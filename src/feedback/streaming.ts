import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { ModelSpec } from '../models/index.js'
import { FeedbackId } from './FeedbackId.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { StateWrapper } from '../state.js'

export type AtemStreamingFeedbacks = {
	[FeedbackId.StreamStatus]: {
		type: 'boolean'
		options: {
			state: Enums.StreamingStatus
		}
	}
}

export function createStreamingFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemStreamingFeedbacks> {
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
			options: convertOptionsFields({
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
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: ({ options }): boolean => {
				const streaming = state.state.streaming?.status?.state
				return streaming === options.state
			},
			learn: () => {
				if (state.state.streaming?.status) {
					return {
						state: state.state.streaming.status.state,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
