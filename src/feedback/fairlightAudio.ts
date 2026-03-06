import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../common.js'
import type { ModelSpec } from '../models/index.js'
import { FeedbackId } from './FeedbackId.js'
import {
	combineRgb,
	type CompanionInputFieldDropdown,
	type CompanionInputFieldNumber,
	CompanionFeedbackDefinitions,
} from '@companion-module/base'
import { CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION } from '../choices.js'
import { compareNumber, NumberComparitor, parseAudioRoutingStringSingle } from '../util.js'
import {
	AtemAudioInputPicker,
	AtemFairlightAudioRoutingDestinationPicker,
	AtemFairlightAudioRoutingSourcePicker,
	AtemFairlightAudioSourcePicker,
	NumberComparitorPicker,
} from '../input.js'
import type { StateWrapper } from '../state.js'

export type AtemFairlightAudioFeedbacks = {
	[FeedbackId.FairlightAudioInputGain]: {
		type: 'boolean'
		options: {
			input: number
			source: string
			comparitor: NumberComparitor
			gain: number
		}
	}
	[FeedbackId.FairlightAudioFaderGain]: {
		type: 'boolean'
		options: {
			input: number
			source: string
			comparitor: NumberComparitor
			gain: number
		}
	}
	[FeedbackId.FairlightAudioMixOption]: {
		type: 'boolean'
		options: {
			input: number
			source: string
			option: Enums.FairlightAudioMixOption
		}
	}
	[FeedbackId.FairlightAudioMasterGain]: {
		type: 'boolean'
		options: {
			comparitor: NumberComparitor
			gain: number
		}
	}
	[FeedbackId.FairlightAudioMonitorSolo]: {
		type: 'boolean'
		options: {
			nothing: boolean
			input: number
			source: string
		}
	}
	[FeedbackId.FairlightAudioMonitorOutputFaderGain]: {
		type: 'boolean'
		options: {
			comparitor: NumberComparitor
			gain: number
		}
	}
	[FeedbackId.FairlightAudioMonitorMasterMuted]: {
		type: 'boolean'
		options: Record<string, never>
	}
	[FeedbackId.FairlightAudioMonitorMasterGain]: {
		type: 'boolean'
		options: {
			comparitor: NumberComparitor
			gain: number
		}
	}
	[FeedbackId.FairlightAudioMonitorTalkbackMuted]: {
		type: 'boolean'
		options: Record<string, never>
	}
	[FeedbackId.FairlightAudioMonitorTalkbackGain]: {
		type: 'boolean'
		options: {
			comparitor: NumberComparitor
			gain: number
		}
	}
	[FeedbackId.FairlightAudioMonitorSidetoneGain]: {
		type: 'boolean'
		options: {
			comparitor: NumberComparitor
			gain: number
		}
	}
	[FeedbackId.FairlightAudioRouting]: {
		type: 'boolean'
		options: {
			destination: number
			source: number
		}
	}
	[FeedbackId.FairlightAudioRoutingVariables]: {
		type: 'boolean'
		options: {
			destination: string
			source: string
		}
	}
}

export function createFairlightAudioFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemFairlightAudioFeedbacks> {
	if (!model.fairlightAudio) {
		return {
			[FeedbackId.FairlightAudioInputGain]: undefined,
			[FeedbackId.FairlightAudioFaderGain]: undefined,
			[FeedbackId.FairlightAudioMixOption]: undefined,
			[FeedbackId.FairlightAudioMasterGain]: undefined,
			[FeedbackId.FairlightAudioMonitorSolo]: undefined,
			[FeedbackId.FairlightAudioMonitorOutputFaderGain]: undefined,
			[FeedbackId.FairlightAudioMonitorMasterMuted]: undefined,
			[FeedbackId.FairlightAudioMonitorMasterGain]: undefined,
			[FeedbackId.FairlightAudioMonitorTalkbackMuted]: undefined,
			[FeedbackId.FairlightAudioMonitorTalkbackGain]: undefined,
			[FeedbackId.FairlightAudioMonitorSidetoneGain]: undefined,
			[FeedbackId.FairlightAudioRouting]: undefined,
			[FeedbackId.FairlightAudioRoutingVariables]: undefined,
		}
	}

	const audioInputOption = AtemAudioInputPicker(model, state.state)
	const audioSourceOption = AtemFairlightAudioSourcePicker()

	return {
		[FeedbackId.FairlightAudioInputGain]: {
			type: 'boolean',
			name: 'Fairlight Audio: Audio input gain',
			description: 'If the audio input has the specified input gain, change style of the bank',
			options: convertOptionsFields({
				input: audioInputOption,
				source: audioSourceOption,
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Input Level (-100 = -inf)',
					id: 'gain',
					range: true,
					default: 0,
					step: 0.1,
					min: -100,
					max: 6,
				},
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.input]?.sources ?? {}
				const source = audioSources[options.source]
				return !!(source?.properties && compareNumber(options.gain, options.comparitor, source.properties.gain / 100))
			},
			learn: ({ options }) => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.input]?.sources ?? {}
				const source = audioSources[options.source]

				if (source?.properties) {
					return {
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
			options: convertOptionsFields({
				input: audioInputOption,
				source: audioSourceOption,
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Fader Level (-100 = -inf)',
					id: 'gain',
					range: true,
					default: 0,
					step: 0.1,
					min: -100,
					max: 10,
				},
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.input]?.sources ?? {}
				const source = audioSources[options.source]
				return !!(
					source?.properties && compareNumber(options.gain, options.comparitor, source.properties.faderGain / 100)
				)
			},
			learn: ({ options }) => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.input]?.sources ?? {}
				const source = audioSources[options.source]

				if (source?.properties) {
					return {
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
			options: convertOptionsFields({
				input: audioInputOption,
				source: audioSourceOption,
				option: {
					id: 'option',
					label: 'Mix option',
					type: 'dropdown',
					default: CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION[0].id,
					choices: CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
				},
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.input]?.sources ?? {}
				const source = audioSources[options.source]
				return source?.properties?.mixOption === options.option
			},
			learn: ({ options }) => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.input]?.sources ?? {}
				const source = audioSources[options.source]

				if (source?.properties) {
					return {
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
			options: convertOptionsFields({
				comparitor: NumberComparitorPicker(),
				gain: {
					type: 'number',
					label: 'Fader Level (-100 = -inf)',
					id: 'gain',
					range: true,
					default: 0,
					step: 0.1,
					min: -100,
					max: 10,
				},
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const props = state.state.fairlight?.master?.properties
				return !!(props && compareNumber(options.gain, options.comparitor, props.faderGain / 100))
			},
			learn: () => {
				const props = state.state.fairlight?.master?.properties

				if (props) {
					return {
						gain: props.faderGain / 100,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.FairlightAudioMonitorSolo]: model.fairlightAudio.monitor
			? {
					type: 'boolean',
					name: 'Fairlight Audio: Solo source',
					description: 'If the specified source is soloed, change style of the bank',
					options: convertOptionsFields({
						nothing: {
							id: 'nothing',
							type: 'checkbox',
							label: 'No solo',
							default: false,
						},
						input: { ...audioInputOption, isVisibleExpression: `!$(options:nothing)` },
						source: { ...audioSourceOption, isVisibleExpression: `!$(options:nothing)` },
					}),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					callback: ({ options }): boolean => {
						const soloState = state.state.fairlight?.solo
						if (options.nothing) {
							return !soloState?.solo
						} else {
							return !!soloState?.solo && soloState?.index === options.input && soloState?.source === options.source
						}
					},
					learn: ({ options }) => {
						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[options.input]?.sources ?? {}
						const source = audioSources[options.source]

						if (source?.properties) {
							return {
								gain: source.properties.faderGain / 100,
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		[FeedbackId.FairlightAudioMonitorOutputFaderGain]: model.fairlightAudio.monitor
			? {
					type: 'boolean',
					name: 'Fairlight Audio: Monitor/Headphone Gain',
					description: 'If the headphone/monitor has the specified fader gain, change style of the bank',
					options: convertOptionsFields({
						comparitor: NumberComparitorPicker(),
						gain: {
							type: 'number',
							label: 'Fader Level (-60 = Min)',
							id: 'gain',
							range: true,
							default: 0,
							step: 0.1,
							min: -60,
							max: 10,
						},
					}),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					callback: ({ options }): boolean => {
						const gain = state.state.fairlight?.monitor?.gain
						return !!(typeof gain === 'number' && compareNumber(options.gain, options.comparitor, gain / 100))
					},
					learn: () => {
						const props = state.state.fairlight?.monitor

						if (props) {
							return {
								gain: props.gain / 100,
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		[FeedbackId.FairlightAudioMonitorMasterMuted]: model.fairlightAudio.monitor
			? {
					type: 'boolean',
					name: 'Fairlight Audio: Monitor/Headphone Master muted',
					description: 'If the headphone master is muted, change style of the bank',
					options: convertOptionsFields({
						// audioInputOption,
					}),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					callback: (): boolean => {
						return !!state.state.fairlight?.monitor?.inputMasterMuted
					},
				}
			: undefined,
		[FeedbackId.FairlightAudioMonitorMasterGain]:
			model.fairlightAudio.monitor === 'split'
				? {
						type: 'boolean',
						name: 'Fairlight Audio: Monitor/Headphone master Gain',
						description: 'If the headphone/monitor has the specified master gain, change style of the bank',
						options: convertOptionsFields({
							comparitor: NumberComparitorPicker(),
							gain: {
								type: 'number',
								label: 'Fader Level (-60 = Min)',
								id: 'gain',
								range: true,
								default: 0,
								step: 0.1,
								min: -60,
								max: 10,
							},
						}),
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: ({ options }): boolean => {
							const gain = state.state.fairlight?.monitor?.inputMasterGain
							return !!(typeof gain === 'number' && compareNumber(options.gain, options.comparitor, gain / 100))
						},
						learn: () => {
							const props = state.state.fairlight?.monitor

							if (props) {
								return {
									gain: props.inputMasterGain / 100,
								}
							} else {
								return undefined
							}
						},
					}
				: undefined,
		[FeedbackId.FairlightAudioMonitorTalkbackMuted]: model.fairlightAudio.monitor
			? {
					type: 'boolean',
					name: 'Fairlight Audio: Monitor/Headphone Talkback muted',
					description: 'If the headphone talkback is muted, change style of the bank',
					options: convertOptionsFields({
						// audioInputOption,
					}),
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					callback: (): boolean => {
						return !!state.state.fairlight?.monitor?.inputTalkbackMuted
					},
				}
			: undefined,
		[FeedbackId.FairlightAudioMonitorTalkbackGain]:
			model.fairlightAudio.monitor === 'split'
				? {
						type: 'boolean',
						name: 'Fairlight Audio: Monitor/Headphone talkback Gain',
						description: 'If the headphone/monitor has the specified talkback gain, change style of the bank',
						options: convertOptionsFields({
							comparitor: NumberComparitorPicker(),
							gain: {
								type: 'number',
								label: 'Fader Level (-60 = Min)',
								id: 'gain',
								range: true,
								default: 0,
								step: 0.1,
								min: -60,
								max: 10,
							},
						}),
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: ({ options }): boolean => {
							const gain = state.state.fairlight?.monitor?.inputTalkbackGain
							return !!(typeof gain === 'number' && compareNumber(options.gain, options.comparitor, gain / 100))
						},
						learn: () => {
							const props = state.state.fairlight?.monitor

							if (props) {
								return {
									gain: props.inputTalkbackGain / 100,
								}
							} else {
								return undefined
							}
						},
					}
				: undefined,
		[FeedbackId.FairlightAudioMonitorSidetoneGain]:
			model.fairlightAudio.monitor === 'split'
				? {
						type: 'boolean',
						name: 'Fairlight Audio: Monitor/Headphone sidetone Gain',
						description: 'If the headphone/monitor has the specified sidetone gain, change style of the bank',
						options: convertOptionsFields({
							comparitor: NumberComparitorPicker(),
							gain: {
								type: 'number',
								label: 'Fader Level (-60 = Min)',
								id: 'gain',
								range: true,
								default: 0,
								step: 0.1,
								min: -60,
								max: 10,
							},
						}),
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: ({ options }): boolean => {
							const gain = state.state.fairlight?.monitor?.inputSidetoneGain
							return !!(typeof gain === 'number' && compareNumber(options.gain, options.comparitor, gain / 100))
						},
						learn: () => {
							const props = state.state.fairlight?.monitor

							if (props) {
								return {
									gain: props.inputSidetoneGain / 100,
								}
							} else {
								return undefined
							}
						},
					}
				: undefined,

		...AudioRoutingFeedbacks(model, state),
	}
}

function AudioRoutingFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<
	Pick<AtemFairlightAudioFeedbacks, FeedbackId.FairlightAudioRouting | FeedbackId.FairlightAudioRoutingVariables>
> {
	if (!model.fairlightAudio?.audioRouting)
		return {
			[FeedbackId.FairlightAudioRouting]: undefined,
			[FeedbackId.FairlightAudioRoutingVariables]: undefined,
		}

	return {
		[FeedbackId.FairlightAudioRouting]: {
			type: 'boolean',
			name: 'Fairlight Audio: Audio Routing',
			description: 'Requires firmware 9.4+',
			options: convertOptionsFields({
				destination: AtemFairlightAudioRoutingDestinationPicker(model, state.state),
				source: AtemFairlightAudioRoutingSourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: async ({ options }) => {
				const outputsState = state.state.fairlight?.audioRouting?.outputs
				if (!outputsState) return false

				const sourceId = options.source
				const destinationId = options.destination

				const output = outputsState[destinationId]
				return output && output.sourceId === sourceId
			},
		},
		[FeedbackId.FairlightAudioRoutingVariables]: {
			type: 'boolean',
			name: 'Fairlight Audio: Audio Routing from variables',
			description: 'Requires firmware 9.4+',
			options: convertOptionsFields({
				destination: {
					type: 'textinput',
					id: 'destination',
					label: 'Destination',
					default: '1-1',
					tooltip:
						'IDs are formed as "output-channel". channel can be omitted when wanting "1/2" eg 1503-3_4 for "MADI 3 3/4"',
					useVariables: true,
				},
				source: {
					type: 'textinput',
					id: 'source',
					label: 'Source',
					default: '0',
					tooltip:
						'IDs are formed as "output-channel". channel can be omitted when wanting "1/2" eg 1503-3_4 for "MADI 3 3/4"',
					useVariables: true,
				},
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: async ({ options }) => {
				const outputsState = state.state.fairlight?.audioRouting?.outputs
				if (!outputsState) return false

				const [sourceStr, destinationStr] = await Promise.all([options.source, options.destination])
				if (!destinationStr || !sourceStr) return false

				const source = parseAudioRoutingStringSingle(sourceStr) ?? 0
				const destination = parseAudioRoutingStringSingle(destinationStr)
				if (!destination) return false

				const output = outputsState[destination]
				return output && output.sourceId === source
			},
		},
	}
}
