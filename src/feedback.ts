import {
	combineRgb,
	CompanionFeedbackBooleanEvent,
	CompanionFeedbackDefinition,
	CompanionFeedbackDefinitions,
	CompanionInputFieldDropdown,
	CompanionInputFieldNumber,
	InputValue,
} from '@companion-module/base'
import { AtemState, Enums } from 'atem-connection'
import { getSuperSource } from 'atem-connection/dist/state/util.js'
import {
	CHOICES_CLASSIC_AUDIO_MIX_OPTION,
	CHOICES_CURRENTKEYFRAMES,
	CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
	GetMacroChoices,
} from './choices.js'
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
	AtemSuperSourceArtPropertiesPickers,
} from './input.js'
import { ModelSpec } from './models/index.js'
import { getDSK, getMixEffect, getMultiviewerWindow, getSuperSourceBox, getUSK, TallyBySource } from './state.js'
import {
	assertUnreachable,
	calculateTransitionSelection,
	literal,
	MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
	compact,
	compareNumber,
} from './util.js'

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
	SSrcArtProperties = 'ssrc_art_properties',
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
	ClassicAudioMasterGain = 'classicAudioMasterGain',
	FairlightAudioFaderGain = 'fairlightAudioFaderGain',
	FairlightAudioInputGain = 'fairlightAudioInputGain',
	FairlightAudioMixOption = 'fairlightAudioMixOption',
	FairlightAudioMasterGain = 'fairlightAudioMasterGain',
	FairlightAudioMonitorMasterMuted = 'fairlightAudioMonitorMasterMuted',
	FairlightAudioMonitorFaderGain = 'fairlightAudioMonitorFaderGain',
}

export enum MacroFeedbackType {
	IsRunning = 'isRunning',
	IsWaiting = 'isWaiting',
	IsRecording = 'isRecording',
	IsUsed = 'isUsed',
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function tallyFeedbacks(model: ModelSpec, state: AtemState, tally: TallyBySource) {
	return {
		[FeedbackId.ProgramTally]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'Tally: Program',
			description: 'If the input specified has an active progam tally light, change style of the bank',
			options: [AtemMESourcePicker(model, state, 0)],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
				const source = tally[Number(evt.options.input)]
				return !!source?.program
			},
		}),
		[FeedbackId.PreviewTally]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'Tally: Preview',
			description: 'If the input specified has an active preview tally light, change style of the bank',
			options: [AtemMESourcePicker(model, state, 0)],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
				const source = tally[Number(evt.options.input)]
				return !!source?.preview
			},
		}),
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function previewFeedbacks(model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.PreviewBG]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'ME: One ME preview source',
			description: 'If the input specified is in use by preview on the M/E stage specified, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				return me?.previewInput === Number(evt.options.input)
			},
			learn: (feedback) => {
				const me = getMixEffect(state, feedback.options.mixeffect)

				if (me) {
					return {
						...feedback.options,
						input: me.previewInput,
					}
				} else {
					return undefined
				}
			},
		}),
		[FeedbackId.PreviewBG2]:
			model.MEs >= 2
				? literal<CompanionFeedbackDefinition>({
						type: 'boolean',
						name: 'ME: Two ME preview sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: [
							AtemMEPicker(model, 1),
							AtemMESourcePicker(model, state, 1),
							AtemMEPicker(model, 2),
							AtemMESourcePicker(model, state, 2),
						],
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							return (
								me1?.previewInput === Number(evt.options.input1) && me2?.previewInput === Number(evt.options.input2)
							)
						},
						learn: (feedback) => {
							const me1 = getMixEffect(state, feedback.options.mixeffect1)
							const me2 = getMixEffect(state, feedback.options.mixeffect2)

							if (me1 && me2) {
								return {
									...feedback.options,
									input1: me1.previewInput,
									input2: me2.previewInput,
								}
							} else {
								return undefined
							}
						},
				  })
				: undefined,
		[FeedbackId.PreviewBG3]:
			model.MEs >= 3
				? literal<CompanionFeedbackDefinition>({
						type: 'boolean',
						name: 'ME: Three ME preview sources',
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
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							const me3 = getMixEffect(state, evt.options.mixeffect3)
							return (
								me1?.previewInput === Number(evt.options.input1) &&
								me2?.previewInput === Number(evt.options.input2) &&
								me3?.previewInput === Number(evt.options.input3)
							)
						},
						learn: (feedback) => {
							const me1 = getMixEffect(state, feedback.options.mixeffect1)
							const me2 = getMixEffect(state, feedback.options.mixeffect2)
							const me3 = getMixEffect(state, feedback.options.mixeffect3)

							if (me1 && me2 && me3) {
								return {
									...feedback.options,
									input1: me1.previewInput,
									input2: me2.previewInput,
									input3: me3.previewInput,
								}
							} else {
								return undefined
							}
						},
				  })
				: undefined,
		[FeedbackId.PreviewBG4]:
			model.MEs >= 4
				? literal<CompanionFeedbackDefinition>({
						type: 'boolean',
						name: 'ME: Four ME preview sources',
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

						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
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
						learn: (feedback) => {
							const me1 = getMixEffect(state, feedback.options.mixeffect1)
							const me2 = getMixEffect(state, feedback.options.mixeffect2)
							const me3 = getMixEffect(state, feedback.options.mixeffect3)
							const me4 = getMixEffect(state, feedback.options.mixeffect4)

							if (me1 && me2 && me3 && me4) {
								return {
									...feedback.options,
									input1: me1.previewInput,
									input2: me2.previewInput,
									input3: me3.previewInput,
									input4: me4.previewInput,
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
function programFeedbacks(model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.ProgramBG]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'ME: One ME program source',
			description: 'If the input specified is in use by program on the M/E stage specified, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				return me?.programInput === Number(evt.options.input)
			},
			learn: (feedback) => {
				const me = getMixEffect(state, feedback.options.mixeffect)

				if (me) {
					return {
						...feedback.options,
						input: me.programInput,
					}
				} else {
					return undefined
				}
			},
		}),
		[FeedbackId.ProgramBG2]:
			model.MEs >= 2
				? literal<CompanionFeedbackDefinition>({
						type: 'boolean',
						name: 'ME: Two ME program sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: [
							AtemMEPicker(model, 1),
							AtemMESourcePicker(model, state, 1),
							AtemMEPicker(model, 2),
							AtemMESourcePicker(model, state, 2),
						],
						defaultStyle: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(255, 0, 0),
						},
						callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							return (
								me1?.programInput === Number(evt.options.input1) && me2?.programInput === Number(evt.options.input2)
							)
						},
						learn: (feedback) => {
							const me1 = getMixEffect(state, feedback.options.mixeffect1)
							const me2 = getMixEffect(state, feedback.options.mixeffect2)

							if (me1 && me2) {
								return {
									...feedback.options,
									input1: me1.programInput,
									input2: me2.programInput,
								}
							} else {
								return undefined
							}
						},
				  })
				: undefined,
		[FeedbackId.ProgramBG3]:
			model.MEs >= 3
				? literal<CompanionFeedbackDefinition>({
						type: 'boolean',
						name: 'ME: Three ME program sources',
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
						defaultStyle: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(255, 0, 0),
						},
						callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
							const me1 = getMixEffect(state, evt.options.mixeffect1)
							const me2 = getMixEffect(state, evt.options.mixeffect2)
							const me3 = getMixEffect(state, evt.options.mixeffect3)
							return (
								me1?.programInput === Number(evt.options.input1) &&
								me2?.programInput === Number(evt.options.input2) &&
								me3?.programInput === Number(evt.options.input3)
							)
						},
						learn: (feedback) => {
							const me1 = getMixEffect(state, feedback.options.mixeffect1)
							const me2 = getMixEffect(state, feedback.options.mixeffect2)
							const me3 = getMixEffect(state, feedback.options.mixeffect3)

							if (me1 && me2 && me3) {
								return {
									...feedback.options,
									input1: me1.programInput,
									input2: me2.programInput,
									input3: me3.programInput,
								}
							} else {
								return undefined
							}
						},
				  })
				: undefined,
		[FeedbackId.ProgramBG4]:
			model.MEs >= 4
				? literal<CompanionFeedbackDefinition>({
						type: 'boolean',
						name: 'ME: Four ME program sources',
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
						defaultStyle: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(255, 0, 0),
						},
						callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
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
						learn: (feedback) => {
							const me1 = getMixEffect(state, feedback.options.mixeffect1)
							const me2 = getMixEffect(state, feedback.options.mixeffect2)
							const me3 = getMixEffect(state, feedback.options.mixeffect3)
							const me4 = getMixEffect(state, feedback.options.mixeffect4)

							if (me1 && me2 && me3 && me4) {
								return {
									...feedback.options,
									input1: me1.programInput,
									input2: me2.programInput,
									input3: me3.programInput,
									input4: me4.programInput,
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
function uskFeedbacks(model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.USKOnAir]: model.USKs
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Upstream key: OnAir state',
					description: 'If the specified upstream keyer is active, change style of the bank',
					options: [AtemMEPicker(model, 0), AtemUSKPicker(model)],
					defaultStyle: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const usk = getUSK(state, evt.options.mixeffect, evt.options.key)
						return !!usk?.onAir
					},
			  })
			: undefined,
		[FeedbackId.USKSource]: model.USKs
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Upstream key: Fill source',
					description: 'If the input specified is in use by the USK specified, change style of the bank',
					options: [AtemMEPicker(model, 0), AtemUSKPicker(model), AtemKeyFillSourcePicker(model, state)],
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(238, 238, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const usk = getUSK(state, evt.options.mixeffect, evt.options.key)
						return usk?.fillSource === Number(evt.options.fill)
					},
					learn: (feedback) => {
						const usk = getUSK(state, feedback.options.mixeffect, feedback.options.key)

						if (usk) {
							return {
								...feedback.options,
								fill: usk.fillSource,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[FeedbackId.USKKeyFrame]:
			model.USKs && model.DVEs
				? literal<CompanionFeedbackDefinition>({
						type: 'boolean',
						name: 'Upstream key: Key frame',
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
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(238, 238, 0),
						},
						callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
							const usk = getUSK(state, evt.options.mixeffect, evt.options.key)
							return usk?.flyProperties?.isAtKeyFrame === Number(evt.options.keyframe)
						},
						learn: (feedback) => {
							const usk = getUSK(state, feedback.options.mixeffect, feedback.options.key)

							if (usk?.flyProperties) {
								return {
									...feedback.options,
									keyframe: usk.flyProperties.isAtKeyFrame,
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
function transitionFeedbacks(model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.TransitionStyle]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'Transition: Style',
			description: 'If the specified transition style is active, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(model.media.clips === 0)],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				return me?.transitionProperties.nextStyle === Number(evt.options.style)
			},
			learn: (feedback) => {
				const me = getMixEffect(state, feedback.options.mixeffect)

				if (me) {
					return {
						...feedback.options,
						style: me.transitionProperties.nextStyle,
					}
				} else {
					return undefined
				}
			},
		}),
		[FeedbackId.TransitionSelection]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'Transition: Selection',
			description: 'If the specified transition selection is active, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemMatchMethod(), ...AtemTransitionSelectionPickers(model)],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
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
		[FeedbackId.TransitionRate]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'Transition: Rate',
			description: 'If the specified transition rate is active, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(true), AtemRatePicker('Transition Rate')],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
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
			learn: (feedback) => {
				const me = getMixEffect(state, feedback.options.mixeffect)

				if (me?.transitionSettings) {
					const style = Number(feedback.options.style) as Enums.TransitionStyle
					switch (style) {
						case Enums.TransitionStyle.MIX:
							return {
								...feedback.options,
								rate: me.transitionSettings.mix?.rate,
							}
						case Enums.TransitionStyle.DIP:
							return {
								...feedback.options,
								rate: me.transitionSettings.dip?.rate,
							}
						case Enums.TransitionStyle.WIPE:
							return {
								...feedback.options,
								rate: me.transitionSettings.wipe?.rate,
							}
						case Enums.TransitionStyle.DVE:
							return {
								...feedback.options,
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
		[FeedbackId.InTransition]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'Transition: Active/Running',
			description: 'If the specified transition is active, change style of the bank',
			options: [AtemMEPicker(model, 0)],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				return !!me?.transitionPosition?.inTransition
			},
		}),
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function fadeToBlackFeedbacks(model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.FadeToBlackIsBlack]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'Fade to black: Active',
			description: 'If the specified fade to black is active, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemFadeToBlackStatePicker()],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
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
		[FeedbackId.FadeToBlackRate]: literal<CompanionFeedbackDefinition>({
			type: 'boolean',
			name: 'Fade to black: Rate',
			description: 'If the specified fade to black rate matches, change style of the bank',
			options: [AtemMEPicker(model, 0), AtemRatePicker('Rate')],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
				const me = getMixEffect(state, evt.options.mixeffect)
				const rate = Number(evt.options.rate)
				return me?.fadeToBlack?.rate === rate
			},
			learn: (feedback) => {
				const me = getMixEffect(state, feedback.options.mixeffect)

				if (me?.fadeToBlack) {
					return {
						...feedback.options,
						rate: me.fadeToBlack.rate,
					}
				} else {
					return undefined
				}
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
function ssrcFeedbacks(model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.SSrcArtProperties]: model.SSrc
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Supersource: Art properties',
					description: 'If the specified SuperSource art properties match, change style of the bank',
					options: compact([
						AtemSuperSourceIdPicker(model),
						...AtemSuperSourceArtPropertiesPickers(model, state, false),
					]),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const ssrcId = evt.options.ssrcId && model.SSrc > 1 ? Number(evt.options.ssrcId) : 0
						const ssrc = getSuperSource(state, ssrcId).properties

						const props = evt.options.properties
						if (!ssrc || !props || !Array.isArray(props)) return false

						if (props.includes('fill') && ssrc.artFillSource !== evt.options.fill) return false
						if (props.includes('key') && ssrc.artCutSource !== evt.options.key) return false

						if (props.includes('artOption') && ssrc.artOption !== evt.options.artOption) return false
						if (props.includes('artPreMultiplied') && ssrc.artPreMultiplied !== !!evt.options.artPreMultiplied)
							return false
						if (props.includes('artClip') && !compareAsInt(evt.options.artClip, ssrc.artClip, 10)) return false
						if (props.includes('artGain') && !compareAsInt(evt.options.artGain, ssrc.artGain, 10)) return false
						if (props.includes('artInvertKey') && ssrc.artInvertKey !== !!evt.options.artInvertKey) return false

						return true
					},
					learn: (feedback) => {
						const ssrcId = feedback.options.ssrcId && model.SSrc > 1 ? Number(feedback.options.ssrcId) : 0

						const ssrcConfig = state?.video.superSources?.[ssrcId]?.properties
						if (ssrcConfig) {
							return {
								...feedback.options,
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
		[FeedbackId.SSrcArtSource]: model.SSrc
			? literal<CompanionFeedbackDefinition>({
					// TODO - replace with FeedbackId.SSrcArtProperties
					type: 'boolean',
					name: 'Supersource: Art fill source',
					description: 'If the specified SuperSource art fill is set to the specified source, change style of the bank',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceArtSourcePicker(model, state, 'source', 'Fill Source'),
					]),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const ssrcId = evt.options.ssrcId && model.SSrc > 1 ? Number(evt.options.ssrcId) : 0
						const ssrc = getSuperSource(state, ssrcId)
						return ssrc.properties?.artFillSource === Number(evt.options.source)
					},
					learn: (feedback) => {
						const ssrcId = feedback.options.ssrcId && model.SSrc > 1 ? Number(feedback.options.ssrcId) : 0
						const ssrc = getSuperSource(state, ssrcId)

						if (ssrc.properties) {
							return {
								...feedback.options,
								source: ssrc.properties.artFillSource,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[FeedbackId.SSrcArtOption]: model.SSrc
			? literal<CompanionFeedbackDefinition>({
					// TODO - replace with FeedbackId.SSrcArtProperties
					type: 'boolean',
					name: 'Supersource: Art placement',
					description:
						'If the specified SuperSource art is placed in the foreground/background, change style of the bank',
					options: compact([AtemSuperSourceIdPicker(model), AtemSuperSourceArtOption(false)]),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const ssrcId = evt.options.ssrcId && model.SSrc > 1 ? Number(evt.options.ssrcId) : 0
						const ssrc = getSuperSource(state, ssrcId)
						return ssrc.properties?.artOption === Number(evt.options.artOption)
					},
					learn: (feedback) => {
						const ssrcId = feedback.options.ssrcId && model.SSrc > 1 ? Number(feedback.options.ssrcId) : 0
						const ssrc = getSuperSource(state, ssrcId)

						if (ssrc.properties) {
							return {
								...feedback.options,
								artOption: ssrc.properties.artOption,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[FeedbackId.SSrcBoxSource]: model.SSrc
			? literal<CompanionFeedbackDefinition>({
					// TODO - replace with FeedbackId.SSrcBoxProperties
					type: 'boolean',
					name: 'Supersource: Box source',
					description: 'If the specified SuperSource box is set to the specified source, change style of the bank',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						AtemSuperSourceBoxSourcePicker(model, state),
					]),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const ssrcId = evt.options.ssrcId && model.SSrc > 1 ? Number(evt.options.ssrcId) : 0
						const box = getSuperSourceBox(state, evt.options.boxIndex, ssrcId)
						return box?.source === Number(evt.options.source)
					},
					learn: (feedback) => {
						const ssrcId = feedback.options.ssrcId && model.SSrc > 1 ? Number(feedback.options.ssrcId) : 0
						const box = getSuperSourceBox(state, feedback.options.boxIndex, ssrcId)

						if (box) {
							return {
								...feedback.options,
								source: box.source,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[FeedbackId.SSrcBoxOnAir]: model.SSrc
			? literal<CompanionFeedbackDefinition>({
					// TODO - replace with FeedbackId.SSrcBoxProperties
					type: 'boolean',
					name: 'Supersource: Box state',
					description: 'If the specified SuperSource box is enabled, change style of the bank',
					options: compact([AtemSuperSourceIdPicker(model), AtemSuperSourceBoxPicker()]),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const ssrcId = evt.options.ssrcId && model.SSrc > 1 ? Number(evt.options.ssrcId) : 0
						const box = getSuperSourceBox(state, evt.options.boxIndex, ssrcId)
						return !!(box && box.enabled)
					},
			  })
			: undefined,
		[FeedbackId.SSrcBoxProperties]: model.SSrc
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Supersource: Box properties',
					description: 'If the specified SuperSource box properties match, change style of the bank',
					options: compact([
						AtemSuperSourceIdPicker(model),
						AtemSuperSourceBoxPicker(),
						...AtemSuperSourcePropertiesPickers(model, state, false),
					]),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const ssrcId = evt.options.ssrcId && model.SSrc > 1 ? Number(evt.options.ssrcId) : 0
						const box = getSuperSourceBox(state, evt.options.boxIndex, ssrcId)

						const props = evt.options.properties
						if (!box || !props || !Array.isArray(props)) return false

						if (props.includes('source') && box.source !== evt.options.source) return false

						if (props.includes('size') && !compareAsInt(evt.options.size, box.size, 1000, 10)) return false
						if (props.includes('x') && !compareAsInt(evt.options.x, box.x, 100)) return false
						if (props.includes('y') && !compareAsInt(evt.options.y, box.y, 100)) return false

						if (props.includes('cropEnable') && box.cropped !== !!evt.options.cropEnable) return false

						if (box.cropped) {
							if (props.includes('cropTop') && !compareAsInt(evt.options.cropTop, box.cropTop, 1000, 10)) return false
							if (props.includes('cropBottom') && !compareAsInt(evt.options.cropBottom, box.cropBottom, 1000, 10))
								return false
							if (props.includes('cropLeft') && !compareAsInt(evt.options.cropLeft, box.cropLeft, 1000, 10))
								return false
							if (props.includes('cropRight') && !compareAsInt(evt.options.cropRight, box.cropRight, 1000, 10))
								return false
						}

						return true
					},
					learn: (feedback) => {
						const ssrcId = feedback.options.ssrcId && model.SSrc > 1 ? Number(feedback.options.ssrcId) : 0
						const boxId = Number(feedback.options.boxIndex)
						const ssrcConfig = state.video.superSources?.[ssrcId]?.boxes[boxId]
						if (ssrcConfig) {
							return {
								...feedback.options,
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
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function dskFeedbacks(model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.DSKOnAir]: model.DSKs
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Downstream key: OnAir',
					description: 'If the specified downstream keyer is onair, change style of the bank',
					options: [AtemDSKPicker(model)],
					defaultStyle: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const dsk = getDSK(state, evt.options.key)
						return !!dsk?.onAir
					},
			  })
			: undefined,
		[FeedbackId.DSKTie]: model.DSKs
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Downstream key: Tied',
					description: 'If the specified downstream keyer is tied, change style of the bank',
					options: [AtemDSKPicker(model)],
					defaultStyle: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const dsk = getDSK(state, evt.options.key)
						return !!dsk?.properties?.tie
					},
			  })
			: undefined,
		[FeedbackId.DSKSource]: model.DSKs
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Downstream key: Fill source',
					description: 'If the input specified is in use by the DSK specified, change style of the bank',
					options: [AtemDSKPicker(model), AtemKeyFillSourcePicker(model, state)],
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(238, 238, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const dsk = getDSK(state, evt.options.key)
						return dsk?.sources?.fillSource === Number(evt.options.fill)
					},
					learn: (feedback) => {
						const dsk = getDSK(state, feedback.options.key)

						if (dsk?.sources) {
							return {
								...feedback.options,
								fill: dsk.sources.fillSource,
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
function streamRecordFeedbacks(model: ModelSpec, state: AtemState) {
	return {
		[FeedbackId.StreamStatus]: model.streaming
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Streaming: Active/Running',
					description: 'If the stream has the specified status, change style of the bank',
					options: [
						literal<CompanionInputFieldDropdown>({
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
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const streaming = state.streaming?.status?.state
						return streaming === Number(evt.options.state)
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
		[FeedbackId.RecordStatus]: model.recording
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Recording: Active/Running',
					description: 'If the record has the specified status, change style of the bank',
					options: [
						literal<CompanionInputFieldDropdown>({
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
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const recording = state.recording?.status?.state
						return recording === Number(evt.options.state)
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
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function audioFeedbacks(model: ModelSpec, state: AtemState) {
	if (model.classicAudio) {
		const audioInputOption = AtemAudioInputPicker(model, state)
		return {
			[FeedbackId.ClassicAudioGain]: literal<CompanionFeedbackDefinition>({
				type: 'boolean',
				name: 'Classic Audio: Audio gain',
				description: 'If the audio input has the specified gain, change style of the bank',
				options: [
					audioInputOption,
					NumberComparitorPicker(),
					literal<CompanionInputFieldNumber>({
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
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[Number(evt.options.input)]
					return !!(channel && compareNumber(evt.options.gain, evt.options.comparitor, channel.gain))
				},
				learn: (feedback) => {
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[Number(feedback.options.input)]

					if (channel) {
						return {
							...feedback.options,
							gain: channel.gain,
						}
					} else {
						return undefined
					}
				},
			}),
			[FeedbackId.ClassicAudioMixOption]: literal<CompanionFeedbackDefinition>({
				type: 'boolean',
				name: 'Classic Audio: Mix option',
				description: 'If the audio input has the specified mix option, change style of the bank',
				options: [
					audioInputOption,
					literal<CompanionInputFieldDropdown>({
						id: 'option',
						label: 'Mix option',
						type: 'dropdown',
						default: CHOICES_CLASSIC_AUDIO_MIX_OPTION[0].id,
						choices: CHOICES_CLASSIC_AUDIO_MIX_OPTION,
					}),
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[Number(evt.options.input)]
					return channel?.mixOption === Number(evt.options.option)
				},
				learn: (feedback) => {
					const audioChannels = state.audio?.channels ?? {}
					const channel = audioChannels[Number(feedback.options.input)]

					if (channel) {
						return {
							...feedback.options,
							option: channel.mixOption,
						}
					} else {
						return undefined
					}
				},
			}),
			[FeedbackId.ClassicAudioMasterGain]: literal<CompanionFeedbackDefinition>({
				type: 'boolean',
				name: 'Classic Audio: Master gain',
				description: 'If the audio master has the specified gain, change style of the bank',
				options: [
					NumberComparitorPicker(),
					literal<CompanionInputFieldNumber>({
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
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
					const props = state.audio?.master
					return !!(props && compareNumber(evt.options.gain, evt.options.comparitor, props.gain))
				},
				learn: (feedback) => {
					const props = state.audio?.master

					if (props) {
						return {
							...feedback.options,
							gain: props.gain,
						}
					} else {
						return undefined
					}
				},
			}),
			[FeedbackId.FairlightAudioInputGain]: undefined,
			[FeedbackId.FairlightAudioFaderGain]: undefined,
			[FeedbackId.FairlightAudioMixOption]: undefined,
			[FeedbackId.FairlightAudioMasterGain]: undefined,
			[FeedbackId.FairlightAudioMonitorMasterMuted]: undefined,
			[FeedbackId.FairlightAudioMonitorFaderGain]: undefined,
		}
	} else if (model.fairlightAudio) {
		const audioInputOption = AtemAudioInputPicker(model, state)
		const audioSourceOption = AtemFairlightAudioSourcePicker()
		return {
			[FeedbackId.ClassicAudioGain]: undefined,
			[FeedbackId.ClassicAudioMixOption]: undefined,
			[FeedbackId.ClassicAudioMasterGain]: undefined,
			[FeedbackId.FairlightAudioInputGain]: literal<CompanionFeedbackDefinition>({
				type: 'boolean',
				name: 'Fairlight Audio: Audio input gain',
				description: 'If the audio input has the specified input gain, change style of the bank',
				options: [
					audioInputOption,
					audioSourceOption,
					NumberComparitorPicker(),
					literal<CompanionInputFieldNumber>({
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
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(evt.options.input)]?.sources ?? {}
					const source = audioSources[evt.options.source + '']
					return !!(
						source?.properties && compareNumber(evt.options.gain, evt.options.comparitor, source.properties.gain / 100)
					)
				},
				learn: (feedback) => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(feedback.options.input)]?.sources ?? {}
					const source = audioSources[feedback.options.source + '']

					if (source?.properties) {
						return {
							...feedback.options,
							gain: source.properties.gain / 100,
						}
					} else {
						return undefined
					}
				},
			}),
			[FeedbackId.FairlightAudioFaderGain]: literal<CompanionFeedbackDefinition>({
				type: 'boolean',
				name: 'Fairlight Audio: Audio fader gain',
				description: 'If the audio input has the specified fader gain, change style of the bank',
				options: [
					audioInputOption,
					audioSourceOption,
					NumberComparitorPicker(),
					literal<CompanionInputFieldNumber>({
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
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(evt.options.input)]?.sources ?? {}
					const source = audioSources[evt.options.source + '']
					return !!(
						source?.properties &&
						compareNumber(evt.options.gain, evt.options.comparitor, source.properties.faderGain / 100)
					)
				},
				learn: (feedback) => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(feedback.options.input)]?.sources ?? {}
					const source = audioSources[feedback.options.source + '']

					if (source?.properties) {
						return {
							...feedback.options,
							gain: source.properties.faderGain / 100,
						}
					} else {
						return undefined
					}
				},
			}),
			[FeedbackId.FairlightAudioMixOption]: literal<CompanionFeedbackDefinition>({
				type: 'boolean',
				name: 'Fairlight Audio: Audio mix option',
				description: 'If the audio input has the specified mix option, change style of the bank',
				options: [
					audioInputOption,
					audioSourceOption,
					literal<CompanionInputFieldDropdown>({
						id: 'option',
						label: 'Mix option',
						type: 'dropdown',
						default: CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION[0].id,
						choices: CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
					}),
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(evt.options.input)]?.sources ?? {}
					const source = audioSources[evt.options.source + '']
					return source?.properties?.mixOption === Number(evt.options.option)
				},
				learn: (feedback) => {
					const audioChannels = state.fairlight?.inputs ?? {}
					const audioSources = audioChannels[Number(feedback.options.input)]?.sources ?? {}
					const source = audioSources[feedback.options.source + '']

					if (source?.properties) {
						return {
							...feedback.options,
							option: source.properties.mixOption,
						}
					} else {
						return undefined
					}
				},
			}),
			[FeedbackId.FairlightAudioMasterGain]: literal<CompanionFeedbackDefinition>({
				type: 'boolean',
				name: 'Fairlight Audio: Master fader gain',
				description: 'If the master has the specified fader gain, change style of the bank',
				options: [
					NumberComparitorPicker(),
					literal<CompanionInputFieldNumber>({
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
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
					const props = state.fairlight?.master?.properties
					return !!(props && compareNumber(evt.options.gain, evt.options.comparitor, props.faderGain / 100))
				},
				learn: (feedback) => {
					const props = state.fairlight?.master?.properties

					if (props) {
						return {
							...feedback.options,
							gain: props.faderGain / 100,
						}
					} else {
						return undefined
					}
				},
			}),
			[FeedbackId.FairlightAudioMonitorMasterMuted]: model.fairlightAudio.monitor
				? literal<CompanionFeedbackDefinition>({
						type: 'boolean',
						name: 'Fairlight Audio: Monitor/Headphone Master muted',
						description: 'If the headphone master is muted, change style of the bank',
						options: [
							// audioInputOption,
						],
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: (_evt: CompanionFeedbackBooleanEvent): boolean => {
							return !!state.fairlight?.monitor?.inputMasterMuted
						},
				  })
				: undefined,
			[FeedbackId.FairlightAudioMonitorFaderGain]: model.fairlightAudio.monitor
				? literal<CompanionFeedbackDefinition>({
						type: 'boolean',
						name: 'Fairlight Audio: Monitor/Headphone Gain',
						description: 'If the headphone/monitor has the specified fader gain, change style of the bank',
						options: [
							NumberComparitorPicker(),
							literal<CompanionInputFieldNumber>({
								type: 'number',
								label: 'Fader Level (-60 = Min)',
								id: 'gain',
								range: true,
								required: true,
								default: 0,
								step: 0.1,
								min: -60,
								max: 10,
							}),
						],
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
							const gain = state.fairlight?.monitor?.gain
							return !!(typeof gain === 'number' && compareNumber(evt.options.gain, evt.options.comparitor, gain / 100))
						},
						learn: (feedback) => {
							const props = state.fairlight?.monitor

							if (props) {
								return {
									...feedback.options,
									gain: props.gain / 100,
								}
							} else {
								return undefined
							}
						},
				  })
				: undefined,
		}
	} else {
		return {
			[FeedbackId.ClassicAudioGain]: undefined,
			[FeedbackId.ClassicAudioMixOption]: undefined,
			[FeedbackId.ClassicAudioMasterGain]: undefined,
			[FeedbackId.FairlightAudioInputGain]: undefined,
			[FeedbackId.FairlightAudioFaderGain]: undefined,
			[FeedbackId.FairlightAudioMixOption]: undefined,
			[FeedbackId.FairlightAudioMasterGain]: undefined,
			[FeedbackId.FairlightAudioMonitorMasterMuted]: undefined,
			[FeedbackId.FairlightAudioMonitorFaderGain]: undefined,
		}
	}
}

export function GetFeedbacksList(
	model: ModelSpec,
	state: AtemState,
	tally: TallyBySource
): CompanionFeedbackDefinitions {
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
		...tallyFeedbacks(model, state, tally),
		...previewFeedbacks(model, state),
		...programFeedbacks(model, state),
		...uskFeedbacks(model, state),
		...dskFeedbacks(model, state),
		...ssrcFeedbacks(model, state),
		...transitionFeedbacks(model, state),
		...fadeToBlackFeedbacks(model, state),
		...streamRecordFeedbacks(model, state),
		...audioFeedbacks(model, state),
		[FeedbackId.AuxBG]: model.auxes
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Aux/Output: Source',
					description: 'If the input specified is in use by the aux bus specified, change style of the bank',
					options: [AtemAuxPicker(model), AtemAuxSourcePicker(model, state)],
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const auxSource = state.video.auxilliaries[Number(evt.options.aux)]
						return auxSource === Number(evt.options.input)
					},
					learn: (feedback) => {
						const auxSource = state.video.auxilliaries[Number(feedback.options.aux)]

						if (auxSource !== undefined) {
							return {
								...feedback.options,
								input: auxSource,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[FeedbackId.Macro]: model.macros
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Macro: State',
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
					defaultStyle: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(238, 238, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
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
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Multiviewer: Window source',
					description: 'If the specified MV window is set to the specified source, change style of the bank',
					options: [
						AtemMultiviewerPicker(model),
						AtemMultiviewWindowPicker(model),
						AtemMultiviewSourcePicker(model, state),
					],
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
						const window = getMultiviewerWindow(state, evt.options.multiViewerId, evt.options.windowIndex)
						return window?.source === Number(evt.options.source)
					},
					learn: (feedback) => {
						const window = getMultiviewerWindow(state, feedback.options.multiViewerId, feedback.options.windowIndex)

						if (window) {
							return {
								...feedback.options,
								source: window.source,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
		[FeedbackId.MediaPlayerSource]: model.media.players
			? literal<CompanionFeedbackDefinition>({
					type: 'boolean',
					name: 'Media player: Source',
					description: 'If the specified media player has the specified source, change style of the bank',
					options: [AtemMediaPlayerPicker(model), AtemMediaPlayerSourcePicker(model, state)],
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					callback: (evt: CompanionFeedbackBooleanEvent): boolean => {
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
					learn: (feedback) => {
						const player = state.media.players[Number(feedback.options.mediaplayer)]

						if (player) {
							return {
								...feedback.options,
								source: player.sourceType ? player.stillIndex : player.clipIndex + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
							}
						} else {
							return undefined
						}
					},
			  })
			: undefined,
	}

	return feedbacks
}
