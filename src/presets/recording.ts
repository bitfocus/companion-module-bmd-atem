import { combineRgb } from '@companion-module/base'
import { Enums } from 'atem-connection'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from './types.js'
import type { ActionTypes } from '../actions/index.js'
import type { FeedbackTypes } from '../feedback/index.js'
import type { ModelSpec } from '../models/types.js'

export function createRecordingPresets(model: ModelSpec): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	if (!model.recording) return []

	return [
		{
			name: 'Streaming & Recording',
			presets: {
				[`recording_toggle`]: {
					name: 'Record',
					type: 'button',
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
				},
			},
		},
	]
}
