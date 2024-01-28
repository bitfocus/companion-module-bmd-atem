import { combineRgb } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from './types.js'
import type { ActionTypes } from '../actions/index.js'
import type { FeedbackTypes } from '../feedback/index.js'
import type { ModelSpec } from '../models/types.js'
import { MacroFeedbackType } from '../feedback/macro.js'

export function createMacroPresets(model: ModelSpec): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	const result: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] = []

	const category: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
		name: `MACROS`,
		presets: {},
	}
	result.push(category)

	for (let macro = 0; macro < model.macros; macro++) {
		category.presets[`macro_run_${macro}`] = {
			name: `Run button for macro ${macro + 1}`,
			type: 'button',
			style: {
				text: `$(atem:macro_${macro + 1})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.Macro,
					options: {
						macroIndex: macro + 1,
						state: MacroFeedbackType.IsUsed,
					},
					style: {
						bgcolor: combineRgb(0, 0, 238),
						color: combineRgb(255, 255, 255),
					},
				},
				{
					feedbackId: FeedbackId.Macro,
					options: {
						macroIndex: macro + 1,
						state: MacroFeedbackType.IsRunning,
					},
					style: {
						bgcolor: combineRgb(0, 238, 0),
						color: combineRgb(255, 255, 255),
					},
				},
				{
					feedbackId: FeedbackId.Macro,
					options: {
						macroIndex: macro + 1,
						state: MacroFeedbackType.IsWaiting,
					},
					style: {
						bgcolor: combineRgb(238, 238, 0),
						color: combineRgb(255, 255, 255),
					},
				},
				{
					feedbackId: FeedbackId.Macro,
					options: {
						macroIndex: macro + 1,
						state: MacroFeedbackType.IsRecording,
					},
					style: {
						bgcolor: combineRgb(238, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: ActionId.MacroRun,
							options: {
								macro: macro + 1,
								action: 'runContinue',
							},
						},
					],
					up: [],
				},
			],
		}
	}

	return result
}
