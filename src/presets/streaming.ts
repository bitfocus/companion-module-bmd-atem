import { Enums } from 'atem-connection'
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
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: 'streamStatus',
				options: {
					state: Enums.StreamingStatus.Streaming,
				},
				style: {
					bgcolor: 0x00ff00,
					color: 0x000000,
				},
			},
			{
				feedbackId: 'streamStatus',
				options: {
					state: Enums.StreamingStatus.Stopping,
				},
				style: {
					bgcolor: 0xeeee00,
					color: 0x000000,
				},
			},
			{
				feedbackId: 'streamStatus',
				options: {
					state: Enums.StreamingStatus.Connecting,
				},
				style: {
					bgcolor: 0xeeee00,
					color: 0x000000,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'streamStartStop',
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
