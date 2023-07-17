import { combineRgb, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from './types.js'
import type { ActionTypes } from '../actions/index.js'
import type { FeedbackTypes } from '../feedback/index.js'
import type { ModelSpec } from '../models/types.js'
import type { SourceInfo } from '../choices.js'

export function createDownstreamKeyerPresets(
	model: ModelSpec,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
	meSources: SourceInfo[]
): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	const result: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] = []

	const onAirCategory: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
		name: 'DSK KEYs OnAir',
		presets: {},
	}
	const nextCategory: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
		name: 'DSK KEYs Next',
		presets: {},
	}
	result.push(onAirCategory, nextCategory)

	for (let dsk = 0; dsk < model.DSKs; ++dsk) {
		onAirCategory.presets[`dsk_onair_${dsk}`] = {
			name: `Toggle downstream KEY ${dsk + 1} OnAir`,
			type: 'button',
			style: {
				text: `DSK ${dsk + 1}`,
				size: '24',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.DSKOnAir,
					options: {
						key: dsk,
						invert: false,
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
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
								key: dsk,
							},
						},
					],
					up: [],
				},
			],
		}

		nextCategory.presets[`dsk_next_${dsk}`] = {
			name: `Toggle downstream KEY ${dsk + 1} Next`,
			type: 'button',
			style: {
				text: `DSK ${dsk + 1}`,
				size: '24',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.DSKTie,
					options: {
						key: dsk,
						invert: false,
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
							actionId: ActionId.DSKTie,
							options: {
								state: 'toggle',
								key: dsk,
							},
						},
					],
					up: [],
				},
			],
		}

		const dskCategory: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
			name: `DSK ${dsk + 1}`,
			presets: {},
		}
		result.push(dskCategory)

		for (const src of meSources) {
			dskCategory.presets[`dsk_src_${dsk}_${src.id}`] = {
				name: `DSK ${dsk + 1} source ${src.shortName}`,
				type: 'button',
				style: {
					text: `$(atem:${pstText}${src.id})`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.DSKSource,
						options: {
							fill: src.id,
							key: dsk,
						},
						style: {
							bgcolor: combineRgb(238, 238, 0),
							color: combineRgb(0, 0, 0),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: ActionId.DSKSource,
								options: {
									fill: src.id,
									cut: src.id + 1,
									key: dsk,
								},
							},
						],
						up: [],
					},
				],
			}
		}
	}

	return result
}
