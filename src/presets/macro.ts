import type { CompanionPresetGroup } from '@companion-module/base'
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
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: 'macro',
				options: {
					macroIndex: { isExpression: true, value: '$(local:index)' },
					state: MacroFeedbackType.IsUsed,
				},
				style: {
					bgcolor: 0x0000ee,
					color: 0xffffff,
				},
			},
			{
				feedbackId: 'macro',
				options: {
					macroIndex: { isExpression: true, value: '$(local:index)' },
					state: MacroFeedbackType.IsRunning,
				},
				style: {
					bgcolor: 0x00ee00,
					color: 0xffffff,
				},
			},
			{
				feedbackId: 'macro',
				options: {
					macroIndex: { isExpression: true, value: '$(local:index)' },
					state: MacroFeedbackType.IsWaiting,
				},
				style: {
					bgcolor: 0xeeee00,
					color: 0xffffff,
				},
			},
			{
				feedbackId: 'macro',
				options: {
					macroIndex: { isExpression: true, value: '$(local:index)' },
					state: MacroFeedbackType.IsRecording,
				},
				style: {
					bgcolor: 0xee0000,
					color: 0xffffff,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'macrorun',
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
