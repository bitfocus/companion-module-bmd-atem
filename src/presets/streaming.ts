import { combineRgb } from '@companion-module/base'
import { Enums } from 'atem-connection'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from './types.js'
import type { ActionTypes } from '../actions/index.js'
import type { FeedbackTypes } from '../feedback/index.js'
import type { ModelSpec } from '../models/types.js'

export function createStreamingPresets(model: ModelSpec): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	if (!model.streaming) return []

	return [
		{
			name: 'Streaming & Recording',
			presets: {
				[`streaming_toggle`]: {
					name: 'Stream',
					type: 'button',
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
				},
			},
		},
	]
}
