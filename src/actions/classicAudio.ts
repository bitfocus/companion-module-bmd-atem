import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { AtemAudioInputPicker, FaderLevelDeltaChoice, CHOICES_CLASSIC_AUDIO_MIX_OPTION } from '../options/audio.js'
import type { AtemTransitions, FadeDurationFieldsType } from '../transitions.js'
import type { StateWrapper } from '../state.js'
import { CLASSIC_AUDIO_MIN_GAIN } from '../util.js'
import { FadeDurationFields } from '../options/fade.js'

export type AtemClassicAudioActions = {
	['classicAudioGain']: {
		options: {
			input: number
			gain: number
		} & FadeDurationFieldsType
	}
	['classicAudioGainDelta']: {
		options: {
			input: number
			delta: number
		} & FadeDurationFieldsType
	}
	['classicAudioMixOption']: {
		options: {
			input: number
			option: 'toggle' | Enums.AudioMixOption
		}
	}
	['classicAudioResetPeaks']: {
		options: {
			reset: 'all' | 'master' | 'monitor' | number
		}
	}
	['classicAudioMasterGain']: {
		options: {
			gain: number
		} & FadeDurationFieldsType
	}
	['classicAudioMasterGainDelta']: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}
	['classicAudioMasterPan']: {
		options: {
			balance: number
		} & FadeDurationFieldsType
	}
	['classicAudioMasterPanDelta']: {
		options: {
			delta: number
		} & FadeDurationFieldsType
	}
}

export function createClassicAudioActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions<AtemClassicAudioActions> {
	if (!model.classicAudio) {
		return {
			['classicAudioGain']: undefined,
			['classicAudioGainDelta']: undefined,
			['classicAudioMixOption']: undefined,
			['classicAudioResetPeaks']: undefined,
			['classicAudioMasterGain']: undefined,
			['classicAudioMasterGainDelta']: undefined,
			['classicAudioMasterPan']: undefined,
			['classicAudioMasterPanDelta']: undefined,
		}
	}

	const audioInputOption = AtemAudioInputPicker(model, state.state)

	return {
		['classicAudioGain']: audioInputOption
			? {
					name: 'Classic Audio: Set input gain',
					options: convertOptionsFields({
						input: audioInputOption,
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
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const audioChannels = state.state.audio?.channels ?? {}
						const channel = audioChannels[inputId]

						await transitions.runForFadeOptions(
							`audio.${inputId}.gain`,
							async (value) => {
								await atem?.setClassicAudioMixerInputProps(inputId, { gain: value })
							},
							channel?.gain,
							options.gain,
							options,
						)
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
				}
			: undefined,
		['classicAudioGainDelta']: audioInputOption
			? {
					name: 'Classic Audio: Adjust input gain',
					options: convertOptionsFields({
						input: audioInputOption,
						delta: FaderLevelDeltaChoice,
						...FadeDurationFields,
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const audioChannels = state.state.audio?.channels ?? {}
						const channel = audioChannels[inputId]

						if (typeof channel?.gain === 'number') {
							const currentGain = Math.max(CLASSIC_AUDIO_MIN_GAIN, channel.gain)
							await transitions.runForFadeOptions(
								`audio.${inputId}.gain`,
								async (value) => {
									await atem?.setClassicAudioMixerInputProps(inputId, { gain: value })
								},
								currentGain,
								currentGain + options.delta,
								options,
							)
						}
					},
				}
			: undefined,
		['classicAudioMixOption']: audioInputOption
			? {
					name: 'Classic Audio: Set input mix option',
					options: convertOptionsFields({
						input: audioInputOption,
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
								...CHOICES_CLASSIC_AUDIO_MIX_OPTION,
							],
							disableAutoExpression: true, // TODO: Until the options are simplified
						},
					}),
					callback: async ({ options }) => {
						const inputId = options.input
						const audioChannels = state.state.audio?.channels ?? {}
						const toggleVal =
							audioChannels[inputId]?.mixOption === Enums.AudioMixOption.On
								? Enums.AudioMixOption.Off
								: Enums.AudioMixOption.On
						const rawVal = options.option
						const newVal = rawVal === 'toggle' ? toggleVal : rawVal
						await atem?.setClassicAudioMixerInputProps(inputId, { mixOption: newVal })
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
				}
			: undefined,
		['classicAudioResetPeaks']: audioInputOption
			? {
					name: 'Classic Audio: Reset peaks',
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
								{
									id: 'monitor',
									label: 'Monitor',
								},
								...audioInputOption.choices,
							],
						},
					}),
					callback: async ({ options }) => {
						const rawVal = options.reset
						if (rawVal === 'all') {
							await atem?.setClassicAudioResetPeaks({ all: true })
						} else if (rawVal === 'master') {
							await atem?.setClassicAudioResetPeaks({ master: true })
						} else if (rawVal === 'monitor') {
							await atem?.setClassicAudioResetPeaks({ monitor: true })
						} else {
							const inputId = Number(rawVal)
							await atem?.setClassicAudioResetPeaks({ input: inputId })
						}
					},
				}
			: undefined,
		['classicAudioMasterGain']: {
			name: 'Classic Audio: Set master gain',
			options: convertOptionsFields({
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
				...FadeDurationFields,
			}),
			callback: async ({ options }) => {
				await transitions.runForFadeOptions(
					`audio.master.gain`,
					async (value) => {
						await atem?.setClassicAudioMixerMasterProps({ gain: value })
					},
					state.state.audio?.master?.gain,
					options.gain,
					options,
				)
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
		['classicAudioMasterGainDelta']: {
			name: 'Classic Audio: Adjust master gain',
			options: convertOptionsFields({
				delta: FaderLevelDeltaChoice,
				...FadeDurationFields,
			}),
			callback: async ({ options }) => {
				const currentGain = Math.max(CLASSIC_AUDIO_MIN_GAIN, state.state.audio?.master?.gain ?? -Infinity)

				if (typeof currentGain === 'number') {
					await transitions.runForFadeOptions(
						`audio.master.gain`,
						async (value) => {
							await atem?.setClassicAudioMixerMasterProps({ gain: value })
						},
						currentGain,
						currentGain + options.delta,
						options,
					)
				}
			},
		},
		['classicAudioMasterPan']: {
			name: 'Classic Audio: Set master pan',
			options: convertOptionsFields({
				balance: {
					type: 'number',
					label: 'Pan',
					id: 'balance',
					range: true,
					default: 0,
					step: 1,
					min: -50,
					max: 50,
					asInteger: true,
					clampValues: true,
				},
				...FadeDurationFields,
			}),
			callback: async ({ options }) => {
				await transitions.runForFadeOptions(
					`audio.master.pan`,
					async (value) => {
						await atem?.setClassicAudioMixerMasterProps({ balance: value })
					},
					state.state.audio?.master?.balance,
					options.balance,
					options,
				)
			},
			learn: () => {
				const props = state.state.audio?.master

				if (props) {
					return {
						balance: props.balance,
					}
				} else {
					return undefined
				}
			},
		},
		['classicAudioMasterPanDelta']: {
			name: 'Classic Audio: Adjust master pan',
			options: convertOptionsFields({
				delta: {
					type: 'number',
					label: 'Delta',
					id: 'delta',
					default: 1,
					max: 50,
					min: -50,
					asInteger: true,
					clampValues: true,
				},
				...FadeDurationFields,
			}),
			callback: async ({ options }) => {
				const currentBalance = state.state.audio?.master?.balance

				if (typeof currentBalance === 'number') {
					await transitions.runForFadeOptions(
						`audio.master.gain`,
						async (value) => {
							await atem?.setClassicAudioMixerMasterProps({ balance: value })
						},
						currentBalance,
						currentBalance + options.delta,
						options,
					)
				}
			},
		},
	}
}
