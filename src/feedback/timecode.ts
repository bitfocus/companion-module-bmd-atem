import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './FeedbackId.js'
import { combineRgb } from '@companion-module/base'
import type { StateWrapper } from '../state.js'
import type { AtemConfig } from '../config.js'
import { Enums } from 'atem-connection'

export interface AtemTimecodeFeedbacks {
	[FeedbackId.TimecodeMode]: {
		mode: Enums.TimeMode
	}
}

export function createTimecodeFeedbacks(
	config: AtemConfig,
	_model: ModelSpec,
	state: StateWrapper
): MyFeedbackDefinitions<AtemTimecodeFeedbacks> {
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
			options: {
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
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				return state.state.settings.timeMode === options.getPlainNumber('mode')
			},
			learn: ({ options }) => {
				return {
					...options.getJson(),
					mode: state.state.settings.timeMode ?? Enums.TimeMode.FreeRun,
				}
			},
		},
	}
}
