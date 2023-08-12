import AtemPkg, { type Atem as IAtem, type AtemState, Commands } from 'atem-connection'
import { GetActionsList } from './actions.js'
import { type AtemConfig, GetConfigFields } from './config.js'
import { FeedbackId, GetFeedbacksList } from './feedback.js'
import { GetAutoDetectModel, GetModelSpec, GetParsedModelSpec, type ModelSpec } from './models/index.js'
import { GetPresetsList } from './presets.js'
import type { StateWrapper } from './state.js'
import { MODEL_AUTO_DETECT } from './models/types.js'
import {
	InitVariables,
	type UpdateVariablesProps,
	updateChangedVariables,
	updateDeviceIpVariable,
} from './variables.js'
import { AtemCommandBatching } from './batching.js'
import { AtemTransitions } from './transitions.js'
import {
	InstanceBase,
	type SomeCompanionConfigField,
	runEntrypoint,
	InstanceStatus,
	type CompanionVariableValues,
} from '@companion-module/base'
import { isEqual } from 'lodash-es'
import { UpgradeScripts } from './upgrades.js'
import { calculateTallyForInputId, type IpAndPort } from './util.js'

const { Atem, AtemConnectionStatus, AtemStateUtil } = AtemPkg

// eslint-disable-next-line node/no-extraneous-import
import { ThreadedClassManager, RegisterExitHandlers } from 'threadedclass'

// HACK: This stops it from registering an unhandledException handler, as that causes companion to exit on error
ThreadedClassManager.handleExit = RegisterExitHandlers.NO

/**
 * Companion instance class for the Blackmagic ATEM Switchers.
 */
class AtemInstance extends InstanceBase<AtemConfig> {
	private model: ModelSpec
	private atem: IAtem | undefined
	private wrappedState: StateWrapper
	private commandBatching: AtemCommandBatching
	private isActive: boolean
	private durationInterval: NodeJS.Timer | undefined
	private atemTransitions: AtemTransitions

	public config: AtemConfig = {}

	/**
	 * Create an instance of an ATEM module.
	 */
	constructor(internal: unknown) {
		super(internal)

		this.commandBatching = new AtemCommandBatching()
		this.wrappedState = {
			state: AtemStateUtil.Create(),
			tally: {},
			tallyCache: new Map(),
		}
		this.atemTransitions = new AtemTransitions(this.config)

		// Fix bugged config
		if (this.config.modelID === 'undefined') {
			this.config.modelID = MODEL_AUTO_DETECT + ''
			setImmediate(() => {
				this.saveConfig(this.config)
			})
		}

		this.model = GetModelSpec(this.getBestModelId() || MODEL_AUTO_DETECT) || GetAutoDetectModel()
		this.config.modelID = this.model.id + ''

		this.isActive = false
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	public async init(config: AtemConfig): Promise<void> {
		this.isActive = true
		this.updateStatus(InstanceStatus.Disconnected)

		this.setupAtemConnection()

		await this.configUpdated(config)

		// Wait for a second to give the discovery a chance to discover atems
		await new Promise((resolve) => setTimeout(resolve, 1000))
	}

	/**
	 * Process an updated configuration array.
	 */
	public async configUpdated(config: AtemConfig): Promise<void> {
		this.config = config

		const variables: CompanionVariableValues = {}
		updateDeviceIpVariable(this, variables)
		this.setVariableValues(variables)

		this.model = GetModelSpec(this.getBestModelId() || MODEL_AUTO_DETECT) || GetAutoDetectModel()
		this.log('debug', 'ATEM changed model: ' + this.model.id)

		// Force clear the cached state
		this.wrappedState.state = AtemStateUtil.Create()
		this.atemTransitions.stopAll()
		this.atemTransitions = new AtemTransitions(this.config)
		this.updateCompanionBits()

		if (this.atem) {
			if (this.atem.status !== AtemConnectionStatus.CLOSED) {
				// Ignore error
				this.atem.disconnect().catch(() => null)
			}

			const target = this.parseIpAndPort()
			if (target) {
				this.updateStatus(InstanceStatus.Connecting)
				this.atem.connect(target.ip, target.port).catch((e) => {
					this.updateStatus(InstanceStatus.ConnectionFailure)

					this.log('error', `Connecting failed: ${e}`)
				})
			} else {
				this.updateStatus(InstanceStatus.Disconnected)
			}
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 */
	public getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields(this)
	}

	/**
	 * Clean up the instance before it is destroyed.
	 */
	public async destroy(): Promise<void> {
		this.isActive = false

		this.atemTransitions.stopAll()

		if (this.atem) {
			this.atem.disconnect().catch(() => null)
			delete this.atem
		}

		this.log('debug', 'destroy: ' + this.id)
	}

	private getBestModelId(): number | undefined {
		const configModel = this.config.modelID ? parseInt(this.config.modelID, 10) : undefined
		if (configModel) {
			return configModel
		} else {
			const info = this.wrappedState.state.info
			if (info && info.model) {
				return info.model
			} else {
				return undefined
			}
		}
	}

	private updateCompanionBits(): void {
		InitVariables(this, this.model, this.wrappedState.state)
		this.setPresetDefinitions(GetPresetsList(this, this.model, this.wrappedState.state))
		this.setFeedbackDefinitions(GetFeedbacksList(this.model, this.wrappedState))
		this.setActionDefinitions(
			GetActionsList(this, this.atem, this.model, this.commandBatching, this.atemTransitions, this.wrappedState),
		)

		this.checkFeedbacks()
	}

	public checkFeedbacks(...feedbackTypes: FeedbackId[]): void {
		super.checkFeedbacks(...feedbackTypes)
	}

	/**
	 * Handle tally packets
	 */
	private processReceivedCommands(commands: Commands.IDeserializedCommand[]): void {
		commands.forEach((command) => {
			if (command instanceof Commands.TallyBySourceCommand) {
				this.wrappedState.tally = command.properties
				this.checkFeedbacks(FeedbackId.ProgramTally, FeedbackId.PreviewTally)
			}
		})
	}
	/**
	 * Handle ATEM state changes
	 */
	private processStateChange(newState: AtemState, paths: string[]): void {
		// TODO - do we need to clone this object?
		this.wrappedState.state = newState

		let reInit = false
		const changedFeedbacks = new Set<FeedbackId>()
		const changedVariables: UpdateVariablesProps = {
			meProgram: new Set(),
			mePreview: new Set(),
			transitionPosition: new Set(),
			auxes: new Set(),
			dsk: new Set(),
			usk: new Set(),
			macros: new Set(),
			ssrc: new Set(),
			mediaPlayer: new Set(),
			streaming: false,
			recording: false,
			fairlightAudio: new Set(),
			classicAudio: new Set(),
			mvWindow: new Set(),
		}

		for (const path of paths) {
			if (reInit) break

			const auxMatch = path.match(/video.auxilliaries.(\d+)/)
			if (auxMatch) {
				changedFeedbacks.add(FeedbackId.AuxBG)
				changedFeedbacks.add(FeedbackId.AuxVariables)
				changedVariables.auxes.add(parseInt(auxMatch[1], 10))
				continue
			}

			const dskMatch = path.match(/video.downstreamKeyers.(\d+)/)
			if (dskMatch) {
				changedVariables.dsk.add(parseInt(dskMatch[1], 10))
				changedFeedbacks.add(FeedbackId.DSKOnAir)
				changedFeedbacks.add(FeedbackId.DSKTie)
				changedFeedbacks.add(FeedbackId.DSKSource)
				changedFeedbacks.add(FeedbackId.DSKSourceVariables)
				continue
			}

			const fairlightInputMatch = path.match(/fairlight.inputs.(\d+)/)
			if (fairlightInputMatch) {
				changedVariables.fairlightAudio.add(parseInt(fairlightInputMatch[1], 10))
				changedFeedbacks.add(FeedbackId.FairlightAudioInputGain)
				changedFeedbacks.add(FeedbackId.FairlightAudioFaderGain)
				changedFeedbacks.add(FeedbackId.FairlightAudioMixOption)
				continue
			}

			const classicAudioInputMatch = path.match(/audio.channels.(\d+)/)
			if (classicAudioInputMatch) {
				changedVariables.classicAudio.add(parseInt(classicAudioInputMatch[1], 10))
				changedFeedbacks.add(FeedbackId.ClassicAudioGain)
				changedFeedbacks.add(FeedbackId.ClassicAudioMixOption)
				continue
			}

			if (path.match(/^inputs/)) {
				// reset everything, since names of inputs might have changed
				reInit = true
				break
			}

			if (path.match(/video.mixEffects.(\d+).upstreamKeyers.(\d+).flyProperties/)) {
				changedFeedbacks.add(FeedbackId.USKKeyFrame)
				continue
			}

			if (path.match(/video.mixEffects.(\d+).upstreamKeyers.(\d+).onAir/)) {
				changedFeedbacks.add(FeedbackId.USKOnAir)
				continue
			}

			const uskSourceMatch = path.match(/video.mixEffects.(\d+).upstreamKeyers.(\d+)/)
			if (uskSourceMatch) {
				const meIndex = parseInt(uskSourceMatch[1], 10)
				const keyIndex = parseInt(uskSourceMatch[2], 10)

				changedVariables.usk.add([meIndex, keyIndex])
				changedFeedbacks.add(FeedbackId.USKSource)
				changedFeedbacks.add(FeedbackId.USKSourceVariables)
				continue
			}

			const macroPropertiesMatch = path.match(/macro.macroProperties.(\d+)/)
			if (macroPropertiesMatch) {
				const macroIndex = parseInt(macroPropertiesMatch[1], 10)
				changedVariables.macros.add(macroIndex)

				changedFeedbacks.add(FeedbackId.Macro)
				continue
			}

			if (path.match(/macro.macroRecorder/) || path.match(/macro.macroPlayer/)) {
				changedFeedbacks.add(FeedbackId.Macro)
				changedFeedbacks.add(FeedbackId.MacroLoop)
				continue
			}

			const mvWindowMatch = path.match(/settings.multiViewers.(\d+).windows.(\d+)/)
			if (mvWindowMatch) {
				const meIndex = parseInt(mvWindowMatch[1], 10)
				const windowIndex = parseInt(mvWindowMatch[2], 10)
				changedVariables.mvWindow.add([meIndex + 1, windowIndex + 1])

				changedFeedbacks.add(FeedbackId.MVSource)
				changedFeedbacks.add(FeedbackId.MVSourceVariables)
				continue
			}

			const meProgramMatch = path.match(/video.mixEffects.(\d+).programInput/)
			if (meProgramMatch) {
				const meIndex = parseInt(meProgramMatch[1], 10)
				changedVariables.meProgram.add(meIndex)

				changedFeedbacks.add(FeedbackId.ProgramBG)
				changedFeedbacks.add(FeedbackId.ProgramVariables)
				changedFeedbacks.add(FeedbackId.ProgramBG2)
				changedFeedbacks.add(FeedbackId.ProgramBG3)
				changedFeedbacks.add(FeedbackId.ProgramBG4)
				continue
			}

			const mePreviewMatch = path.match(/video.mixEffects.(\d+).previewInput/)
			if (mePreviewMatch) {
				const meIndex = parseInt(mePreviewMatch[1], 10)
				changedVariables.mePreview.add(meIndex)

				changedFeedbacks.add(FeedbackId.PreviewBG)
				changedFeedbacks.add(FeedbackId.PreviewVariables)
				changedFeedbacks.add(FeedbackId.PreviewBG2)
				changedFeedbacks.add(FeedbackId.PreviewBG3)
				changedFeedbacks.add(FeedbackId.PreviewBG4)
				continue
			}

			const ssrcBoxMatch = path.match(/video.superSources.(\d+).boxes.(\d+)/)
			if (ssrcBoxMatch) {
				changedFeedbacks.add(FeedbackId.SSrcBoxSource)
				changedFeedbacks.add(FeedbackId.SSrcBoxSourceVariables)
				changedFeedbacks.add(FeedbackId.SSrcBoxOnAir)
				changedFeedbacks.add(FeedbackId.SSrcBoxProperties)
				changedVariables.ssrc.add(parseInt(ssrcBoxMatch[1], 10))
				continue
			}
			if (path.match(/video.superSources.(\d+).properties/)) {
				changedFeedbacks.add(FeedbackId.SSrcArtOption)
				changedFeedbacks.add(FeedbackId.SSrcArtSource)
				continue
			}

			if (path.match(/video.mixEffects.(\d+).transitionProperties/)) {
				changedFeedbacks.add(FeedbackId.TransitionStyle)
				changedFeedbacks.add(FeedbackId.TransitionSelection)
				continue
			}
			if (path.match(/video.mixEffects.(\d+).transitionSettings/)) {
				changedFeedbacks.add(FeedbackId.TransitionRate)
				continue
			}
			const transitionPositionMatch = path.match(/video.mixEffects.(\d+).transitionPosition/)
			if (transitionPositionMatch) {
				const meIndex = parseInt(transitionPositionMatch[1], 10)
				changedVariables.transitionPosition.add(meIndex)

				changedFeedbacks.add(FeedbackId.InTransition)
				continue
			}
			if (path.match(/video.mixEffects.(\d+).fadeToBlack/)) {
				changedFeedbacks.add(FeedbackId.FadeToBlackRate)
				changedFeedbacks.add(FeedbackId.FadeToBlackIsBlack)
				continue
			}

			const mediaPlayerMatch = path.match(/media.players.(\d+)/)
			if (mediaPlayerMatch) {
				const mediaPlayer = parseInt(mediaPlayerMatch[1], 10)
				changedVariables.mediaPlayer.add(mediaPlayer)
				changedFeedbacks.add(FeedbackId.MediaPlayerSource)
				continue
			}

			if (path.match(/media.clipPool/) || path.match(/media.stillPool/)) {
				// reset everything, since names of media might have changed
				reInit = true
				break
			}

			if (path.match(/streaming.status/)) {
				changedFeedbacks.add(FeedbackId.StreamStatus)
				continue
			}
			if (path.match(/recording.status/)) {
				changedFeedbacks.add(FeedbackId.RecordStatus)
				continue
			}
			if (path.match(/streaming.duration/) || path.match(/streaming.stats/)) {
				changedVariables.streaming = true
				continue
			}
			if (path.match(/recording.duration/)) {
				changedVariables.recording = true
				continue
			}
			if (path.match(/fairlight.monitor/)) {
				changedFeedbacks.add(FeedbackId.FairlightAudioMonitorMasterMuted)
				continue
			}
		}

		const changedFeedbackIds = this.invalidateCachedTallyState()

		// Apply the change
		if (reInit) {
			this.updateCompanionBits()
		} else {
			updateChangedVariables(this, this.wrappedState.state, changedVariables)
			if (changedFeedbacks.size > 0) this.checkFeedbacks(...Array.from(changedFeedbacks))
			if (changedFeedbackIds.size > 0) this.checkFeedbacksById(...Array.from(changedFeedbackIds))
		}
	}

	private invalidateCachedTallyState() {
		// Invalidate any tally
		const changedFeedbackIds = new Set<string>()
		for (const [inputId, tally] of this.wrappedState.tallyCache.entries()) {
			if (tally.referencedFeedbackIds.size) {
				const newTally = calculateTallyForInputId(this.wrappedState.state, inputId)
				if (tally.lastVisibleInputs.length !== newTally.length || !isEqual(newTally, tally.lastVisibleInputs)) {
					// Tally has changed
					tally.referencedFeedbackIds.forEach((id) => changedFeedbackIds.add(id))
					tally.lastVisibleInputs = newTally
				}
			} else {
				// Not used, clear it out
				tally.lastVisibleInputs = []
			}
		}

		return changedFeedbackIds
	}

	private setupAtemConnection(): void {
		this.atem = new Atem()

		this.atem.on('connected', () => {
			if (this.atem?.state) {
				this.wrappedState.state = this.atem.state
				this.invalidateCachedTallyState()

				const atemInfo = this.wrappedState.state.info
				this.log('info', 'Connected to a ' + atemInfo.productIdentifier)
				this.updateStatus(InstanceStatus.Ok)

				const newBestModelId = this.getBestModelId()
				const newModelSpec = newBestModelId ? GetModelSpec(newBestModelId) : undefined
				if (newModelSpec) {
					this.model = newModelSpec
				} else {
					this.model = GetParsedModelSpec(this.wrappedState.state)
					this.updateStatus(
						InstanceStatus.UnknownWarning,
						`Unknown model: ${atemInfo.productIdentifier}. Some bits may be missing`,
					)
				}

				// Log if the config mismatches the device
				const configModelId = this.config.modelID ? parseInt(this.config.modelID, 10) : undefined
				if (configModelId !== MODEL_AUTO_DETECT && configModelId !== undefined && configModelId !== this.model.id) {
					this.log(
						'warn',
						'Connected to a ' +
							atemInfo.productIdentifier +
							', but instance is configured for ' +
							this.model.label +
							".  Change instance to 'Auto Detect' or the appropriate model to ensure stability.",
					)
				}

				this.updateCompanionBits()

				if (!this.durationInterval && (this.wrappedState.state.streaming || this.wrappedState.state.recording)) {
					this.durationInterval = setInterval(() => {
						if (this.atem && this.wrappedState.state.streaming) {
							this.atem.requestStreamingDuration().catch((e) => {
								this.log('debug', 'Action execution error: ' + e)
							})
						}
						if (this.atem && this.wrappedState.state.recording) {
							this.atem.requestRecordingDuration().catch((e) => {
								this.log('debug', 'Action execution error: ' + e)
							})
						}
					}, 1000)
				}
			}
		})
		this.atem.on('info', (msg) => this.log('debug', msg))
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.atem.on('error', (e: any) => {
			this.log('error', e.message)
			this.updateStatus(InstanceStatus.UnknownError, e.message)
		})
		this.atem.on('disconnected', () => {
			if (this.isActive) {
				this.updateStatus(InstanceStatus.Connecting)
			}
			this.log('info', 'Lost connection')

			if (this.durationInterval) {
				clearInterval(this.durationInterval)
				delete this.durationInterval
			}
			// TODO - clear cached state after some timeout
		})
		this.atem.on('stateChanged', this.processStateChange.bind(this))
		this.atem.on('receivedCommands', this.processReceivedCommands.bind(this))

		const target = this.parseIpAndPort()
		if (target) {
			this.updateStatus(InstanceStatus.Connecting)
			this.atem.connect(target.ip, target.port).catch((e) => {
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.log('error', `Connecting failed: ${e}`)
			})
		}
	}

	parseIpAndPort(): IpAndPort | null {
		const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

		if (this.config.bonjour_host) {
			const [ip, rawPort] = this.config.bonjour_host.split(':')
			const port = Number(rawPort)
			if (ip.match(ipRegex) && !isNaN(port)) {
				return {
					ip,
					port,
				}
			}
		} else if (this.config.host) {
			if (this.config.host.match(ipRegex)) {
				return {
					ip: this.config.host,
					port: undefined,
				}
			}
		}
		return null
	}
}

runEntrypoint(AtemInstance, UpgradeScripts)
