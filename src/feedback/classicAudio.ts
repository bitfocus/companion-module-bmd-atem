import { Enums, type AtemState } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './index.js'
import { combineRgb, type CompanionInputFieldDropdown, type CompanionInputFieldNumber } from '@companion-module/base'
import { CHOICES_CLASSIC_AUDIO_MIX_OPTION } from '../choices.js'
import { compareNumber, NumberComparitor } from '../util.js'
import { AtemAudioInputPicker, NumberComparitorPicker } from '../input.js'
import type { StateWrapper } from '../state.js'

export interface AtemClassicAudioFeedbacks {
	[FeedbackId.ClassicAudioGain]: {
		input: number
		comparitor: NumberComparitor
		gain: number
	}
	[FeedbackId.ClassicAudioMixOption]: {
		input: number
		option: Enums.AudioMixOption
	}
	[FeedbackId.ClassicAudioMasterGain]: {
		comparitor: NumberComparitor
		gain: number
	}
}

export function createClassicAudioFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): MyFeedbackDefinitions<AtemClassicAudioFeedbacks> {
	if (!model.classicAudio) {
		return {
			[FeedbackId.ClassicAudioGain]: undefined,
			[FeedbackId.ClassicAudioMixOption]: undefined,
			[FeedbackId.ClassicAudioMasterGain]: undefined,
		}
	}

	const audioInputOption = AtemAudioInputPicker(model, state.state)

	return {
		[FeedbackId.ClassicAudioGain]: {
			type: 'boolean',
			name: 'Classic Audio: Audio gain',
			description: 'If the audio input has the specified gain, change style of the bank',
			options: {
				input: audioInputOption,
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Fader Level (-60 = -inf)',
					id: 'gain',
					range: true,
					required: true,
					default: 0,
					step: 0.1,
					min: -60,
					max: 6,
				} satisfies CompanionInputFieldNumber,
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[options.getPlainNumber('input')]
				return !!(
					channel && compareNumber(options.getPlainNumber('gain'), options.getPlainString('comparitor'), channel.gain)
				)
			},
			learn: ({ options }) => {
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[options.getPlainNumber('input')]

				if (channel) {
					return {
						...options.getJson(),
						gain: channel.gain,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.ClassicAudioMixOption]: {
			type: 'boolean',
			name: 'Classic Audio: Mix option',
			description: 'If the audio input has the specified mix option, change style of the bank',
			options: {
				input: audioInputOption,
				option: {
					id: 'option',
					label: 'Mix option',
					type: 'dropdown',
					default: CHOICES_CLASSIC_AUDIO_MIX_OPTION[0].id,
					choices: CHOICES_CLASSIC_AUDIO_MIX_OPTION,
				} satisfies CompanionInputFieldDropdown,
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[options.getPlainNumber('input')]
				return channel?.mixOption === options.getPlainNumber('option')
			},
			learn: ({ options }) => {
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[options.getPlainNumber('input')]

				if (channel) {
					return {
						...options.getJson(),
						option: channel.mixOption,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.ClassicAudioMasterGain]: {
			type: 'boolean',
			name: 'Classic Audio: Master gain',
			description: 'If the audio master has the specified gain, change style of the bank',
			options: {
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Fader Level (-60 = -inf)',
					id: 'gain',
					range: true,
					required: true,
					default: 0,
					step: 0.1,
					min: -60,
					max: 6,
				} satisfies CompanionInputFieldNumber,
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const props = state.state.audio?.master
				return !!(
					props && compareNumber(options.getPlainNumber('gain'), options.getPlainString('comparitor'), props.gain)
				)
			},
			learn: ({ options }) => {
				const props = state.state.audio?.master

				if (props) {
					return {
						...options.getJson(),
						gain: props.gain,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
