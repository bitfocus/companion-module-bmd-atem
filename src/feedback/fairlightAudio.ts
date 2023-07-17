import { Enums } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './FeedbackId.js'
import { combineRgb, type CompanionInputFieldDropdown, type CompanionInputFieldNumber } from '@companion-module/base'
import { CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION } from '../choices.js'
import { compareNumber, NumberComparitor } from '../util.js'
import { AtemAudioInputPicker, AtemFairlightAudioSourcePicker, NumberComparitorPicker } from '../input.js'
import type { StateWrapper } from '../state.js'

export interface AtemFairlightAudioFeedbacks {
	[FeedbackId.FairlightAudioInputGain]: {
		input: number
		source: string
		comparitor: NumberComparitor
		gain: number
	}
	[FeedbackId.FairlightAudioFaderGain]: {
		input: number
		source: string
		comparitor: NumberComparitor
		gain: number
	}
	[FeedbackId.FairlightAudioMixOption]: {
		input: number
		source: string
		option: Enums.FairlightAudioMixOption
	}
	[FeedbackId.FairlightAudioMasterGain]: {
		comparitor: NumberComparitor
		gain: number
	}
	[FeedbackId.FairlightAudioMonitorMasterMuted]: Record<string, never>
	[FeedbackId.FairlightAudioMonitorFaderGain]: {
		comparitor: NumberComparitor
		gain: number
	}
}

export function createFairlightAudioFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): MyFeedbackDefinitions<AtemFairlightAudioFeedbacks> {
	if (!model.fairlightAudio) {
		return {
			[FeedbackId.FairlightAudioInputGain]: undefined,
			[FeedbackId.FairlightAudioFaderGain]: undefined,
			[FeedbackId.FairlightAudioMixOption]: undefined,
			[FeedbackId.FairlightAudioMasterGain]: undefined,
			[FeedbackId.FairlightAudioMonitorMasterMuted]: undefined,
			[FeedbackId.FairlightAudioMonitorFaderGain]: undefined,
		}
	}

	const audioInputOption = AtemAudioInputPicker(model, state.state)
	const audioSourceOption = AtemFairlightAudioSourcePicker()

	return {
		[FeedbackId.FairlightAudioInputGain]: {
			type: 'boolean',
			name: 'Fairlight Audio: Audio input gain',
			description: 'If the audio input has the specified input gain, change style of the bank',
			options: {
				input: audioInputOption,
				source: audioSourceOption,
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Input Level (-100 = -inf)',
					id: 'gain',
					range: true,
					required: true,
					default: 0,
					step: 0.1,
					min: -100,
					max: 6,
				} satisfies CompanionInputFieldNumber,
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.getPlainNumber('input')]?.sources ?? {}
				const source = audioSources[options.getPlainString('source')]
				return !!(
					source?.properties &&
					compareNumber(
						options.getPlainNumber('gain'),
						options.getPlainString('comparitor'),
						source.properties.gain / 100,
					)
				)
			},
			learn: ({ options }) => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.getPlainNumber('input')]?.sources ?? {}
				const source = audioSources[options.getPlainString('source')]

				if (source?.properties) {
					return {
						...options.getJson(),
						gain: source.properties.gain / 100,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.FairlightAudioFaderGain]: {
			type: 'boolean',
			name: 'Fairlight Audio: Audio fader gain',
			description: 'If the audio input has the specified fader gain, change style of the bank',
			options: {
				input: audioInputOption,
				source: audioSourceOption,
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Fader Level (-100 = -inf)',
					id: 'gain',
					range: true,
					required: true,
					default: 0,
					step: 0.1,
					min: -100,
					max: 10,
				} satisfies CompanionInputFieldNumber,
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.getPlainNumber('input')]?.sources ?? {}
				const source = audioSources[options.getPlainString('source')]
				return !!(
					source?.properties &&
					compareNumber(
						options.getPlainNumber('gain'),
						options.getPlainString('comparitor'),
						source.properties.faderGain / 100,
					)
				)
			},
			learn: ({ options }) => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.getPlainNumber('input')]?.sources ?? {}
				const source = audioSources[options.getPlainString('source')]

				if (source?.properties) {
					return {
						...options.getJson(),
						gain: source.properties.faderGain / 100,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.FairlightAudioMixOption]: {
			type: 'boolean',
			name: 'Fairlight Audio: Audio mix option',
			description: 'If the audio input has the specified mix option, change style of the bank',
			options: {
				input: audioInputOption,
				source: audioSourceOption,
				option: {
					id: 'option',
					label: 'Mix option',
					type: 'dropdown',
					default: CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION[0].id,
					choices: CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
				} satisfies CompanionInputFieldDropdown,
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.getPlainNumber('input')]?.sources ?? {}
				const source = audioSources[options.getPlainString('source')]
				return source?.properties?.mixOption === options.getPlainNumber('option')
			},
			learn: ({ options }) => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.getPlainNumber('input')]?.sources ?? {}
				const source = audioSources[options.getPlainString('source')]

				if (source?.properties) {
					return {
						...options.getJson(),
						option: source.properties.mixOption,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.FairlightAudioMasterGain]: {
			type: 'boolean',
			name: 'Fairlight Audio: Master fader gain',
			description: 'If the master has the specified fader gain, change style of the bank',
			options: {
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Fader Level (-100 = -inf)',
					id: 'gain',
					range: true,
					required: true,
					default: 0,
					step: 0.1,
					min: -100,
					max: 10,
				} satisfies CompanionInputFieldNumber,
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const props = state.state.fairlight?.master?.properties
				return !!(
					props &&
					compareNumber(options.getPlainNumber('gain'), options.getPlainString('comparitor'), props.faderGain / 100)
				)
			},
			learn: ({ options }) => {
				const props = state.state.fairlight?.master?.properties

				if (props) {
					return {
						...options.getJson(),
						gain: props.faderGain / 100,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.FairlightAudioMonitorMasterMuted]: model.fairlightAudio.monitor
			? {
					type: 'boolean',
					name: 'Fairlight Audio: Monitor/Headphone Master muted',
					description: 'If the headphone master is muted, change style of the bank',
					options: {
						// audioInputOption,
					},
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					callback: (): boolean => {
						return !!state.state.fairlight?.monitor?.inputMasterMuted
					},
				}
			: undefined,
		[FeedbackId.FairlightAudioMonitorFaderGain]: model.fairlightAudio.monitor
			? {
					type: 'boolean',
					name: 'Fairlight Audio: Monitor/Headphone Gain',
					description: 'If the headphone/monitor has the specified fader gain, change style of the bank',
					options: {
						comparitor: NumberComparitorPicker(),
						gain: {
							type: 'number',
							label: 'Fader Level (-60 = Min)',
							id: 'gain',
							range: true,
							required: true,
							default: 0,
							step: 0.1,
							min: -60,
							max: 10,
						} satisfies CompanionInputFieldNumber,
					},
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					callback: ({ options }): boolean => {
						const gain = state.state.fairlight?.monitor?.gain
						return !!(
							typeof gain === 'number' &&
							compareNumber(options.getPlainNumber('gain'), options.getPlainString('comparitor'), gain / 100)
						)
					},
					learn: ({ options }) => {
						const props = state.state.fairlight?.monitor

						if (props) {
							return {
								...options.getJson(),
								gain: props.gain / 100,
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
	}
}
