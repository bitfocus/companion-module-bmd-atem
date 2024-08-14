import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import {
	AtemAudioInputPicker,
	AtemFairlightAudioSourcePicker,
	FadeDurationFields,
	FaderLevelDeltaChoice,
	type FadeDurationFieldsType,
} from '../input.js'
import type { AtemTransitions } from '../transitions.js'
import { CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION, CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../choices.js'
import type { StateWrapper } from '../state.js'

export interface AtemFairlightAudioActions {
	[ActionId.FairlightAudioInputGain]: {
		input: number
		source: string
		gain: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioInputGainDelta]: {
		input: number
		source: string
		delta: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioInputDelay]: {
		input: number
		source: string
		delay: number
	}
	[ActionId.FairlightAudioInputDelayDelta]: {
		input: number
		source: string
		delay: number
	}
	[ActionId.FairlightAudioFaderGain]: {
		input: number
		source: string
		gain: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioFaderGainDelta]: {
		input: number
		source: string
		delta: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioMixOption]: {
		input: number
		source: string
		option: 'toggle' | Enums.FairlightAudioMixOption
	}
	[ActionId.FairlightAudioResetPeaks]: {
		reset: 'all' | 'master'
	}
	[ActionId.FairlightAudioResetSourcePeaks]: {
		input: number
		source: string
	}
	[ActionId.FairlightAudioMasterGain]: {
		gain: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioMasterGainDelta]: {
		delta: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioMonitorSolo]: {
		solo: TrueFalseToggle
		input: number
		source: string
	}
	[ActionId.FairlightAudioMonitorOutputGain]: {
		gain: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioMonitorOutputGainDelta]: {
		delta: number
	} & FadeDurationFieldsType

	[ActionId.FairlightAudioMonitorMasterMuted]: {
		state: TrueFalseToggle
	}
	[ActionId.FairlightAudioMonitorMasterGain]: {
		gain: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioMonitorMasterGainDelta]: {
		delta: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioMonitorTalkbackMuted]: {
		state: TrueFalseToggle
	}
	[ActionId.FairlightAudioMonitorTalkbackGain]: {
		gain: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioMonitorTalkbackGainDelta]: {
		delta: number
	} & FadeDurationFieldsType
	// [ActionId.FairlightAudioMonitorSidetoneMuted]: {
	// 	state: TrueFalseToggle
	// }
	[ActionId.FairlightAudioMonitorSidetoneGain]: {
		gain: number
	} & FadeDurationFieldsType
	[ActionId.FairlightAudioMonitorSidetoneGainDelta]: {
		delta: number
	} & FadeDurationFieldsType
}

export function createFairlightAudioActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper
): MyActionDefinitions<AtemFairlightAudioActions> {
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
		}
	}

	const audioInputOption = AtemAudioInputPicker(model, state.state)
	const audioSourceOption = AtemFairlightAudioSourcePicker()

	const audioInputFrameDelayOption = AtemAudioInputPicker(model, state.state, 'delay')

	return {
		[ActionId.FairlightAudioInputGain]: {
			name: 'Fairlight Audio: Set input gain',
			options: {
				input: audioInputOption,
				source: audioSourceOption,
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
				},
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')

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
					options.getPlainNumber('gain') * 100,
					options
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
		[ActionId.FairlightAudioInputGainDelta]: {
			name: 'Fairlight Audio: Adjust input gain',
			options: {
				input: audioInputOption,
				source: audioSourceOption,
				delta: FaderLevelDeltaChoice,
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')

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
						source.properties.gain + options.getPlainNumber('delta') * 100,
						options
					)
				}
			},
		},
		[ActionId.FairlightAudioInputDelay]: audioInputFrameDelayOption
			? {
					name: 'Fairlight Audio: Set delay',
					options: {
						input: audioInputFrameDelayOption,
						source: audioSourceOption,
						delay: {
							type: 'number',
							label: 'Delay (frames)',
							id: 'gain',
							range: true,
							required: true,
							default: 0,
							step: 1,
							min: 0,
							max: 8,
						},
					},
					callback: async ({ options }) => {
						const inputId = options.getPlainNumber('input')
						const sourceId = options.getPlainString('source')

						await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, {
							framesDelay: options.getPlainNumber('delay'),
						})
					},
					learn: ({ options }) => {
						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[options.getPlainNumber('input')]?.sources ?? {}
						const source = audioSources[options.getPlainString('source')]

						if (source?.properties) {
							return {
								...options.getJson(),
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
					options: {
						input: audioInputFrameDelayOption,
						source: audioSourceOption,
						delay: {
							type: 'number',
							label: 'Adjustment (frames)',
							id: 'gain',
							range: true,
							required: true,
							default: 0,
							step: 1,
							min: -8,
							max: 8,
						},
					},
					callback: async ({ options }) => {
						const inputId = options.getPlainNumber('input')
						const sourceId = options.getPlainString('source')

						const delta = options.getPlainNumber('delay')

						const audioChannels = state.state.fairlight?.inputs ?? {}
						const audioSources = audioChannels[options.getPlainNumber('input')]?.sources ?? {}
						const source = audioSources[options.getPlainString('source')]

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
			options: {
				input: audioInputOption,
				source: audioSourceOption,
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
				},
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')

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
					options.getPlainNumber('gain') * 100,
					options
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
		[ActionId.FairlightAudioFaderGainDelta]: {
			name: 'Fairlight Audio: Adjust fader gain',
			options: {
				input: audioInputOption,
				source: audioSourceOption,
				delta: FaderLevelDeltaChoice,
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')

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
						source.properties.faderGain + options.getPlainNumber('delta') * 100,
						options
					)
				}
			},
		},
		[ActionId.FairlightAudioMixOption]: {
			name: 'Fairlight Audio: Set input mix option',
			options: {
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
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')
				const audioChannels = state.state.fairlight?.inputs ?? {}
				const audioSources = audioChannels[inputId]?.sources ?? {}
				const toggleVal =
					audioSources[sourceId]?.properties?.mixOption === Enums.FairlightAudioMixOption.On
						? Enums.FairlightAudioMixOption.Off
						: Enums.FairlightAudioMixOption.On
				const rawVal = options.getRaw('option')
				const newVal = rawVal === 'toggle' ? toggleVal : rawVal
				await atem?.setFairlightAudioMixerSourceProps(inputId, sourceId, { mixOption: newVal })
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
		[ActionId.FairlightAudioResetPeaks]: {
			name: 'Fairlight Audio: Reset peaks',
			options: {
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
			},
			callback: async ({ options }) => {
				const rawVal = options.getPlainString('reset')
				if (rawVal === 'all') {
					await atem?.setFairlightAudioMixerResetPeaks({ all: true, master: false })
				} else if (rawVal === 'master') {
					await atem?.setFairlightAudioMixerResetPeaks({ master: true, all: false })
				}
			},
		},
		[ActionId.FairlightAudioResetSourcePeaks]: {
			name: 'Fairlight Audio: Reset Source peaks',
			options: {
				input: audioInputOption,
				source: audioSourceOption,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')
				await atem?.setFairlightAudioMixerSourceResetPeaks(inputId, sourceId, {
					output: true,
					dynamicsInput: false,
					dynamicsOutput: false,
				})
			},
		},
		[ActionId.FairlightAudioMasterGain]: {
			name: 'Fairlight Audio: Set master gain',
			options: {
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
				},
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				await transitions.runForFadeOptions(
					`audio.master.gain`,
					async (value) => {
						await atem?.setFairlightAudioMixerMasterProps({
							faderGain: value,
						})
					},
					state.state.fairlight?.master?.properties?.faderGain,
					options.getPlainNumber('gain') * 100,
					options
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
		[ActionId.FairlightAudioMasterGainDelta]: {
			name: 'Fairlight Audio: Adjust master gain',
			options: {
				delta: FaderLevelDeltaChoice,
				...FadeDurationFields,
			},
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
						currentGain + options.getPlainNumber('delta') * 100,
						options
					)
				}
			},
		},

		[ActionId.FairlightAudioMonitorSolo]: model.fairlightAudio.monitor
			? {
					name: 'Fairlight Audio: Solo source',
					options: {
						solo: {
							id: 'solo',
							type: 'dropdown',
							label: 'State',
							default: 'true',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
						input: audioInputOption,
						source: audioSourceOption,
					},
					callback: async ({ options }) => {
						const inputId = options.getPlainNumber('input')
						const sourceId = options.getPlainString('source')

						let target: boolean
						if (options.getPlainString('solo') === 'toggle') {
							const soloProps = state.state.fairlight?.solo
							if (soloProps) {
								const isSourceSelectedForSolo = soloProps.index === inputId && soloProps.source === sourceId

								target = !soloProps.solo || !isSourceSelectedForSolo
							} else {
								target = true
							}
						} else {
							target = options.getPlainString('solo') === 'true'
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
					options: {
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
						},
						...FadeDurationFields,
					},
					callback: async ({ options }) => {
						await transitions.runForFadeOptions(
							`audio.monitor.faderGain`,
							async (value) => {
								await atem?.setFairlightAudioMixerMonitorProps({
									gain: value,
								})
							},
							state.state.fairlight?.monitor?.gain,
							options.getPlainNumber('gain') * 100,
							options
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
		[ActionId.FairlightAudioMonitorOutputGainDelta]: model.fairlightAudio.monitor
			? {
					name: 'Fairlight Audio: Adjust Monitor/Headphone fader gain',
					options: {
						delta: FaderLevelDeltaChoice,
						...FadeDurationFields,
					},
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
								currentGain + options.getPlainNumber('delta') * 100,
								options
							)
						}
					},
			  }
			: undefined,
		...HeadphoneMasterActions(atem, model, transitions, state),
		...HeadphoneTalkbackActions(atem, model, transitions, state),
		...HeadphoneSidetoneActions(atem, model, transitions, state),
	}
}

function HeadphoneMasterActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper
): MyActionDefinitions<
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
					options: {
						state: {
							id: 'state',
							type: 'dropdown',
							label: 'State',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					},
					callback: async ({ options }) => {
						let target: boolean
						if (options.getPlainString('state') === 'toggle') {
							target = !state.state.fairlight?.monitor?.inputMasterMuted
						} else {
							target = options.getPlainString('state') === 'true'
						}

						await atem?.setFairlightAudioMixerMonitorProps({
							inputMasterMuted: target,
						})
					},
					learn: ({ options }) => {
						const props = state.state.fairlight?.monitor

						if (props) {
							return {
								...options.getJson(),
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
						options: {
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
							},
							...FadeDurationFields,
						},
						callback: async ({ options }) => {
							await transitions.runForFadeOptions(
								`audio.monitor.inputMasterGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerMonitorProps({
										inputMasterGain: value,
									})
								},
								state.state.fairlight?.monitor?.inputMasterGain,
								options.getPlainNumber('gain') * 100,
								options
							)
						},
						learn: ({ options }) => {
							const props = state.state.fairlight?.monitor

							if (props) {
								return {
									...options.getJson(),
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
						options: {
							delta: FaderLevelDeltaChoice,
							...FadeDurationFields,
						},
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
									currentGain + options.getPlainNumber('delta') * 100,
									options
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
	state: StateWrapper
): MyActionDefinitions<
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
					options: {
						state: {
							id: 'state',
							type: 'dropdown',
							label: 'State',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					},
					callback: async ({ options }) => {
						let target: boolean
						if (options.getPlainString('state') === 'toggle') {
							target = !state.state.fairlight?.monitor?.inputTalkbackMuted
						} else {
							target = options.getPlainString('state') === 'true'
						}

						await atem?.setFairlightAudioMixerMonitorProps({
							inputTalkbackMuted: target, //
						})
					},
					learn: ({ options }) => {
						const props = state.state.fairlight?.monitor

						if (props) {
							return {
								...options.getJson(),
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
						options: {
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
							},
							...FadeDurationFields,
						},
						callback: async ({ options }) => {
							await transitions.runForFadeOptions(
								`audio.monitor.inputTalkbackGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerMonitorProps({
										inputTalkbackGain: value,
									})
								},
								state.state.fairlight?.monitor?.inputTalkbackGain,
								options.getPlainNumber('gain') * 100,
								options
							)
						},
						learn: ({ options }) => {
							const props = state.state.fairlight?.monitor

							if (props) {
								return {
									...options.getJson(),
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
						options: {
							delta: FaderLevelDeltaChoice,
							...FadeDurationFields,
						},
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
									currentGain + options.getPlainNumber('delta') * 100,
									options
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
	state: StateWrapper
): MyActionDefinitions<
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
					options: {
						state: {
							id: 'state',
							type: 'dropdown',
							label: 'State',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					},
					callback: async ({ options }) => {
						let target: boolean
						if (options.getPlainString('state') === 'toggle') {
							target = !state.state.fairlight?.monitor?.inputSidetoneMuted
						} else {
							target = options.getPlainString('state') === 'true'
						}

						await atem?.setFairlightAudioMixerMonitorProps({
							inputSidetoneMuted: target,
						})
					},
					learn: ({ options }) => {
						const props = state.state.fairlight?.monitor

						if (props) {
							return {
								...options.getJson(),
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
						options: {
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
							},
							...FadeDurationFields,
						},
						callback: async ({ options }) => {
							await transitions.runForFadeOptions(
								`audio.monitor.inputSidetoneGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerMonitorProps({
										inputSidetoneGain: value,
									})
								},
								state.state.fairlight?.monitor?.inputSidetoneGain,
								options.getPlainNumber('gain') * 100,
								options
							)
						},
						learn: ({ options }) => {
							const props = state.state.fairlight?.monitor

							if (props) {
								return {
									...options.getJson(),
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
						options: {
							delta: FaderLevelDeltaChoice,
							...FadeDurationFields,
						},
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
									currentGain + options.getPlainNumber('delta') * 100,
									options
								)
							}
						},
				  }
				: undefined,
	}
}
