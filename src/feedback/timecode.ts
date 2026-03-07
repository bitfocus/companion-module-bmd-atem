import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../options/common.js'
import { FeedbackId } from './FeedbackId.js'
import { assertNever, CompanionFeedbackDefinitions, CompanionInputFieldDropdown } from '@companion-module/base'
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
						{ id: 'freerun', label: 'Free run' },
						{ id: 'timeofday', label: 'Time of Day' },
					],
					default: 'freerun',
				} satisfies CompanionInputFieldDropdown<'mode', TimecodeMode>,
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
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
