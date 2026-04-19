import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionFeedbackDefinitions, JsonValue } from '@companion-module/base'
import type { StateWrapper } from '../state.js'
import type { AtemConfig } from '../config.js'
import { AtemTimecodeModePicker, timecodeModeToEnum, upstreamKeyerTypeEnumToString } from '../options/timecode.js'

type TimecodeMode = 'freerun' | 'timeofday'

export type AtemTimecodeFeedbacks = {
	['timecodeMode']: {
		type: 'boolean'
		options: {
			mode: TimecodeMode | JsonValue | undefined
		}
	}
}

export function createTimecodeFeedbacks(
	config: AtemConfig,
	_model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemTimecodeFeedbacks> {
	if (!config.pollTimecode) {
		return {
			['timecodeMode']: undefined,
		}
	}
	return {
		['timecodeMode']: {
			type: 'boolean',
			name: 'Timecode: Mode',
			description: 'If the timecode mode is as specified',
			options: convertOptionsFields({
				mode: AtemTimecodeModePicker(),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const parsedMode = timecodeModeToEnum(options.mode)
				if (parsedMode === null) throw new Error("Invalid mode, must be 'freerun' or 'timeofday'")

				return state.state.settings.timeMode === parsedMode
			},
			learn: () => {
				const rawMode = state.state.settings.timeMode
				if (rawMode === undefined) return undefined

				const newMode = upstreamKeyerTypeEnumToString(rawMode)
				if (newMode === undefined) return undefined

				return {
					mode: newMode,
				}
			},
		},
	}
}
