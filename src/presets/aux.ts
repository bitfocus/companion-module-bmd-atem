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

	for (let aux = 0; aux < model.auxes; ++aux) {
		const category: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
			name: `AUX ${aux + 1}`,
			presets: {},
		}
		result.push(category)

		for (const src of GetSourcesListForType(model, state, 'aux')) {
			category.presets[`aux_${aux}_${src.id}`] = {
				name: `AUX ${aux + 1} button for ${src.shortName}`,
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
							aux,
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
									aux,
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
