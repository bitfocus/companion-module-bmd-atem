import { combineRgb } from '@companion-module/base'
import { Enums } from 'atem-connection'
import { ActionId } from '../actions/ActionId.js'
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
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.RecordStatus,
				options: {
					state: Enums.RecordingStatus.Recording,
				},
				style: {
					bgcolor: combineRgb(0, 255, 0),
					color: combineRgb(0, 0, 0),
				},
			},
			{
				feedbackId: FeedbackId.RecordStatus,
				options: {
					state: Enums.RecordingStatus.Stopping,
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
						actionId: ActionId.RecordStartStop,
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
