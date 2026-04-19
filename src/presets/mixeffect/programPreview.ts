import type { CompanionPresetGroup, CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../../actions/ActionId.js'
import { FeedbackId } from '../../feedback/FeedbackId.js'
import type { SourceInfo } from '../../options/sources.js'
import type { PresetsBuilderContext } from '../context.js'
import type { AtemSchema } from '../../schema.js'

export function createProgramPreviewPresets(
	context: PresetsBuilderContext,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
	meSources: SourceInfo[],
): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'programPreview',
		name: `MixEffect Program/Preview`,
		definitions: groups,
	})

	context.definitions[`preview_me`] = {
		name: `Preview button for X`,
		type: 'simple',
		style: {
			text: `$(atem:${pstText}$(local:input))`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.Preview,
				options: {
					mixeffect: { isExpression: true, value: '$(local:me)' },
					input: { isExpression: true, value: '$(local:input)' },
				},
				style: {
					bgcolor: 0x00ff00,
					color: 0xffffff,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: ActionId.Preview,
						options: {
							mixeffect: { isExpression: true, value: '$(local:me)' },
							input: { isExpression: true, value: '$(local:input)' },
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'me',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
		],
	}
	context.definitions[`program_me`] = {
		name: `Program button for X`,
		type: 'simple',
		style: {
			text: `$(atem:${pstText}$(local:input))`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.Program,
				options: {
					mixeffect: { isExpression: true, value: '$(local:me)' },
					input: { isExpression: true, value: '$(local:input)' },
				},
				style: {
					bgcolor: 0x00ff00,
					color: 0xffffff,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: ActionId.Program,
						options: {
							mixeffect: { isExpression: true, value: '$(local:me)' },
							input: { isExpression: true, value: '$(local:input)' },
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'me',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
		],
	}

	for (let me = 0; me < context.model.MEs; ++me) {
		groups.push(
			{
				id: `program_me_${me}`,
				name: `Program (M/E ${me + 1})`,
				type: 'template',
				presetId: 'program_me',
				templateVariableName: 'input',
				templateValues: meSources.map((src) => ({
					name: `Program button for ${src.shortName}`,
					value: src.id,
				})),
				commonVariableValues: {
					me: me + 1,
				},
			},
			{
				id: `preview_me_${me}`,
				name: `Preview (M/E ${me + 1})`,
				type: 'template',
				presetId: 'preview_me',
				templateVariableName: 'input',
				templateValues: meSources.map((src) => ({
					name: `Preview button for ${src.shortName}`,
					value: src.id,
				})),
				commonVariableValues: {
					me: me + 1,
				},
			},
		)
	}
}
