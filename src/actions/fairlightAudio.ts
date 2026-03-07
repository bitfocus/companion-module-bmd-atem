import { Enums, type Atem, Commands } from 'atem-connection'
import { convertOptionsFields } from '../common.js'
import { assertNever, type CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import {
	AtemAudioInputPicker,
	AtemFairlightAudioRoutingDestinationsPicker,
	AtemFairlightAudioRoutingSourcePicker,
	AtemFairlightAudioSourcePicker,
	FadeDurationFields,
	FaderLevelDeltaChoice,
	resolveTrueFalseToggle,
	type FadeDurationFieldsType,
} from '../input.js'
import type { AtemTransitions } from '../transitions.js'
import {
	CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION,
	CHOICES_ON_OFF_TOGGLE,
	FairlightMixOption2,
	type TrueFalseToggle,
} from '../choices.js'
import type { StateWrapper } from '../state.js'
import { parseAudioRoutingString, parseAudioRoutingStringSingle } from '../util.js'

export type AtemFairlightAudioActions = {
	[ActionId.FairlightAudioInputGain]: {
		options: {
			input: number
			source: string
			gain: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioInputGainDelta]: {
		options: {
			input: number
			source: string
			delta: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioInputDelay]: {
		options: {
			input: number
			source: string
			delay: number
		}
	}
	[ActionId.FairlightAudioInputDelayDelta]: {
		options: {
			input: number
			source: string
			delay: number
		}
	}
	[ActionId.FairlightAudioFaderGain]: {
		options: {
			input: number
			source: string
			gain: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioFaderGainDelta]: {
		options: {
			input: number
			source: string
			delta: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioMixOption]: {
		options: {
			input: number
			source: string
			option: 'toggle' | FairlightMixOption2
		}
	}
	[ActionId.FairlightAudioResetPeaks]: {
		options: {
			reset: 'all' | 'master'
		}
	}
	[ActionId.FairlightAudioResetSourcePeaks]: {
		options: {
			input: number
			source: string
		}
	}
	[ActionId.FairlightAudioMasterGain]: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioMasterGainDelta]: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioMonitorSolo]: {
		options: {
			solo: TrueFalseToggle
			input: number
			source: string
		}
	}
	[ActionId.FairlightAudioMonitorOutputGain]: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioMonitorOutputGainDelta]: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}

	[ActionId.FairlightAudioMonitorMasterMuted]: {
		options: {
			state: TrueFalseToggle
		}
	}
	[ActionId.FairlightAudioMonitorMasterGain]: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioMonitorMasterGainDelta]: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioMonitorTalkbackMuted]: {
		options: {
			state: TrueFalseToggle
		}
	}
	[ActionId.FairlightAudioMonitorTalkbackGain]: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioMonitorTalkbackGainDelta]: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}
	// [ActionId.FairlightAudioMonitorSidetoneMuted]: {
	// 	options: {
	// 		state: TrueFalseToggle
	// 	}
	// }
	[ActionId.FairlightAudioMonitorSidetoneGain]: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	[ActionId.FairlightAudioMonitorSidetoneGainDelta]: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}

	[ActionId.FairlightAudioRouting]: {
		options: {
			destinations: number[]
			source: number
		}
	}
	[ActionId.FairlightAudioRoutingVariables]: {
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
			[ActionId.FairlightAudioInputGain]: undefined,
			[ActionId.FairlightAudioInputGainDelta]: undefined,
			[ActionId.FairlightAudioInputDelay]: undefined,
			[ActionId.FairlightAudioInputDelayDelta]: undefined,
			[ActionId.FairlightAudioFaderGain]: undefined,
			[ActionId.FairlightAudioFaderGainDelta]: undefined,
			[ActionId.FairlightAudioMixOption]: undefined,
			[ActionId.FairlightAudioResetPeaks]: undefined,
			[ActionId.FairlightAudioResetSourcePeaks]: undefined,
			[ActionId.FairlightAudioMasterGain]: undefined,
			[ActionId.FairlightAudioMasterGainDelta]: undefined,
			[ActionId.FairlightAudioMonitorSolo]: undefined,
			[ActionId.FairlightAudioMonitorOutputGain]: undefined,
			[ActionId.FairlightAudioMonitorOutputGainDelta]: undefined,
			[ActionId.FairlightAudioMonitorMasterMuted]: undefined,
			[ActionId.FairlightAudioMonitorMasterGain]: undefined,
			[ActionId.FairlightAudioMonitorMasterGainDelta]: undefined,
			[ActionId.FairlightAudioMonitorTalkbackMuted]: undefined,
			[ActionId.FairlightAudioMonitorTalkbackGain]: undefined,
			[ActionId.FairlightAudioMonitorTalkbackGainDelta]: undefined,
			// [ActionId.FairlightAudioMonitorSidetoneMuted]: undefined,
			[ActionId.FairlightAudioMonitorSidetoneGain]: undefined,
			[ActionId.FairlightAudioMonitorSidetoneGainDelta]: undefined,
			[ActionId.FairlightAudioRouting]: undefined,
			[ActionId.FairlightAudioRoutingVariables]: undefined,
		}
	}

	const audioInputOption = AtemAudioInputPicker(model, state.state)
	const audioSourceOption = AtemFairlightAudioSourcePicker()

	const audioInputFrameDelayOption = AtemAudioInputPicker(model, state.state, 'delay')

	return {
		[ActionId.FairlightAudioInputGain]: {
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
		},
		[ActionId.FairlightAudioInputGainDelta]: {
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
		},
		[ActionId.FairlightAudioInputDelay]: audioInputFrameDelayOption
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
		[ActionId.FairlightAudioInputDelayDelta]: audioInputFrameDelayOption
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
		[ActionId.FairlightAudioFaderGain]: {
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
		},
		[ActionId.FairlightAudioFaderGainDelta]: {
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
		},
		[ActionId.FairlightAudioMixOption]: {
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
					case 'on':
						newVal = Enums.FairlightAudioMixOption.On
						break
					case 'off':
						newVal = Enums.FairlightAudioMixOption.Off
						break
					case 'afv':
						newVal = Enums.FairlightAudioMixOption.AudioFollowVideo
						break
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
						assertNever(options.option)
						return
				}

				await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, { mixOption: newVal })
			},
			learn: ({ options }) => {
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[options.input]?.sources ?? {}
				const source = audioSources[options.source]

				if (source?.properties) {
					let newMixOption: FairlightMixOption2
					switch (source.properties.mixOption) {
						case Enums.FairlightAudioMixOption.On:
							newMixOption = 'on'
							break
						case Enums.FairlightAudioMixOption.Off:
							newMixOption = 'off'
							break
						case Enums.FairlightAudioMixOption.AudioFollowVideo:
							newMixOption = 'afv'
							break
						default:
							assertNever(source.properties.mixOption)
							newMixOption = 'on'
							break
					}

					return {
						option: newMixOption,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.FairlightAudioResetPeaks]: {
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
		[ActionId.FairlightAudioResetSourcePeaks]: {
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
		},
		[ActionId.FairlightAudioMasterGain]: {
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
		[ActionId.FairlightAudioMasterGainDelta]: {
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

		[ActionId.FairlightAudioMonitorSolo]: model.fairlightAudio.monitor
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

		[ActionId.FairlightAudioMonitorOutputGain]: model.fairlightAudio.monitor
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
		[ActionId.FairlightAudioMonitorOutputGainDelta]: model.fairlightAudio.monitor
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
		| ActionId.FairlightAudioMonitorMasterMuted
		| ActionId.FairlightAudioMonitorMasterGain
		| ActionId.FairlightAudioMonitorMasterGainDelta
	>
> {
	return {
		[ActionId.FairlightAudioMonitorMasterMuted]: model.fairlightAudio?.monitor
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
		[ActionId.FairlightAudioMonitorMasterGain]:
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
		[ActionId.FairlightAudioMonitorMasterGainDelta]:
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
		| ActionId.FairlightAudioMonitorTalkbackMuted
		| ActionId.FairlightAudioMonitorTalkbackGain
		| ActionId.FairlightAudioMonitorTalkbackGainDelta
	>
> {
	return {
		[ActionId.FairlightAudioMonitorTalkbackMuted]: model.fairlightAudio?.monitor
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
		[ActionId.FairlightAudioMonitorTalkbackGain]:
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
		[ActionId.FairlightAudioMonitorTalkbackGainDelta]:
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
		ActionId.FairlightAudioMonitorSidetoneGain | ActionId.FairlightAudioMonitorSidetoneGainDelta
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
		[ActionId.FairlightAudioMonitorSidetoneGain]:
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
		[ActionId.FairlightAudioMonitorSidetoneGainDelta]:
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
	Pick<AtemFairlightAudioActions, ActionId.FairlightAudioRouting | ActionId.FairlightAudioRoutingVariables>
> {
	if (!model.fairlightAudio?.audioRouting)
		return {
			[ActionId.FairlightAudioRouting]: undefined,
			[ActionId.FairlightAudioRoutingVariables]: undefined,
		}

	return {
		[ActionId.FairlightAudioRouting]: {
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
		[ActionId.FairlightAudioRoutingVariables]: {
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
