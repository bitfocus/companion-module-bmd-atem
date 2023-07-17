import { Enums } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './index.js'
import { combineRgb, type CompanionInputFieldDropdown } from '@companion-module/base'
import type { StateWrapper } from '../state.js'

export interface AtemStreamingFeedbacks {
	[FeedbackId.StreamStatus]: {
		state: Enums.StreamingStatus
	}
}

export function createStreamingFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): MyFeedbackDefinitions<AtemStreamingFeedbacks> {
	if (!model.streaming) {
		return {
			[FeedbackId.StreamStatus]: undefined,
		}
	}
	return {
		[FeedbackId.StreamStatus]: {
			type: 'boolean',
			name: 'Streaming: Active/Running',
			description: 'If the stream has the specified status, change style of the bank',
			options: {
				state: {
					id: 'state',
					label: 'State',
					type: 'dropdown',
					choices: Object.entries(Enums.StreamingStatus)
						.filter(([_k, v]) => typeof v === 'number')
						.map(([k, v]) => ({
							id: v,
							label: k,
						})),
					default: Enums.StreamingStatus.Streaming,
				} satisfies CompanionInputFieldDropdown,
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const streaming = state.state.streaming?.status?.state
				return streaming === options.getPlainNumber('state')
			},
			learn: ({ options }) => {
				if (state.state.streaming?.status) {
					return {
						...options.getJson(),
						state: state.state.streaming.status.state,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
