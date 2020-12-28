import { Atem, AtemState, Enums } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionAction, CompanionActionEvent, CompanionActions } from '../../../instance_skel_types'
import {
	CHOICES_KEYTRANS,
	GetDSKIdChoices,
	GetMacroChoices,
	CHOICES_ON_OFF_TOGGLE,
	CHOICES_CLASSIC_AUDIO_MIX_OPTION,
	CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
} from './choices'
import { AtemConfig } from './config'
import {
	AtemAuxPicker,
	AtemAuxSourcePicker,
	AtemDSKPicker,
	AtemKeyCutSourcePicker,
	AtemKeyFillSourcePicker,
	AtemMediaPlayerPicker,
	AtemMediaPlayerSourcePicker,
	AtemMEPicker,
	AtemMESourcePicker,
	AtemMultiviewerPicker,
	AtemMultiviewSourcePicker,
	AtemMultiviewWindowPicker,
	AtemRatePicker,
	AtemSuperSourceBoxPicker,
	AtemSuperSourceBoxSourcePicker,
	AtemSuperSourceIdPicker,
	AtemSuperSourcePropertiesPickers,
	AtemTransitionSelectionPickers,
	AtemTransitionStylePicker,
	AtemUSKPicker,
	AtemTransitionSelectionComponentPicker,
	AtemAudioInputPicker,
	AtemFairlightAudioSourcePicker,
	FadeDurationChoice,
	FaderLevelDeltaChoice,
} from './input'
import { ModelSpec } from './models'
import { getDSK, getSuperSourceBox, getUSK, getTransitionProperties, getMediaPlayer } from './state'
import {
	assertUnreachable,
	calculateTransitionSelection,
	literal,
	MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
	compact,
	clamp,
	executePromise,
} from './util'
import { AtemCommandBatching, CommandBatching } from './batching'
import { AtemTransitions } from './transitions'

export enum ActionId {
	Program = 'program',
	Preview = 'preview',
	Cut = 'cut',
	Auto = 'auto',
	Aux = 'aux',
	USKSource = 'uskSource',
	USKOnAir = 'usk',
	DSKSource = 'dskSource',
	DSKOnAir = 'dsk',
	DSKTie = 'dskTie',
	DSKAuto = 'dskAuto',
	MacroRun = 'macrorun',
	MacroContinue = 'macrocontinue',
	MacroStop = 'macrostop',
	MultiviewerWindowSource = 'setMvSource',
	SuperSourceBoxSource = 'setSsrcBoxSource',
	SuperSourceBoxOnAir = 'setSsrcBoxEnable',
	SuperSourceBoxProperties = 'setSsrcBoxProperties',
	SuperSourceBoxPropertiesDelta = 'setSsrcBoxPropertiesDelta',
	TransitionStyle = 'transitionStyle',
	TransitionSelection = 'transitionSelection',
	TransitionSelectionComponent = 'transitionSelectionComponent',
	TransitionRate = 'transitionRate',
	MediaPlayerSource = 'mediaPlayerSource',
	MediaPlayerCycle = 'mediaPlayerCycle',
	FadeToBlackAuto = 'fadeToBlackAuto',
	FadeToBlackRate = 'fadeToBlackRate',
	StreamStartStop = 'streamStartStop',
	StreamService = 'streamService',
	RecordStartStop = 'recordStartStop',
	RecordSwitchDisk = 'recordSwitchDisk',
	RecordFilename = 'recordFilename',
	ClassicAudioGain = 'classicAudioGain',
	ClassicAudioGainDelta = 'classicAudioGainDelta',
	ClassicAudioMixOption = 'classicAudioMixOption',
	FairlightAudioFaderGain = 'fairlightAudioFaderGain',
	FairlightAudioInputGain = 'fairlightAudioInputGain',
	FairlightAudioMixOption = 'fairlightAudioMixOption',
}

type CompanionActionExt = CompanionAction & Required<Pick<CompanionAction, 'callback'>>
type CompanionActionsExt = { [id in ActionId]: CompanionActionExt | undefined }

function getOptNumber(action: CompanionActionEvent, key: string, defVal?: number): number {
	const rawVal = action.options[key]
	if (defVal !== undefined && rawVal === undefined) return defVal
	const val = Number(rawVal)
	if (isNaN(val)) {
		throw new Error(`Invalid option '${key}'`)
	}
	return val
}
function getOptBool(action: CompanionActionEvent, key: string): boolean {
	return Boolean(action.options[key])
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function meActions(
	instance: InstanceSkel<AtemConfig>,
	atem: Atem,
	model: ModelSpec,
	commandBatching: AtemCommandBatching,
	state: AtemState
) {
	return {
		[ActionId.Program]: literal<CompanionActionExt>({
			label: 'Set input on Program',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			callback: (action): void => {
				executePromise(
					instance,
					atem.changeProgramInput(getOptNumber(action, 'input'), getOptNumber(action, 'mixeffect'))
				)
			},
		}),
		[ActionId.Preview]: literal<CompanionActionExt>({
			label: 'Set input on Preview',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			callback: (action): void => {
				executePromise(
					instance,
					atem.changePreviewInput(getOptNumber(action, 'input'), getOptNumber(action, 'mixeffect'))
				)
			},
		}),
		[ActionId.Cut]: literal<CompanionActionExt>({
			label: 'CUT operation',
			options: [AtemMEPicker(model, 0)],
			callback: (action): void => {
				executePromise(instance, atem.cut(getOptNumber(action, 'mixeffect')))
			},
		}),
		[ActionId.Auto]: literal<CompanionActionExt>({
			label: 'AUTO transition operation',
			options: [AtemMEPicker(model, 0)],
			callback: (action): void => {
				executePromise(instance, atem.autoTransition(getOptNumber(action, 'mixeffect')))
			},
		}),

		[ActionId.USKSource]: model.USKs
			? literal<CompanionActionExt>({
					label: 'Set inputs on Upstream KEY',
					options: [
						AtemMEPicker(model, 0),
						AtemUSKPicker(model),
						AtemKeyFillSourcePicker(model, state),
						AtemKeyCutSourcePicker(model, state),
					],
					callback: (action): void => {
						executePromise(
							instance,
							Promise.all([
								atem.setUpstreamKeyerFillSource(
									getOptNumber(action, 'fill'),
									getOptNumber(action, 'mixeffect'),
									getOptNumber(action, 'key')
								),
								atem.setUpstreamKeyerCutSource(
									getOptNumber(action, 'cut'),
									getOptNumber(action, 'mixeffect'),
									getOptNumber(action, 'key')
								),
							])
						)
					},
			  })
			: undefined,
		[ActionId.USKOnAir]: model.USKs
			? literal<CompanionActionExt>({
					label: 'Set Upstream KEY OnAir',
					options: [
						{
							id: 'onair',
							type: 'dropdown',
							label: 'On Air',
							default: 'true',
							choices: CHOICES_KEYTRANS,
						},
						AtemMEPicker(model, 0),
						AtemUSKPicker(model),
					],
					callback: (action): void => {
						const meIndex = getOptNumber(action, 'mixeffect')
						const keyIndex = getOptNumber(action, 'key')
						if (action.options.onair === 'toggle') {
							const usk = getUSK(state, meIndex, keyIndex)
							executePromise(instance, atem.setUpstreamKeyerOnAir(!usk?.onAir, meIndex, keyIndex))
						} else {
							executePromise(instance, atem.setUpstreamKeyerOnAir(action.options.onair === 'true', meIndex, keyIndex))
						}
					},
			  })
			: undefined,
		[ActionId.TransitionStyle]: literal<CompanionActionExt>({
			label: 'Change transition style',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(model.media.clips === 0)],
			callback: (action): void => {
				executePromise(
					instance,
					atem.setTransitionStyle(
						{
							nextStyle: getOptNumber(action, 'style'),
						},
						getOptNumber(action, 'mixeffect')
					)
				)
			},
		}),
		[ActionId.TransitionRate]: literal<CompanionActionExt>({
			label: 'Change transition rate',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(true), AtemRatePicker('Transition Rate')],
			callback: (action): void => {
				const style = getOptNumber(action, 'style') as Enums.TransitionStyle
				switch (style) {
					case Enums.TransitionStyle.MIX:
						executePromise(
							instance,
							atem.setMixTransitionSettings(
								{
									rate: getOptNumber(action, 'rate'),
								},
								getOptNumber(action, 'mixeffect')
							)
						)
						break
					case Enums.TransitionStyle.DIP:
						executePromise(
							instance,
							atem.setDipTransitionSettings(
								{
									rate: getOptNumber(action, 'rate'),
								},
								getOptNumber(action, 'mixeffect')
							)
						)
						break
					case Enums.TransitionStyle.WIPE:
						executePromise(
							instance,
							atem.setWipeTransitionSettings(
								{
									rate: getOptNumber(action, 'rate'),
								},
								getOptNumber(action, 'mixeffect')
							)
						)
						break
					case Enums.TransitionStyle.DVE:
						executePromise(
							instance,
							atem.setDVETransitionSettings(
								{
									rate: getOptNumber(action, 'rate'),
								},
								getOptNumber(action, 'mixeffect')
							)
						)
						break
					case Enums.TransitionStyle.STING:
						// Not supported
						break
					default:
						assertUnreachable(style)
						instance.debug('Unknown transition style: ' + style)
				}
			},
		}),
		[ActionId.TransitionSelection]: literal<CompanionActionExt>({
			label: 'Change transition selection',
			options: [AtemMEPicker(model, 0), ...AtemTransitionSelectionPickers(model)],
			callback: (action): void => {
				executePromise(
					instance,
					atem.setTransitionStyle(
						{
							nextSelection: calculateTransitionSelection(model.USKs, action.options),
						},
						getOptNumber(action, 'mixeffect')
					)
				)
			},
		}),
		[ActionId.TransitionSelectionComponent]: literal<CompanionActionExt>({
			label: 'Change transition selection component',
			options: [
				AtemMEPicker(model, 0),
				AtemTransitionSelectionComponentPicker(model),
				{
					type: 'dropdown',
					id: 'mode',
					label: 'State',
					choices: CHOICES_KEYTRANS,
					default: CHOICES_KEYTRANS[0].id,
				},
			],
			callback: (action): void => {
				const me = getOptNumber(action, 'mixeffect')
				const tp = getTransitionProperties(state, me)
				if (tp) {
					let batch = commandBatching.meTransitionSelection.get(me)
					if (!batch) {
						batch = new CommandBatching(
							(newVal) =>
								atem.setTransitionStyle(
									{
										nextSelection: newVal,
									},
									me
								),
							{
								delayStep: 100,
								maxBatch: 5,
							}
						)
						commandBatching.meTransitionSelection.set(me, batch)
					}

					const mode = action.options.mode
					const component = 1 << Number(action.options.component)
					batch.queueChange(tp.nextSelection, (oldVal) => {
						let mode2 = mode
						if (mode === 'toggle') {
							if ((oldVal & component) > 0) {
								mode2 = 'false'
							} else {
								mode2 = 'true'
							}
						}

						if (mode2 === 'true') {
							return oldVal | component
						} else {
							return oldVal & ~component
						}
					})
				}
			},
		}),
		[ActionId.FadeToBlackAuto]: literal<CompanionActionExt>({
			label: 'AUTO fade to black',
			options: [AtemMEPicker(model, 0)],
			callback: (action): void => {
				executePromise(instance, atem.fadeToBlack(getOptNumber(action, 'mixeffect')))
			},
		}),
		[ActionId.FadeToBlackRate]: literal<CompanionActionExt>({
			label: 'Change fade to black rate',
			options: [AtemMEPicker(model, 0), AtemRatePicker('Rate')],
			callback: (action): void => {
				executePromise(
					instance,
					atem.setFadeToBlackRate(getOptNumber(action, 'rate'), getOptNumber(action, 'mixeffect'))
				)
			},
		}),
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function dskActions(instance: InstanceSkel<AtemConfig>, atem: Atem, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.DSKSource]: model.DSKs
			? literal<CompanionActionExt>({
					label: 'Set inputs on Downstream KEY',
					options: [AtemDSKPicker(model), AtemKeyFillSourcePicker(model, state), AtemKeyCutSourcePicker(model, state)],
					callback: (action): void => {
						executePromise(
							instance,
							Promise.all([
								atem.setDownstreamKeyFillSource(getOptNumber(action, 'fill'), getOptNumber(action, 'key')),
								atem.setDownstreamKeyCutSource(getOptNumber(action, 'cut'), getOptNumber(action, 'key')),
							])
						)
					},
			  })
			: undefined,
		[ActionId.DSKAuto]: model.DSKs
			? literal<CompanionActionExt>({
					label: 'AUTO DSK Transition',
					options: [
						{
							type: 'dropdown',
							id: 'downstreamKeyerId',
							label: 'DSK',
							default: 0,
							choices: GetDSKIdChoices(model),
						},
					],
					callback: (action): void => {
						executePromise(instance, atem.autoDownstreamKey(getOptNumber(action, 'downstreamKeyerId')))
					},
			  })
			: undefined,
		[ActionId.DSKOnAir]: model.DSKs
			? literal<CompanionActionExt>({
					label: 'Set Downstream KEY OnAir',
					options: [
						{
							id: 'onair',
							type: 'dropdown',
							label: 'On Air',
							default: 'true',
							choices: CHOICES_KEYTRANS,
						},
						AtemDSKPicker(model),
					],
					callback: (action): void => {
						const keyIndex = getOptNumber(action, 'key')
						if (action.options.onair === 'toggle') {
							const dsk = getDSK(state, keyIndex)
							executePromise(instance, atem.setDownstreamKeyOnAir(!dsk?.onAir, keyIndex))
						} else {
							executePromise(instance, atem.setDownstreamKeyOnAir(action.options.onair === 'true', keyIndex))
						}
					},
			  })
			: undefined,
		[ActionId.DSKTie]: model.DSKs
			? literal<CompanionActionExt>({
					label: 'Set Downstream KEY Tie',
					options: [
						{
							id: 'state',
							type: 'dropdown',
							label: 'State',
							default: 'true',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
						AtemDSKPicker(model),
					],
					callback: (action): void => {
						const keyIndex = getOptNumber(action, 'key')
						if (action.options.state === 'toggle') {
							const dsk = getDSK(state, keyIndex)
							executePromise(instance, atem.setDownstreamKeyTie(!dsk?.properties?.tie, keyIndex))
						} else {
							executePromise(instance, atem.setDownstreamKeyTie(action.options.state === 'true', keyIndex))
						}
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function macroActions(instance: InstanceSkel<AtemConfig>, atem: Atem, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.MacroRun]: model.macros
			? literal<CompanionActionExt>({
					label: 'Run MACRO',
					options: [
						{
							type: 'dropdown',
							id: 'macro',
							label: 'Macro',
							default: 1,
							choices: GetMacroChoices(model, state),
						},
						{
							type: 'dropdown',
							id: 'action',
							label: 'Action',
							default: 'run',
							choices: [
								{ id: 'run', label: 'Run' },
								{ id: 'runContinue', label: 'Run/Continue' },
							],
						},
					],
					callback: (action): void => {
						const macroIndex = getOptNumber(action, 'macro') - 1
						const { macroPlayer, macroRecorder } = state.macro
						if (
							action.options.action === 'runContinue' &&
							macroPlayer.isWaiting &&
							macroPlayer.macroIndex === macroIndex
						) {
							executePromise(instance, atem.macroContinue())
						} else if (macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex) {
							executePromise(instance, atem.macroStopRecord())
						} else {
							executePromise(instance, atem.macroRun(macroIndex))
						}
					},
			  })
			: undefined,
		[ActionId.MacroContinue]: model.macros
			? literal<CompanionActionExt>({
					label: 'Continue MACRO',
					options: [],
					callback: (): void => {
						executePromise(instance, atem.macroContinue())
					},
			  })
			: undefined,
		[ActionId.MacroStop]: model.macros
			? literal<CompanionActionExt>({
					label: 'Stop MACROS',
					options: [],
					callback: (): void => {
						executePromise(instance, atem.macroStop())
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ssrcActions(instance: InstanceSkel<AtemConfig>, atem: Atem, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.SuperSourceBoxSource]: model.SSrc
			? literal<CompanionActionExt>({
					label: 'Change SuperSource box source',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						AtemSuperSourceBoxSourcePicker(model, state),
					]),
					callback: (action): void => {
						executePromise(
							instance,
							atem.setSuperSourceBoxSettings(
								{
									source: getOptNumber(action, 'source'),
								},
								getOptNumber(action, 'boxIndex'),
								action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
							)
						)
					},
			  })
			: undefined,
		[ActionId.SuperSourceBoxOnAir]: model.SSrc
			? literal<CompanionActionExt>({
					label: 'Change SuperSource box enabled',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						{
							id: 'onair',
							type: 'dropdown',
							label: 'On Air',
							default: 'true',
							choices: CHOICES_KEYTRANS,
						},
					]),
					callback: (action): void => {
						const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
						const boxIndex = getOptNumber(action, 'boxIndex')

						if (action.options.onair === 'toggle') {
							const box = getSuperSourceBox(state, boxIndex, ssrcId)
							executePromise(
								instance,
								atem.setSuperSourceBoxSettings(
									{
										enabled: !box?.enabled,
									},
									boxIndex,
									ssrcId
								)
							)
						} else {
							executePromise(
								instance,
								atem.setSuperSourceBoxSettings(
									{
										enabled: action.options.onair === 'true',
									},
									boxIndex,
									ssrcId
								)
							)
						}
					},
			  })
			: undefined,
		[ActionId.SuperSourceBoxProperties]: model.SSrc
			? literal<CompanionActionExt>({
					label: 'Change SuperSource box properties',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						...AtemSuperSourcePropertiesPickers(false),
					]),
					callback: (action): void => {
						executePromise(
							instance,
							atem.setSuperSourceBoxSettings(
								{
									size: getOptNumber(action, 'size') * 1000,
									x: getOptNumber(action, 'x') * 100,
									y: getOptNumber(action, 'y') * 100,
									cropped: getOptBool(action, 'cropEnable'),
									cropTop: getOptNumber(action, 'cropTop') * 1000,
									cropBottom: getOptNumber(action, 'cropBottom') * 1000,
									cropLeft: getOptNumber(action, 'cropLeft') * 1000,
									cropRight: getOptNumber(action, 'cropRight') * 1000,
								},
								getOptNumber(action, 'boxIndex'),
								action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
							)
						)
					},
			  })
			: undefined,
		[ActionId.SuperSourceBoxPropertiesDelta]: model.SSrc
			? literal<CompanionActionExt>({
					label: 'Offset SuperSource box properties',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						...AtemSuperSourcePropertiesPickers(true),
					]),
					callback: (action): void => {
						const index = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
						const boxIndex = getOptNumber(action, 'boxIndex')
						const box = getSuperSourceBox(state, boxIndex, index)
						if (box) {
							executePromise(
								instance,
								atem.setSuperSourceBoxSettings(
									{
										size: clamp(0, 1000, box.size + getOptNumber(action, 'size') * 1000),
										x: clamp(-4800, 4800, box.x + getOptNumber(action, 'x') * 100),
										y: clamp(-2700, 2700, box.y + getOptNumber(action, 'y') * 100),
										cropTop: clamp(0, 18000, box.cropTop + getOptNumber(action, 'cropTop') * 1000),
										cropBottom: clamp(0, 18000, box.cropBottom + getOptNumber(action, 'cropBottom') * 1000),
										cropLeft: clamp(0, 32000, box.cropLeft + getOptNumber(action, 'cropLeft') * 1000),
										cropRight: clamp(0, 32000, box.cropRight + getOptNumber(action, 'cropRight') * 1000),
									},
									boxIndex,
									index
								)
							)
						}
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function streamRecordActions(instance: InstanceSkel<AtemConfig>, atem: Atem, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.StreamStartStop]: model.streaming
			? literal<CompanionActionExt>({
					label: 'Start or Stop Streaming',
					options: [
						{
							id: 'stream',
							type: 'dropdown',
							label: 'Stream',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					],
					callback: (action): void => {
						let newState = action.options.stream === 'true'
						if (action.options.stream === 'toggle') {
							newState = state.streaming?.status?.state === Enums.StreamingStatus.Idle
						}

						if (newState) {
							executePromise(instance, atem.startStreaming())
						} else {
							executePromise(instance, atem.stopStreaming())
						}
					},
			  })
			: undefined,
		[ActionId.StreamService]: model.recording
			? literal<CompanionActionExt>({
					label: 'Set streaming service',
					options: [
						{
							id: 'service',
							label: 'Service',
							type: 'textinput',
							default: '',
						},
						{
							id: 'url',
							label: 'URL',
							type: 'textinput',
							default: '',
						},
						{
							id: 'key',
							label: 'Key',
							type: 'textinput',
							default: '',
						},
					],
					callback: (action): void => {
						executePromise(
							instance,
							atem.setStreamingService({
								serviceName: `${action.options.service || ''}`,
								url: `${action.options.url || ''}`,
								key: `${action.options.key || ''}`,
							})
						)
					},
			  })
			: undefined,
		[ActionId.RecordStartStop]: model.recording
			? literal<CompanionActionExt>({
					label: 'Start or Stop Recording',
					options: [
						{
							id: 'record',
							type: 'dropdown',
							label: 'Record',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					],
					callback: (action): void => {
						let newState = action.options.record === 'true'
						if (action.options.record === 'toggle') {
							newState = state.recording?.status?.state === Enums.RecordingStatus.Idle
						}

						if (newState) {
							executePromise(instance, atem.startRecording())
						} else {
							executePromise(instance, atem.stopRecording())
						}
					},
			  })
			: undefined,
		[ActionId.RecordSwitchDisk]: model.recording
			? literal<CompanionActionExt>({
					label: 'Switch recording disk',
					options: [],
					callback: (): void => {
						executePromise(instance, atem.switchRecordingDisk())
					},
			  })
			: undefined,
		[ActionId.RecordFilename]: model.recording
			? literal<CompanionActionExt>({
					label: 'Set recording filename',
					options: [
						{
							id: 'filename',
							label: 'Filename',
							type: 'textinput',
							default: '',
						},
					],
					callback: (action): void => {
						executePromise(
							instance,
							atem.setRecordingSettings({
								filename: `${action.options.filename || ''}`,
							})
						)
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function audioActions(
	instance: InstanceSkel<AtemConfig>,
	atem: Atem,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: AtemState
) {
	if (model.classicAudio) {
		const audioInputOption = AtemAudioInputPicker(model, state)
		return {
			[ActionId.ClassicAudioGain]: literal<CompanionActionExt>({
				label: 'Set classic audio input gain',
				options: [
					audioInputOption,
					{
						type: 'number',
						label: 'Fader Level (-60 = -inf)',
						id: 'gain',
						range: true,
						required: true,
						default: 0,
						step: 0.1,
						min: -60,
						max: 6,
					},
					FadeDurationChoice,
				],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[inputId]

					transitions.run(
						`audio.${inputId}`,
						(value) => {
							executePromise(instance, atem.setAudioMixerInputGain(getOptNumber(action, 'input'), value))
						},
						channel?.gain,
						getOptNumber(action, 'gain'),
						getOptNumber(action, 'fadeDuration', 0)
					)
				},
			}),
			[ActionId.ClassicAudioGainDelta]: literal<CompanionActionExt>({
				label: 'Adjust classic audio input gain',
				options: [audioInputOption, FaderLevelDeltaChoice, FadeDurationChoice],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[inputId]

					if (typeof channel?.gain === 'number') {
						transitions.run(
							`audio.${inputId}`,
							(value) => {
								executePromise(instance, atem.setAudioMixerInputGain(getOptNumber(action, 'input'), value))
							},
							channel.gain,
							channel.gain + getOptNumber(action, 'delta'),
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			}),
			[ActionId.ClassicAudioMixOption]: literal<CompanionActionExt>({
				label: 'Set classic audio input mix option',
				options: [
					audioInputOption,
					{
						id: 'option',
						label: 'Mix option',
						type: 'dropdown',
						default: 'toggle',
						choices: [
							{
								id: 'toggle',
								label: 'Toggle (On/Off)',
							},
							...CHOICES_CLASSIC_AUDIO_MIX_OPTION,
						],
					},
				],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const audioChannels = state.audio?.channels ?? {}
					const toggleVal =
						audioChannels[inputId]?.mixOption === Enums.AudioMixOption.On
							? Enums.AudioMixOption.Off
							: Enums.AudioMixOption.On
					const newVal = action.options.option === 'toggle' ? toggleVal : getOptNumber(action, 'option')
					executePromise(instance, atem.setAudioMixerInputMixOption(inputId, newVal))
				},
			}),
			[ActionId.FairlightAudioInputGain]: undefined,
			[ActionId.FairlightAudioFaderGain]: undefined,
			[ActionId.FairlightAudioMixOption]: undefined,
		}
	} else if (model.fairlightAudio) {
		const audioInputOption = AtemAudioInputPicker(model, state)
		const audioSourceOption = AtemFairlightAudioSourcePicker()
		return {
			[ActionId.ClassicAudioGain]: undefined,
			[ActionId.ClassicAudioGainDelta]: undefined,
			[ActionId.ClassicAudioMixOption]: undefined,
			[ActionId.FairlightAudioInputGain]: literal<CompanionActionExt>({
				label: 'Set fairlight audio input gain',
				options: [
					audioInputOption,
					audioSourceOption,
					{
						type: 'number',
						label: 'Input Level (-100 = -inf)',
						id: 'gain',
						range: true,
						required: true,
						default: 0,
						step: 0.1,
						min: -100,
						max: 6,
					},
				],
				callback: (action): void => {
					executePromise(
						instance,
						atem.setFairlightAudioMixerSourceProps(getOptNumber(action, 'input'), action.options.source + '', {
							gain: getOptNumber(action, 'gain') * 100,
						})
					)
				},
			}),
			[ActionId.FairlightAudioFaderGain]: literal<CompanionActionExt>({
				label: 'Set fairlight audio fader gain',
				options: [
					audioInputOption,
					audioSourceOption,
					{
						type: 'number',
						label: 'Fader Level (-100 = -inf)',
						id: 'gain',
						range: true,
						required: true,
						default: 0,
						step: 0.1,
						min: -100,
						max: 10,
					},
				],
				callback: (action): void => {
					executePromise(
						instance,
						atem.setFairlightAudioMixerSourceProps(getOptNumber(action, 'input'), action.options.source + '', {
							faderGain: getOptNumber(action, 'gain') * 100,
						})
					)
				},
			}),
			[ActionId.FairlightAudioMixOption]: literal<CompanionActionExt>({
				label: 'Set fairlight audio input mix option',
				options: [
					audioInputOption,
					audioSourceOption,
					{
						id: 'option',
						label: 'Mix option',
						type: 'dropdown',
						default: 'toggle',
						choices: [
							{
								id: 'toggle',
								label: 'Toggle (On/Off)',
							},
							...CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION, // TODO - fairlightify
						],
					},
				],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const toggleVal =
						audioSources[sourceId]?.properties?.mixOption === Enums.FairlightAudioMixOption.On
							? Enums.FairlightAudioMixOption.Off
							: Enums.FairlightAudioMixOption.On
					const newVal = action.options.option === 'toggle' ? toggleVal : getOptNumber(action, 'option')
					executePromise(instance, atem.setFairlightAudioMixerSourceProps(inputId, sourceId, { mixOption: newVal }))
				},
			}),
		}
	} else {
		return {
			[ActionId.ClassicAudioGain]: undefined,
			[ActionId.ClassicAudioGainDelta]: undefined,
			[ActionId.ClassicAudioMixOption]: undefined,
			[ActionId.FairlightAudioInputGain]: undefined,
			[ActionId.FairlightAudioFaderGain]: undefined,
			[ActionId.FairlightAudioMixOption]: undefined,
		}
	}
}

export function GetActionsList(
	instance: InstanceSkel<AtemConfig>,
	atem: Atem,
	model: ModelSpec,
	commandBatching: AtemCommandBatching,
	transitions: AtemTransitions,
	state: AtemState
): CompanionActions {
	const actions: CompanionActionsExt = {
		...meActions(instance, atem, model, commandBatching, state),
		...dskActions(instance, atem, model, state),
		...macroActions(instance, atem, model, state),
		...ssrcActions(instance, atem, model, state),
		...streamRecordActions(instance, atem, model, state),
		...audioActions(instance, atem, model, transitions, state),
		[ActionId.Aux]: model.auxes
			? literal<CompanionActionExt>({
					label: 'Set AUX bus',
					options: [AtemAuxPicker(model), AtemAuxSourcePicker(model, state)],
					callback: (action): void => {
						executePromise(instance, atem.setAuxSource(getOptNumber(action, 'input'), getOptNumber(action, 'aux')))
					},
			  })
			: undefined,
		[ActionId.MultiviewerWindowSource]: model.MVs
			? literal<CompanionActionExt>({
					label: 'Change MV window source',
					options: [
						AtemMultiviewerPicker(model),
						AtemMultiviewWindowPicker(model),
						AtemMultiviewSourcePicker(model, state),
					],
					callback: (action): void => {
						executePromise(
							instance,
							atem.setMultiViewerSource(
								{
									windowIndex: getOptNumber(action, 'windowIndex'),
									source: getOptNumber(action, 'source'),
								},
								getOptNumber(action, 'multiViewerId')
							)
						)
					},
			  })
			: undefined,
		[ActionId.MediaPlayerSource]: model.media.players
			? literal<CompanionActionExt>({
					label: 'Change media player source',
					options: [AtemMediaPlayerPicker(model), AtemMediaPlayerSourcePicker(model, state)],
					callback: (action): void => {
						const source = getOptNumber(action, 'source')
						if (source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
							executePromise(
								instance,
								atem.setMediaPlayerSource(
									{
										sourceType: Enums.MediaSourceType.Clip,
										clipIndex: source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
									},
									getOptNumber(action, 'mediaplayer')
								)
							)
						} else {
							executePromise(
								instance,
								atem.setMediaPlayerSource(
									{
										sourceType: Enums.MediaSourceType.Still,
										stillIndex: source,
									},
									getOptNumber(action, 'mediaplayer')
								)
							)
						}
					},
			  })
			: undefined,
		[ActionId.MediaPlayerCycle]: model.media.players
			? literal<CompanionActionExt>({
					label: 'Cycle media player source',
					options: [
						AtemMediaPlayerPicker(model),
						{
							type: 'dropdown',
							id: 'direction',
							label: 'Direction',
							default: 'next',
							choices: [
								{
									id: 'next',
									label: 'Next',
								},
								{
									id: 'previous',
									label: 'Previous',
								},
							],
						},
						// AtemMediaPlayerSourcePicker(model, state)
					],
					callback: (action): void => {
						const playerId = getOptNumber(action, 'mediaplayer')
						const direction = action.options.direction as string
						const offset = direction === 'next' ? 1 : -1

						const player = getMediaPlayer(state, playerId)
						if (player?.sourceType == Enums.MediaSourceType.Still) {
							const maxIndex = state.media.stillPool.length
							let nextIndex = player.stillIndex + offset
							if (nextIndex >= maxIndex) nextIndex = 0
							if (nextIndex < 0) nextIndex = maxIndex - 1

							executePromise(
								instance,
								atem.setMediaPlayerSource(
									{
										sourceType: Enums.MediaSourceType.Still,
										stillIndex: nextIndex,
									},
									playerId
								)
							)
						}
					},
			  })
			: undefined,
	}

	return actions
}
