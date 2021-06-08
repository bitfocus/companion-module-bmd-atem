import { Atem, AtemConnectionStatus, AtemState, AtemStateUtil, Commands } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionConfigField, CompanionSystem } from '../../../instance_skel_types'
import { GetActionsList } from './actions'
import { AtemConfig, GetConfigFields } from './config'
import { FeedbackId, GetFeedbacksList } from './feedback'
import { BooleanFeedbackUpgradeMap, upgradeV2x2x0 } from './migrations'
import { GetAutoDetectModel, GetModelSpec, GetParsedModelSpec, ModelSpec } from './models'
import { GetPresetsList } from './presets'
import { TallyBySource } from './state'
import { MODEL_AUTO_DETECT } from './models/types'
import {
	InitVariables,
	updateDSKVariable,
	updateMacroVariable,
	updateMediaPlayerVariables,
	updateMEPreviewVariable,
	updateMEProgramVariable,
	updateUSKVariable,
	updateStreamingVariables,
	updateRecordingVariables,
	updateAuxVariable,
} from './variables'
import { AtemCommandBatching } from './batching'
import { executePromise } from './util'
import { AtemTransitions } from './transitions'

// eslint-disable-next-line node/no-extraneous-import
import { ThreadedClassManager, RegisterExitHandlers } from 'threadedclass'
import { AtemMdnsDetector } from './mdns-detector'

// HACK: This stops it from registering an unhandledException handler, as that causes companion to exit on error
ThreadedClassManager.handleExit = RegisterExitHandlers.NO

/**
 * Companion instance class for the Blackmagic ATEM Switchers.
 */
class AtemInstance extends InstanceSkel<AtemConfig> {
	private model: ModelSpec
	private atem: Atem | undefined
	private atemState: AtemState
	private commandBatching: AtemCommandBatching
	private atemTally: TallyBySource
	private isActive: boolean
	private durationInterval: NodeJS.Timer | undefined
	private atemTransitions: AtemTransitions

	/**
	 * Create an instance of an ATEM module.
	 */
	constructor(system: CompanionSystem, id: string, config: AtemConfig) {
		super(system, id, config)

		this.commandBatching = new AtemCommandBatching()
		this.atemState = AtemStateUtil.Create()
		this.atemTally = {}
		this.atemTransitions = new AtemTransitions(this.config)

		// Fix bugged config
		if (this.config.modelID === 'undefined') {
			this.config.modelID = MODEL_AUTO_DETECT + ''
			setImmediate(() => this.saveConfig())
		}

		this.model = GetModelSpec(this.getBestModelId() || MODEL_AUTO_DETECT) || GetAutoDetectModel()
		this.config.modelID = this.model.id + ''

		this.isActive = false

		this.addUpgradeScript(upgradeV2x2x0)
		this.addUpgradeToBooleanFeedbackScript(BooleanFeedbackUpgradeMap)
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	public init(): void {
		this.isActive = true
		this.status(this.STATUS_UNKNOWN)

		AtemMdnsDetector.subscribe(this.id)

		// Unfortunately this is redundant if the switcher goes
		// online right away, but necessary for offline programming
		this.updateCompanionBits()

		this.setupAtemConnection()
	}

	/**
	 * Process an updated configuration array.
	 */
	public updateConfig(config: AtemConfig): void {
		this.config = config

		this.model = GetModelSpec(this.getBestModelId() || MODEL_AUTO_DETECT) || GetAutoDetectModel()
		this.debug('ATEM changed model: ' + this.model.id)

		// Force clear the cached state
		this.atemState = AtemStateUtil.Create()
		this.atemTransitions.stopAll()
		this.atemTransitions = new AtemTransitions(this.config)
		this.updateCompanionBits()

		if (this.config.host !== undefined && this.atem) {
			if (this.atem.status !== AtemConnectionStatus.CLOSED) {
				// Ignore error
				this.atem.disconnect().catch(() => null)
			}

			this.status(this.STATUS_WARNING, 'Connecting')
			this.atem.connect(this.config.host).catch((e) => {
				this.status(this.STATUS_ERROR, 'Connecting failed')
				this.log('error', `Connecting failed: ${e}`)
			})
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 */
	public config_fields(): CompanionConfigField[] {
		return GetConfigFields(this)
	}

	/**
	 * Clean up the instance before it is destroyed.
	 */
	public destroy(): void {
		this.isActive = false

		AtemMdnsDetector.unsubscribe(this.id)

		this.atemTransitions.stopAll()

		if (this.atem) {
			this.atem.disconnect().catch(() => null)
			delete this.atem
		}

		this.debug('destroy', this.id)
	}

	private getBestModelId(): number | undefined {
		const configModel = this.config.modelID ? parseInt(this.config.modelID, 10) : undefined
		if (configModel) {
			return configModel
		} else {
			const info = this.atemState.info
			if (info && info.model) {
				return info.model
			} else {
				return undefined
			}
		}
	}

	private updateCompanionBits(): void {
		InitVariables(this, this.model, this.atemState)
		this.setPresetDefinitions(GetPresetsList(this, this.model, this.atemState))
		this.setFeedbackDefinitions(GetFeedbacksList(this, this.model, this.atemState, this.atemTally))
		this.setActions(
			GetActionsList(this, this.atem, this.model, this.commandBatching, this.atemTransitions, this.atemState)
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
				// The feedback holds a reference to the old object, so we need
				// to update it in place
				Object.assign(this.atemTally, command.properties)
				this.checkFeedbacks(FeedbackId.ProgramTally, FeedbackId.PreviewTally)
			}
		})
	}
	/**
	 * Handle ATEM state changes
	 */
	private processStateChange(newState: AtemState, paths: string[]): void {
		// TODO - do we need to clone this object?
		this.atemState = newState

		// TODO - should this batch changes?
		paths.forEach((path) => {
			const auxMatch = path.match(/video.auxilliaries.(\d+)/)
			if (auxMatch) {
				this.checkFeedbacks(FeedbackId.AuxBG)
				updateAuxVariable(this, this.atemState, parseInt(auxMatch[1], 10))
				return
			}

			const dskMatch = path.match(/video.downstreamKeyers.(\d+)/)
			if (dskMatch) {
				updateDSKVariable(this, this.atemState, parseInt(dskMatch[1], 10))
				this.checkFeedbacks(FeedbackId.DSKOnAir, FeedbackId.DSKTie, FeedbackId.DSKSource)
				return
			}

			if (path.match(/inputs/)) {
				// reset everything, since names of inputs might have changed
				this.updateCompanionBits()
				return
			}

			if (path.match(/video.mixEffects.(\d+).upstreamKeyers.(\d+).onAir/)) {
				this.checkFeedbacks(FeedbackId.USKOnAir)
				return
			}

			const uskSourceMatch = path.match(/video.mixEffects.(\d+).upstreamKeyers.(\d+)/)
			if (uskSourceMatch) {
				const meIndex = parseInt(uskSourceMatch[1], 10)
				const keyIndex = parseInt(uskSourceMatch[2], 10)

				updateUSKVariable(this, this.atemState, meIndex, keyIndex)
				this.checkFeedbacks(FeedbackId.USKSource)
				return
			}

			const macroPropertiesMatch = path.match(/macro.macroProperties.(\d+)/)
			if (macroPropertiesMatch) {
				const macroIndex = parseInt(macroPropertiesMatch[1], 10)
				updateMacroVariable(this, this.atemState, macroIndex)

				this.checkFeedbacks(FeedbackId.Macro)
				return
			}

			if (path.match(/macro.macroRecorder/) || path.match(/macro.macroPlayer/)) {
				this.checkFeedbacks(FeedbackId.Macro)
				return
			}

			if (path.match(/settings.multiViewers.(\d+).windows.(\d+)/)) {
				this.checkFeedbacks(FeedbackId.MVSource)
				return
			}

			const meProgramMatch = path.match(/video.mixEffects.(\d+).programInput/)
			if (meProgramMatch) {
				const meIndex = parseInt(meProgramMatch[1], 10)
				updateMEProgramVariable(this, this.atemState, meIndex)

				this.checkFeedbacks(FeedbackId.ProgramBG, FeedbackId.ProgramBG2, FeedbackId.ProgramBG3, FeedbackId.ProgramBG4)
				return
			}

			const mePreviewMatch = path.match(/video.mixEffects.(\d+).previewInput/)
			if (mePreviewMatch) {
				const meIndex = parseInt(mePreviewMatch[1], 10)
				updateMEPreviewVariable(this, this.atemState, meIndex)

				this.checkFeedbacks(FeedbackId.PreviewBG, FeedbackId.PreviewBG2, FeedbackId.PreviewBG3, FeedbackId.PreviewBG4)
				return
			}

			if (path.match(/video.superSources.(\d+).boxes.(\d+)/)) {
				this.checkFeedbacks(FeedbackId.SSrcBoxSource, FeedbackId.SSrcBoxOnAir, FeedbackId.SSrcBoxProperties)
				return
			}
			if (path.match(/video.superSources.(\d+).properties/)) {
				this.checkFeedbacks(FeedbackId.SSrcArtOption, FeedbackId.SSrcArtSource)
				return
			}

			if (path.match(/video.mixEffects.(\d+).transitionProperties/)) {
				this.checkFeedbacks(FeedbackId.TransitionStyle, FeedbackId.TransitionSelection)
				return
			}
			if (path.match(/video.mixEffects.(\d+).transitionSettings/)) {
				this.checkFeedbacks(FeedbackId.TransitionRate)
				return
			}
			if (path.match(/video.mixEffects.(\d+).transitionPosition/)) {
				this.checkFeedbacks(FeedbackId.InTransition)
				return
			}
			if (path.match(/video.mixEffects.(\d+).fadeToBlack/)) {
				this.checkFeedbacks(FeedbackId.FadeToBlackRate, FeedbackId.FadeToBlackIsBlack)
				return
			}

			const mediaPlayerMatch = path.match(/media.players.(\d+)/)
			if (mediaPlayerMatch) {
				const mediaPlayer = parseInt(mediaPlayerMatch[1], 10)
				updateMediaPlayerVariables(this, this.atemState, mediaPlayer)
				this.checkFeedbacks(FeedbackId.MediaPlayerSource)
				return
			}

			if (path.match(/media.clipPool/) || path.match(/media.stillPool/)) {
				// reset everything, since names of media might have changed
				this.updateCompanionBits()
				return
			}

			if (path.match(/streaming.status/)) {
				this.checkFeedbacks(FeedbackId.StreamStatus)
				return
			}
			if (path.match(/recording.status/)) {
				this.checkFeedbacks(FeedbackId.RecordStatus)
				return
			}
			if (path.match(/streaming.duration/) || path.match(/streaming.stats/)) {
				updateStreamingVariables(this, this.atemState)
				return
			}
			if (path.match(/recording.duration/) || path.match(/streaming.status/)) {
				updateRecordingVariables(this, this.atemState)
				return
			}
			if (path.match(/audio.channels/)) {
				this.checkFeedbacks(FeedbackId.ClassicAudioGain, FeedbackId.ClassicAudioMixOption)
				return
			}
			if (path.match(/fairlight.inputs/)) {
				this.checkFeedbacks(
					FeedbackId.FairlightAudioInputGain,
					FeedbackId.FairlightAudioFaderGain,
					FeedbackId.FairlightAudioMixOption
				)
				return
			}
		})
	}

	private setupAtemConnection(): void {
		this.atem = new Atem()

		this.atem.on('connected', () => {
			if (this.atem?.state) {
				this.atemState = this.atem.state

				const atemInfo = this.atemState.info
				this.log('info', 'Connected to a ' + atemInfo.productIdentifier)
				this.status(this.STATUS_OK)

				const newBestModelId = this.getBestModelId()
				const newModelSpec = newBestModelId ? GetModelSpec(newBestModelId) : undefined
				if (newModelSpec) {
					this.model = newModelSpec
				} else {
					this.model = GetParsedModelSpec(this.atemState)
					this.status(this.STATUS_WARNING, `Unknown model: ${atemInfo.productIdentifier}. Some bits may be missing`)
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
							".  Change instance to 'Auto Detect' or the appropriate model to ensure stability."
					)
				}

				this.updateCompanionBits()

				if (!this.durationInterval && (this.atemState.streaming || this.atemState.recording)) {
					this.durationInterval = setInterval(() => {
						if (this.atem && this.atemState.streaming) {
							executePromise(this, this.atem.requestStreamingDuration())
						}
						if (this.atem && this.atemState.recording) {
							executePromise(this, this.atem.requestRecordingDuration())
						}
					}, 1000)
				}
			}
		})
		this.atem.on('info', this.debug.bind(this))
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.atem.on('error', (e: any) => {
			this.log('error', e.message)
			this.status(this.STATUS_ERROR, e.message)
		})
		this.atem.on('disconnected', () => {
			if (this.isActive) {
				this.status(this.STATUS_WARNING, 'Reconnecting')
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

		if (this.config.host) {
			this.status(this.STATUS_WARNING, 'Connecting')
			this.atem.connect(this.config.host).catch((e) => {
				this.status(this.STATUS_ERROR, 'Connecting failed')
				this.log('error', `Connecting failed: ${e}`)
			})
		}
	}
}

export = AtemInstance
