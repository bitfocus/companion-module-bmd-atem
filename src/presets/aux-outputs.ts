import type { CompanionPresetGroup, CompanionButtonStyleProps } from '@companion-module/base'
import { FeedbackId } from '../feedback/FeedbackId.js'
import { GetSourcesListForType } from '../options/sources.js'
import type { AtemState } from 'atem-connection'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'

export function createAuxOutputPresets(
	context: PresetsBuilderContext,
	state: AtemState,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'aux_outputs',
		name: `Aux/Outputs`,
		definitions: groups,
	})

	context.definitions[`aux_source`] = {
		name: `X button for X`,
		type: 'simple',
		style: {
			text: `$(atem:${pstText}$(local:input))`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.Aux,
				options: {
					input: { isExpression: true, value: '$(local:input)' },
					aux: { isExpression: true, value: '$(local:output)' },
				},
				style: {
					bgcolor: 0xffff00,
					color: 0x000000,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'aux',
						options: {
							aux: { isExpression: true, value: '$(local:output)' },
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
				variableName: 'input',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'output',
				startupValue: 0,
			},
		],
	}

	for (const output of context.model.outputs) {
		groups.push({
			id: `aux_${output.id}`,
			name: output.name,
			type: 'template',
			presetId: 'aux_source',
			templateVariableName: 'input',
			templateValues: GetSourcesListForType(context.model, state, 'aux').map((src) => ({
				name: `${output.name} button for ${src.shortName}`,
				value: src.id,
			})),
			commonVariableValues: {
				output: output.id + 1,
			},
		})
	}
}
