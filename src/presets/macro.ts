import { combineRgb, CompanionPresetGroup } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import { MacroFeedbackType } from '../feedback/macro.js'
import type { PresetsBuilderContext } from './context.js'
import { iterateTimes } from '../util.js'
import type { AtemSchema } from '../schema.js'

export function createMacroPresets(context: PresetsBuilderContext): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'macors',
		name: `Macros`,
		definitions: groups,
	})

	groups.push({
		id: `macro_run`,
		name: ``,
		type: 'template',
		presetId: 'macro_run',
		templateVariableName: 'index',
		templateValues: iterateTimes(context.model.macros, (index) => ({
			name: `Run macro ${index + 1}`,
			value: index + 1,
		})),
	})

	context.definitions[`macro_run`] = {
		name: `Run macro X`,
		type: 'simple',
		style: {
			text: `$(atem:macro_$(local:index))`,
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.Macro,
				options: {
					macroIndex: { isExpression: true, value: '$(local:index)' },
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
					macroIndex: { isExpression: true, value: '$(local:index)' },
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
					macroIndex: { isExpression: true, value: '$(local:index)' },
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
					macroIndex: { isExpression: true, value: '$(local:index)' },
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
							macro: { isExpression: true, value: '$(local:index)' },
							action: 'runContinue',
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'index',
				startupValue: 0,
			},
		],
	}
}
