import { combineRgb, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from './types.js'
import type { ActionTypes } from '../actions/index.js'
import type { FeedbackTypes } from '../feedback/index.js'
import type { ModelSpec } from '../models/types.js'

export function createFadeToBlackPresets(
	model: ModelSpec,
	pstSize: CompanionButtonStyleProps['size'],
	rateOptions: number[],
): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	const result: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] = []

	for (let me = 0; me < model.MEs; ++me) {
		const category: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
			name: `Fade to black (M/E ${me + 1})`,
			presets: {
				[`ftb_auto_${me}`]: {
					name: `Auto fade`,
					type: 'button',
					style: {
						text: `FTB Auto`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.FadeToBlackIsBlack,
							options: {
								mixeffect: me,
								state: 'off',
							},
							style: {
								bgcolor: combineRgb(0, 255, 0),
								color: combineRgb(255, 255, 255),
							},
						},
						{
							feedbackId: FeedbackId.FadeToBlackIsBlack,
							options: {
								mixeffect: me,
								state: 'on',
							},
							style: {
								bgcolor: combineRgb(255, 0, 0),
								color: combineRgb(255, 255, 255),
							},
						},
						{
							feedbackId: FeedbackId.FadeToBlackIsBlack,
							options: {
								mixeffect: me,
								state: 'fading',
							},
							style: {
								bgcolor: combineRgb(255, 255, 0),
								color: combineRgb(0, 0, 0),
							},
						},
					],
					steps: [
						{
							down: [
								{
									actionId: ActionId.FadeToBlackAuto,
									options: {
										mixeffect: me,
									},
								},
							],
							up: [],
						},
					],
				},
			},
		}

		for (const rate of rateOptions) {
			category.presets[`ftb_rate_${me}_${rate}`] = {
				name: `Rate ${rate}`,
				type: 'button',
				style: {
					text: `Rate ${rate}`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.FadeToBlackRate,
						options: {
							mixeffect: me,
							rate,
						},
						style: {
							bgcolor: combineRgb(255, 255, 0),
							color: combineRgb(0, 0, 0),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: ActionId.FadeToBlackRate,
								options: {
									mixeffect: me,
									rate,
								},
							},
						],
						up: [],
					},
				],
			}
		}

		result.push(category)
	}

	return result
}
