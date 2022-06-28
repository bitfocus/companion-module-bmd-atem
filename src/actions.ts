import { Atem, AtemState, Enums, InputState, VideoState } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionAction, CompanionActionEvent, CompanionActions } from '../../../instance_skel_types'
import {
	CHOICES_KEYTRANS,
	GetDSKIdChoices,
	GetMacroChoices,
	CHOICES_ON_OFF_TOGGLE,
	CHOICES_CLASSIC_AUDIO_MIX_OPTION,
	CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
	CHOICES_KEYFRAMES,
	CHOICES_FLYDIRECTIONS,
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
	AtemAllSourcePicker,
	AtemSuperSourceArtPropertiesPickers,
} from './input'
import { ModelSpec } from './models'
import {
	getDSK,
	getSuperSourceBox,
	getUSK,
	getTransitionProperties,
	getMediaPlayer,
	getMixEffect,
	getMultiviewerWindow,
} from './state'
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
import { SuperSource } from 'atem-connection/dist/state/video'

export enum ActionId {
	Program = 'program',
	Preview = 'preview',
	Cut = 'cut',
	Auto = 'auto',
	Aux = 'aux',
	USKSource = 'uskSource',
	USKOnAir = 'usk',
	USKFly = 'uskFly',
	USKFlyInfinite = 'uskFlyInfinite',
	DSKSource = 'dskSource',
	DSKRate = 'dskRate',
	DSKOnAir = 'dsk',
	DSKTie = 'dskTie',
	DSKAuto = 'dskAuto',
	MacroRun = 'macrorun',
	MacroContinue = 'macrocontinue',
	MacroStop = 'macrostop',
	MultiviewerWindowSource = 'setMvSource',
	SuperSourceArt = 'ssrcArt',
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
	ClassicAudioResetPeaks = 'classicAudioResetPeaks',
	ClassicAudioMasterGain = 'classicAudioMasterGain',
	ClassicAudioMasterGainDelta = 'classicAudioMasterGainDelta',
	FairlightAudioFaderGain = 'fairlightAudioFaderGain',
	FairlightAudioFaderGainDelta = 'fairlightAudioFaderGainDelta',
	FairlightAudioInputGain = 'fairlightAudioInputGain',
	FairlightAudioInputGainDelta = 'fairlightAudioInputGainDelta',
	FairlightAudioMixOption = 'fairlightAudioMixOption',
	FairlightAudioResetPeaks = 'fairlightAudioResetPeaks',
	FairlightAudioResetSourcePeaks = 'fairlightAudioResetSourcePeaks',
	FairlightAudioMasterGain = 'fairlightAudioMasterGain',
	FairlightAudioMasterGainDelta = 'fairlightAudioMasterGainDelta',
	FairlightAudioMonitorMasterMuted = 'fairlightAudioMonitorMasterMuted',
	FairlightAudioMonitorGain = 'fairlightAudioMonitorGain',
	FairlightAudioMonitorGainDelta = 'fairlightAudioMonitorGainDelta',
	// FairlightAudioMonitorMasterGain = 'fairlightAudioMonitorMasterGain',
	SaveStartupState = 'saveStartupState',
	ClearStartupState = 'clearStartupState',
	InputName = 'inputName',
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
	atem: Atem | undefined,
	model: ModelSpec,
	commandBatching: AtemCommandBatching,
	state: AtemState
) {
	return {
		[ActionId.Program]: literal<CompanionActionExt>({
			label: 'ME: Set Program input',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			callback: (action): void => {
				executePromise(
					instance,
					atem?.changeProgramInput(getOptNumber(action, 'input'), getOptNumber(action, 'mixeffect'))
				)
			},
			learn: (action) => {
				const me = getMixEffect(state, getOptNumber(action, 'mixeffect'))

				if (me) {
					return {
						...action.options,
						input: me.programInput,
					}
				} else {
					return undefined
				}
			},
		}),
		[ActionId.Preview]: literal<CompanionActionExt>({
			label: 'ME: Set Preview input',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			callback: (action): void => {
				executePromise(
					instance,
					atem?.changePreviewInput(getOptNumber(action, 'input'), getOptNumber(action, 'mixeffect'))
				)
			},
			learn: (action) => {
				const me = getMixEffect(state, getOptNumber(action, 'mixeffect'))

				if (me) {
					return {
						...action.options,
						input: me.previewInput,
					}
				} else {
					return undefined
				}
			},
		}),
		[ActionId.Cut]: literal<CompanionActionExt>({
			label: 'ME: Perform CUT transition',
			options: [AtemMEPicker(model, 0)],
			callback: (action): void => {
				executePromise(instance, atem?.cut(getOptNumber(action, 'mixeffect')))
			},
		}),
		[ActionId.Auto]: literal<CompanionActionExt>({
			label: 'ME: Perform AUTO transition',
			options: [AtemMEPicker(model, 0)],
			callback: (action): void => {
				executePromise(instance, atem?.autoTransition(getOptNumber(action, 'mixeffect')))
			},
		}),

		[ActionId.USKSource]: model.USKs
			? literal<CompanionActionExt>({
					label: 'Upstream key: Set inputs',
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
								atem?.setUpstreamKeyerFillSource(
									getOptNumber(action, 'fill'),
									getOptNumber(action, 'mixeffect'),
									getOptNumber(action, 'key')
								),
								atem?.setUpstreamKeyerCutSource(
									getOptNumber(action, 'cut'),
									getOptNumber(action, 'mixeffect'),
									getOptNumber(action, 'key')
								),
							])
						)
					},
					learn: (action) => {
						const usk = getUSK(state, getOptNumber(action, 'mixeffect'), getOptNumber(action, 'key'))

						if (usk) {
							return {
								...action.options,
								cut: usk.cutSource,
								fill: usk.fillSource,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.USKOnAir]: model.USKs
			? literal<CompanionActionExt>({
					label: 'Upstream key: Set OnAir',
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
							executePromise(instance, atem?.setUpstreamKeyerOnAir(!usk?.onAir, meIndex, keyIndex))
						} else {
							executePromise(instance, atem?.setUpstreamKeyerOnAir(action.options.onair === 'true', meIndex, keyIndex))
						}
					},
					learn: (action) => {
						const usk = getUSK(state, getOptNumber(action, 'mixeffect'), getOptNumber(action, 'key'))

						if (usk) {
							return {
								...action.options,
								onair: usk.onAir,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.TransitionStyle]: literal<CompanionActionExt>({
			label: 'Transition: Set style/pattern',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(model.media.clips === 0)],
			callback: (action): void => {
				executePromise(
					instance,
					atem?.setTransitionStyle(
						{
							nextStyle: getOptNumber(action, 'style'),
						},
						getOptNumber(action, 'mixeffect')
					)
				)
			},
			learn: (action) => {
				const me = getMixEffect(state, getOptNumber(action, 'mixeffect'))

				if (me) {
					return {
						...action.options,
						style: me.transitionProperties.nextStyle,
					}
				} else {
					return undefined
				}
			},
		}),
		[ActionId.TransitionRate]: literal<CompanionActionExt>({
			label: 'Transition: Change rate',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(true), AtemRatePicker('Transition Rate')],
			callback: (action): void => {
				const style = getOptNumber(action, 'style') as Enums.TransitionStyle
				switch (style) {
					case Enums.TransitionStyle.MIX:
						executePromise(
							instance,
							atem?.setMixTransitionSettings(
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
							atem?.setDipTransitionSettings(
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
							atem?.setWipeTransitionSettings(
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
							atem?.setDVETransitionSettings(
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
			learn: (action) => {
				const me = getMixEffect(state, action.options.mixeffect)

				if (me?.transitionSettings) {
					const style = Number(action.options.style) as Enums.TransitionStyle
					switch (style) {
						case Enums.TransitionStyle.MIX:
							return {
								...action.options,
								rate: me.transitionSettings.mix?.rate,
							}
						case Enums.TransitionStyle.DIP:
							return {
								...action.options,
								rate: me.transitionSettings.dip?.rate,
							}
						case Enums.TransitionStyle.WIPE:
							return {
								...action.options,
								rate: me.transitionSettings.wipe?.rate,
							}
						case Enums.TransitionStyle.DVE:
							return {
								...action.options,
								rate: me.transitionSettings.DVE?.rate,
							}
						case Enums.TransitionStyle.STING:
							return undefined
						default:
							assertUnreachable(style)
							return undefined
					}
				} else {
					return undefined
				}
			},
		}),
		[ActionId.TransitionSelection]: literal<CompanionActionExt>({
			label: 'Transition: Change selection',
			options: [AtemMEPicker(model, 0), ...AtemTransitionSelectionPickers(model)],
			callback: (action): void => {
				executePromise(
					instance,
					atem?.setTransitionStyle(
						{
							nextSelection: calculateTransitionSelection(model.USKs, action.options),
						},
						getOptNumber(action, 'mixeffect')
					)
				)
			},
		}),
		[ActionId.TransitionSelectionComponent]: literal<CompanionActionExt>({
			label: 'Transition: Change selection component',
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
				if (tp && atem) {
					let batch = commandBatching.meTransitionSelection.get(me)
					if (!batch) {
						batch = new CommandBatching(
							async (newVal) =>
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
							if (oldVal.includes(component)) {
								mode2 = 'false'
							} else {
								mode2 = 'true'
							}
						}

						if (mode2 === 'true') {
							return [...oldVal, component]
						} else {
							return oldVal.filter((v) => v !== component)
						}
					})
				}
			},
		}),
		[ActionId.FadeToBlackAuto]: literal<CompanionActionExt>({
			label: 'Fade to black: Run AUTO Transition',
			options: [AtemMEPicker(model, 0)],
			callback: (action): void => {
				executePromise(instance, atem?.fadeToBlack(getOptNumber(action, 'mixeffect')))
			},
		}),
		[ActionId.FadeToBlackRate]: literal<CompanionActionExt>({
			label: 'Fade to black: Change rate',
			options: [AtemMEPicker(model, 0), AtemRatePicker('Rate')],
			callback: (action): void => {
				executePromise(
					instance,
					atem?.setFadeToBlackRate(getOptNumber(action, 'rate'), getOptNumber(action, 'mixeffect'))
				)
			},
			learn: (action) => {
				const me = getMixEffect(state, action.options.mixeffect)

				if (me?.fadeToBlack) {
					return {
						...action.options,
						rate: me.fadeToBlack.rate,
					}
				} else {
					return undefined
				}
			},
		}),
		[ActionId.USKFly]:
			model.USKs && model.DVEs
				? literal<CompanionActionExt>({
						label: 'Upstream key: fly to keyframe',
						options: [
							AtemMEPicker(model, 0),
							AtemUSKPicker(model),
							{
								type: 'dropdown',
								id: 'keyframe',
								label: 'Key Frame',
								choices: CHOICES_KEYFRAMES,
								default: CHOICES_KEYFRAMES[0].id,
							},
						],
						callback: (action): void => {
							executePromise(
								instance,
								atem?.runUpstreamKeyerFlyKeyTo(
									getOptNumber(action, 'mixeffect'),
									getOptNumber(action, 'key'),
									getOptNumber(action, 'keyframe')
								)
							)
						},
						learn: (action) => {
							const usk = getUSK(state, getOptNumber(action, 'mixeffect'), getOptNumber(action, 'key'))

							if (usk?.flyProperties) {
								return {
									...action.options,
									keyframe: usk.flyProperties.isAtKeyFrame,
								}
							} else {
								return undefined
							}
						},
				  })
				: undefined,
		[ActionId.USKFlyInfinite]:
			model.USKs && model.DVEs
				? literal<CompanionActionExt>({
						label: 'Upstream key: fly to infinite',
						options: [
							AtemMEPicker(model, 0),
							AtemUSKPicker(model),
							{
								type: 'dropdown',
								id: 'flydirection',
								label: 'Fly direction',
								choices: CHOICES_FLYDIRECTIONS,
								default: CHOICES_FLYDIRECTIONS[0].id,
							},
						],
						callback: (action): void => {
							executePromise(
								instance,
								atem?.runUpstreamKeyerFlyKeyToInfinite(
									getOptNumber(action, 'mixeffect'),
									getOptNumber(action, 'key'),
									getOptNumber(action, 'flydirection')
								)
							)
						},
						learn: (action) => {
							const usk = getUSK(state, getOptNumber(action, 'mixeffect'), getOptNumber(action, 'key'))

							if (usk?.flyProperties) {
								return {
									...action.options,
									flydirection: usk.flyProperties.runToInfiniteIndex,
								}
							} else {
								return undefined
							}
						},
				  })
				: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function dskActions(instance: InstanceSkel<AtemConfig>, atem: Atem | undefined, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.DSKSource]: model.DSKs
			? literal<CompanionActionExt>({
					label: 'Downstream key: Set inputs',
					options: [AtemDSKPicker(model), AtemKeyFillSourcePicker(model, state), AtemKeyCutSourcePicker(model, state)],
					callback: (action): void => {
						executePromise(
							instance,
							Promise.all([
								atem?.setDownstreamKeyFillSource(getOptNumber(action, 'fill'), getOptNumber(action, 'key')),
								atem?.setDownstreamKeyCutSource(getOptNumber(action, 'cut'), getOptNumber(action, 'key')),
							])
						)
					},
					learn: (feedback) => {
						const dsk = getDSK(state, feedback.options.key)

						if (dsk?.sources) {
							return {
								...feedback.options,
								fill: dsk.sources.fillSource,
								cut: dsk.sources.cutSource,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
			[ActionId.DSKRate]: model.DSKs
			? literal<CompanionActionExt>({
					label: 'Downstream key: Set Rate',
					options: [AtemDSKPicker(model), AtemRatePicker('Rate')],
					callback: (action): void => {
						executePromise(
							instance,
							Promise.all([
								atem?.setDownstreamKeyRate(getOptNumber(action, 'rate'), getOptNumber(action, 'key')),
							])
						)
					},
					learn: (feedback) => {
						const dsk = getDSK(state, feedback.options.key)

						if (dsk?.properties) {
							return {
								...feedback.options,
								rate: dsk.properties.rate,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.DSKAuto]: model.DSKs
			? literal<CompanionActionExt>({
					label: 'Downstream key: Run AUTO Transition',
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
						executePromise(instance, atem?.autoDownstreamKey(getOptNumber(action, 'downstreamKeyerId')))
					},
			  })
			: undefined,
		[ActionId.DSKOnAir]: model.DSKs
			? literal<CompanionActionExt>({
					label: 'Downstream key: Set OnAir',
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
							executePromise(instance, atem?.setDownstreamKeyOnAir(!dsk?.onAir, keyIndex))
						} else {
							executePromise(instance, atem?.setDownstreamKeyOnAir(action.options.onair === 'true', keyIndex))
						}
					},
					learn: (feedback) => {
						const dsk = getDSK(state, feedback.options.key)

						if (dsk) {
							return {
								...feedback.options,
								onair: dsk.onAir,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.DSKTie]: model.DSKs
			? literal<CompanionActionExt>({
					label: 'Downstream key: Set Tied',
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
							executePromise(instance, atem?.setDownstreamKeyTie(!dsk?.properties?.tie, keyIndex))
						} else {
							executePromise(instance, atem?.setDownstreamKeyTie(action.options.state === 'true', keyIndex))
						}
					},
					learn: (feedback) => {
						const dsk = getDSK(state, feedback.options.key)

						if (dsk?.properties) {
							return {
								...feedback.options,
								state: dsk.properties.tie,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function macroActions(instance: InstanceSkel<AtemConfig>, atem: Atem | undefined, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.MacroRun]: model.macros
			? literal<CompanionActionExt>({
					label: 'Macro: Run',
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
							executePromise(instance, atem?.macroContinue())
						} else if (macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex) {
							executePromise(instance, atem?.macroStopRecord())
						} else {
							executePromise(instance, atem?.macroRun(macroIndex))
						}
					},
			  })
			: undefined,
		[ActionId.MacroContinue]: model.macros
			? literal<CompanionActionExt>({
					label: 'Macro: Continue',
					options: [],
					callback: (): void => {
						executePromise(instance, atem?.macroContinue())
					},
			  })
			: undefined,
		[ActionId.MacroStop]: model.macros
			? literal<CompanionActionExt>({
					label: 'Macro: Stop',
					options: [],
					callback: (): void => {
						executePromise(instance, atem?.macroStop())
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ssrcActions(instance: InstanceSkel<AtemConfig>, atem: Atem | undefined, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.SuperSourceArt]: model.SSrc
			? literal<CompanionActionExt>({
					label: 'SuperSource: Set art properties',
					options: compact([
						AtemSuperSourceIdPicker(model),
						...AtemSuperSourceArtPropertiesPickers(model, state, true),
					]),
					callback: (action): void => {
						const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
						const newProps: Partial<VideoState.SuperSource.SuperSourceProperties> = {}

						const props = action.options.properties
						if (props && Array.isArray(props)) {
							if (props.includes('fill')) newProps.artFillSource = getOptNumber(action, 'fill')
							if (props.includes('key')) newProps.artCutSource = getOptNumber(action, 'key')

							if (props.includes('artOption')) {
								const rawArtOption = action.options.artOption
								if (rawArtOption === 'toggle') {
									const ssrc = state.video.superSources[ssrcId]

									newProps.artOption =
										ssrc?.properties?.artOption === Enums.SuperSourceArtOption.Background
											? Enums.SuperSourceArtOption.Foreground
											: Enums.SuperSourceArtOption.Background
								} else if (rawArtOption !== 'unchanged') {
									newProps.artOption = getOptNumber(action, 'artOption')
								}
							}

							if (props.includes('artPreMultiplied')) newProps.artPreMultiplied = getOptBool(action, 'artPreMultiplied')
							if (props.includes('artClip')) newProps.artClip = getOptNumber(action, 'artClip') * 10
							if (props.includes('artGain')) newProps.artGain = getOptNumber(action, 'artGain') * 10
							if (props.includes('artInvertKey')) newProps.artInvertKey = getOptBool(action, 'artInvertKey')
						}

						if (Object.keys(newProps).length === 0) return

						executePromise(instance, atem?.setSuperSourceProperties(newProps, ssrcId))
					},
					learn: (action) => {
						const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0

						const ssrcConfig = atem?.state?.video.superSources?.[ssrcId]?.properties
						if (ssrcConfig) {
							return {
								...action.options,
								fill: ssrcConfig.artFillSource,
								key: ssrcConfig.artCutSource,

								artOption: ssrcConfig.artOption,
								artPreMultiplied: ssrcConfig.artPreMultiplied,
								artClip: ssrcConfig.artClip / 10,
								artGain: ssrcConfig.artGain / 10,
								artInvertKey: ssrcConfig.artInvertKey,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.SuperSourceBoxSource]: model.SSrc
			? literal<CompanionActionExt>({
					// TODO - combine into ActionId.SuperSourceBoxProperties
					label: 'SuperSource: Set box source',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						AtemSuperSourceBoxSourcePicker(model, state),
					]),
					callback: (action): void => {
						executePromise(
							instance,
							atem?.setSuperSourceBoxSettings(
								{
									source: getOptNumber(action, 'source'),
								},
								getOptNumber(action, 'boxIndex'),
								action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
							)
						)
					},
					learn: (action) => {
						const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
						const boxId = getOptNumber(action, 'boxIndex')

						const ssrcConfig = state?.video.superSources?.[ssrcId]?.boxes[boxId]
						if (ssrcConfig) {
							return {
								...action.options,
								source: ssrcConfig.source,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.SuperSourceBoxOnAir]: model.SSrc
			? literal<CompanionActionExt>({
					// TODO - combine into ActionId.SuperSourceBoxProperties
					label: 'SuperSource: Set box enabled',
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
								atem?.setSuperSourceBoxSettings(
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
								atem?.setSuperSourceBoxSettings(
									{
										enabled: action.options.onair === 'true',
									},
									boxIndex,
									ssrcId
								)
							)
						}
					},
					learn: (action) => {
						const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
						const boxId = getOptNumber(action, 'boxIndex')

						const ssrcConfig = state?.video.superSources?.[ssrcId]?.boxes[boxId]
						if (ssrcConfig) {
							return {
								...action.options,
								onair: ssrcConfig.enabled + '',
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.SuperSourceBoxProperties]: model.SSrc
			? literal<CompanionActionExt>({
					label: 'SuperSource: Change box properties',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						...AtemSuperSourcePropertiesPickers(model, state, false),
					]),
					callback: (action): void => {
						const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
						const boxIndex = getOptNumber(action, 'boxIndex')

						const newProps: Partial<SuperSource.SuperSourceBox> = {}

						const props = action.options.properties
						if (props && Array.isArray(props)) {
							if (props.includes('onair')) {
								if (action.options.onair === 'toggle') {
									const box = getSuperSourceBox(state, boxIndex, ssrcId)
									newProps.enabled = !box?.enabled
								} else {
									newProps.enabled = action.options.onair === 'true'
								}
							}

							if (props.includes('source')) newProps.source = getOptNumber(action, 'source')

							if (props.includes('size')) newProps.size = getOptNumber(action, 'size') * 1000
							if (props.includes('x')) newProps.x = getOptNumber(action, 'x') * 100
							if (props.includes('y')) newProps.y = getOptNumber(action, 'y') * 100

							if (props.includes('cropEnable')) newProps.cropped = getOptBool(action, 'cropEnable')
							if (props.includes('cropTop')) newProps.cropTop = getOptNumber(action, 'cropTop') * 1000
							if (props.includes('cropBottom')) newProps.cropBottom = getOptNumber(action, 'cropBottom') * 1000
							if (props.includes('cropLeft')) newProps.cropLeft = getOptNumber(action, 'cropLeft') * 1000
							if (props.includes('cropRight')) newProps.cropRight = getOptNumber(action, 'cropRight') * 1000
						}

						if (Object.keys(newProps).length === 0) return

						executePromise(instance, atem?.setSuperSourceBoxSettings(newProps, boxIndex, ssrcId))
					},
					learn: (action) => {
						const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
						const boxId = getOptNumber(action, 'boxIndex')

						const ssrcConfig = state?.video.superSources?.[ssrcId]?.boxes[boxId]
						if (ssrcConfig) {
							return {
								...action.options,
								onair: ssrcConfig.enabled + '',
								source: ssrcConfig.source,
								size: ssrcConfig.size / 1000,
								x: ssrcConfig.x / 100,
								y: ssrcConfig.y / 100,
								cropEnable: ssrcConfig.cropped,
								cropTop: ssrcConfig.cropTop / 1000,
								cropBottom: ssrcConfig.cropBottom / 1000,
								cropLeft: ssrcConfig.cropLeft / 1000,
								cropRight: ssrcConfig.cropRight / 1000,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.SuperSourceBoxPropertiesDelta]: model.SSrc
			? literal<CompanionActionExt>({
					label: 'SuperSource: Offset box properties',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						...AtemSuperSourcePropertiesPickers(model, state, true),
					]),
					callback: (action): void => {
						const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
						const boxIndex = getOptNumber(action, 'boxIndex')

						const newProps: Partial<SuperSource.SuperSourceBox> = {}

						const box = getSuperSourceBox(state, boxIndex, ssrcId)

						const props = action.options.properties
						if (box && props && Array.isArray(props)) {
							if (props.includes('size')) newProps.size = clamp(0, 1000, box.size + getOptNumber(action, 'size') * 1000)
							if (props.includes('x')) newProps.x = clamp(-4800, 4800, box.x + getOptNumber(action, 'x') * 100)
							if (props.includes('y')) newProps.y = clamp(-2700, 2700, box.y + getOptNumber(action, 'y') * 100)

							if (props.includes('cropTop'))
								newProps.cropTop = clamp(0, 18000, box.cropTop + getOptNumber(action, 'cropTop') * 1000)
							if (props.includes('cropBottom'))
								newProps.cropBottom = clamp(0, 18000, box.cropBottom + getOptNumber(action, 'cropBottom') * 1000)
							if (props.includes('cropLeft'))
								newProps.cropLeft = clamp(0, 32000, box.cropLeft + getOptNumber(action, 'cropLeft') * 1000)
							if (props.includes('cropRight'))
								newProps.cropRight = clamp(0, 32000, box.cropRight + getOptNumber(action, 'cropRight') * 1000)
						}

						if (Object.keys(newProps).length === 0) return

						executePromise(instance, atem?.setSuperSourceBoxSettings(newProps, boxIndex, ssrcId))
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function streamRecordActions(
	instance: InstanceSkel<AtemConfig>,
	atem: Atem | undefined,
	model: ModelSpec,
	state: AtemState
) {
	return {
		[ActionId.StreamStartStop]: model.streaming
			? literal<CompanionActionExt>({
					label: 'Stream: Start or Stop',
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
							executePromise(instance, atem?.startStreaming())
						} else {
							executePromise(instance, atem?.stopStreaming())
						}
					},
					learn: (feedback) => {
						if (state.streaming?.status) {
							return {
								...feedback.options,
								state: state.streaming.status.state,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.StreamService]: model.recording
			? literal<CompanionActionExt>({
					label: 'Stream: Set service',
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
							atem?.setStreamingService({
								serviceName: `${action.options.service || ''}`,
								url: `${action.options.url || ''}`,
								key: `${action.options.key || ''}`,
							})
						)
					},
					learn: (feedback) => {
						if (state.streaming?.service) {
							return {
								...feedback.options,
								service: state.streaming.service.serviceName,
								url: state.streaming.service.url,
								key: state.streaming.service.key,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.RecordStartStop]: model.recording
			? literal<CompanionActionExt>({
					label: 'Recording: Start or Stop',
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
							executePromise(instance, atem?.startRecording())
						} else {
							executePromise(instance, atem?.stopRecording())
						}
					},
					learn: (feedback) => {
						if (state.recording?.status) {
							return {
								...feedback.options,
								state: state.recording.status.state,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.RecordSwitchDisk]: model.recording
			? literal<CompanionActionExt>({
					label: 'Recording: Switch disk',
					options: [],
					callback: (): void => {
						executePromise(instance, atem?.switchRecordingDisk())
					},
			  })
			: undefined,
		[ActionId.RecordFilename]: model.recording
			? literal<CompanionActionExt>({
					label: 'Recording: Set filename',
					options: [
						{
							id: 'filename',
							label: 'Filename',
							type: 'textinput',
							default: '',
						},
					],
					callback: (action): void => {
						instance.parseVariables(`${action.options.filename || ''}`, (filename) => {
							executePromise(
								instance,
								atem?.setRecordingSettings({
									filename: `${filename || ''}`,
								})
							)
						})
					},
					learn: (feedback) => {
						if (state.recording?.properties) {
							return {
								...feedback.options,
								filename: state.recording?.properties.filename,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function audioActions(
	instance: InstanceSkel<AtemConfig>,
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: AtemState
) {
	if (model.classicAudio) {
		const audioInputOption = AtemAudioInputPicker(model, state)
		return {
			[ActionId.ClassicAudioGain]: literal<CompanionActionExt>({
				label: 'Classic Audio: Set input gain',
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
						`audio.${inputId}.gain`,
						(value) => {
							executePromise(instance, atem?.setClassicAudioMixerInputProps(inputId, { gain: value }))
						},
						channel?.gain,
						getOptNumber(action, 'gain'),
						getOptNumber(action, 'fadeDuration', 0)
					)
				},
				learn: (action) => {
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[Number(action.options.input)]

					if (channel) {
						return {
							...action.options,
							gain: channel.gain,
						}
					} else {
						return undefined
					}
				},
			}),
			[ActionId.ClassicAudioGainDelta]: literal<CompanionActionExt>({
				label: 'Classic Audio: Adjust input gain',
				options: [audioInputOption, FaderLevelDeltaChoice, FadeDurationChoice],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[inputId]

					if (typeof channel?.gain === 'number') {
						transitions.run(
							`audio.${inputId}.gain`,
							(value) => {
								executePromise(instance, atem?.setClassicAudioMixerInputProps(inputId, { gain: value }))
							},
							channel.gain,
							channel.gain + getOptNumber(action, 'delta'),
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			}),
			[ActionId.ClassicAudioMixOption]: literal<CompanionActionExt>({
				label: 'Classic Audio: Set input mix option',
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
					executePromise(instance, atem?.setClassicAudioMixerInputProps(inputId, { mixOption: newVal }))
				},
				learn: (action) => {
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[Number(action.options.input)]

					if (channel) {
						return {
							...action.options,
							option: channel.mixOption,
						}
					} else {
						return undefined
					}
				},
			}),
			[ActionId.ClassicAudioResetPeaks]: literal<CompanionActionExt>({
				label: 'Classic Audio: Reset peaks',
				options: [
					{
						type: 'dropdown',
						id: 'reset',
						label: 'Reset',
						default: 'all',
						choices: [
							{
								id: 'all',
								label: 'All',
							},
							{
								id: 'master',
								label: 'Master',
							},
							{
								id: 'monitor',
								label: 'Monitor',
							},
							...audioInputOption.choices,
						],
					},
				],
				callback: (action): void => {
					const rawVal = action.options['target']
					if (rawVal === 'all') {
						executePromise(instance, atem?.setClassicAudioResetPeaks({ all: true }))
					} else if (rawVal === 'master') {
						executePromise(instance, atem?.setClassicAudioResetPeaks({ master: true }))
					} else if (rawVal === 'monitor') {
						executePromise(instance, atem?.setClassicAudioResetPeaks({ monitor: true }))
					} else {
						const inputId = getOptNumber(action, 'target')
						executePromise(instance, atem?.setClassicAudioResetPeaks({ input: inputId }))
					}
				},
			}),
			[ActionId.ClassicAudioMasterGain]: literal<CompanionActionExt>({
				label: 'Classic Audio: Set master gain',
				options: [
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
					transitions.run(
						`audio.master.gain`,
						(value) => {
							executePromise(instance, atem?.setClassicAudioMixerMasterProps({ gain: value }))
						},
						atem?.state?.audio?.master?.gain,
						getOptNumber(action, 'gain'),
						getOptNumber(action, 'fadeDuration', 0)
					)
				},
				learn: (action) => {
					const props = state.audio?.master

					if (props) {
						return {
							...action.options,
							gain: props.gain,
						}
					} else {
						return undefined
					}
				},
			}),
			[ActionId.ClassicAudioMasterGainDelta]: literal<CompanionActionExt>({
				label: 'Classic Audio: Adjust master gain',
				options: [FaderLevelDeltaChoice, FadeDurationChoice],
				callback: (action): void => {
					const currentGain = state.audio?.master?.gain

					if (typeof currentGain === 'number') {
						transitions.run(
							`audio.master.gain`,
							(value) => {
								executePromise(instance, atem?.setClassicAudioMixerMasterProps({ gain: value }))
							},
							currentGain,
							currentGain + getOptNumber(action, 'gain'),
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			}),
			[ActionId.FairlightAudioInputGain]: undefined,
			[ActionId.FairlightAudioInputGainDelta]: undefined,
			[ActionId.FairlightAudioFaderGain]: undefined,
			[ActionId.FairlightAudioFaderGainDelta]: undefined,
			[ActionId.FairlightAudioMixOption]: undefined,
			[ActionId.FairlightAudioResetPeaks]: undefined,
			[ActionId.FairlightAudioResetSourcePeaks]: undefined,
			[ActionId.FairlightAudioMasterGain]: undefined,
			[ActionId.FairlightAudioMasterGainDelta]: undefined,
			[ActionId.FairlightAudioMonitorMasterMuted]: undefined,
			[ActionId.FairlightAudioMonitorGain]: undefined,
			[ActionId.FairlightAudioMonitorGainDelta]: undefined,
			// [ActionId.FairlightAudioMonitorMasterGain]: undefined,
		}
	} else if (model.fairlightAudio) {
		const audioInputOption = AtemAudioInputPicker(model, state)
		const audioSourceOption = AtemFairlightAudioSourcePicker()
		return {
			[ActionId.ClassicAudioGain]: undefined,
			[ActionId.ClassicAudioGainDelta]: undefined,
			[ActionId.ClassicAudioMixOption]: undefined,
			[ActionId.ClassicAudioResetPeaks]: undefined,
			[ActionId.ClassicAudioMasterGain]: undefined,
			[ActionId.ClassicAudioMasterGainDelta]: undefined,
			[ActionId.FairlightAudioInputGain]: literal<CompanionActionExt>({
				label: 'Fairlight Audio: Set input gain',
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
					FadeDurationChoice,
				],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''

					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const source = audioSources[sourceId]

					transitions.run(
						`audio.${inputId}.${sourceId}.gain`,
						(value) => {
							executePromise(
								instance,
								atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
									gain: value,
								})
							)
						},
						source?.properties?.gain,
						getOptNumber(action, 'gain') * 100,
						getOptNumber(action, 'fadeDuration', 0)
					)
				},
				learn: (action) => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(action.options.input)]?.sources ?? {}
					const source = audioSources[action.options.source + '']

					if (source?.properties) {
						return {
							...action.options,
							gain: source.properties.gain / 100,
						}
					} else {
						return undefined
					}
				},
			}),
			[ActionId.FairlightAudioInputGainDelta]: literal<CompanionActionExt>({
				label: 'Fairlight Audio: Adjust input gain',
				options: [audioInputOption, audioSourceOption, FaderLevelDeltaChoice, FadeDurationChoice],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''

					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const source = audioSources[sourceId]

					if (typeof source?.properties?.gain === 'number') {
						transitions.run(
							`audio.${inputId}.${sourceId}.gain`,
							(value) => {
								executePromise(
									instance,
									atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
										gain: value,
									})
								)
							},
							source.properties.gain,
							source.properties.gain + getOptNumber(action, 'delta') * 100,
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			}),
			[ActionId.FairlightAudioFaderGain]: literal<CompanionActionExt>({
				label: 'Fairlight Audio: Set fader gain',
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
					FadeDurationChoice,
				],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''

					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const source = audioSources[sourceId]

					transitions.run(
						`audio.${inputId}.${sourceId}.faderGain`,
						(value) => {
							executePromise(
								instance,
								atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
									faderGain: value,
								})
							)
						},
						source?.properties?.faderGain,
						getOptNumber(action, 'gain') * 100,
						getOptNumber(action, 'fadeDuration', 0)
					)
				},
				learn: (action) => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(action.options.input)]?.sources ?? {}
					const source = audioSources[action.options.source + '']

					if (source?.properties) {
						return {
							...action.options,
							gain: source.properties.faderGain / 100,
						}
					} else {
						return undefined
					}
				},
			}),
			[ActionId.FairlightAudioFaderGainDelta]: literal<CompanionActionExt>({
				label: 'Fairlight Audio: Adjust fader gain',
				options: [audioInputOption, audioSourceOption, FaderLevelDeltaChoice, FadeDurationChoice],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''

					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const source = audioSources[sourceId]

					if (typeof source?.properties?.faderGain === 'number') {
						transitions.run(
							`audio.${inputId}.${sourceId}.faderGain`,
							(value) => {
								executePromise(
									instance,
									atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
										faderGain: value,
									})
								)
							},
							source.properties.faderGain,
							source.properties.faderGain + getOptNumber(action, 'delta') * 100,
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			}),
			[ActionId.FairlightAudioMixOption]: literal<CompanionActionExt>({
				label: 'Fairlight Audio: Set input mix option',
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
							...CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
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
					executePromise(instance, atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, { mixOption: newVal }))
				},
				learn: (action) => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(action.options.input)]?.sources ?? {}
					const source = audioSources[action.options.source + '']

					if (source?.properties) {
						return {
							...action.options,
							option: source.properties.mixOption,
						}
					} else {
						return undefined
					}
				},
			}),
			[ActionId.FairlightAudioResetPeaks]: literal<CompanionActionExt>({
				label: 'Fairlight Audio: Reset peaks',
				options: [
					{
						type: 'dropdown',
						id: 'reset',
						label: 'Reset',
						default: 'all',
						choices: [
							{
								id: 'all',
								label: 'All',
							},
							{
								id: 'master',
								label: 'Master',
							},
						],
					},
				],
				callback: (action): void => {
					const rawVal = action.options['target']
					if (rawVal === 'all') {
						executePromise(instance, atem?.setFairlightAudioMixerResetPeaks({ all: true, master: false }))
					} else if (rawVal === 'master') {
						executePromise(instance, atem?.setFairlightAudioMixerResetPeaks({ master: true, all: false }))
					}
				},
			}),
			[ActionId.FairlightAudioResetSourcePeaks]: literal<CompanionActionExt>({
				label: 'Fairlight Audio: Reset Source peaks',
				options: [audioInputOption, audioSourceOption],
				callback: (action): void => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''
					executePromise(
						instance,
						atem?.setFairlightAudioMixerSourceResetPeaks(inputId, sourceId, {
							output: true,
							dynamicsInput: false,
							dynamicsOutput: false,
						})
					)
				},
			}),
			[ActionId.FairlightAudioMasterGain]: literal<CompanionActionExt>({
				label: 'Fairlight Audio: Set master gain',
				options: [
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
					FadeDurationChoice,
				],
				callback: (action): void => {
					transitions.run(
						`audio.master.gain`,
						(value) => {
							executePromise(
								instance,
								atem?.setFairlightAudioMixerMasterProps({
									faderGain: value,
								})
							)
						},
						atem?.state?.fairlight?.master?.properties?.faderGain,
						getOptNumber(action, 'gain') * 100,
						getOptNumber(action, 'fadeDuration', 0)
					)
				},
				learn: (action) => {
					const props = state.fairlight?.master?.properties

					if (props) {
						return {
							...action.options,
							gain: props.faderGain / 100,
						}
					} else {
						return undefined
					}
				},
			}),
			[ActionId.FairlightAudioMasterGainDelta]: literal<CompanionActionExt>({
				label: 'Fairlight Audio: Adjust master gain',
				options: [FaderLevelDeltaChoice, FadeDurationChoice],
				callback: (action): void => {
					const currentGain = state.fairlight?.master?.properties?.faderGain

					if (typeof currentGain === 'number') {
						transitions.run(
							`audio.master.gain`,
							(value) => {
								executePromise(
									instance,
									atem?.setFairlightAudioMixerMasterProps({
										faderGain: value,
									})
								)
							},
							currentGain,
							currentGain + getOptNumber(action, 'delta') * 100,
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			}),
			[ActionId.FairlightAudioMonitorMasterMuted]: model.fairlightAudio.monitor
				? literal<CompanionActionExt>({
						label: 'Fairlight Audio: Monitor/Headphone master muted',
						options: [
							{
								id: 'state',
								type: 'dropdown',
								label: 'State',
								default: 'true',
								choices: CHOICES_ON_OFF_TOGGLE,
							},
						],
						callback: (action): void => {
							let target: boolean
							if (action.options.state === 'toggle') {
								target = !atem?.state?.fairlight?.monitor?.inputMasterMuted
							} else {
								target = action.options.state === 'true'
							}

							executePromise(
								instance,
								atem?.setFairlightAudioMixerMonitorProps({
									inputMasterMuted: target,
								})
							)
						},
						learn: (action) => {
							const props = state.fairlight?.monitor

							if (props) {
								return {
									...action.options,
									state: props.inputMasterMuted,
								}
							} else {
								return undefined
							}
						},
				  })
				: undefined,
			[ActionId.FairlightAudioMonitorGain]: model.fairlightAudio.monitor
				? literal<CompanionActionExt>({
						label: 'Fairlight Audio: Monitor/Headphone fader gain',
						options: [
							{
								type: 'number',
								label: 'Fader Level (-60 = Min)',
								id: 'gain',
								range: true,
								required: true,
								default: 0,
								step: 0.1,
								min: -60,
								max: 10,
							},
							FadeDurationChoice,
						],
						callback: (action): void => {
							transitions.run(
								`audio.monitor.faderGain`,
								(value) => {
									executePromise(
										instance,
										atem?.setFairlightAudioMixerMonitorProps({
											gain: value,
										})
									)
								},
								atem?.state?.fairlight?.monitor?.gain,
								getOptNumber(action, 'gain') * 100,
								getOptNumber(action, 'fadeDuration', 0)
							)
						},
						learn: (action) => {
							const props = state.fairlight?.monitor

							if (props) {
								return {
									...action.options,
									gain: props.gain / 100,
								}
							} else {
								return undefined
							}
						},
				  })
				: undefined,
			[ActionId.FairlightAudioMonitorGainDelta]: model.fairlightAudio.monitor
				? literal<CompanionActionExt>({
						label: 'Fairlight Audio: Adjust Monitor/Headphone fader gain',
						options: [audioInputOption, audioSourceOption, FaderLevelDeltaChoice, FadeDurationChoice],
						callback: (action): void => {
							const currentGain = atem?.state?.fairlight?.monitor?.gain
							if (typeof currentGain === 'number') {
								transitions.run(
									`audio.monitor.faderGain`,
									(value) => {
										executePromise(
											instance,
											atem?.setFairlightAudioMixerMonitorProps({
												gain: value,
											})
										)
									},
									currentGain,
									currentGain + getOptNumber(action, 'delta') * 100,
									getOptNumber(action, 'fadeDuration', 0)
								)
							}
						},
				  })
				: undefined,
			// [ActionId.FairlightAudioMonitorMasterGain]: literal<CompanionActionExt>({
			// 	label: 'Fairlight Audio: Monitor/Headphone master gain',
			// 	options: [
			// 		{
			// 			type: 'number',
			// 			label: 'Fader Level (-100 = -inf)',
			// 			id: 'gain',
			// 			range: true,
			// 			required: true,
			// 			default: 0,
			// 			step: 0.1,
			// 			min: -100,
			// 			max: 10,
			// 		},
			// 		FadeDurationChoice,
			// 	],
			// 	callback: (action): void => {
			// 		transitions.run(
			// 			`audio.monitor.inputMasterGain`,
			// 			(value) => {
			// 				executePromise(
			// 					instance,
			// 					atem?.setFairlightAudioMixerMonitorProps({
			// 						inputMasterGain: value,
			// 					})
			// 				)
			// 			},
			// 			atem?.state?.fairlight?.monitor?.inputMasterGain,
			// 			getOptNumber(action, 'gain') * 100,
			// 			getOptNumber(action, 'fadeDuration', 0)
			// 		)
			// 	},
			// }),
		}
	} else {
		return {
			[ActionId.ClassicAudioGain]: undefined,
			[ActionId.ClassicAudioGainDelta]: undefined,
			[ActionId.ClassicAudioMixOption]: undefined,
			[ActionId.ClassicAudioResetPeaks]: undefined,
			[ActionId.ClassicAudioMasterGain]: undefined,
			[ActionId.ClassicAudioMasterGainDelta]: undefined,
			[ActionId.FairlightAudioInputGain]: undefined,
			[ActionId.FairlightAudioInputGainDelta]: undefined,
			[ActionId.FairlightAudioFaderGain]: undefined,
			[ActionId.FairlightAudioFaderGainDelta]: undefined,
			[ActionId.FairlightAudioMixOption]: undefined,
			[ActionId.FairlightAudioResetPeaks]: undefined,
			[ActionId.FairlightAudioResetSourcePeaks]: undefined,
			[ActionId.FairlightAudioMasterGain]: undefined,
			[ActionId.FairlightAudioMasterGainDelta]: undefined,
			[ActionId.FairlightAudioMonitorMasterMuted]: undefined,
			[ActionId.FairlightAudioMonitorGain]: undefined,
			[ActionId.FairlightAudioMonitorGainDelta]: undefined,
			// [ActionId.FairlightAudioMonitorMasterGain]: undefined,
		}
	}
}

export function GetActionsList(
	instance: InstanceSkel<AtemConfig>,
	atem: Atem | undefined,
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
					label: 'Aux/Output: Set source',
					options: [AtemAuxPicker(model), AtemAuxSourcePicker(model, state)],
					callback: (action): void => {
						executePromise(instance, atem?.setAuxSource(getOptNumber(action, 'input'), getOptNumber(action, 'aux')))
					},
					learn: (action) => {
						const auxSource = state.video.auxilliaries[Number(action.options.aux)]

						if (auxSource !== undefined) {
							return {
								...action.options,
								input: auxSource,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.MultiviewerWindowSource]: model.MVs
			? literal<CompanionActionExt>({
					label: 'Multiviewer: Change window source',
					options: [
						AtemMultiviewerPicker(model),
						AtemMultiviewWindowPicker(model),
						AtemMultiviewSourcePicker(model, state),
					],
					callback: (action): void => {
						executePromise(
							instance,
							atem?.setMultiViewerWindowSource(
								getOptNumber(action, 'source'),
								getOptNumber(action, 'multiViewerId'),
								getOptNumber(action, 'windowIndex')
							)
						)
					},
					learn: (action) => {
						const window = getMultiviewerWindow(state, action.options.multiViewerId, action.options.windowIndex)

						if (window) {
							return {
								...action.options,
								source: window.source,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.MediaPlayerSource]: model.media.players
			? literal<CompanionActionExt>({
					label: 'Media player: Set source',
					options: [AtemMediaPlayerPicker(model), AtemMediaPlayerSourcePicker(model, state)],
					callback: (action): void => {
						const source = getOptNumber(action, 'source')
						if (source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
							executePromise(
								instance,
								atem?.setMediaPlayerSource(
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
								atem?.setMediaPlayerSource(
									{
										sourceType: Enums.MediaSourceType.Still,
										stillIndex: source,
									},
									getOptNumber(action, 'mediaplayer')
								)
							)
						}
					},
					learn: (action) => {
						const player = state.media.players[Number(action.options.mediaplayer)]

						if (player) {
							return {
								...action.options,
								source: player.sourceType ? player.stillIndex : player.clipIndex + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[ActionId.MediaPlayerCycle]: model.media.players
			? literal<CompanionActionExt>({
					label: 'Media player: Cycle source',
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
								atem?.setMediaPlayerSource(
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
		[ActionId.SaveStartupState]: literal<CompanionActionExt>({
			label: 'Startup State: Save',
			options: [],
			callback: (): void => {
				executePromise(instance, atem?.saveStartupState())
			},
		}),
		[ActionId.ClearStartupState]: literal<CompanionActionExt>({
			label: 'Startup State: Clear',
			options: [],
			callback: (): void => {
				executePromise(instance, atem?.clearStartupState())
			},
		}),
		[ActionId.InputName]: literal<CompanionActionExt>({
			label: 'Input: Set name',
			options: [
				AtemAllSourcePicker(model, state),
				{
					id: 'short_enable',
					label: 'Set short name',
					type: 'checkbox',
					default: true,
				},
				{
					id: 'short_value',
					label: 'Short name',
					type: 'textwithvariables',
					default: '',
					tooltip: 'Max 4 characters. Supports variables',
				},
				{
					id: 'long_enable',
					label: 'Set long name',
					type: 'checkbox',
					default: true,
				},
				{
					id: 'long_value',
					label: 'Long name',
					type: 'textwithvariables',
					default: '',
					tooltip: 'Max 24 characters. Supports variables',
				},
			],
			callback: (action): void => {
				const source = getOptNumber(action, 'source')
				const setShort = getOptBool(action, 'short_enable')
				const setLong = getOptBool(action, 'long_enable')

				const newProps: Partial<Pick<InputState.InputChannel, 'longName' | 'shortName'>> = {}
				if (setShort && typeof action.options.short_value === 'string') {
					const rawVal = action.options.short_value
					instance.parseVariables(rawVal, (val) => (newProps.shortName = val ?? rawVal))
				}
				if (setLong && typeof action.options.long_value === 'string') {
					const rawVal = action.options.long_value
					instance.parseVariables(rawVal, (val) => (newProps.longName = val ?? rawVal))
				}

				executePromise(
					instance,
					Promise.all([
						newProps.longName && !atem?.hasInternalMultiviewerLabelGeneration()
							? atem?.drawMultiviewerLabel(source, newProps.longName)
							: undefined,
						Object.keys(newProps).length ? atem?.setInputSettings(newProps, source) : undefined,
					])
				)
			},
			learn: (action) => {
				const source = getOptNumber(action, 'source')
				const props = state.inputs[source]

				if (props) {
					return {
						...action.options,
						long_value: props.longName,
						short_value: props.shortName,
					}
				} else {
					return undefined
				}
			},
		}),
	}

	return actions
}
