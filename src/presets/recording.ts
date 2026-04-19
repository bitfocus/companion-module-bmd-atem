import { Enums } from 'atem-connection'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { PresetsBuilderContext } from './context.js'

export function createRecordingPresets(context: PresetsBuilderContext): void {
	if (!context.model.recording) return

	context.sections.push({
		id: 'recording',
		name: 'Recording',
		// Simple and flat for now??
		definitions: ['recording_toggle'],
	})

	context.definitions[`recording_toggle`] = {
		name: 'Toggle Record',
		type: 'simple',
		style: {
			text: 'Record\\n$(atem:record_duration_hm)',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.RecordStatus,
				options: {
					state: Enums.RecordingStatus.Recording,
				},
				style: {
					bgcolor: 0x00ff00,
					color: 0x000000,
				},
			},
			{
				feedbackId: FeedbackId.RecordStatus,
				options: {
					state: Enums.RecordingStatus.Stopping,
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
						actionId: 'recordStartStop',
						options: {
							record: 'toggle',
						},
					},
				],
				up: [],
			},
		],
	}
}
