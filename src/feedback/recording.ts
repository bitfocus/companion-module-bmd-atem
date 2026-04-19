import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { ModelSpec } from '../models/index.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { StateWrapper } from '../state.js'

export type AtemRecordingFeedbacks = {
	['recordStatus']: {
		type: 'boolean'
		options: {
			state: Enums.RecordingStatus
		}
	}
	['recordISO']: {
		type: 'boolean'
		options: Record<never, never>
	}
}

export function createRecordingFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemRecordingFeedbacks> {
	if (!model.recording) {
		return {
			['recordStatus']: undefined,
			['recordISO']: undefined,
		}
	}
	return {
		['recordStatus']: {
			type: 'boolean',
			name: 'Recording: Active/Running',
			description: 'If the record has the specified status, change style of the bank',
			options: convertOptionsFields({
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
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: ({ options }): boolean => {
				const recording = state.state.recording?.status?.state
				return recording === options.state
			},
			learn: () => {
				if (state.state.recording?.status) {
					return {
						state: state.state.recording.status.state,
					}
				} else {
					return undefined
				}
			},
		},
		['recordISO']: {
			type: 'boolean',
			name: 'Recording: ISO enabled',
			description: 'If ISO recording is enabled',
			options: convertOptionsFields({}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (): boolean => {
				return !!state.state.recording?.recordAllInputs
			},
		},
	}
}
