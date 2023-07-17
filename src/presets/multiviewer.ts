import { combineRgb, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from './types.js'
import type { ActionTypes } from '../actions/index.js'
import type { FeedbackTypes } from '../feedback/index.js'
import type { ModelSpec } from '../models/types.js'
import { GetSourcesListForType } from '../choices.js'
import type { AtemState } from 'atem-connection'

export function createMultiviewerPresets(
	model: ModelSpec,
	state: AtemState,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string
): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	const result: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] = []

	for (let mv = 0; mv < model.MVs; mv++) {
		const firstWindow = model.multiviewerFullGrid ? 0 : 2
		const windowCount = model.multiviewerFullGrid ? 16 : 10
		for (let window = firstWindow; window < windowCount; window++) {
			const category: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
				name: `MV ${mv + 1} Window ${window + 1}`,
				presets: {},
			}
			result.push(category)

			for (const src of GetSourcesListForType(model, state, 'mv')) {
				category.presets[`mv_win_src_${mv}_${window}_${src.id}`] = {
					name: `Set MV ${mv + 1} Window ${window + 1} to source ${src.shortName}`,
					type: 'button',
					style: {
						text: `$(atem:${pstText}${src.id})`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.MVSource,
							options: {
								multiViewerId: mv,
								source: src.id,
								windowIndex: window,
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
									actionId: ActionId.MultiviewerWindowSource,
									options: {
										multiViewerId: mv,
										source: src.id,
										windowIndex: window,
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
