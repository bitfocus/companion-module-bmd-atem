import { combineRgb, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from './types.js'
import type { ActionTypes } from '../actions/index.js'
import type { FeedbackTypes } from '../feedback/index.js'
import type { ModelSpec } from '../models/types.js'
import type { SourceInfo } from '../choices.js'

export function createSuperSourcePresets(
	model: ModelSpec,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
	meSources: SourceInfo[]
): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	const result: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] = []

	for (let ssrc = 0; ssrc < model.SSrc; ssrc++) {
		const category: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
			name: `SSrc ${ssrc + 1} Boxes`,
			presets: {},
		}
		result.push(category)

		for (let box = 0; box < 4; box++) {
			category.presets[`ssrc_box_onair_${ssrc}_${box}`] = {
				name: `Toggle SuperSource ${ssrc + 1} Box ${box + 1} visibility`,
				type: 'button',
				style: {
					text: `Box ${box + 1}`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.SSrcBoxOnAir,
						options: {
							ssrcId: ssrc,
							boxIndex: box,
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
								actionId: ActionId.SuperSourceBoxOnAir,
								options: {
									ssrcId: ssrc,
									onair: 'toggle',
									boxIndex: box,
								},
							},
						],
						up: [],
					},
				],
			}

			const boxCategory: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
				name: `SSrc ${ssrc + 1} Box ${box + 1}`,
				presets: {},
			}
			result.push(boxCategory)

			for (const src of meSources) {
				boxCategory.presets[`ssrc_box_src_${ssrc}_${box}_${src.id}`] = {
					name: `Set SuperSource ${ssrc + 1} Box ${box + 1} to source ${src.shortName}`,
					type: 'button',
					style: {
						text: `$(atem:${pstText}${src.id})`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.SSrcBoxSource,
							options: {
								ssrcId: ssrc,
								source: src.id,
								boxIndex: box,
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
									actionId: ActionId.SuperSourceBoxSource,
									options: {
										ssrcId: ssrc,
										source: src.id,
										boxIndex: box,
									},
								},
							],
							up: [],
						},
					],
				}
			}
		}
	}

	return result
}
