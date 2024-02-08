import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import {
	AtemAudioInputPicker,
	AtemFairlightAudioSourcePicker,
	FadeDurationChoice,
	FaderLevelDeltaChoice,
} from '../input.js'
import type { AtemTransitions } from '../transitions.js'
import { CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION, CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../choices.js'
import type { StateWrapper } from '../state.js'

export interface AtemFairlightAudioActions {
	[ActionId.FairlightAudioInputGain]: {
		input: number
		source: string
		gain: number
		fadeDuration: number
	}
	[ActionId.FairlightAudioInputGainDelta]: {
		input: number
		source: string
		delta: number
		fadeDuration: number
	}
	[ActionId.FairlightAudioFaderGain]: {
		input: number
		source: string
		gain: number
		fadeDuration: number
	}
	[ActionId.FairlightAudioFaderGainDelta]: {
		input: number
		source: string
		delta: number
		fadeDuration: number
	}
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
		fadeDuration: number
	}
	[ActionId.FairlightAudioMasterGainDelta]: {
		delta: number
		fadeDuration: number
	}
	[ActionId.FairlightAudioMonitorMasterMuted]: {
		state: TrueFalseToggle
	}
	[ActionId.FairlightAudioMonitorGain]: {
		gain: number
		fadeDuration: number
	}
	[ActionId.FairlightAudioMonitorGainDelta]: {
		delta: number
		fadeDuration: number
	}
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

	const audioInputOption = AtemAudioInputPicker(model, state.state)
	const audioSourceOption = AtemFairlightAudioSourcePicker()

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
				fadeDuration: FadeDurationChoice,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')

				const audioChannels = state.state.fairlight?.inputs ?? {}
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
					options.getPlainNumber('gain') * 100,
					options.getPlainNumber('fadeDuration')
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
				fadeDuration: FadeDurationChoice,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')

				const audioChannels = state.state.fairlight?.inputs ?? {}
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
						source.properties.gain + options.getPlainNumber('delta') * 100,
						options.getPlainNumber('fadeDuration')
					)
				}
			},
		},
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
				fadeDuration: FadeDurationChoice,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')

				const audioChannels = state.state.fairlight?.inputs ?? {}
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
					options.getPlainNumber('gain') * 100,
					options.getPlainNumber('fadeDuration')
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
				fadeDuration: FadeDurationChoice,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const sourceId = options.getPlainString('source')

				const audioChannels = state.state.fairlight?.inputs ?? {}
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
						source.properties.faderGain + options.getPlainNumber('delta') * 100,
						options.getPlainNumber('fadeDuration')
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
				fadeDuration: FadeDurationChoice,
			},
			callback: async ({ options }) => {
				await transitions.run(
					`audio.master.gain`,
					async (value) => {
						await atem?.setFairlightAudioMixerMasterProps({
							faderGain: value,
						})
					},
					state.state.fairlight?.master?.properties?.faderGain,
					options.getPlainNumber('gain') * 100,
					options.getPlainNumber('fadeDuration')
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
				fadeDuration: FadeDurationChoice,
			},
			callback: async ({ options }) => {
				const currentGain = state.state.fairlight?.master?.properties?.faderGain

				if (typeof currentGain === 'number') {
					await transitions.run(
						`audio.master.gain`,
						async (value) => {
							await atem?.setFairlightAudioMixerMasterProps({
								faderGain: value,
							})
						},
						currentGain,
						currentGain + options.getPlainNumber('delta') * 100,
						options.getPlainNumber('fadeDuration')
					)
				}
			},
		},
		[ActionId.FairlightAudioMonitorMasterMuted]: model.fairlightAudio.monitor
			? {
					name: 'Fairlight Audio: Monitor/Headphone master muted',
					options: {
						state: {
							id: 'state',
							type: 'dropdown',
							label: 'State',
							default: 'true',
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
		[ActionId.FairlightAudioMonitorGain]: model.fairlightAudio.monitor
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
						fadeDuration: FadeDurationChoice,
					},
					callback: async ({ options }) => {
						await transitions.run(
							`audio.monitor.faderGain`,
							async (value) => {
								await atem?.setFairlightAudioMixerMonitorProps({
									gain: value,
								})
							},
							state.state.fairlight?.monitor?.gain,
							options.getPlainNumber('gain') * 100,
							options.getPlainNumber('fadeDuration')
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
		[ActionId.FairlightAudioMonitorGainDelta]: model.fairlightAudio.monitor
			? {
					name: 'Fairlight Audio: Adjust Monitor/Headphone fader gain',
					options: {
						delta: FaderLevelDeltaChoice,
						fadeDuration: FadeDurationChoice,
					},
					callback: async ({ options }) => {
						const currentGain = state.state.fairlight?.monitor?.gain
						if (typeof currentGain === 'number') {
							await transitions.run(
								`audio.monitor.faderGain`,
								async (value) => {
									await atem?.setFairlightAudioMixerMonitorProps({
										gain: value,
									})
								},
								currentGain,
								currentGain + options.getPlainNumber('delta') * 100,
								options.getPlainNumber('fadeDuration')
							)
						}
					},
			  }
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
		// 	callback: async ({ options })=> {
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
		// 			state.state.fairlight?.monitor?.inputMasterGain,
		// 			options.getPlainNumber( 'gain') * 100,
		// 			options.getPlainNumber( 'fadeDuration', )
		// 		)
		// 	},
		// }),
	}
}
