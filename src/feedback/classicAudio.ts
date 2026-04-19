import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { ModelSpec } from '../models/index.js'
import { FeedbackId } from './FeedbackId.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import {
	compareNumber,
	NumberComparitor,
	AtemAudioInputPicker,
	NumberComparitorPicker,
	CHOICES_CLASSIC_AUDIO_MIX_OPTION,
} from '../options/audio.js'
import type { StateWrapper } from '../state.js'

export type AtemClassicAudioFeedbacks = {
	[FeedbackId.ClassicAudioGain]: {
		type: 'boolean'
		options: {
			input: number
			comparitor: NumberComparitor
			gain: number
		}
	}
	[FeedbackId.ClassicAudioMixOption]: {
		type: 'boolean'
		options: {
			input: number
			option: Enums.AudioMixOption
		}
	}
	[FeedbackId.ClassicAudioMasterGain]: {
		type: 'boolean'
		options: {
			comparitor: NumberComparitor
			gain: number
		}
	}
}

export function createClassicAudioFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemClassicAudioFeedbacks> {
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
			options: convertOptionsFields({
				input: audioInputOption,
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Fader Level',
					id: 'gain',
					range: true,
					default: 0,
					step: 0.1,
					min: -60,
					max: 6,
					description: '-60 = -inf',
					showMinAsNegativeInfinity: true,
					asInteger: false,
					clampValues: true,
				},
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[options.input]
				return !!(channel && compareNumber(options.gain, options.comparitor, channel.gain))
			},
			learn: ({ options }) => {
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[options.input]

				if (channel) {
					return {
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
			options: convertOptionsFields({
				input: audioInputOption,
				option: {
					id: 'option',
					label: 'Mix option',
					type: 'dropdown',
					default: CHOICES_CLASSIC_AUDIO_MIX_OPTION[0].id,
					choices: CHOICES_CLASSIC_AUDIO_MIX_OPTION,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[options.input]
				return channel?.mixOption === options.option
			},
			learn: ({ options }) => {
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[options.input]

				if (channel) {
					return {
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
			options: convertOptionsFields({
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Fader Level',
					id: 'gain',
					range: true,
					default: 0,
					step: 0.1,
					min: -60,
					max: 6,
					description: '-60 = -inf',
					showMinAsNegativeInfinity: true,
					asInteger: false,
					clampValues: true,
				},
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: ({ options }): boolean => {
				const props = state.state.audio?.master
				return !!(props && compareNumber(options.gain, options.comparitor, props.gain))
			},
			learn: () => {
				const props = state.state.audio?.master

				if (props) {
					return {
						gain: props.gain,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
