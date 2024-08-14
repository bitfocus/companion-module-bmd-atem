import { combineRgb, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from './types.js'
import type { ActionTypes } from '../actions/index.js'
import type { FeedbackTypes } from '../feedback/index.js'
import type { ModelSpec } from '../models/types.js'
import { GetSourcesListForType } from '../choices.js'
import type { AtemState } from 'atem-connection'

export function createAuxOutputPresets(
	model: ModelSpec,
	state: AtemState,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string
): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	const result: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] = []

	for (const output of model.outputs) {
		const category: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
			name: output.name,
			presets: {},
		}
		result.push(category)

		for (const src of GetSourcesListForType(model, state, 'aux')) {
			category.presets[`aux_${output.id}_${src.id}`] = {
				name: `${output.name} button for ${src.shortName}`,
				type: 'button',
				style: {
					text: `$(atem:${pstText}${src.id})`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.AuxBG,
						options: {
							input: src.id,
							aux: output.id,
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
								actionId: ActionId.Aux,
								options: {
									aux: output.id,
									input: src.id,
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
