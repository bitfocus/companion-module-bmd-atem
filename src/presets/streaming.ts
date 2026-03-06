import { combineRgb } from '@companion-module/base'
import { Enums } from 'atem-connection'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { PresetsBuilderContext } from './context.js'

export function createStreamingPresets(context: PresetsBuilderContext): void {
	if (!context.model.streaming) return

	context.sections.push({
		id: 'streaming',
		name: 'Streaming',
		// Simple and flat for now??
		definitions: ['streaming_toggle'],
	})

	context.definitions[`streaming_toggle`] = {
		name: 'Toggle Stream',
		type: 'simple',
		style: {
			text: 'Stream\\n$(atem:stream_duration_hm)',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.StreamStatus,
				options: {
					state: Enums.StreamingStatus.Streaming,
				},
				style: {
					bgcolor: combineRgb(0, 255, 0),
					color: combineRgb(0, 0, 0),
				},
			},
			{
				feedbackId: FeedbackId.StreamStatus,
				options: {
					state: Enums.StreamingStatus.Stopping,
				},
				style: {
					bgcolor: combineRgb(238, 238, 0),
					color: combineRgb(0, 0, 0),
				},
			},
			{
				feedbackId: FeedbackId.StreamStatus,
				options: {
					state: Enums.StreamingStatus.Connecting,
				},
				style: {
					bgcolor: combineRgb(238, 238, 0),
					color: combineRgb(0, 0, 0),
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: ActionId.StreamStartStop,
						options: {
							stream: 'toggle',
						},
					},
				],
				up: [],
			},
		],
	}
}
