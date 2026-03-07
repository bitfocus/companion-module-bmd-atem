import { CompanionPresetGroup, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { SourceInfo } from '../choices.js'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'
import { iterateTimes } from '../util.js'

export function createDownstreamKeyerPresets(
	context: PresetsBuilderContext,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
	meSources: SourceInfo[],
): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'dsks',
		name: `Downstream Keyers`,
		definitions: groups,
	})

	groups.push(
		{
			id: 'dsk_onair',
			name: 'Toggle On Air',
			type: 'template',
			presetId: 'dsk_onair',
			templateVariableName: 'dsk',
			templateValues: iterateTimes(context.model.DSKs, (dsk) => ({
				name: `Toggle downstream KEY ${dsk + 1} OnAir`,
				value: dsk + 1,
			})),
		},
		{
			id: 'dsk_tie',
			name: 'Toggle Tie',
			type: 'template',
			presetId: 'dsk_tie',
			templateVariableName: 'dsk',
			templateValues: iterateTimes(context.model.DSKs, (dsk) => ({
				name: `Toggle downstream KEY ${dsk + 1} Tie`,
				value: dsk + 1,
			})),
		},
	)

	for (let dsk = 0; dsk < context.model.DSKs; ++dsk) {
		groups.push({
			id: `dsk_src_${dsk}`,
			name: `DSK ${dsk + 1} source`,
			type: 'template',
			presetId: 'dsk_src',
			templateVariableName: 'input',
			templateValues: meSources.map((src) => ({
				name: src.shortName,
				value: src.id,
			})),
			commonVariableValues: {
				dsk: dsk + 1,
			},
		})
	}

	context.definitions[`dsk_onair`] = {
		name: `Toggle downstream KEY X OnAir`,
		type: 'simple',
		style: {
			text: `DSK $(local:dsk)`,
			size: '24',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.DSKOnAir,
				options: {
					key: { isExpression: true, value: '$(local:dsk)' },
				},
				style: {
					bgcolor: 0xff0000,
					color: 0xffffff,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: ActionId.DSKOnAir,
						options: {
							onair: 'toggle',
							key: { isExpression: true, value: '$(local:dsk)' },
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'dsk',
				startupValue: 0,
			},
		],
	}

	context.definitions[`dsk_tie`] = {
		name: `Toggle downstream KEY X Next`,
		type: 'simple',
		style: {
			text: `DSK $(local:dsk)`,
			size: '24',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.DSKTie,
				options: {
					key: { isExpression: true, value: '$(local:dsk)' },
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
						actionId: ActionId.DSKTie,
						options: {
							state: 'toggle',
							key: { isExpression: true, value: '$(local:dsk)' },
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'dsk',
				startupValue: 0,
			},
		],
	}

	context.definitions[`dsk_src`] = {
		name: `DSK X source X`,
		type: 'simple',
		style: {
			text: `$(atem:${pstText}$(local:input))`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.DSKSource,
				options: {
					fill: { isExpression: true, value: '$(local:input)' },
					key: { isExpression: true, value: '$(local:dsk)' },
				},
				style: {
					bgcolor: 0xeeee00,
					color: 0x000000,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: ActionId.DSKSource,
						options: {
							fill: { isExpression: true, value: '$(local:input)' },
							cut: { isExpression: true, value: '$(local:input) + 1' },
							key: { isExpression: true, value: '$(local:dsk)' },
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'dsk',
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
