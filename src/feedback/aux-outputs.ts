import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../common.js'
import { FeedbackId } from './FeedbackId.js'
import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import { AtemAuxPicker, AtemAuxSourcePicker } from '../input.js'
import type { StateWrapper } from '../state.js'

export type AtemAuxOutputFeedbacks = {
	[FeedbackId.Aux]: {
		type: 'boolean'
		options: {
			aux: number
			input: number
		}
	}
}

export function createAuxOutputFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemAuxOutputFeedbacks> {
	if (model.outputs.length === 0) {
		return {
			[FeedbackId.Aux]: undefined,
		}
	}
	return {
		[FeedbackId.Aux]: {
			type: 'boolean',
			name: 'Aux/Output: Source',
			description: 'If the input specified is selected in the aux bus specified, change style of the bank',
			options: convertOptionsFields({
				aux: AtemAuxPicker(model),
				input: AtemAuxSourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const auxSource = state.state.video.auxilliaries[options.aux - 1]
				return auxSource === options.input
			},
			learn: ({ options }) => {
				const auxSource = state.state.video.auxilliaries[options.aux - 1]

				if (auxSource !== undefined) {
					return {
						input: auxSource,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
