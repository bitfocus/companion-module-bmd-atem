import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../common.js'
import { FeedbackId } from './FeedbackId.js'
import { assertNever, combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import type { StateWrapper } from '../state.js'
import type { AtemConfig } from '../config.js'
import { Enums } from 'atem-connection'

type TimecodeMode = 'freerun' | 'timeofday'

export type AtemTimecodeFeedbacks = {
	[FeedbackId.TimecodeMode]: {
		type: 'boolean'
		options: {
			mode: TimecodeMode
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
			[FeedbackId.TimecodeMode]: undefined,
		}
	}
	return {
		[FeedbackId.TimecodeMode]: {
			type: 'boolean',
			name: 'Timecode: Mode',
			description: 'If the timecode mode is as specified',
			options: convertOptionsFields({
				mode: {
					id: 'mode',
					type: 'dropdown',
					label: 'Mode',
					choices: [
						{ id: Enums.TimeMode.FreeRun, label: 'Free run' },
						{ id: Enums.TimeMode.TimeOfDay, label: 'Time of Day' },
					],
					default: Enums.TimeMode.FreeRun,
				},
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				let targetMode: Enums.TimeMode | undefined

				const rawMode = String(options.mode).toLowerCase()
				if (rawMode.includes('free') || rawMode.includes('run')) {
					targetMode = Enums.TimeMode.FreeRun
				} else if (rawMode.includes('time') || rawMode.includes('day')) {
					targetMode = Enums.TimeMode.TimeOfDay
				} else {
					return false
				}

				return state.state.settings.timeMode === targetMode
			},
			learn: () => {
				const rawMode = state.state.settings.timeMode
				if (rawMode === undefined) return undefined

				let newMode: TimecodeMode | undefined
				switch (rawMode) {
					case Enums.TimeMode.FreeRun:
						newMode = 'freerun'
						break
					case Enums.TimeMode.TimeOfDay:
						newMode = 'timeofday'
						break
					default:
						assertNever(rawMode)
						return undefined
				}

				return {
					mode: newMode,
				}
			},
		},
	}
}
