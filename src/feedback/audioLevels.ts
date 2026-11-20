import type { CompanionFeedbackDefinitions, JsonValue } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../options/util.js'
import { AtemAudioInputPicker, AtemFairlightAudioSourcePicker, GetAudioInputsList } from '../options/audio.js'
import {
	AtemFairlightMasterMeterPicker,
	AtemFairlightMeterPicker,
	parseFairlightMasterMeter,
	parseFairlightMeter,
} from '../options/audioLevels.js'
import type { StateWrapper } from '../state.js'

export type AtemAudioLevelFeedbacks = {
	['fairlightAudioMasterLevel']: {
		type: 'value'
		options: {
			meter: JsonValue
		}
	}
	['classicAudioMasterLevel']: {
		type: 'value'
		options: {
			meter: number
		}
	}
	['classicAudioInputLevel']: {
		type: 'value'
		options: {
			input: number
			meter: number
		}
	}
	['audioInputShortName']: {
		type: 'value'
		options: {
			input: number
		}
	}
	['fairlightAudioInputLevel']: {
		type: 'value'
		options: {
			input: number
			source: string
			meter: JsonValue
		}
	}
}

export function createAudioLevelFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemAudioLevelFeedbacks> {
	// Only fairlight audio reports levels
	const audioInputOption = model.fairlightAudio ? AtemAudioInputPicker(model, state.state) : null
	// the classic mixer's, through the commands added in classicLevels.ts
	const classic = !model.fairlightAudio && !!model.classicAudio
	const classicInputOption = classic ? AtemAudioInputPicker(model, state.state) : null
	const classicMeter = {
		type: 'dropdown' as const,
		id: 'meter' as const,
		label: 'Meter',
		default: 0,
		choices: [
			{ id: 0, label: 'Left' },
			{ id: 1, label: 'Right' },
			{ id: 2, label: 'Peak left' },
			{ id: 3, label: 'Peak right' },
		],
	}
	const meterOf = (v: unknown) => Math.min(3, Math.max(0, Math.round(Number(v)) || 0)) as 0 | 1 | 2 | 3

	return {
		['fairlightAudioMasterLevel']: model.fairlightAudio
			? {
					type: 'value',
					name: 'Fairlight Audio: Master level',
					description: 'The level currently being metered by the switcher, in dB',
					options: convertOptionsFields({
						meter: AtemFairlightMasterMeterPicker(),
					}),
					callback: ({ id, options }) => {
						// There is no subscribe, so registering here is what asks the switcher for levels
						state.audioLevels.subscribe(id)

						const meter = parseFairlightMasterMeter(options.meter)
						if (meter === null) return null

						return state.audioLevels.getMasterLevel(meter)
					},
					unsubscribe: ({ id }) => state.audioLevels.unsubscribe(id),
				}
			: undefined,

		['classicAudioMasterLevel']: classic
			? {
					type: 'value',
					name: 'Classic Audio: Master level',
					description: 'The level currently being metered by the switcher, in dB',
					options: [classicMeter],
					callback: ({ id, options }) => {
						state.audioLevels.subscribe(id)
						return state.audioLevels.getClassicLevel('master', meterOf(options.meter))
					},
					unsubscribe: ({ id }) => state.audioLevels.unsubscribe(id),
				}
			: undefined,

		['classicAudioInputLevel']: classicInputOption
			? {
					type: 'value',
					name: 'Classic Audio: Input level',
					description: 'The level currently being metered by the switcher, in dB',
					options: [classicInputOption, classicMeter],
					callback: ({ id, options }) => {
						state.audioLevels.subscribe(id)
						return state.audioLevels.getClassicLevel(Number(options.input), meterOf(options.meter))
					},
					unsubscribe: ({ id }) => state.audioLevels.unsubscribe(id),
				}
			: undefined,

		['audioInputShortName']:
			audioInputOption || classicInputOption
				? {
						type: 'value',
						name: 'Audio: Input short name',
						description: 'The short name of an audio input, for labels (eg on meters)',
						options: [
							{ type: 'number', id: 'input', label: 'Input id', default: 1, min: 0, max: 65535, asInteger: true },
						],
						callback: ({ options }) =>
							GetAudioInputsList(model, state.state).find((i) => i.id === Number(options.input))?.shortName ??
							String(options.input),
					}
				: undefined,

		['fairlightAudioInputLevel']: audioInputOption
			? {
					type: 'value',
					name: 'Fairlight Audio: Input level',
					description: 'The level currently being metered by the switcher, in dB',
					options: convertOptionsFields({
						input: audioInputOption,
						source: AtemFairlightAudioSourcePicker(),
						meter: AtemFairlightMeterPicker(),
					}),
					callback: ({ id, options }) => {
						// There is no subscribe, so registering here is what asks the switcher for levels
						state.audioLevels.subscribe(id)

						const meter = parseFairlightMeter(options.meter)
						if (meter === null) return null

						return state.audioLevels.getSourceLevel(options.input, options.source, meter)
					},
					unsubscribe: ({ id }) => state.audioLevels.unsubscribe(id),
				}
			: undefined,
	}
}
