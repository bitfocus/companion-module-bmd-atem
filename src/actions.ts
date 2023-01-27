import { type Atem, type AtemState, Enums, type InputState, type VideoState } from 'atem-connection'
import {
	CHOICES_KEYTRANS,
	GetDSKIdChoices,
	GetMacroChoices,
	CHOICES_ON_OFF_TOGGLE,
	CHOICES_CLASSIC_AUDIO_MIX_OPTION,
	CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
	CHOICES_KEYFRAMES,
	CHOICES_FLYDIRECTIONS,
} from './choices.js'
import type { AtemConfig } from './config.js'
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
	AtemUSKMaskPropertiesPickers,
	AtemUSKDVEPropertiesPickers,
	AtemTransitionSelectionComponentPicker,
	AtemAudioInputPicker,
	AtemFairlightAudioSourcePicker,
	FadeDurationChoice,
	FaderLevelDeltaChoice,
	AtemAllSourcePicker,
	AtemSuperSourceArtPropertiesPickers,
	AtemDSKMaskPropertiesPickers,
	AtemDSKPreMultipliedKeyPropertiesPickers,
} from './input.js'
import type { ModelSpec } from './models/index.js'
import {
	getDSK,
	getSuperSourceBox,
	getUSK,
	getTransitionProperties,
	getMediaPlayer,
	getMixEffect,
	getMultiviewerWindow,
} from './state.js'
import {
	assertUnreachable,
	calculateTransitionSelection,
	MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
	compact,
	clamp,
	type InstanceBaseExt,
} from './util.js'
import { AtemCommandBatching, CommandBatching } from './batching.js'
import { AtemTransitions } from './transitions.js'
import type { SuperSource } from 'atem-connection/dist/state/video/index.js'
import type { CompanionActionDefinition, CompanionActionEvent } from '@companion-module/base'
import type { DownstreamKeyerMask, DownstreamKeyerGeneral } from 'atem-connection/dist/state/video/downstreamKeyers.js'
import type {
	UpstreamKeyerMaskSettings,
	UpstreamKeyerDVESettings,
} from 'atem-connection/dist/state/video/upstreamKeyers.js'

export enum ActionId {
	Program = 'program',
	ProgramVariables = 'programVariables',
	Preview = 'preview',
	PreviewVariables = 'previewVariables',
	Cut = 'cut',
	Auto = 'auto',
	Aux = 'aux',
	AuxVariables = 'auxVariables',
	USKSource = 'uskSource',
	USKOnAir = 'usk',
	USKFly = 'uskFly',
	USKMaskLumaChromaPattern = 'uskMaskLumaChromaPattern',
	USKDVEProperties = 'uskDveProperties',
	USKFlyInfinite = 'uskFlyInfinite',
	DSKSource = 'dskSource',
	DSKRate = 'dskRate',
	DSKMask = 'dskMask',
	DSKPreMultipliedKey = 'dskPreMultipliedKey',
	DSKOnAir = 'dsk',
	DSKTie = 'dskTie',
	DSKAuto = 'dskAuto',
	MacroRun = 'macrorun',
	MacroContinue = 'macrocontinue',
	MacroStop = 'macrostop',
	MacroLoop = 'macroloop',
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

type CompanionActionsExt = { [id in ActionId]: CompanionActionDefinition | undefined }

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
	instance: InstanceBaseExt<AtemConfig>,
	atem: Atem | undefined,
	model: ModelSpec,
	commandBatching: AtemCommandBatching,
	state: AtemState
) {
	return {
		[ActionId.Program]: {
			name: 'ME: Set Program input',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			callback: async (action) => {
				await atem?.changeProgramInput(getOptNumber(action, 'input'), getOptNumber(action, 'mixeffect'))
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
		} satisfies CompanionActionDefinition,
		[ActionId.ProgramVariables]: {
			name: 'ME: Set Program input from variables',
			options: [
				{
					type: 'textinput',
					id: 'mixeffect',
					label: 'M/E',
					default: '1',
					useVariables: true,
				},
				{
					type: 'textinput',
					id: 'input',
					label: 'Input ID',
					default: '0',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const mixeffect = Number(await instance.parseVariablesInString(action.options.mixeffect as string))
				const input = Number(await instance.parseVariablesInString(action.options.input as string))

				if (!isNaN(mixeffect) && !isNaN(input)) {
					await atem?.changeProgramInput(input, mixeffect - 1)
				}
			},
		} satisfies CompanionActionDefinition,
		[ActionId.Preview]: {
			name: 'ME: Set Preview input',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			callback: async (action) => {
				await atem?.changePreviewInput(getOptNumber(action, 'input'), getOptNumber(action, 'mixeffect'))
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
		} satisfies CompanionActionDefinition,
		[ActionId.PreviewVariables]: {
			name: 'ME: Set Preview input from variables',
			options: [
				{
					type: 'textinput',
					id: 'mixeffect',
					label: 'M/E',
					default: '1',
					useVariables: true,
				},
				{
					type: 'textinput',
					id: 'input',
					label: 'Input ID',
					default: '0',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const mixeffect = Number(await instance.parseVariablesInString(action.options.mixeffect as string))
				const input = Number(await instance.parseVariablesInString(action.options.input as string))

				if (!isNaN(mixeffect) && !isNaN(input)) {
					await atem?.changePreviewInput(input, mixeffect - 1)
				}
			},
		} satisfies CompanionActionDefinition,
		[ActionId.Cut]: {
			name: 'ME: Perform CUT transition',
			options: [AtemMEPicker(model, 0)],
			callback: async (action) => {
				await atem?.cut(getOptNumber(action, 'mixeffect'))
			},
		} satisfies CompanionActionDefinition,
		[ActionId.Auto]: {
			name: 'ME: Perform AUTO transition',
			options: [AtemMEPicker(model, 0)],
			callback: async (action) => {
				await atem?.autoTransition(getOptNumber(action, 'mixeffect'))
			},
		} satisfies CompanionActionDefinition,

		[ActionId.USKSource]: model.USKs
			? ({
					name: 'Upstream key: Set inputs',
					options: [
						AtemMEPicker(model, 0),
						AtemUSKPicker(model),
						AtemKeyFillSourcePicker(model, state),
						AtemKeyCutSourcePicker(model, state),
					],
					callback: async (action) => {
						await Promise.all([
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.USKOnAir]: model.USKs
			? ({
					name: 'Upstream key: Set OnAir',
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
					callback: async (action) => {
						const meIndex = getOptNumber(action, 'mixeffect')
						const keyIndex = getOptNumber(action, 'key')
						if (action.options.onair === 'toggle') {
							const usk = getUSK(state, meIndex, keyIndex)
							await atem?.setUpstreamKeyerOnAir(!usk?.onAir, meIndex, keyIndex)
						} else {
							await atem?.setUpstreamKeyerOnAir(action.options.onair === 'true', meIndex, keyIndex)
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.TransitionStyle]: {
			name: 'Transition: Set style/pattern',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(model.media.clips === 0)],
			callback: async (action) => {
				await atem?.setTransitionStyle(
					{
						nextStyle: getOptNumber(action, 'style'),
					},
					getOptNumber(action, 'mixeffect')
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
		} satisfies CompanionActionDefinition,
		[ActionId.TransitionRate]: {
			name: 'Transition: Change rate',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(true), AtemRatePicker('Transition Rate')],
			callback: async (action) => {
				const style = getOptNumber(action, 'style') as Enums.TransitionStyle
				switch (style) {
					case Enums.TransitionStyle.MIX:
						await atem?.setMixTransitionSettings(
							{
								rate: getOptNumber(action, 'rate'),
							},
							getOptNumber(action, 'mixeffect')
						)
						break
					case Enums.TransitionStyle.DIP:
						await atem?.setDipTransitionSettings(
							{
								rate: getOptNumber(action, 'rate'),
							},
							getOptNumber(action, 'mixeffect')
						)

						break
					case Enums.TransitionStyle.WIPE:
						await atem?.setWipeTransitionSettings(
							{
								rate: getOptNumber(action, 'rate'),
							},
							getOptNumber(action, 'mixeffect')
						)

						break
					case Enums.TransitionStyle.DVE:
						await atem?.setDVETransitionSettings(
							{
								rate: getOptNumber(action, 'rate'),
							},
							getOptNumber(action, 'mixeffect')
						)
						break
					case Enums.TransitionStyle.STING:
						// Not supported
						break
					default:
						assertUnreachable(style)
						instance.log('debug', 'Unknown transition style: ' + style)
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
		} satisfies CompanionActionDefinition,
		[ActionId.TransitionSelection]: {
			name: 'Transition: Change selection',
			options: [AtemMEPicker(model, 0), ...AtemTransitionSelectionPickers(model)],
			callback: async (action) => {
				await atem?.setTransitionStyle(
					{
						nextSelection: calculateTransitionSelection(model.USKs, action.options),
					},
					getOptNumber(action, 'mixeffect')
				)
			},
		} satisfies CompanionActionDefinition,
		[ActionId.TransitionSelectionComponent]: {
			name: 'Transition: Change selection component',
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
			callback: async (action) => {
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
		} satisfies CompanionActionDefinition,
		[ActionId.FadeToBlackAuto]: {
			name: 'Fade to black: Run AUTO Transition',
			options: [AtemMEPicker(model, 0)],
			callback: async (action) => {
				await atem?.fadeToBlack(getOptNumber(action, 'mixeffect'))
			},
		} satisfies CompanionActionDefinition,
		[ActionId.FadeToBlackRate]: {
			name: 'Fade to black: Change rate',
			options: [AtemMEPicker(model, 0), AtemRatePicker('Rate')],
			callback: async (action) => {
				await atem?.setFadeToBlackRate(getOptNumber(action, 'rate'), getOptNumber(action, 'mixeffect'))
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
		} satisfies CompanionActionDefinition,
		[ActionId.USKMaskLumaChromaPattern]: model.USKs
			? ({
					name: 'Upstream key: Set Mask (Luma, Chroma, Pattern)',
					options: compact([AtemMEPicker(model, 0), AtemUSKPicker(model), ...AtemUSKMaskPropertiesPickers()]),
					callback: async (action) => {
						const keyId = getOptNumber(action, 'key')
						const mixEffectId = getOptNumber(action, 'mixeffect')
						const newProps: Partial<UpstreamKeyerMaskSettings> = {}

						const props = action.options.properties
						if (props && Array.isArray(props)) {
							if (props.includes('maskEnabled')) {
								newProps.maskEnabled = getOptBool(action, 'maskEnabled')
							}
							if (props.includes('maskTop')) {
								newProps.maskTop = getOptNumber(action, 'maskTop') * 1000
							}
							if (props.includes('maskBottom')) {
								newProps.maskBottom = getOptNumber(action, 'maskBottom') * 1000
							}
							if (props.includes('maskLeft')) {
								newProps.maskLeft = getOptNumber(action, 'maskLeft') * 1000
							}
							if (props.includes('maskRight')) {
								newProps.maskRight = getOptNumber(action, 'maskRight') * 1000
							}
						}

						if (Object.keys(newProps).length === 0) return

						await atem?.setUpstreamKeyerMaskSettings(newProps, mixEffectId, keyId)
					},
					learn: (action) => {
						const usk = getUSK(state, getOptNumber(action, 'mixeffect'), getOptNumber(action, 'key'))

						if (usk?.maskSettings) {
							return {
								...action.options,
								maskEnabled: usk.maskSettings.maskEnabled,
								maskTop: usk.maskSettings.maskTop / 1000,
								maskBottom: usk.maskSettings.maskBottom / 1000,
								maskLeft: usk.maskSettings.maskLeft / 1000,
								maskRight: usk.maskSettings.maskRight / 1000,
							}
						} else {
							return undefined
						}
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.USKDVEProperties]: model.DVEs
			? ({
					name: 'Upstream key: Change DVE properties',
					options: compact([AtemMEPicker(model, 0), AtemUSKPicker(model), ...AtemUSKDVEPropertiesPickers()]),
					callback: async (action) => {
						const keyId = getOptNumber(action, 'key')
						const mixEffectId = getOptNumber(action, 'mixeffect')
						const newProps: Partial<UpstreamKeyerDVESettings> = {}

						const props = action.options.properties
						if (props && Array.isArray(props)) {
							if (props.includes('maskEnabled')) {
								newProps.maskEnabled = getOptBool(action, 'maskEnabled')
							}
							if (props.includes('maskTop')) {
								newProps.maskTop = getOptNumber(action, 'maskTop') * 1000
							}
							if (props.includes('maskBottom')) {
								newProps.maskBottom = getOptNumber(action, 'maskBottom') * 1000
							}
							if (props.includes('maskLeft')) {
								newProps.maskLeft = getOptNumber(action, 'maskLeft') * 1000
							}
							if (props.includes('maskRight')) {
								newProps.maskRight = getOptNumber(action, 'maskRight') * 1000
							}
							if (props.includes('sizeX')) {
								newProps.sizeX = getOptNumber(action, 'sizeX') * 1000
							}
							if (props.includes('sizeY')) {
								newProps.sizeY = getOptNumber(action, 'sizeY') * 1000
							}
							if (props.includes('positionX')) {
								newProps.positionX = getOptNumber(action, 'positionX') * 1000
							}
							if (props.includes('positionY')) {
								newProps.positionY = getOptNumber(action, 'positionY') * 1000
							}
							if (props.includes('rotation')) {
								newProps.rotation = getOptNumber(action, 'rotation')
							}
							if (props.includes('borderOuterWidth')) {
								newProps.borderOuterWidth = getOptNumber(action, 'borderOuterWidth') * 100
							}
							if (props.includes('borderInnerWidth')) {
								newProps.borderInnerWidth = getOptNumber(action, 'borderInnerWidth') * 100
							}
							if (props.includes('borderOuterSoftness')) {
								newProps.borderOuterSoftness = getOptNumber(action, 'borderOuterSoftness')
							}
							if (props.includes('borderInnerSoftness')) {
								newProps.borderInnerSoftness = getOptNumber(action, 'borderInnerSoftness')
							}
							if (props.includes('borderBevelSoftness')) {
								newProps.borderBevelSoftness = getOptNumber(action, 'borderBevelSoftness')
							}
							if (props.includes('borderBevelPosition')) {
								newProps.borderBevelPosition = getOptNumber(action, 'borderBevelPosition')
							}
							if (props.includes('borderOpacity')) {
								newProps.borderOpacity = getOptNumber(action, 'borderOpacity')
							}
							if (props.includes('borderHue')) {
								newProps.borderHue = getOptNumber(action, 'borderHue') * 10
							}
							if (props.includes('borderSaturation')) {
								newProps.borderSaturation = getOptNumber(action, 'borderSaturation') * 10
							}
							if (props.includes('borderLuma')) {
								newProps.borderLuma = getOptNumber(action, 'borderLuma') * 10
							}
							if (props.includes('lightSourceDirection')) {
								newProps.lightSourceDirection = getOptNumber(action, 'lightSourceDirection') * 10
							}
							if (props.includes('lightSourceAltitude')) {
								newProps.lightSourceAltitude = getOptNumber(action, 'lightSourceAltitude')
							}
							if (props.includes('borderEnabled')) {
								newProps.borderEnabled = getOptBool(action, 'borderEnabled')
							}
							if (props.includes('shadowEnabled')) {
								newProps.shadowEnabled = getOptBool(action, 'shadowEnabled')
							}
							if (props.includes('borderBevel')) {
								newProps.borderBevel = getOptNumber(action, 'borderBevel')
							}
							if (props.includes('rate')) {
								newProps.rate = getOptNumber(action, 'rate')
							}
						}

						if (Object.keys(newProps).length === 0) return

						await atem?.setUpstreamKeyerDVESettings(newProps, mixEffectId, keyId)
					},
					learn: (action) => {
						const usk = getUSK(state, getOptNumber(action, 'mixeffect'), getOptNumber(action, 'key'))

						if (usk?.dveSettings) {
							return {
								...action.options,
								maskEnabled: usk.dveSettings.maskEnabled,
								maskTop: usk.dveSettings.maskTop / 1000,
								maskBottom: usk.dveSettings.maskBottom / 1000,
								maskLeft: usk.dveSettings.maskLeft / 1000,
								maskRight: usk.dveSettings.maskRight / 1000,
								sizeX: usk.dveSettings.sizeX / 1000,
								sizeY: usk.dveSettings.sizeY / 1000,
								positionX: usk.dveSettings.positionX / 1000,
								positionY: usk.dveSettings.positionY / 1000,
								rotation: usk.dveSettings.rotation,
								borderOuterWidth: usk.dveSettings.borderOuterWidth / 100,
								borderInnerWidth: usk.dveSettings.borderInnerWidth / 100,
								borderOuterSoftness: usk.dveSettings.borderOuterSoftness,
								borderInnerSoftness: usk.dveSettings.borderInnerSoftness,
								borderBevelSoftness: usk.dveSettings.borderBevelSoftness,
								borderBevelPosition: usk.dveSettings.borderBevelPosition,
								borderOpacity: usk.dveSettings.borderOpacity,
								borderHue: usk.dveSettings.borderHue / 10,
								borderSaturation: usk.dveSettings.borderSaturation / 10,
								borderLuma: usk.dveSettings.borderLuma / 10,
								lightSourceDirection: usk.dveSettings.lightSourceDirection / 10,
								lightSourceAltitude: usk.dveSettings.lightSourceAltitude,
								borderEnabled: usk.dveSettings.borderEnabled,
								shadowEnabled: usk.dveSettings.shadowEnabled,
								borderBevel: usk.dveSettings.borderBevel,
								rate: usk.dveSettings.rate,
							}
						} else {
							return undefined
						}
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.USKFly]:
			model.USKs && model.DVEs
				? ({
						name: 'Upstream key: fly to keyframe',
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
						callback: async (action) => {
							await atem?.runUpstreamKeyerFlyKeyTo(
								getOptNumber(action, 'mixeffect'),
								getOptNumber(action, 'key'),
								getOptNumber(action, 'keyframe')
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
				  } satisfies CompanionActionDefinition)
				: undefined,
		[ActionId.USKFlyInfinite]:
			model.USKs && model.DVEs
				? ({
						name: 'Upstream key: fly to infinite',
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
						callback: async (action) => {
							await atem?.runUpstreamKeyerFlyKeyToInfinite(
								getOptNumber(action, 'mixeffect'),
								getOptNumber(action, 'key'),
								getOptNumber(action, 'flydirection')
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
				  } satisfies CompanionActionDefinition)
				: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function dskActions(atem: Atem | undefined, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.DSKSource]: model.DSKs
			? ({
					name: 'Downstream key: Set inputs',
					options: [AtemDSKPicker(model), AtemKeyFillSourcePicker(model, state), AtemKeyCutSourcePicker(model, state)],
					callback: async (action) => {
						await Promise.all([
							atem?.setDownstreamKeyFillSource(getOptNumber(action, 'fill'), getOptNumber(action, 'key')),
							atem?.setDownstreamKeyCutSource(getOptNumber(action, 'cut'), getOptNumber(action, 'key')),
						])
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.DSKRate]: model.DSKs
			? ({
					name: 'Downstream key: Set Rate',
					options: [AtemDSKPicker(model), AtemRatePicker('Rate')],
					callback: async (action) => {
						await atem?.setDownstreamKeyRate(getOptNumber(action, 'rate'), getOptNumber(action, 'key'))
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.DSKMask]: model.DSKs
			? ({
					name: 'Downstream key: Set Mask',
					options: compact([AtemDSKPicker(model), ...AtemDSKMaskPropertiesPickers()]),
					callback: async (action) => {
						const keyId = getOptNumber(action, 'key')
						const newProps: Partial<DownstreamKeyerMask> = {}

						const props = action.options.properties
						if (props && Array.isArray(props)) {
							if (props.includes('maskEnabled')) {
								newProps.enabled = getOptBool(action, 'maskEnabled')
							}
							if (props.includes('maskTop')) {
								newProps.top = getOptNumber(action, 'maskTop') * 1000
							}
							if (props.includes('maskBottom')) {
								newProps.bottom = getOptNumber(action, 'maskBottom') * 1000
							}
							if (props.includes('maskLeft')) {
								newProps.left = getOptNumber(action, 'maskLeft') * 1000
							}
							if (props.includes('maskRight')) {
								newProps.right = getOptNumber(action, 'maskRight') * 1000
							}
						}

						if (Object.keys(newProps).length === 0) return

						await atem?.setDownstreamKeyMaskSettings(newProps, keyId)
					},
					learn: (feedback) => {
						const dsk = getDSK(state, feedback.options.key)

						if (dsk?.properties?.mask) {
							return {
								...feedback.options,
								maskEnabled: dsk.properties.mask.enabled,
								maskTop: dsk.properties.mask.top / 1000,
								maskBottom: dsk.properties.mask.bottom / 1000,
								maskLeft: dsk.properties.mask.left / 1000,
								maskRight: dsk.properties.mask.right / 1000,
							}
						} else {
							return undefined
						}
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.DSKPreMultipliedKey]: model.DSKs
			? ({
					name: 'Downstream key: Set Pre Multiplied Key',
					options: compact([AtemDSKPicker(model), ...AtemDSKPreMultipliedKeyPropertiesPickers()]),
					callback: async (action) => {
						const keyId = getOptNumber(action, 'key')
						const newProps: Partial<DownstreamKeyerGeneral> = {}

						const props = action.options.properties
						if (props && Array.isArray(props)) {
							if (props.includes('preMultiply')) {
								newProps.preMultiply = getOptBool(action, 'preMultiply')
							}
							if (props.includes('clip')) {
								newProps.clip = getOptNumber(action, 'clip') * 10
							}
							if (props.includes('gain')) {
								newProps.gain = getOptNumber(action, 'gain') * 10
							}
							if (props.includes('invert')) {
								newProps.invert = getOptBool(action, 'invert')
							}
						}

						if (Object.keys(newProps).length === 0) return

						await atem?.setDownstreamKeyGeneralProperties(newProps, keyId)
					},
					learn: (feedback) => {
						const dsk = getDSK(state, feedback.options.key)

						if (dsk?.properties) {
							return {
								...feedback.options,
								preMultiply: dsk.properties.preMultiply,
								clip: dsk.properties.clip / 10,
								gain: dsk.properties.gain / 10,
								invert: dsk.properties.invert,
							}
						} else {
							return undefined
						}
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.DSKAuto]: model.DSKs
			? ({
					name: 'Downstream key: Run AUTO Transition',
					options: [
						{
							type: 'dropdown',
							id: 'downstreamKeyerId',
							label: 'DSK',
							default: 0,
							choices: GetDSKIdChoices(model),
						},
					],
					callback: async (action) => {
						await atem?.autoDownstreamKey(getOptNumber(action, 'downstreamKeyerId'))
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.DSKOnAir]: model.DSKs
			? ({
					name: 'Downstream key: Set OnAir',
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
					callback: async (action) => {
						const keyIndex = getOptNumber(action, 'key')
						if (action.options.onair === 'toggle') {
							const dsk = getDSK(state, keyIndex)
							await atem?.setDownstreamKeyOnAir(!dsk?.onAir, keyIndex)
						} else {
							await atem?.setDownstreamKeyOnAir(action.options.onair === 'true', keyIndex)
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.DSKTie]: model.DSKs
			? ({
					name: 'Downstream key: Set Tied',
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
					callback: async (action) => {
						const keyIndex = getOptNumber(action, 'key')
						if (action.options.state === 'toggle') {
							const dsk = getDSK(state, keyIndex)
							await atem?.setDownstreamKeyTie(!dsk?.properties?.tie, keyIndex)
						} else {
							await atem?.setDownstreamKeyTie(action.options.state === 'true', keyIndex)
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
			  } satisfies CompanionActionDefinition)
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function macroActions(atem: Atem | undefined, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.MacroRun]: model.macros
			? ({
					name: 'Macro: Run',
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
					callback: async (action) => {
						const macroIndex = getOptNumber(action, 'macro') - 1
						const { macroPlayer, macroRecorder } = state.macro
						if (
							action.options.action === 'runContinue' &&
							macroPlayer.isWaiting &&
							macroPlayer.macroIndex === macroIndex
						) {
							await atem?.macroContinue()
						} else if (macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex) {
							await atem?.macroStopRecord()
						} else {
							await atem?.macroRun(macroIndex)
						}
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.MacroContinue]: model.macros
			? ({
					name: 'Macro: Continue',
					options: [],
					callback: async () => {
						await atem?.macroContinue()
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.MacroStop]: model.macros
			? ({
					name: 'Macro: Stop',
					options: [],
					callback: async () => {
						await atem?.macroStop()
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.MacroLoop]: model.macros
			? ({
					name: 'Macro: Loop',
					options: [
						{
							id: 'loop',
							type: 'dropdown',
							label: 'Loop',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					],
					callback: async (action) => {
						let newState = action.options.loop === 'true'
						if (action.options.loop === 'toggle') {
							newState = !state.macro.macroPlayer.loop
						}

						await atem?.macroSetLoop(newState)
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ssrcActions(atem: Atem | undefined, model: ModelSpec, state: AtemState) {
	return {
		[ActionId.SuperSourceArt]: model.SSrc
			? ({
					name: 'SuperSource: Set art properties',
					options: compact([
						AtemSuperSourceIdPicker(model),
						...AtemSuperSourceArtPropertiesPickers(model, state, true),
					]),
					callback: async (action) => {
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

						await atem?.setSuperSourceProperties(newProps, ssrcId)
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.SuperSourceBoxSource]: model.SSrc
			? ({
					// TODO - combine into ActionId.SuperSourceBoxProperties
					name: 'SuperSource: Set box source',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						AtemSuperSourceBoxSourcePicker(model, state),
					]),
					callback: async (action) => {
						await atem?.setSuperSourceBoxSettings(
							{
								source: getOptNumber(action, 'source'),
							},
							getOptNumber(action, 'boxIndex'),
							action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.SuperSourceBoxOnAir]: model.SSrc
			? ({
					// TODO - combine into ActionId.SuperSourceBoxProperties
					name: 'SuperSource: Set box enabled',
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
					callback: async (action) => {
						const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
						const boxIndex = getOptNumber(action, 'boxIndex')

						if (action.options.onair === 'toggle') {
							const box = getSuperSourceBox(state, boxIndex, ssrcId)
							await atem?.setSuperSourceBoxSettings(
								{
									enabled: !box?.enabled,
								},
								boxIndex,
								ssrcId
							)
						} else {
							await atem?.setSuperSourceBoxSettings(
								{
									enabled: action.options.onair === 'true',
								},
								boxIndex,
								ssrcId
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.SuperSourceBoxProperties]: model.SSrc
			? ({
					name: 'SuperSource: Change box properties',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						...AtemSuperSourcePropertiesPickers(model, state, false),
					]),
					callback: async (action) => {
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

						await atem?.setSuperSourceBoxSettings(newProps, boxIndex, ssrcId)
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.SuperSourceBoxPropertiesDelta]: model.SSrc
			? ({
					name: 'SuperSource: Offset box properties',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						...AtemSuperSourcePropertiesPickers(model, state, true),
					]),
					callback: async (action) => {
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

						await atem?.setSuperSourceBoxSettings(newProps, boxIndex, ssrcId)
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function streamRecordActions(
	instance: InstanceBaseExt<AtemConfig>,
	atem: Atem | undefined,
	model: ModelSpec,
	state: AtemState
) {
	return {
		[ActionId.StreamStartStop]: model.streaming
			? ({
					name: 'Stream: Start or Stop',
					options: [
						{
							id: 'stream',
							type: 'dropdown',
							label: 'Stream',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					],
					callback: async (action) => {
						let newState = action.options.stream === 'true'
						if (action.options.stream === 'toggle') {
							newState = state.streaming?.status?.state === Enums.StreamingStatus.Idle
						}

						if (newState) {
							await atem?.startStreaming()
						} else {
							await atem?.stopStreaming()
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.StreamService]: model.recording
			? ({
					name: 'Stream: Set service',
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
					callback: async (action) => {
						await atem?.setStreamingService({
							serviceName: `${action.options.service || ''}`,
							url: `${action.options.url || ''}`,
							key: `${action.options.key || ''}`,
						})
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.RecordStartStop]: model.recording
			? ({
					name: 'Recording: Start or Stop',
					options: [
						{
							id: 'record',
							type: 'dropdown',
							label: 'Record',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					],
					callback: async (action) => {
						let newState = action.options.record === 'true'
						if (action.options.record === 'toggle') {
							newState = state.recording?.status?.state === Enums.RecordingStatus.Idle
						}

						if (newState) {
							await atem?.startRecording()
						} else {
							await atem?.stopRecording()
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.RecordSwitchDisk]: model.recording
			? ({
					name: 'Recording: Switch disk',
					options: [],
					callback: async () => {
						await atem?.switchRecordingDisk()
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.RecordFilename]: model.recording
			? ({
					name: 'Recording: Set filename',
					options: [
						{
							id: 'filename',
							label: 'Filename',
							type: 'textinput',
							default: '',
						},
					],
					callback: async (action) => {
						const filename = await instance.parseVariablesInString(`${action.options.filename || ''}`)
						await atem?.setRecordingSettings({
							filename: `${filename || ''}`,
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
			  } satisfies CompanionActionDefinition)
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function audioActions(atem: Atem | undefined, model: ModelSpec, transitions: AtemTransitions, state: AtemState) {
	if (model.classicAudio) {
		const audioInputOption = AtemAudioInputPicker(model, state)
		return {
			[ActionId.ClassicAudioGain]: {
				name: 'Classic Audio: Set input gain',
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
				callback: async (action) => {
					const inputId = getOptNumber(action, 'input')
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[inputId]

					await transitions.run(
						`audio.${inputId}.gain`,
						async (value) => {
							await atem?.setClassicAudioMixerInputProps(inputId, { gain: value })
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
			} satisfies CompanionActionDefinition,
			[ActionId.ClassicAudioGainDelta]: {
				name: 'Classic Audio: Adjust input gain',
				options: [audioInputOption, FaderLevelDeltaChoice, FadeDurationChoice],
				callback: async (action) => {
					const inputId = getOptNumber(action, 'input')
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[inputId]

					if (typeof channel?.gain === 'number') {
						await transitions.run(
							`audio.${inputId}.gain`,
							async (value) => {
								await atem?.setClassicAudioMixerInputProps(inputId, { gain: value })
							},
							channel.gain,
							channel.gain + getOptNumber(action, 'delta'),
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			} satisfies CompanionActionDefinition,
			[ActionId.ClassicAudioMixOption]: {
				name: 'Classic Audio: Set input mix option',
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
				callback: async (action) => {
					const inputId = getOptNumber(action, 'input')
					const audioChannels = state.audio?.channels ?? {}
					const toggleVal =
						audioChannels[inputId]?.mixOption === Enums.AudioMixOption.On
							? Enums.AudioMixOption.Off
							: Enums.AudioMixOption.On
					const newVal = action.options.option === 'toggle' ? toggleVal : getOptNumber(action, 'option')
					await atem?.setClassicAudioMixerInputProps(inputId, { mixOption: newVal })
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
			} satisfies CompanionActionDefinition,
			[ActionId.ClassicAudioResetPeaks]: {
				name: 'Classic Audio: Reset peaks',
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
				callback: async (action) => {
					const rawVal = action.options['reset']
					if (rawVal === 'all') {
						await atem?.setClassicAudioResetPeaks({ all: true })
					} else if (rawVal === 'master') {
						await atem?.setClassicAudioResetPeaks({ master: true })
					} else if (rawVal === 'monitor') {
						await atem?.setClassicAudioResetPeaks({ monitor: true })
					} else {
						const inputId = getOptNumber(action, 'reset')
						await atem?.setClassicAudioResetPeaks({ input: inputId })
					}
				},
			} satisfies CompanionActionDefinition,
			[ActionId.ClassicAudioMasterGain]: {
				name: 'Classic Audio: Set master gain',
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
				callback: async (action) => {
					await transitions.run(
						`audio.master.gain`,
						async (value) => {
							await atem?.setClassicAudioMixerMasterProps({ gain: value })
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
			} satisfies CompanionActionDefinition,
			[ActionId.ClassicAudioMasterGainDelta]: {
				name: 'Classic Audio: Adjust master gain',
				options: [FaderLevelDeltaChoice, FadeDurationChoice],
				callback: async (action) => {
					const currentGain = state.audio?.master?.gain

					if (typeof currentGain === 'number') {
						await transitions.run(
							`audio.master.gain`,
							async (value) => {
								await atem?.setClassicAudioMixerMasterProps({ gain: value })
							},
							currentGain,
							currentGain + getOptNumber(action, 'gain'),
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			} satisfies CompanionActionDefinition,
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
			[ActionId.FairlightAudioInputGain]: {
				name: 'Fairlight Audio: Set input gain',
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
				callback: async (action) => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''

					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const source = audioSources[sourceId]

					await transitions.run(
						`audio.${inputId}.${sourceId}.gain`,
						async (value) => {
							await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
								gain: value,
							})
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
			} satisfies CompanionActionDefinition,
			[ActionId.FairlightAudioInputGainDelta]: {
				name: 'Fairlight Audio: Adjust input gain',
				options: [audioInputOption, audioSourceOption, FaderLevelDeltaChoice, FadeDurationChoice],
				callback: async (action) => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''

					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const source = audioSources[sourceId]

					if (typeof source?.properties?.gain === 'number') {
						await transitions.run(
							`audio.${inputId}.${sourceId}.gain`,
							async (value) => {
								await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
									gain: value,
								})
							},
							source.properties.gain,
							source.properties.gain + getOptNumber(action, 'delta') * 100,
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			} satisfies CompanionActionDefinition,
			[ActionId.FairlightAudioFaderGain]: {
				name: 'Fairlight Audio: Set fader gain',
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
				callback: async (action) => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''

					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const source = audioSources[sourceId]

					await transitions.run(
						`audio.${inputId}.${sourceId}.faderGain`,
						async (value) => {
							await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
								faderGain: value,
							})
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
			} satisfies CompanionActionDefinition,
			[ActionId.FairlightAudioFaderGainDelta]: {
				name: 'Fairlight Audio: Adjust fader gain',
				options: [audioInputOption, audioSourceOption, FaderLevelDeltaChoice, FadeDurationChoice],
				callback: async (action) => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''

					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const source = audioSources[sourceId]

					if (typeof source?.properties?.faderGain === 'number') {
						await transitions.run(
							`audio.${inputId}.${sourceId}.faderGain`,
							async (value) => {
								await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
									faderGain: value,
								})
							},
							source.properties.faderGain,
							source.properties.faderGain + getOptNumber(action, 'delta') * 100,
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			} satisfies CompanionActionDefinition,
			[ActionId.FairlightAudioMixOption]: {
				name: 'Fairlight Audio: Set input mix option',
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
				callback: async (action) => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[inputId]?.sources ?? {}
					const toggleVal =
						audioSources[sourceId]?.properties?.mixOption === Enums.FairlightAudioMixOption.On
							? Enums.FairlightAudioMixOption.Off
							: Enums.FairlightAudioMixOption.On
					const newVal = action.options.option === 'toggle' ? toggleVal : getOptNumber(action, 'option')
					await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, { mixOption: newVal })
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
			} satisfies CompanionActionDefinition,
			[ActionId.FairlightAudioResetPeaks]: {
				name: 'Fairlight Audio: Reset peaks',
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
				callback: async (action) => {
					const rawVal = action.options['reset']
					if (rawVal === 'all') {
						await atem?.setFairlightAudioMixerResetPeaks({ all: true, master: false })
					} else if (rawVal === 'master') {
						await atem?.setFairlightAudioMixerResetPeaks({ master: true, all: false })
					}
				},
			} satisfies CompanionActionDefinition,
			[ActionId.FairlightAudioResetSourcePeaks]: {
				name: 'Fairlight Audio: Reset Source peaks',
				options: [audioInputOption, audioSourceOption],
				callback: async (action) => {
					const inputId = getOptNumber(action, 'input')
					const sourceId = action.options.source + ''
					await atem?.setFairlightAudioMixerSourceResetPeaks(inputId, sourceId, {
						output: true,
						dynamicsInput: false,
						dynamicsOutput: false,
					})
				},
			} satisfies CompanionActionDefinition,
			[ActionId.FairlightAudioMasterGain]: {
				name: 'Fairlight Audio: Set master gain',
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
				callback: async (action) => {
					await transitions.run(
						`audio.master.gain`,
						async (value) => {
							await atem?.setFairlightAudioMixerMasterProps({
								faderGain: value,
							})
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
			} satisfies CompanionActionDefinition,
			[ActionId.FairlightAudioMasterGainDelta]: {
				name: 'Fairlight Audio: Adjust master gain',
				options: [FaderLevelDeltaChoice, FadeDurationChoice],
				callback: async (action) => {
					const currentGain = state.fairlight?.master?.properties?.faderGain

					if (typeof currentGain === 'number') {
						await transitions.run(
							`audio.master.gain`,
							async (value) => {
								await atem?.setFairlightAudioMixerMasterProps({
									faderGain: value,
								})
							},
							currentGain,
							currentGain + getOptNumber(action, 'delta') * 100,
							getOptNumber(action, 'fadeDuration', 0)
						)
					}
				},
			} satisfies CompanionActionDefinition,
			[ActionId.FairlightAudioMonitorMasterMuted]: model.fairlightAudio.monitor
				? ({
						name: 'Fairlight Audio: Monitor/Headphone master muted',
						options: [
							{
								id: 'state',
								type: 'dropdown',
								label: 'State',
								default: 'true',
								choices: CHOICES_ON_OFF_TOGGLE,
							},
						],
						callback: async (action) => {
							let target: boolean
							if (action.options.state === 'toggle') {
								target = !atem?.state?.fairlight?.monitor?.inputMasterMuted
							} else {
								target = action.options.state === 'true'
							}

							await atem?.setFairlightAudioMixerMonitorProps({
								inputMasterMuted: target,
							})
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
				  } satisfies CompanionActionDefinition)
				: undefined,
			[ActionId.FairlightAudioMonitorGain]: model.fairlightAudio.monitor
				? ({
						name: 'Fairlight Audio: Monitor/Headphone fader gain',
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
						callback: async (action) => {
							await transitions.run(
								`audio.monitor.faderGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerMonitorProps({
										gain: value,
									})
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
				  } satisfies CompanionActionDefinition)
				: undefined,
			[ActionId.FairlightAudioMonitorGainDelta]: model.fairlightAudio.monitor
				? ({
						name: 'Fairlight Audio: Adjust Monitor/Headphone fader gain',
						options: [audioInputOption, audioSourceOption, FaderLevelDeltaChoice, FadeDurationChoice],
						callback: async (action) => {
							const currentGain = atem?.state?.fairlight?.monitor?.gain
							if (typeof currentGain === 'number') {
								await transitions.run(
									`audio.monitor.faderGain`,
									async (value) => {
										await atem?.setFairlightAudioMixerMonitorProps({
											gain: value,
										})
									},
									currentGain,
									currentGain + getOptNumber(action, 'delta') * 100,
									getOptNumber(action, 'fadeDuration', 0)
								)
							}
						},
				  } satisfies CompanionActionDefinition)
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
			// 	callback: async (action) => {
			// 		await transitions.run(
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
	instance: InstanceBaseExt<AtemConfig>,
	atem: Atem | undefined,
	model: ModelSpec,
	commandBatching: AtemCommandBatching,
	transitions: AtemTransitions,
	state: AtemState
): CompanionActionsExt {
	const actions: CompanionActionsExt = {
		...meActions(instance, atem, model, commandBatching, state),
		...dskActions(atem, model, state),
		...macroActions(atem, model, state),
		...ssrcActions(atem, model, state),
		...streamRecordActions(instance, atem, model, state),
		...audioActions(atem, model, transitions, state),
		[ActionId.Aux]: model.auxes
			? ({
					name: 'Aux/Output: Set source',
					options: [AtemAuxPicker(model), AtemAuxSourcePicker(model, state)],
					callback: async (action) => {
						await atem?.setAuxSource(getOptNumber(action, 'input'), getOptNumber(action, 'aux'))
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.AuxVariables]: model.auxes
			? ({
					name: 'Aux/Output: Set source from variables',
					options: [
						{
							type: 'textinput',
							id: 'aux',
							label: 'AUX',
							default: '1',
							useVariables: true,
						},
						{
							type: 'textinput',
							id: 'input',
							label: 'Input ID',
							default: '0',
							useVariables: true,
						},
					],
					callback: async (action) => {
						const output = Number(await instance.parseVariablesInString(action.options.aux as string))
						const input = Number(await instance.parseVariablesInString(action.options.input as string))

						if (!isNaN(output) && !isNaN(input)) {
							await atem?.setAuxSource(input, output - 1)
						}
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.MultiviewerWindowSource]: model.MVs
			? ({
					name: 'Multiviewer: Change window source',
					options: [
						AtemMultiviewerPicker(model),
						AtemMultiviewWindowPicker(model),
						AtemMultiviewSourcePicker(model, state),
					],
					callback: async (action) => {
						await atem?.setMultiViewerWindowSource(
							getOptNumber(action, 'source'),
							getOptNumber(action, 'multiViewerId'),
							getOptNumber(action, 'windowIndex')
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.MediaPlayerSource]: model.media.players
			? ({
					name: 'Media player: Set source',
					options: [AtemMediaPlayerPicker(model), AtemMediaPlayerSourcePicker(model, state)],
					callback: async (action) => {
						const source = getOptNumber(action, 'source')
						if (source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
							await atem?.setMediaPlayerSource(
								{
									sourceType: Enums.MediaSourceType.Clip,
									clipIndex: source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
								},
								getOptNumber(action, 'mediaplayer')
							)
						} else {
							await atem?.setMediaPlayerSource(
								{
									sourceType: Enums.MediaSourceType.Still,
									stillIndex: source,
								},
								getOptNumber(action, 'mediaplayer')
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
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.MediaPlayerCycle]: model.media.players
			? ({
					name: 'Media player: Cycle source',
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
					callback: async (action) => {
						const playerId = getOptNumber(action, 'mediaplayer')
						const direction = action.options.direction as string
						const offset = direction === 'next' ? 1 : -1

						const player = getMediaPlayer(state, playerId)
						if (player?.sourceType == Enums.MediaSourceType.Still) {
							const maxIndex = state.media.stillPool.length
							let nextIndex = player.stillIndex + offset
							if (nextIndex >= maxIndex) nextIndex = 0
							if (nextIndex < 0) nextIndex = maxIndex - 1

							await atem?.setMediaPlayerSource(
								{
									sourceType: Enums.MediaSourceType.Still,
									stillIndex: nextIndex,
								},
								playerId
							)
						}
					},
			  } satisfies CompanionActionDefinition)
			: undefined,
		[ActionId.SaveStartupState]: {
			name: 'Startup State: Save',
			options: [],
			callback: async () => {
				await atem?.saveStartupState()
			},
		} satisfies CompanionActionDefinition,
		[ActionId.ClearStartupState]: {
			name: 'Startup State: Clear',
			options: [],
			callback: async () => {
				await atem?.clearStartupState()
			},
		} satisfies CompanionActionDefinition,
		[ActionId.InputName]: {
			name: 'Input: Set name',
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
					type: 'textinput',
					default: '',
					tooltip: 'Max 4 characters. Supports variables',
					useVariables: true,
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
					type: 'textinput',
					default: '',
					tooltip: 'Max 24 characters. Supports variables',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const source = getOptNumber(action, 'source')
				const setShort = getOptBool(action, 'short_enable')
				const setLong = getOptBool(action, 'long_enable')

				const newProps: Partial<Pick<InputState.InputChannel, 'longName' | 'shortName'>> = {}
				if (setShort && typeof action.options.short_value === 'string') {
					const rawVal = action.options.short_value
					newProps.shortName = await instance.parseVariablesInString(rawVal)
				}
				if (setLong && typeof action.options.long_value === 'string') {
					const rawVal = action.options.long_value
					newProps.longName = await instance.parseVariablesInString(rawVal)
				}

				await Promise.all([
					typeof newProps.longName === 'string' && !atem?.hasInternalMultiviewerLabelGeneration()
						? atem?.drawMultiviewerLabel(source, newProps.longName)
						: undefined,
					Object.keys(newProps).length ? atem?.setInputSettings(newProps, source) : undefined,
				])
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
		} satisfies CompanionActionDefinition,
	}

	return actions
}
