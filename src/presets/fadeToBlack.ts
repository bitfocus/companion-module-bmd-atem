import type { CompanionPresetGroup, CompanionButtonStyleProps } from '@companion-module/base'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'
import { iterateTimes } from '../util.js'

export function createFadeToBlackPresets(
	context: PresetsBuilderContext,
	pstSize: CompanionButtonStyleProps['size'],
	rateOptions: number[],
): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'fadeToBlack',
		name: `Fade to Black`,
		definitions: groups,
	})

	groups.push({
		id: 'ftb_auto',
		name: 'Auto Fade',
		type: 'template',
		presetId: 'ftb_auto',
		templateVariableName: 'me',
		templateValues: iterateTimes(context.model.MEs, (me) => ({
			name: `Auto fade M/E ${me + 1}`,
			value: me + 1,
		})),
	})

	for (let me = 0; me < context.model.MEs; ++me) {
		groups.push({
			id: `ftb_rate_${me}`,
			name: `Rate (M/E ${me + 1})`,
			type: 'template',
			presetId: 'ftb_rate',
			templateVariableName: 'rate',
			templateValues: rateOptions.map((rate) => ({
				name: `Rate ${rate}`,
				value: rate,
			})),
			commonVariableValues: {
				me: me + 1,
			},
		})
	}

	context.definitions['ftb_auto'] = {
		name: `Auto fade`,
		type: 'simple',
		style: {
			text: `FTB Auto`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.FadeToBlackIsBlack,
				options: {
					mixeffect: { isExpression: true, value: '$(local:me)' },
					state: 'off',
				},
				style: {
					bgcolor: 0x00ff00,
					color: 0xffffff,
				},
			},
			{
				feedbackId: FeedbackId.FadeToBlackIsBlack,
				options: {
					mixeffect: { isExpression: true, value: '$(local:me)' },
					state: 'on',
				},
				style: {
					bgcolor: 0xff0000,
					color: 0xffffff,
				},
			},
			{
				feedbackId: FeedbackId.FadeToBlackIsBlack,
				options: {
					mixeffect: { isExpression: true, value: '$(local:me)' },
					state: 'fading',
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
						actionId: 'fadeToBlackAuto',
						options: {
							mixeffect: { isExpression: true, value: '$(local:me)' },
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
		],
	}

	context.definitions['ftb_rate'] = {
		name: `FTB Rate X`,
		type: 'simple',
		style: {
			text: `Rate $(local:rate)`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.FadeToBlackRate,
				options: {
					mixeffect: { isExpression: true, value: '$(local:me)' },
					rate: { isExpression: true, value: '$(local:rate)' },
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
						actionId: 'fadeToBlackRate',
						options: {
							mixeffect: { isExpression: true, value: '$(local:me)' },
							rate: { isExpression: true, value: '$(local:rate)' },
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
				variableName: 'rate',
				startupValue: 0,
			},
		],
	}
}
