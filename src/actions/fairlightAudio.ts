import { Enums, type Atem, Commands } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import {
	AtemAudioInputPicker,
	AtemFairlightAudioSourcePicker,
	FaderLevelDeltaChoice,
	CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
	fairlightMixOptionFromProtocol,
	fairlightMixOptionToProtocol,
	type FairlightMixOption2,
} from '../options/audio.js'
import type { AtemTransitions, FadeDurationFieldsType } from '../transitions.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle, resolveTrueFalseToggle } from '../options/common.js'
import type { StateWrapper } from '../state.js'
import {
	AtemFairlightAudioRoutingDestinationsPicker,
	AtemFairlightAudioRoutingSourcePicker,
	parseAudioRoutingString,
	parseAudioRoutingStringSingle,
} from '../options/fairlight-routing.js'
import { FadeDurationFields } from '../options/fade.js'

export type AtemFairlightAudioActions = {
	['fairlightAudioInputGain']: {
		options: {
			input: number
			source: string
			gain: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioInputGainDelta']: {
		options: {
			input: number
			source: string
			delta: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioInputDelay']: {
		options: {
			input: number
			source: string
			delay: number
		}
	}
	['fairlightAudioInputDelayDelta']: {
		options: {
			input: number
			source: string
			delay: number
		}
	}
	['fairlightAudioFaderGain']: {
		options: {
			input: number
			source: string
			gain: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioFaderGainDelta']: {
		options: {
			input: number
			source: string
			delta: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioInputPan']: {
		options: {
			input: number
			source: string
			balance: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioInputPanDelta']: {
		options: {
			input: number
			source: string
			delta: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioMixOption']: {
		options: {
			input: number
			source: string
			option: 'toggle' | FairlightMixOption2
		}
	}
	['fairlightAudioResetPeaks']: {
		options: {
			reset: 'all' | 'master'
		}
	}
	['fairlightAudioResetSourcePeaks']: {
		options: {
			input: number
			source: string
		}
	}
	['fairlightAudioMasterGain']: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioMasterGainDelta']: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioMonitorSolo']: {
		options: {
			solo: TrueFalseToggle
			input: number
			source: string
		}
	}
	['fairlightAudioMonitorGain']: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioMonitorGainDelta']: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}

	['fairlightAudioMonitorMasterMuted']: {
		options: {
			state: TrueFalseToggle
		}
	}
	['fairlightAudioMonitorMasterGain']: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioMonitorMasterGainDelta']: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioMonitorTalkbackMuted']: {
		options: {
			state: TrueFalseToggle
		}
	}
	['fairlightAudioMonitorTalkbackGain']: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioMonitorTalkbackGainDelta']: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}
	// [ActionId.FairlightAudioMonitorSidetoneMuted]: {
	// 	options: {
	// 		state: TrueFalseToggle
	// 	}
	// }
	['fairlightAudioMonitorSidetoneGain']: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	['fairlightAudioMonitorSidetoneGainDelta']: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}

	['fairlightAudioRouting']: {
		options: {
			destinations: number[]
			source: number
		}
	}
	['fairlightAudioRoutingVariables']: {
		options: {
			destinations: string
			source: string
		}
	}
}

export function createFairlightAudioActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions<AtemFairlightAudioActions> {
	if (!model.fairlightAudio) {
		return {
			['fairlightAudioInputGain']: undefined,
			['fairlightAudioInputGainDelta']: undefined,
			['fairlightAudioInputDelay']: undefined,
			['fairlightAudioInputDelayDelta']: undefined,
			['fairlightAudioFaderGain']: undefined,
			['fairlightAudioFaderGainDelta']: undefined,
			['fairlightAudioInputPan']: undefined,
			['fairlightAudioInputPanDelta']: undefined,
			['fairlightAudioMixOption']: undefined,
			['fairlightAudioResetPeaks']: undefined,
			['fairlightAudioResetSourcePeaks']: undefined,
			['fairlightAudioMasterGain']: undefined,
			['fairlightAudioMasterGainDelta']: undefined,
			['fairlightAudioMonitorSolo']: undefined,
			['fairlightAudioMonitorGain']: undefined,
			['fairlightAudioMonitorGainDelta']: undefined,
			['fairlightAudioMonitorMasterMuted']: undefined,
			['fairlightAudioMonitorMasterGain']: undefined,
			['fairlightAudioMonitorMasterGainDelta']: undefined,
			['fairlightAudioMonitorTalkbackMuted']: undefined,
			['fairlightAudioMonitorTalkbackGain']: undefined,
			['fairlightAudioMonitorTalkbackGainDelta']: undefined,
			// [ActionId.FairlightAudioMonitorSidetoneMuted]: undefined,
			['fairlightAudioMonitorSidetoneGain']: undefined,
			['fairlightAudioMonitorSidetoneGainDelta']: undefined,
			['fairlightAudioRouting']: undefined,
			['fairlightAudioRoutingVariables']: undefined,
		}
	}

	const audioInputOption = AtemAudioInputPicker(model, state.state)
	const audioSourceOption = AtemFairlightAudioSourcePicker()

	const audioInputFrameDelayOption = AtemAudioInputPicker(model, state.state, 'delay')

	return {
		['fairlightAudioInputGain']: audioInputOption
			? {
					name: 'Fairlight Audio: Set input gain',
					options: convertOptionsFields({
						input: audioInputOption,
						source: audioSourceOption,
						gain: {
							type: 'number',
							label: 'Input Level',
							id: 'gain',
							range: true,
							default: 0,
							step: 0.1,
							min: -100,
							max: 6,
							description: '-100 = -inf',
							showMinAsNegativeInfinity: true,
							asInteger: false,
							clampValues: true,
						},
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source

						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[inputId]?.sources ?? {}
						const source = audioSources[sourceId]

						await transitions.runForFadeOptions(
							`audio.${inputId}.${sourceId}.gain`,
							async (value) => {
								await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
									gain: value,
								})
							},
							source?.properties?.gain,
							options.gain * 100,
							options,
						)
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
				}
			: undefined,
		['fairlightAudioInputGainDelta']: audioInputOption
			? {
					name: 'Fairlight Audio: Adjust input gain',
					options: convertOptionsFields({
						input: audioInputOption,
						source: audioSourceOption,
						delta: FaderLevelDeltaChoice,
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source

						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[inputId]?.sources ?? {}
						const source = audioSources[sourceId]

						if (typeof source?.properties?.gain === 'number') {
							await transitions.runForFadeOptions(
								`audio.${inputId}.${sourceId}.gain`,
								async (value) => {
									await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
										gain: value,
									})
								},
								source.properties.gain,
								source.properties.gain + options.delta * 100,
								options,
							)
						}
					},
				}
			: undefined,
		['fairlightAudioInputDelay']: audioInputFrameDelayOption
			? {
					name: 'Fairlight Audio: Set delay',
					options: convertOptionsFields({
						input: audioInputFrameDelayOption,
						source: audioSourceOption,
						delay: {
							type: 'number',
							label: 'Delay (frames)',
							id: 'delay',
							range: true,
							default: 0,
							step: 1,
							min: 0,
							max: 8,
							asInteger: true,
							clampValues: true,
						},
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source

						await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
							framesDelay: options.delay,
						})
					},
					learn: ({ options }) => {
						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[options.input]?.sources ?? {}
						const source = audioSources[options.source]

						if (source?.properties) {
							return {
								delay: source.properties.framesDelay,
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		['fairlightAudioInputDelayDelta']: audioInputFrameDelayOption
			? {
					name: 'Fairlight Audio: Adjust delay',
					options: convertOptionsFields({
						input: audioInputFrameDelayOption,
						source: audioSourceOption,
						delay: {
							type: 'number',
							label: 'Adjustment (frames)',
							id: 'delay',
							range: true,
							default: 0,
							step: 1,
							min: -8,
							max: 8,
							asInteger: true,
							clampValues: true,
						},
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source

						const delta = options.delay

						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[options.input]?.sources ?? {}
						const source = audioSources[options.source]

						const existingDelay = source?.properties?.framesDelay
						if (existingDelay === undefined) return

						await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
							framesDelay: existingDelay + delta,
						})
					},
				}
			: undefined,
		['fairlightAudioFaderGain']: audioInputOption
			? {
					name: 'Fairlight Audio: Set fader gain',
					options: convertOptionsFields({
						input: audioInputOption,
						source: audioSourceOption,
						gain: {
							type: 'number',
							label: 'Fader Level',
							id: 'gain',
							range: true,
							default: 0,
							step: 0.1,
							min: -100,
							max: 10,
							description: '-100 = -inf',
							showMinAsNegativeInfinity: true,
							asInteger: false,
							clampValues: true,
						},
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source

						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[inputId]?.sources ?? {}
						const source = audioSources[sourceId]

						await transitions.runForFadeOptions(
							`audio.${inputId}.${sourceId}.faderGain`,
							async (value) => {
								await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
									faderGain: value,
								})
							},
							source?.properties?.faderGain,
							options.gain * 100,
							options,
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
				}
			: undefined,
		['fairlightAudioFaderGainDelta']: audioInputOption
			? {
					name: 'Fairlight Audio: Adjust fader gain',
					options: convertOptionsFields({
						input: audioInputOption,
						source: audioSourceOption,
						delta: FaderLevelDeltaChoice,
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source

						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[inputId]?.sources ?? {}
						const source = audioSources[sourceId]

						if (typeof source?.properties?.faderGain === 'number') {
							await transitions.runForFadeOptions(
								`audio.${inputId}.${sourceId}.faderGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
										faderGain: value,
									})
								},
								source.properties.faderGain,
								source.properties.faderGain + options.delta * 100,
								options,
							)
						}
					},
				}
			: undefined,
		['fairlightAudioInputPan']: audioInputOption
			? {
					name: 'Fairlight Audio: Set input pan',
					options: convertOptionsFields({
						input: audioInputOption,
						source: audioSourceOption,
						balance: {
							type: 'number',
							label: 'Pan',
							id: 'balance',
							range: true,
							default: 0,
							step: 1,
							min: -100,
							max: 100,
							asInteger: false,
							clampValues: true,
						},
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source

						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[inputId]?.sources ?? {}
						const source = audioSources[sourceId]

						await transitions.runForFadeOptions(
							`audio.${inputId}.${sourceId}.balance`,
							async (value) => {
								await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
									balance: value,
								})
							},
							source?.properties?.balance,
							options.balance * 100,
							options,
						)
					},
					learn: ({ options }) => {
						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[options.input]?.sources ?? {}
						const source = audioSources[options.source]

						if (source?.properties) {
							return {
								balance: source.properties.balance / 100,
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		['fairlightAudioInputPanDelta']: audioInputOption
			? {
					name: 'Fairlight Audio: Adjust input pan',
					options: convertOptionsFields({
						input: audioInputOption,
						source: audioSourceOption,
						delta: FaderLevelDeltaChoice,
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source

						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[inputId]?.sources ?? {}
						const source = audioSources[sourceId]

						if (typeof source?.properties?.balance === 'number') {
							await transitions.runForFadeOptions(
								`audio.${inputId}.${sourceId}.balance`,
								async (value) => {
									await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
										balance: value,
									})
								},
								source.properties.balance,
								source.properties.balance + options.delta * 100,
								options,
							)
						}
					},
				}
			: undefined,
		['fairlightAudioMixOption']: audioInputOption
			? {
					name: 'Fairlight Audio: Set input mix option',
					options: convertOptionsFields({
						input: audioInputOption,
						source: audioSourceOption,
						option: {
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
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source

						let newVal: Enums.FairlightAudioMixOption
						switch (options.option) {
							case 'toggle': {
								const audioChannels = state.state.fairlight?.inputs ?? {}
								const audioSources = audioChannels[inputId]?.sources ?? {}

								newVal =
									audioSources[sourceId]?.properties?.mixOption === Enums.FairlightAudioMixOption.On
										? Enums.FairlightAudioMixOption.Off
										: Enums.FairlightAudioMixOption.On
								break
							}
							default:
								newVal = fairlightMixOptionToProtocol(options.option)
								break
						}
						if (newVal === undefined) return

						await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, { mixOption: newVal })
					},
					learn: ({ options }) => {
						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[options.input]?.sources ?? {}
						const source = audioSources[options.source]

						if (source?.properties) {
							const newMixOption = fairlightMixOptionFromProtocol(source.properties.mixOption)
							if (!newMixOption) return undefined

							return {
								option: newMixOption,
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		['fairlightAudioResetPeaks']: {
			name: 'Fairlight Audio: Reset peaks',
			options: convertOptionsFields({
				reset: {
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
			}),
			callback: async ({ options }) => {
				const rawVal = options.reset
				if (rawVal === 'all') {
					await atem?.setFairlightAudioMixerResetPeaks({ all: true, master: false })
				} else if (rawVal === 'master') {
					await atem?.setFairlightAudioMixerResetPeaks({ master: true, all: false })
				}
			},
		},
		['fairlightAudioResetSourcePeaks']: audioInputOption
			? {
					name: 'Fairlight Audio: Reset Source peaks',
					options: convertOptionsFields({
						input: audioInputOption,
						source: audioSourceOption,
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const sourceId = options.source
						await atem?.setFairlightAudioMixerSourceResetPeaks(inputId, sourceId, {
							output: true,
							dynamicsInput: false,
							dynamicsOutput: false,
						})
					},
				}
			: undefined,
		['fairlightAudioMasterGain']: {
			name: 'Fairlight Audio: Set master gain',
			options: convertOptionsFields({
				gain: {
					type: 'number',
					label: 'Input Level',
					id: 'gain',
					range: true,
					default: 0,
					step: 0.1,
					min: -100,
					max: 6,
					description: '-100 = -inf',
					showMinAsNegativeInfinity: true,
					asInteger: false,
					clampValues: true,
				},
				...FadeDurationFields,
			}),
			callback: async ({ options }) => {
				await transitions.runForFadeOptions(
					`audio.master.gain`,
					async (value) => {
						await atem?.setFairlightAudioMixerMasterProps({
							faderGain: value,
						})
					},
					state.state.fairlight?.master?.properties?.faderGain,
					options.gain * 100,
					options,
				)
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
		['fairlightAudioMasterGainDelta']: {
			name: 'Fairlight Audio: Adjust master gain',
			options: convertOptionsFields({
				delta: FaderLevelDeltaChoice,
				...FadeDurationFields,
			}),
			callback: async ({ options }) => {
				const currentGain = state.state.fairlight?.master?.properties?.faderGain

				if (typeof currentGain === 'number') {
					await transitions.runForFadeOptions(
						`audio.master.gain`,
						async (value) => {
							await atem?.setFairlightAudioMixerMasterProps({
								faderGain: value,
							})
						},
						currentGain,
						currentGain + options.delta * 100,
						options,
					)
				}
			},
		},

		['fairlightAudioMonitorSolo']:
			model.fairlightAudio.monitor && audioInputOption
				? {
						name: 'Fairlight Audio: Solo source',
						options: convertOptionsFields({
							solo: {
								id: 'solo',
								type: 'dropdown',
								label: 'State',
								default: 'true',
								choices: CHOICES_ON_OFF_TOGGLE,
								disableAutoExpression: true, // TODO: Until the options are simplified
							},
							input: audioInputOption,
							source: audioSourceOption,
						}),
						callback: async ({ options }) => {
							const inputId = options.input
							const sourceId = options.source

							let target: boolean
							if (options.solo === 'toggle') {
								const soloProps = state.state.fairlight?.solo
								if (soloProps) {
									const isSourceSelectedForSolo = soloProps.index === inputId && soloProps.source === sourceId

									target = !soloProps.solo || !isSourceSelectedForSolo
								} else {
									target = true
								}
							} else {
								target = options.solo === 'true'
							}

							await atem?.setFairlightAudioMixerMonitorSolo({
								solo: target,
								index: inputId,
								source: sourceId,
							})
						},
					}
				: undefined,

		['fairlightAudioMonitorGain']: model.fairlightAudio.monitor
			? {
					name: 'Fairlight Audio: Set Monitor/Headphone fader gain',
					options: convertOptionsFields({
						gain: {
							type: 'number',
							label: 'Fader Level',
							id: 'gain',
							range: true,
							default: 0,
							step: 0.1,
							min: -60,
							max: 10,
							description: '-60 = -inf',
							showMinAsNegativeInfinity: true,
							asInteger: false,
							clampValues: true,
						},
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						await transitions.runForFadeOptions(
							`audio.monitor.faderGain`,
							async (value) => {
								await atem?.setFairlightAudioMixerMonitorProps({
									gain: value,
								})
							},
							state.state.fairlight?.monitor?.gain,
							options.gain * 100,
							options,
						)
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
		['fairlightAudioMonitorGainDelta']: model.fairlightAudio.monitor
			? {
					name: 'Fairlight Audio: Adjust Monitor/Headphone fader gain',
					options: convertOptionsFields({
						delta: FaderLevelDeltaChoice,
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						const currentGain = state.state.fairlight?.monitor?.gain
						if (typeof currentGain === 'number') {
							await transitions.runForFadeOptions(
								`audio.monitor.faderGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerMonitorProps({
										gain: value,
									})
								},
								currentGain,
								currentGain + options.delta * 100,
								options,
							)
						}
					},
				}
			: undefined,
		...HeadphoneMasterActions(atem, model, transitions, state),
		...HeadphoneTalkbackActions(atem, model, transitions, state),
		...HeadphoneSidetoneActions(atem, model, transitions, state),

		...AudioRoutingActions(atem, model, transitions, state),
	}
}

function HeadphoneMasterActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions<
	Pick<
		AtemFairlightAudioActions,
		'fairlightAudioMonitorMasterMuted' | 'fairlightAudioMonitorMasterGain' | 'fairlightAudioMonitorMasterGainDelta'
	>
> {
	return {
		['fairlightAudioMonitorMasterMuted']: model.fairlightAudio?.monitor
			? {
					name: 'Fairlight Audio: Monitor/Headphone master muted',
					options: convertOptionsFields({
						state: {
							id: 'state',
							type: 'dropdown',
							label: 'State',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
							disableAutoExpression: true, // TODO: Until the options are simplified
						},
					}),
					callback: async ({ options }) => {
						const target = resolveTrueFalseToggle(options.state, state.state.fairlight?.monitor?.inputMasterMuted)

						await atem?.setFairlightAudioMixerMonitorProps({
							inputMasterMuted: target,
						})
					},
					learn: () => {
						const props = state.state.fairlight?.monitor

						if (props) {
							return {
								state: props.inputMasterMuted ? 'true' : 'false',
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		['fairlightAudioMonitorMasterGain']:
			model.fairlightAudio?.monitor === 'split'
				? {
						name: 'Fairlight Audio: Set Monitor/Headphone master gain',
						options: convertOptionsFields({
							gain: {
								type: 'number',
								label: 'Fader Level',
								id: 'gain',
								range: true,
								default: 0,
								step: 0.1,
								min: -60,
								max: 10,
								description: '-60 = -inf',
								showMinAsNegativeInfinity: true,
								asInteger: false,
								clampValues: true,
							},
							...FadeDurationFields,
						}),
						callback: async ({ options }) => {
							await transitions.runForFadeOptions(
								`audio.monitor.inputMasterGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerMonitorProps({
										inputMasterGain: value,
									})
								},
								state.state.fairlight?.monitor?.inputMasterGain,
								options.gain * 100,
								options,
							)
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
		['fairlightAudioMonitorMasterGainDelta']:
			model.fairlightAudio?.monitor === 'split'
				? {
						name: 'Fairlight Audio: Adjust Monitor/Headphone master gain',
						options: convertOptionsFields({
							delta: FaderLevelDeltaChoice,
							...FadeDurationFields,
						}),
						callback: async ({ options }) => {
							const currentGain = state.state.fairlight?.monitor?.inputMasterGain
							if (typeof currentGain === 'number') {
								await transitions.runForFadeOptions(
									`audio.monitor.inputMasterGain`,
									async (value) => {
										await atem?.setFairlightAudioMixerMonitorProps({
											inputMasterGain: value,
										})
									},
									currentGain,
									currentGain + options.delta * 100,
									options,
								)
							}
						},
					}
				: undefined,
	}
}

function HeadphoneTalkbackActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions<
	Pick<
		AtemFairlightAudioActions,
		| 'fairlightAudioMonitorTalkbackMuted'
		| 'fairlightAudioMonitorTalkbackGain'
		| 'fairlightAudioMonitorTalkbackGainDelta'
	>
> {
	return {
		['fairlightAudioMonitorTalkbackMuted']: model.fairlightAudio?.monitor
			? {
					name: 'Fairlight Audio: Monitor/Headphone talkback muted',
					options: convertOptionsFields({
						state: {
							id: 'state',
							type: 'dropdown',
							label: 'State',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
							disableAutoExpression: true, // TODO: Until the options are simplified
						},
					}),
					callback: async ({ options }) => {
						const target = resolveTrueFalseToggle(options.state, state.state.fairlight?.monitor?.inputTalkbackMuted)

						await atem?.setFairlightAudioMixerMonitorProps({
							inputTalkbackMuted: target, //
						})
					},
					learn: () => {
						const props = state.state.fairlight?.monitor

						if (props) {
							return {
								state: props.inputTalkbackMuted ? 'true' : 'false',
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		['fairlightAudioMonitorTalkbackGain']:
			model.fairlightAudio?.monitor === 'split'
				? {
						name: 'Fairlight Audio: Set Monitor/Headphone talkback gain',
						options: convertOptionsFields({
							gain: {
								type: 'number',
								label: 'Fader Level',
								id: 'gain',
								range: true,
								default: 0,
								step: 0.1,
								min: -60,
								max: 10,
								description: '-60 = -inf',
								showMinAsNegativeInfinity: true,
								asInteger: false,
								clampValues: true,
							},
							...FadeDurationFields,
						}),
						callback: async ({ options }) => {
							await transitions.runForFadeOptions(
								`audio.monitor.inputTalkbackGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerMonitorProps({
										inputTalkbackGain: value,
									})
								},
								state.state.fairlight?.monitor?.inputTalkbackGain,
								options.gain * 100,
								options,
							)
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
		['fairlightAudioMonitorTalkbackGainDelta']:
			model.fairlightAudio?.monitor === 'split'
				? {
						name: 'Fairlight Audio: Adjust Monitor/Headphone talkback gain',
						options: convertOptionsFields({
							delta: FaderLevelDeltaChoice,
							...FadeDurationFields,
						}),
						callback: async ({ options }) => {
							const currentGain = state.state.fairlight?.monitor?.inputTalkbackGain
							if (typeof currentGain === 'number') {
								await transitions.runForFadeOptions(
									`audio.monitor.inputTalkbackGain`,
									async (value) => {
										await atem?.setFairlightAudioMixerMonitorProps({
											inputTalkbackGain: value,
										})
									},
									currentGain,
									currentGain + options.delta * 100,
									options,
								)
							}
						},
					}
				: undefined,
	}
}

function HeadphoneSidetoneActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions<
	Pick<
		AtemFairlightAudioActions,
		// | ActionId.FairlightAudioMonitorSidetoneMuted
		'fairlightAudioMonitorSidetoneGain' | 'fairlightAudioMonitorSidetoneGainDelta'
	>
> {
	return {
		/*[ActionId.FairlightAudioMonitorSidetoneMuted]: model.fairlightAudio?.monitor
			? {
					name: 'Fairlight Audio: Monitor/Headphone sidetone muted',
					options: convertOptionsFields({
						state: {
							id: 'state',
							type: 'dropdown',
							label: 'State',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
							disableAutoExpression: true, // TODO: Until the options are simplified
						},
					}),
					callback: async ({ options }) => {
						let target: boolean
						if (options.state === 'toggle') {
							target = !state.state.fairlight?.monitor?.inputSidetoneMuted
						} else {
							target = options.state === 'true'
						}

						await atem?.setFairlightAudioMixerMonitorProps({
							inputSidetoneMuted: target,
						})
					},
					learn: ({ options }) => {
						const props = state.state.fairlight?.monitor

						if (props) {
							return {
								
								state: props.inputSidetoneMuted ? 'true' : 'false',
							}
						} else {
							return undefined
						}
					},
			  }
			: undefined, */
		['fairlightAudioMonitorSidetoneGain']:
			model.fairlightAudio?.monitor === 'split'
				? {
						name: 'Fairlight Audio: Set Monitor/Headphone sidetone gain',
						options: convertOptionsFields({
							gain: {
								type: 'number',
								label: 'Fader Level',
								id: 'gain',
								range: true,
								default: 0,
								step: 0.1,
								min: -60,
								max: 10,
								description: '-60 = -inf',
								showMinAsNegativeInfinity: true,
								asInteger: false,
								clampValues: true,
							},
							...FadeDurationFields,
						}),
						callback: async ({ options }) => {
							await transitions.runForFadeOptions(
								`audio.monitor.inputSidetoneGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerMonitorProps({
										inputSidetoneGain: value,
									})
								},
								state.state.fairlight?.monitor?.inputSidetoneGain,
								options.gain * 100,
								options,
							)
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
		['fairlightAudioMonitorSidetoneGainDelta']:
			model.fairlightAudio?.monitor === 'split'
				? {
						name: 'Fairlight Audio: Adjust Monitor/Headphone sidetone gain',
						options: convertOptionsFields({
							delta: FaderLevelDeltaChoice,
							...FadeDurationFields,
						}),
						callback: async ({ options }) => {
							const currentGain = state.state.fairlight?.monitor?.inputSidetoneGain
							if (typeof currentGain === 'number') {
								await transitions.runForFadeOptions(
									`audio.monitor.inputSidetoneGain`,
									async (value) => {
										await atem?.setFairlightAudioMixerMonitorProps({
											inputSidetoneGain: value,
										})
									},
									currentGain,
									currentGain + options.delta * 100,
									options,
								)
							}
						},
					}
				: undefined,
	}
}
function AudioRoutingActions(
	atem: Atem | undefined,
	model: ModelSpec,
	_transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions<
	Pick<AtemFairlightAudioActions, 'fairlightAudioRouting' | 'fairlightAudioRoutingVariables'>
> {
	if (!model.fairlightAudio?.audioRouting)
		return {
			['fairlightAudioRouting']: undefined,
			['fairlightAudioRoutingVariables']: undefined,
		}

	return {
		['fairlightAudioRouting']: {
			name: 'Fairlight Audio: Audio Routing',
			description: 'Requires firmware 9.4+',
			options: convertOptionsFields({
				destinations: AtemFairlightAudioRoutingDestinationsPicker(model, state.state),
				source: AtemFairlightAudioRoutingSourcePicker(model, state.state),
			}),
			callback: async ({ options }) => {
				const sourceId = options.source
				const destinations = options.destinations
				if (!destinations || destinations.length === 0) return

				// TODO - simpler batching
				const commands: Commands.AudioRoutingOutputCommand[] = []
				for (const destination of destinations) {
					const cmd = new Commands.AudioRoutingOutputCommand(destination)
					cmd.updateProps({ sourceId: sourceId })
					commands.push(cmd)
				}

				await atem?.sendCommands(commands)
			},
		},
		['fairlightAudioRoutingVariables']: {
			// TODO - merge this into the non-variables one
			name: 'Fairlight Audio: Audio Routing from variables',
			description: 'Requires firmware 9.4+',
			options: convertOptionsFields({
				destinations: {
					type: 'textinput',
					id: 'destinations',
					label: 'Destinations',
					default: '1-1',
					tooltip:
						'Comma/space separated list of destination IDs. IDs are formed as "output-channel". channel can be omitted when wanting "1/2" eg 1503-3_4 for "MADI 3 3/4"',
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
			callback: async ({ options }) => {
				if (!options.destinations || !options.source) return

				const source = parseAudioRoutingStringSingle(options.source) ?? 0
				const destinations = parseAudioRoutingString(options.destinations)

				if (destinations.length === 0) return

				// TODO - simpler batching
				const commands: Commands.AudioRoutingOutputCommand[] = []
				for (const destination of destinations) {
					const cmd = new Commands.AudioRoutingOutputCommand(destination)
					cmd.updateProps({ sourceId: source })
					commands.push(cmd)
				}

				await atem?.sendCommands(commands)
			},
		},
	}
}
