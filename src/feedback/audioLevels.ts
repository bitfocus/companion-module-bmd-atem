import type { CompanionFeedbackDefinitions, JsonValue } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../options/util.js'
import { AtemAudioInputPicker, AtemFairlightAudioSourcePicker } from '../options/audio.js'
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
