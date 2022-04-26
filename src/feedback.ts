import { AtemState, Enums } from 'atem-connection'
import { SetRequired } from 'type-fest'
import InstanceSkel = require('../../../instance_skel')
import {
	CompanionFeedbackEvent,
	InputValue,
	CompanionFeedbacks,
	SomeCompanionInputField,
	CompanionFeedbackAdvanced,
	CompanionFeedbackBoolean,
} from '../../../instance_skel_types'
import {
	CHOICES_CLASSIC_AUDIO_MIX_OPTION,
	CHOICES_CURRENTKEYFRAMES,
	CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
	GetMacroChoices,
} from './choices'
import { AtemConfig } from './config'
import {
	AtemAuxPicker,
	AtemAuxSourcePicker,
	AtemDSKPicker,
	AtemFadeToBlackStatePicker,
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
	AtemMatchMethod,
	AtemAudioInputPicker,
	NumberComparitorPicker,
	AtemFairlightAudioSourcePicker,
	AtemSuperSourceArtSourcePicker,
	AtemSuperSourceArtOption,
} from './input'
import { ModelSpec } from './models'
import { getDSK, getMixEffect, getMultiviewerWindow, getSuperSourceBox, getUSK, TallyBySource } from './state'
import {
	assertUnreachable,
	calculateTransitionSelection,
	literal,
	MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
	compact,
	compareNumber,
} from './util'

type CompanionFeedbackWithCallback =
	| SetRequired<CompanionFeedbackBoolean, 'callback' | 'type'>
	| SetRequired<CompanionFeedbackAdvanced, 'callback' | 'type'>

export enum FeedbackId {
	PreviewBG = 'preview_bg',
	PreviewBG2 = 'preview_bg_2',
	PreviewBG3 = 'preview_bg_3',
	PreviewBG4 = 'preview_bg_4',
	ProgramBG = 'program_bg',
	ProgramBG2 = 'program_bg_2',
	ProgramBG3 = 'program_bg_3',
	ProgramBG4 = 'program_bg_4',
	AuxBG = 'aux_bg',
	USKOnAir = 'usk_bg',
	USKSource = 'usk_source',
	USKKeyFrame = 'usk_keyframe',
	DSKOnAir = 'dsk_bg',
	DSKTie = 'dskTie',
	DSKSource = 'dsk_source',
	Macro = 'macro',
	MVSource = 'mv_source',
	SSrcArtSource = 'ssrc_art_source',
	SSrcArtOption = 'ssrc_art_option',
	SSrcBoxOnAir = 'ssrc_box_enable',
	SSrcBoxSource = 'ssrc_box_source',
	SSrcBoxProperties = 'ssrc_box_properties',
	TransitionStyle = 'transitionStyle',
	TransitionSelection = 'transitionSelection',
	TransitionRate = 'transitionRate',
	InTransition = 'inTransition',
	MediaPlayerSource = 'mediaPlayerSource',
	FadeToBlackIsBlack = 'fadeToBlackIsBlack',
	FadeToBlackRate = 'fadeToBlackRate',
	ProgramTally = 'program_tally',
	PreviewTally = 'preview_tally',
	StreamStatus = 'streamStatus',
	RecordStatus = 'recordStatus',
	ClassicAudioGain = 'classicAudioGain',
	ClassicAudioMixOption = 'classicAudioMixOption',
	FairlightAudioFaderGain = 'fairlightAudioFaderGain',
	FairlightAudioInputGain = 'fairlightAudioInputGain',
	FairlightAudioMixOption = 'fairlightAudioMixOption',
}

export enum MacroFeedbackType {
	IsRunning = 'isRunning',
	IsWaiting = 'isWaiting',
	IsRecording = 'isRecording',
	IsUsed = 'isUsed',
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function tallyFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState, tally: TallyBySource) {
	return {
		[FeedbackId.ProgramTally]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'Tally: Program',
			description: 'If the input specified has an active progam tally light, change style of the bank',
			options: [AtemMESourcePicker(model, state, 0)],
			style: {
				color: instance.rgb(255, 255, 255),
				bgcolor: instance.rgb(255, 0, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const source = tally[Number(evt.options.input)]
				return !!source?.program
			},
		}),
		[FeedbackId.PreviewTally]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'Tally: Preview',
			description: 'If the input specified has an active preview tally light, change style of the bank',
			options: [AtemMESourcePicker(model, state, 0)],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(0, 255, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const source = tally[Number(evt.options.input)]
				return !!source?.preview
			},
		}),
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function previewFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.PreviewBG]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'ME: One ME preview source',
			description: 'If the input specified is in use by preview on the M/E stage specified, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(0, 255, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				return me?.previewInput === Number(evt.options.input)
			},
		}),
		[FeedbackId.PreviewBG2]:
			model.MEs >= 2
				? literal<CompanionFeedbackWithCallback>({
						type: 'boolean',
						label: 'ME: Two ME preview sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: [
							AtemMEPicker(model, 1),
							AtemMESourcePicker(model, state, 1),
							AtemMEPicker(model, 2),
							AtemMESourcePicker(model, state, 2),
						],
						style: {
							color: instance.rgb(0, 0, 0),
							bgcolor: instance.rgb(0, 255, 0),
						},
						callback: (evt: CompanionFeedbackEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							return (
								me1?.previewInput === Number(evt.options.input1) && me2?.previewInput === Number(evt.options.input2)
							)
						},
				  })
				: undefined,
		[FeedbackId.PreviewBG3]:
			model.MEs >= 3
				? literal<CompanionFeedbackWithCallback>({
						type: 'boolean',
						label: 'ME: Three ME preview sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: [
							AtemMEPicker(model, 1),
							AtemMESourcePicker(model, state, 1),
							AtemMEPicker(model, 2),
							AtemMESourcePicker(model, state, 2),
							AtemMEPicker(model, 3),
							AtemMESourcePicker(model, state, 3),
						],
						style: {
							color: instance.rgb(0, 0, 0),
							bgcolor: instance.rgb(0, 255, 0),
						},
						callback: (evt: CompanionFeedbackEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							const me3 = getMixEffect(state, evt.options.mixeffect3)
							return (
								me1?.previewInput === Number(evt.options.input1) &&
								me2?.previewInput === Number(evt.options.input2) &&
								me3?.previewInput === Number(evt.options.input3)
							)
						},
				  })
				: undefined,
		[FeedbackId.PreviewBG4]:
			model.MEs >= 4
				? literal<CompanionFeedbackWithCallback>({
						type: 'boolean',
						label: 'ME: Four ME preview sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: [
							AtemMEPicker(model, 1),
							AtemMESourcePicker(model, state, 1),
							AtemMEPicker(model, 2),
							AtemMESourcePicker(model, state, 2),
							AtemMEPicker(model, 3),
							AtemMESourcePicker(model, state, 3),
							AtemMEPicker(model, 4),
							AtemMESourcePicker(model, state, 4),
						],

						style: {
							color: instance.rgb(0, 0, 0),
							bgcolor: instance.rgb(0, 255, 0),
						},
						callback: (evt: CompanionFeedbackEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							const me3 = getMixEffect(state, evt.options.mixeffect3)
							const me4 = getMixEffect(state, evt.options.mixeffect4)
							return (
								me1?.previewInput === Number(evt.options.input1) &&
								me2?.previewInput === Number(evt.options.input2) &&
								me3?.previewInput === Number(evt.options.input3) &&
								me4?.previewInput === Number(evt.options.input4)
							)
						},
				  })
				: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function programFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.ProgramBG]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'ME: One ME program source',
			description: 'If the input specified is in use by program on the M/E stage specified, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			style: {
				color: instance.rgb(255, 255, 255),
				bgcolor: instance.rgb(255, 0, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				return me?.programInput === Number(evt.options.input)
			},
		}),
		[FeedbackId.ProgramBG2]:
			model.MEs >= 2
				? literal<CompanionFeedbackWithCallback>({
						type: 'boolean',
						label: 'ME: Two ME program sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: [
							AtemMEPicker(model, 1),
							AtemMESourcePicker(model, state, 1),
							AtemMEPicker(model, 2),
							AtemMESourcePicker(model, state, 2),
						],
						style: {
							color: instance.rgb(255, 255, 255),
							bgcolor: instance.rgb(255, 0, 0),
						},
						callback: (evt: CompanionFeedbackEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							return (
								me1?.programInput === Number(evt.options.input1) && me2?.programInput === Number(evt.options.input2)
							)
						},
				  })
				: undefined,
		[FeedbackId.ProgramBG3]:
			model.MEs >= 3
				? literal<CompanionFeedbackWithCallback>({
						type: 'boolean',
						label: 'ME: Three ME program sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: [
							AtemMEPicker(model, 1),
							AtemMESourcePicker(model, state, 1),
							AtemMEPicker(model, 2),
							AtemMESourcePicker(model, state, 2),
							AtemMEPicker(model, 3),
							AtemMESourcePicker(model, state, 3),
						],
						style: {
							color: instance.rgb(255, 255, 255),
							bgcolor: instance.rgb(255, 0, 0),
						},
						callback: (evt: CompanionFeedbackEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							const me3 = getMixEffect(state, evt.options.mixeffect3)
							return (
								me1?.programInput === Number(evt.options.input1) &&
								me2?.programInput === Number(evt.options.input2) &&
								me3?.programInput === Number(evt.options.input3)
							)
						},
				  })
				: undefined,
		[FeedbackId.ProgramBG4]:
			model.MEs >= 4
				? literal<CompanionFeedbackWithCallback>({
						type: 'boolean',
						label: 'ME: Four ME program sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: [
							AtemMEPicker(model, 1),
							AtemMESourcePicker(model, state, 1),
							AtemMEPicker(model, 2),
							AtemMESourcePicker(model, state, 2),
							AtemMEPicker(model, 3),
							AtemMESourcePicker(model, state, 3),
							AtemMEPicker(model, 4),
							AtemMESourcePicker(model, state, 4),
						],
						style: {
							color: instance.rgb(255, 255, 255),
							bgcolor: instance.rgb(255, 0, 0),
						},
						callback: (evt: CompanionFeedbackEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							const me3 = getMixEffect(state, evt.options.mixeffect3)
							const me4 = getMixEffect(state, evt.options.mixeffect4)
							return (
								me1?.programInput === Number(evt.options.input1) &&
								me2?.programInput === Number(evt.options.input2) &&
								me3?.programInput === Number(evt.options.input3) &&
								me4?.programInput === Number(evt.options.input4)
							)
						},
				  })
				: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function uskFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.USKOnAir]: model.USKs
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Upstream key: OnAir state',
					description: 'If the specified upstream keyer is active, change style of the bank',
					options: [AtemMEPicker(model, 0), AtemUSKPicker(model)],
					style: {
						color: instance.rgb(255, 255, 255),
						bgcolor: instance.rgb(255, 0, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const usk = getUSK(state, evt.options.mixeffect, evt.options.key)
						return !!usk?.onAir
					},
			  })
			: undefined,
		[FeedbackId.USKSource]: model.USKs
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Upstream key: Fill source',
					description: 'If the input specified is in use by the USK specified, change style of the bank',
					options: [AtemMEPicker(model, 0), AtemUSKPicker(model), AtemKeyFillSourcePicker(model, state)],
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(238, 238, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const usk = getUSK(state, evt.options.mixeffect, evt.options.key)
						return usk?.fillSource === Number(evt.options.fill)
					},
			  })
			: undefined,
		[FeedbackId.USKKeyFrame]: model.USKs
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Upstream key: Key frame',
					description: 'If the USK specified is at the Key Frame specified, change style of the bank',
					options: [
						AtemMEPicker(model, 0),
						AtemUSKPicker(model),
						{
							type: 'dropdown',
							id: 'keyframe',
							label: 'Key Frame',
							choices: CHOICES_CURRENTKEYFRAMES,
							default: CHOICES_CURRENTKEYFRAMES[0].id,
						},
					],
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(238, 238, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const usk = getUSK(state, evt.options.mixeffect, evt.options.key)
						return usk?.flyProperties?.isAtKeyFrame === Number(evt.options.keyframe)
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function transitionFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.TransitionStyle]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'Transition: Style',
			description: 'If the specified transition style is active, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(model.media.clips === 0)],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				return me?.transitionProperties.nextStyle === Number(evt.options.style)
			},
		}),
		[FeedbackId.TransitionSelection]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'Transition: Selection',
			description: 'If the specified transition selection is active, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemMatchMethod(), ...AtemTransitionSelectionPickers(model)],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				const expectedSelection = calculateTransitionSelection(model.USKs, evt.options)
				if (me) {
					switch (evt.options.matchmethod) {
						case 'exact':
							return me.transitionProperties.nextSelection.join(',') === expectedSelection.join(',')
						case 'contains':
							return expectedSelection.every((s) => me.transitionProperties.nextSelection.includes(s))
						case 'not-contain':
							return !expectedSelection.find((s) => me.transitionProperties.nextSelection.includes(s))
					}
				}
				return false
			},
		}),
		[FeedbackId.TransitionRate]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'Transition: Rate',
			description: 'If the specified transition rate is active, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(true), AtemRatePicker('Transition Rate')],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				if (me?.transitionSettings) {
					const style = Number(evt.options.style) as Enums.TransitionStyle
					const rate = Number(evt.options.rate)
					switch (style) {
						case Enums.TransitionStyle.MIX:
							return me.transitionSettings.mix?.rate === rate
						case Enums.TransitionStyle.DIP:
							return me.transitionSettings.dip?.rate === rate
						case Enums.TransitionStyle.WIPE:
							return me.transitionSettings.wipe?.rate === rate
						case Enums.TransitionStyle.DVE:
							return me.transitionSettings.DVE?.rate === rate
						case Enums.TransitionStyle.STING:
							break
						default:
							assertUnreachable(style)
					}
				}
				return false
			},
		}),
		[FeedbackId.InTransition]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'Transition: Active/Running',
			description: 'If the specified transition is active, change style of the bank',
			options: [AtemMEPicker(model, 0)],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				return !!me?.transitionPosition?.inTransition
			},
		}),
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function fadeToBlackFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.FadeToBlackIsBlack]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'Fade to black: Active',
			description: 'If the specified fade to black is active, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemFadeToBlackStatePicker()],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				if (me && me.fadeToBlack) {
					switch (evt.options.state) {
						case 'off':
							return !me.fadeToBlack.isFullyBlack && !me.fadeToBlack.inTransition
						case 'fading':
							return me.fadeToBlack.inTransition
						default:
							// on
							return !me.fadeToBlack.inTransition && me.fadeToBlack.isFullyBlack
					}
				}
				return false
			},
		}),
		[FeedbackId.FadeToBlackRate]: literal<CompanionFeedbackWithCallback>({
			type: 'boolean',
			label: 'Fade to black: Rate',
			description: 'If the specified fade to black rate matches, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemRatePicker('Rate')],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				const rate = Number(evt.options.rate)
				return me?.fadeToBlack?.rate === rate
			},
		}),
	}
}

function compareAsInt(
	targetStr: InputValue | undefined,
	actual: number,
	targetScale: number,
	actualRounding = 1
): boolean {
	if (targetStr === undefined) {
		return false
	}

	const targetVal = Number(targetStr) * targetScale
	if (actualRounding) {
		actual = actualRounding * Math.round(actual / actualRounding)
	}
	return targetVal === actual
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ssrcFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.SSrcArtSource]: model.SSrc
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Supersource: Art fill source',
					description: 'If the specified SuperSource art fill is set to the specified source, change style of the bank',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceArtSourcePicker(model, state, 'source', 'Fill Source'),
					]),
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const ssrc = state.video.superSources[Number(evt.options.ssrcId || 0)]
						return ssrc?.properties?.artFillSource === Number(evt.options.source)
					},
			  })
			: undefined,
		[FeedbackId.SSrcArtOption]: model.SSrc
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Supersource: Art placement',
					description:
						'If the specified SuperSource art is placed in the foreground/background, change style of the bank',
					options: compact([AtemSuperSourceIdPicker(model), AtemSuperSourceArtOption(false)]),
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const ssrc = state.video.superSources[Number(evt.options.ssrcId || 0)]
						return ssrc?.properties?.artOption === Number(evt.options.artOption)
					},
			  })
			: undefined,
		[FeedbackId.SSrcBoxSource]: model.SSrc
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Supersource: Box source',
					description: 'If the specified SuperSource box is set to the specified source, change style of the bank',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						AtemSuperSourceBoxSourcePicker(model, state),
					]),
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const box = getSuperSourceBox(state, evt.options.boxIndex, evt.options.ssrcId || 0)
						return box?.source === Number(evt.options.source)
					},
			  })
			: undefined,
		[FeedbackId.SSrcBoxOnAir]: model.SSrc
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Supersource: Box state',
					description: 'If the specified SuperSource box is enabled, change style of the bank',
					options: compact([AtemSuperSourceIdPicker(model), AtemSuperSourceBoxPicker()]),
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const box = getSuperSourceBox(state, evt.options.boxIndex, evt.options.ssrcId || 0)
						return !!(box && box.enabled)
					},
			  })
			: undefined,
		[FeedbackId.SSrcBoxProperties]: model.SSrc
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Supersource: Box properties',
					description: 'If the specified SuperSource box properties match, change style of the bank',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						...AtemSuperSourcePropertiesPickers(false),
					]),
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const box = getSuperSourceBox(state, evt.options.boxIndex, evt.options.ssrcId || 0)
						const boxCroppingMatches =
							box &&
							(!box.cropped ||
								(compareAsInt(evt.options.cropTop, box.cropTop, 1000, 10) &&
									compareAsInt(evt.options.cropBottom, box.cropBottom, 1000, 10) &&
									compareAsInt(evt.options.cropLeft, box.cropLeft, 1000, 10) &&
									compareAsInt(evt.options.cropRight, box.cropRight, 1000, 10)))

						return !!(
							box &&
							compareAsInt(evt.options.size, box.size, 1000, 10) &&
							compareAsInt(evt.options.x, box.x, 100) &&
							compareAsInt(evt.options.y, box.y, 100) &&
							box.cropped === !!evt.options.cropEnable &&
							boxCroppingMatches
						)
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function dskFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.DSKOnAir]: model.DSKs
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Downstream key: OnAir',
					description: 'If the specified downstream keyer is onair, change style of the bank',
					options: [AtemDSKPicker(model)],
					style: {
						color: instance.rgb(255, 255, 255),
						bgcolor: instance.rgb(255, 0, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const dsk = getDSK(state, evt.options.key)
						return !!dsk?.onAir
					},
			  })
			: undefined,
		[FeedbackId.DSKTie]: model.DSKs
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Downstream key: Tied',
					description: 'If the specified downstream keyer is tied, change style of the bank',
					options: [AtemDSKPicker(model)],
					style: {
						color: instance.rgb(255, 255, 255),
						bgcolor: instance.rgb(255, 0, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const dsk = getDSK(state, evt.options.key)
						return !!dsk?.properties?.tie
					},
			  })
			: undefined,
		[FeedbackId.DSKSource]: model.DSKs
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Downstream key: Fill source',
					description: 'If the input specified is in use by the DSK specified, change style of the bank',
					options: [AtemDSKPicker(model), AtemKeyFillSourcePicker(model, state)],
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(238, 238, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const dsk = getDSK(state, evt.options.key)
						return dsk?.sources?.fillSource === Number(evt.options.fill)
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function streamRecordFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.StreamStatus]: model.streaming
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Streaming: Active/Running',
					description: 'If the stream has the specified status, change style of the bank',
					options: [
						literal<SomeCompanionInputField>({
							id: 'state',
							label: 'State',
							type: 'dropdown',
							choices: Object.entries(Enums.StreamingStatus)
								.filter(([_k, v]) => typeof v === 'number')
								.map(([k, v]) => ({
									id: v,
									label: k,
								})),
							default: Enums.StreamingStatus.Streaming,
						}),
					],
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(0, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const streaming = state.streaming?.status?.state
						return streaming === Number(evt.options.state)
					},
			  })
			: undefined,
		[FeedbackId.RecordStatus]: model.recording
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Recording: Active/Running',
					description: 'If the record has the specified status, change style of the bank',
					options: [
						literal<SomeCompanionInputField>({
							id: 'state',
							label: 'State',
							type: 'dropdown',
							choices: Object.entries(Enums.RecordingStatus)
								.filter(([_k, v]) => typeof v === 'number')
								.map(([k, v]) => ({
									id: v,
									label: k,
								})),
							default: Enums.RecordingStatus.Recording,
						}),
					],
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(0, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const recording = state.recording?.status?.state
						return recording === Number(evt.options.state)
					},
			  })
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function audioFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
	if (model.classicAudio) {
		const audioInputOption = AtemAudioInputPicker(model, state)
		return {
			[FeedbackId.ClassicAudioGain]: literal<CompanionFeedbackWithCallback>({
				type: 'boolean',
				label: 'Classic Audio: Audio gain',
				description: 'If the audio input has the specified gain, change style of the bank',
				options: [
					audioInputOption,
					NumberComparitorPicker(),
					literal<SomeCompanionInputField>({
						type: 'number',
						label: 'Fader Level (-60 = -inf)',
						id: 'gain',
						range: true,
						required: true,
						default: 0,
						step: 0.1,
						min: -60,
						max: 6,
					}),
				],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackEvent): boolean => {
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[Number(evt.options.input)]
					return !!(channel && compareNumber(evt.options.gain, evt.options.comparitor, channel.gain))
				},
			}),
			[FeedbackId.ClassicAudioMixOption]: literal<CompanionFeedbackWithCallback>({
				type: 'boolean',
				label: 'Classic Audio: Mix option',
				description: 'If the audio input has the specified mix option, change style of the bank',
				options: [
					audioInputOption,
					literal<SomeCompanionInputField>({
						id: 'option',
						label: 'Mix option',
						type: 'dropdown',
						default: CHOICES_CLASSIC_AUDIO_MIX_OPTION[0].id,
						choices: CHOICES_CLASSIC_AUDIO_MIX_OPTION,
					}),
				],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackEvent): boolean => {
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[Number(evt.options.input)]
					return channel?.mixOption === Number(evt.options.option)
				},
			}),
			[FeedbackId.FairlightAudioInputGain]: undefined,
			[FeedbackId.FairlightAudioFaderGain]: undefined,
			[FeedbackId.FairlightAudioMixOption]: undefined,
		}
	} else if (model.fairlightAudio) {
		const audioInputOption = AtemAudioInputPicker(model, state)
		const audioSourceOption = AtemFairlightAudioSourcePicker()
		return {
			[FeedbackId.ClassicAudioGain]: undefined,
			[FeedbackId.ClassicAudioMixOption]: undefined,
			[FeedbackId.FairlightAudioInputGain]: literal<CompanionFeedbackWithCallback>({
				type: 'boolean',
				label: 'Fairlight Audio: Audio input gain',
				description: 'If the audio input has the specified input gain, change style of the bank',
				options: [
					audioInputOption,
					audioSourceOption,
					NumberComparitorPicker(),
					literal<SomeCompanionInputField>({
						type: 'number',
						label: 'Input Level (-100 = -inf)',
						id: 'gain',
						range: true,
						required: true,
						default: 0,
						step: 0.1,
						min: -100,
						max: 6,
					}),
				],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackEvent): boolean => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(evt.options.input)]?.sources ?? {}
					const source = audioSources[evt.options.source + '']
					return !!(
						source?.properties && compareNumber(evt.options.gain, evt.options.comparitor, source.properties.gain / 100)
					)
				},
			}),
			[FeedbackId.FairlightAudioFaderGain]: literal<CompanionFeedbackWithCallback>({
				type: 'boolean',
				label: 'Fairlight Audio: Audio fader gain',
				description: 'If the audio input has the specified fader gain, change style of the bank',
				options: [
					audioInputOption,
					audioSourceOption,
					NumberComparitorPicker(),
					literal<SomeCompanionInputField>({
						type: 'number',
						label: 'Fader Level (-100 = -inf)',
						id: 'gain',
						range: true,
						required: true,
						default: 0,
						step: 0.1,
						min: -100,
						max: 10,
					}),
				],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackEvent): boolean => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(evt.options.input)]?.sources ?? {}
					const source = audioSources[evt.options.source + '']
					return !!(
						source?.properties &&
						compareNumber(evt.options.gain, evt.options.comparitor, source.properties.faderGain / 100)
					)
				},
			}),
			[FeedbackId.FairlightAudioMixOption]: literal<CompanionFeedbackWithCallback>({
				type: 'boolean',
				label: 'Fairlight Audio: Audio mix option',
				description: 'If the audio input has the specified mix option, change style of the bank',
				options: [
					audioInputOption,
					audioSourceOption,
					literal<SomeCompanionInputField>({
						id: 'option',
						label: 'Mix option',
						type: 'dropdown',
						default: CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION[0].id,
						choices: CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
					}),
				],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackEvent): boolean => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(evt.options.input)]?.sources ?? {}
					const source = audioSources[evt.options.source + '']
					return source?.properties?.mixOption === Number(evt.options.option)
				},
			}),
		}
	} else {
		return {
			[FeedbackId.ClassicAudioGain]: undefined,
			[FeedbackId.ClassicAudioMixOption]: undefined,
			[FeedbackId.FairlightAudioInputGain]: undefined,
			[FeedbackId.FairlightAudioFaderGain]: undefined,
			[FeedbackId.FairlightAudioMixOption]: undefined,
		}
	}
}

export function GetFeedbacksList(
	instance: InstanceSkel<AtemConfig>,
	model: ModelSpec,
	state: AtemState,
	tally: TallyBySource
): CompanionFeedbacks {
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackWithCallback | undefined } = {
		...tallyFeedbacks(instance, model, state, tally),
		...previewFeedbacks(instance, model, state),
		...programFeedbacks(instance, model, state),
		...uskFeedbacks(instance, model, state),
		...dskFeedbacks(instance, model, state),
		...ssrcFeedbacks(instance, model, state),
		...transitionFeedbacks(instance, model, state),
		...fadeToBlackFeedbacks(instance, model, state),
		...streamRecordFeedbacks(instance, model, state),
		...audioFeedbacks(instance, model, state),
		[FeedbackId.AuxBG]: model.auxes
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Aux/Output: Source',
					description: 'If the input specified is in use by the aux bus specified, change style of the bank',
					options: [AtemAuxPicker(model), AtemAuxSourcePicker(model, state)],
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const auxSource = state.video.auxilliaries[Number(evt.options.aux)]
						return auxSource === Number(evt.options.input)
					},
			  })
			: undefined,
		[FeedbackId.Macro]: model.macros
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Macro: State',
					description: 'If the specified macro is running or waiting, change style of the bank',
					options: [
						{
							type: 'dropdown',
							label: 'Macro Number (1-100)',
							id: 'macroIndex',
							default: 1,
							choices: GetMacroChoices(model, state),
						},
						{
							type: 'dropdown',
							label: 'State',
							id: 'state',
							default: MacroFeedbackType.IsWaiting,
							choices: [
								{ id: MacroFeedbackType.IsRunning, label: 'Is Running' },
								{ id: MacroFeedbackType.IsWaiting, label: 'Is Waiting' },
								{ id: MacroFeedbackType.IsRecording, label: 'Is Recording' },
								{ id: MacroFeedbackType.IsUsed, label: 'Is Used' },
							],
						},
					],
					style: {
						color: instance.rgb(255, 255, 255),
						bgcolor: instance.rgb(238, 238, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						let macroIndex = Number(evt.options.macroIndex)
						if (!isNaN(macroIndex)) {
							macroIndex -= 1
							const { macroPlayer, macroRecorder } = state.macro
							const type = evt.options.state as MacroFeedbackType

							switch (type) {
								case MacroFeedbackType.IsUsed: {
									const macro = state.macro.macroProperties[macroIndex]
									return !!macro?.isUsed
								}
								case MacroFeedbackType.IsRecording:
									return macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex
								case MacroFeedbackType.IsRunning:
									return macroPlayer.isRunning && macroPlayer.macroIndex === macroIndex
								case MacroFeedbackType.IsWaiting:
									return macroPlayer.isWaiting && macroPlayer.macroIndex === macroIndex
								default:
									assertUnreachable(type)
							}
						}
						return false
					},
			  })
			: undefined,
		[FeedbackId.MVSource]: model.MVs
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Multiviewer: Window source',
					description: 'If the specified MV window is set to the specified source, change style of the bank',
					options: [
						AtemMultiviewerPicker(model),
						AtemMultiviewWindowPicker(model),
						AtemMultiviewSourcePicker(model, state),
					],
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const window = getMultiviewerWindow(state, evt.options.multiViewerId, evt.options.windowIndex)
						return window?.source === Number(evt.options.source)
					},
			  })
			: undefined,
		[FeedbackId.MediaPlayerSource]: model.media.players
			? literal<CompanionFeedbackWithCallback>({
					type: 'boolean',
					label: 'Media player: Source',
					description: 'If the specified media player has the specified source, change style of the bank',
					options: [AtemMediaPlayerPicker(model), AtemMediaPlayerSourcePicker(model, state)],
					style: {
						color: instance.rgb(0, 0, 0),
						bgcolor: instance.rgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackEvent): boolean => {
						const player = state.media.players[Number(evt.options.mediaplayer)]
						if (
							player?.sourceType === Enums.MediaSourceType.Still &&
							player?.stillIndex === Number(evt.options.source)
						) {
							return true
						} else if (
							player?.sourceType === Enums.MediaSourceType.Clip &&
							player?.clipIndex + MEDIA_PLAYER_SOURCE_CLIP_OFFSET === Number(evt.options.source)
						) {
							return true
						} else {
							return false
						}
					},
			  })
			: undefined,
	}

	return feedbacks
}
