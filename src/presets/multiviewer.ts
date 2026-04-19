import type { CompanionPresetGroup, CompanionButtonStyleProps } from '@companion-module/base'
import { FeedbackId } from '../feedback/FeedbackId.js'
import { GetSourcesListForType } from '../options/sources.js'
import type { AtemState } from 'atem-connection'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'

export function createMultiviewerWindowPresets(
	context: PresetsBuilderContext,
	state: AtemState,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'multiviewer_window',
		name: `Multiviewer Windows`,
		definitions: groups,
	})

	context.definitions[`multiviewer_window`] = {
		name: `Set MV X Window X to source X`,
		type: 'simple',
		style: {
			text: `$(atem:${pstText}$(local:input))`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.MVSource,
				options: {
					multiViewerId: { isExpression: true, value: '$(local:multiviewer)' },
					source: { isExpression: true, value: '$(local:input)' },
					windowIndex: { isExpression: true, value: '$(local:window)' },
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
						actionId: 'setMvSource',
						options: {
							multiViewerId: { isExpression: true, value: '$(local:multiviewer)' },
							source: { isExpression: true, value: '$(local:input)' },
							windowIndex: { isExpression: true, value: '$(local:window)' },
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'multiviewer',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'window',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
		],
	}

	const mvWindowSources = GetSourcesListForType(context.model, state, 'mv')

	for (let mv = 0; mv < context.model.MVs; mv++) {
		const firstWindow = context.model.multiviewerFullGrid ? 0 : 2
		const windowCount = context.model.multiviewerFullGrid ? 16 : 10
		for (let window = firstWindow; window < windowCount; window++) {
			groups.push({
				id: `mv_${mv}_w_${window}`,
				name: `MV ${mv + 1} Window ${window + 1}`,
				type: 'template',
				presetId: 'multiviewer_window',
				templateVariableName: 'input',
				templateValues: mvWindowSources.map((src) => ({
					name: `Set MV ${mv + 1} Window ${window + 1} to source ${src.shortName}`,
					value: src.id,
				})),
				commonVariableValues: {
					multiviewer: mv + 1,
					window: window + 1,
				},
			})
		}
	}
}
