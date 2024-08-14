import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import { CHOICES_CLASSIC_AUDIO_MIX_OPTION } from '../choices.js'
import {
	AtemAudioInputPicker,
	FadeDurationFields,
	FaderLevelDeltaChoice,
	type FadeDurationFieldsType,
} from '../input.js'
import type { AtemTransitions } from '../transitions.js'
import type { StateWrapper } from '../state.js'

export interface AtemClassicAudioActions {
	[ActionId.ClassicAudioGain]: {
		input: number
		gain: number
	} & FadeDurationFieldsType
	[ActionId.ClassicAudioGainDelta]: {
		input: number
		delta: number
	} & FadeDurationFieldsType
	[ActionId.ClassicAudioMixOption]: {
		input: number
		option: 'toggle' | Enums.AudioMixOption
	}
	[ActionId.ClassicAudioResetPeaks]: {
		reset: 'all' | 'master' | 'monitor' | number
	}
	[ActionId.ClassicAudioMasterGain]: {
		gain: number
	} & FadeDurationFieldsType
	[ActionId.ClassicAudioMasterGainDelta]: {
		delta: number
	} & FadeDurationFieldsType
	[ActionId.ClassicAudioMasterPan]: {
		balance: number
	} & FadeDurationFieldsType
	[ActionId.ClassicAudioMasterPanDelta]: {
		delta: number
	} & FadeDurationFieldsType
}

export function createClassicAudioActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper
): MyActionDefinitions<AtemClassicAudioActions> {
	if (!model.classicAudio) {
		return {
			[ActionId.ClassicAudioGain]: undefined,
			[ActionId.ClassicAudioGainDelta]: undefined,
			[ActionId.ClassicAudioMixOption]: undefined,
			[ActionId.ClassicAudioResetPeaks]: undefined,
			[ActionId.ClassicAudioMasterGain]: undefined,
			[ActionId.ClassicAudioMasterGainDelta]: undefined,
			[ActionId.ClassicAudioMasterPan]: undefined,
			[ActionId.ClassicAudioMasterPanDelta]: undefined,
		}
	}

	const audioInputOption = AtemAudioInputPicker(model, state.state)

	return {
		[ActionId.ClassicAudioGain]: {
			name: 'Classic Audio: Set input gain',
			options: {
				input: audioInputOption,
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
				},
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[inputId]

				await transitions.runForFadeOptions(
					`audio.${inputId}.gain`,
					async (value) => {
						await atem?.setClassicAudioMixerInputProps(inputId, { gain: value })
					},
					channel?.gain,
					options.getPlainNumber('gain'),
					options
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
		[ActionId.ClassicAudioGainDelta]: {
			name: 'Classic Audio: Adjust input gain',
			options: {
				input: audioInputOption,
				delta: FaderLevelDeltaChoice,
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const audioChannels = state.state.audio?.channels ?? {}
				const channel = audioChannels[inputId]

				if (typeof channel?.gain === 'number') {
					await transitions.runForFadeOptions(
						`audio.${inputId}.gain`,
						async (value) => {
							await atem?.setClassicAudioMixerInputProps(inputId, { gain: value })
						},
						channel.gain,
						channel.gain + options.getPlainNumber('delta'),
						options
					)
				}
			},
		},
		[ActionId.ClassicAudioMixOption]: {
			name: 'Classic Audio: Set input mix option',
			options: {
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
				},
			},
			callback: async ({ options }) => {
				const inputId = options.getPlainNumber('input')
				const audioChannels = state.state.audio?.channels ?? {}
				const toggleVal =
					audioChannels[inputId]?.mixOption === Enums.AudioMixOption.On
						? Enums.AudioMixOption.Off
						: Enums.AudioMixOption.On
				const rawVal = options.getRaw('option')
				const newVal = rawVal === 'toggle' ? toggleVal : rawVal
				await atem?.setClassicAudioMixerInputProps(inputId, { mixOption: newVal })
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
		[ActionId.ClassicAudioResetPeaks]: {
			name: 'Classic Audio: Reset peaks',
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
						{
							id: 'monitor',
							label: 'Monitor',
						},
						...audioInputOption.choices,
					],
				},
			},
			callback: async ({ options }) => {
				const rawVal = options.getRaw('reset')
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
		},
		[ActionId.ClassicAudioMasterGain]: {
			name: 'Classic Audio: Set master gain',
			options: {
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
				},
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				await transitions.runForFadeOptions(
					`audio.master.gain`,
					async (value) => {
						await atem?.setClassicAudioMixerMasterProps({ gain: value })
					},
					state.state.audio?.master?.gain,
					options.getPlainNumber('gain'),
					options
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
		[ActionId.ClassicAudioMasterGainDelta]: {
			name: 'Classic Audio: Adjust master gain',
			options: {
				delta: FaderLevelDeltaChoice,
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				const currentGain = state.state.audio?.master?.gain

				if (typeof currentGain === 'number') {
					await transitions.runForFadeOptions(
						`audio.master.gain`,
						async (value) => {
							await atem?.setClassicAudioMixerMasterProps({ gain: value })
						},
						currentGain,
						currentGain + options.getPlainNumber('delta'),
						options
					)
				}
			},
		},
		[ActionId.ClassicAudioMasterPan]: {
			name: 'Classic Audio: Set master pan',
			options: {
				balance: {
					type: 'number',
					label: 'Pan',
					id: 'balance',
					range: true,
					required: true,
					default: 0,
					step: 1,
					min: -50,
					max: 50,
				},
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				await transitions.runForFadeOptions(
					`audio.master.pan`,
					async (value) => {
						await atem?.setClassicAudioMixerMasterProps({ balance: value })
					},
					state.state.audio?.master?.balance,
					options.getPlainNumber('balance'),
					options
				)
			},
			learn: ({ options }) => {
				const props = state.state.audio?.master

				if (props) {
					return {
						...options.getJson(),
						balance: props.balance,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.ClassicAudioMasterPanDelta]: {
			name: 'Classic Audio: Adjust master pan',
			options: {
				delta: {
					type: 'number',
					label: 'Delta',
					id: 'delta',
					default: 1,
					max: 50,
					min: -50,
				},
				...FadeDurationFields,
			},
			callback: async ({ options }) => {
				const currentBalance = state.state.audio?.master?.balance

				if (typeof currentBalance === 'number') {
					await transitions.runForFadeOptions(
						`audio.master.gain`,
						async (value) => {
							await atem?.setClassicAudioMixerMasterProps({ balance: value })
						},
						currentBalance,
						currentBalance + options.getPlainNumber('delta'),
						options
					)
				}
			},
		},
	}
}
