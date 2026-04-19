import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { AtemAuxPicker, AtemAuxSourcePicker } from '../options/aux-outputs.js'
import type { StateWrapper } from '../state.js'

export type AtemAuxOutputFeedbacks = {
	['aux']: {
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
			['aux']: undefined,
		}
	}
	return {
		['aux']: {
			type: 'boolean',
			name: 'Aux/Output: Source',
			options: convertOptionsFields({
				aux: AtemAuxPicker(model),
				input: AtemAuxSourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
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
