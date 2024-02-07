import { Enums } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './FeedbackId.js'
import { combineRgb, type CompanionInputFieldDropdown } from '@companion-module/base'
import type { StateWrapper } from '../state.js'

export interface AtemRecordingFeedbacks {
	[FeedbackId.RecordStatus]: {
		state: Enums.RecordingStatus
	}
	[FeedbackId.RecordISO]: Record<never, never>
}

export function createRecordingFeedbacks(
	model: ModelSpec,
	state: StateWrapper
): MyFeedbackDefinitions<AtemRecordingFeedbacks> {
	if (!model.recording) {
		return {
			[FeedbackId.RecordStatus]: undefined,
			[FeedbackId.RecordISO]: undefined,
		}
	}
	return {
		[FeedbackId.RecordStatus]: {
			type: 'boolean',
			name: 'Recording: Active/Running',
			description: 'If the record has the specified status, change style of the bank',
			options: {
				state: {
					id: 'state',
					label: 'State',
					type: 'dropdown',
					choices: Object.entries(Enums.RecordingStatus)
						.filter(([_k, v]) => typeof v === 'number')
						.map(([k, v]) => ({
							id: v,
							label: k,
						})),
					default: Enums.RecordingStatus.Recording,
				} satisfies CompanionInputFieldDropdown,
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const recording = state.state.recording?.status?.state
				return recording === options.getPlainNumber('state')
			},
			learn: ({ options }) => {
				if (state.state.recording?.status) {
					return {
						...options.getJson(),
						state: state.state.recording.status.state,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.RecordISO]: {
			type: 'boolean',
			name: 'Recording: ISO enabled',
			description: 'If ISO recording is enabled',
			options: {},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (): boolean => {
				return !!state.state.recording?.recordAllInputs
			},
		},
	}
}
