import { CompanionPresetGroup, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { SourceInfo } from '../choices.js'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'
import { iterateTimes } from '../util.js'

export function createSuperSourcePresets(
	context: PresetsBuilderContext,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
	meSources: SourceInfo[],
): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'superSource',
		name: `SuperSource`,
		definitions: groups,
	})

	for (let ssrc = 0; ssrc < context.model.SSrc; ssrc++) {
		groups.push({
			id: `ssrc_box_onair_${ssrc}`,
			name: `SSrc ${ssrc + 1} Box On Air`,
			type: 'template',
			presetId: 'ssrc_box_onair',
			templateVariableName: 'box',
			templateValues: iterateTimes(4, (box) => ({
				name: `Toggle SuperSource ${ssrc + 1} Box ${box + 1} visibility`,
				value: box + 1,
			})),
			commonVariableValues: {
				ssrc: ssrc + 1,
			},
		})

		for (let box = 0; box < 4; box++) {
			groups.push({
				id: `ssrc_box_src_${ssrc}_${box}`,
				name: `SSrc ${ssrc + 1} Box ${box + 1} Source`,
				type: 'template',
				presetId: 'ssrc_box_src',
				templateVariableName: 'input',
				templateValues: meSources.map((src) => ({
					name: `Set SuperSource ${ssrc + 1} Box ${box + 1} to source ${src.shortName}`,
					value: src.id,
				})),
				commonVariableValues: {
					ssrc: ssrc + 1,
					box: box + 1,
				},
			})
		}
	}

	context.definitions['ssrc_box_onair'] = {
		name: `Toggle SuperSource X Box X visibility`,
		type: 'simple',
		style: {
			text: `Box $(local:box)`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.SSrcBoxOnAir,
				options: {
					ssrcId: { isExpression: true, value: '$(local:ssrc) - 1' },
					boxIndex: { isExpression: true, value: '$(local:box) - 1' },
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
						actionId: ActionId.SuperSourceBoxOnAir,
						options: {
							ssrcId: { isExpression: true, value: '$(local:ssrc) - 1' },
							onair: 'toggle',
							boxIndex: { isExpression: true, value: '$(local:box) - 1' },
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'ssrc',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'box',
				startupValue: 0,
			},
		],
	}

	context.definitions['ssrc_box_src'] = {
		name: `Set SuperSource X Box X to source X`,
		type: 'simple',
		style: {
			text: `$(atem:${pstText}$(local:input))`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.SSrcBoxSource,
				options: {
					ssrcId: { isExpression: true, value: '$(local:ssrc) - 1' },
					source: { isExpression: true, value: '$(local:input)' },
					boxIndex: { isExpression: true, value: '$(local:box) - 1' },
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
						actionId: ActionId.SuperSourceBoxSource,
						options: {
							ssrcId: { isExpression: true, value: '$(local:ssrc) - 1' },
							source: { isExpression: true, value: '$(local:input)' },
							boxIndex: { isExpression: true, value: '$(local:box) - 1' },
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'ssrc',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'box',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
		],
	}
}
