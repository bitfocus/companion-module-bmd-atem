import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './FeedbackId.js'
import { combineRgb } from '@companion-module/base'
import { AtemAuxPicker, AtemAuxSourcePicker } from '../input.js'
import type { StateWrapper } from '../state.js'

export interface AtemAuxOutputFeedbacks {
	[FeedbackId.AuxBG]: {
		aux: number
		input: number
	}
	[FeedbackId.AuxVariables]: {
		aux: string
		input: string
	}
}

export function createAuxOutputFeedbacks(
	model: ModelSpec,
	state: StateWrapper
): MyFeedbackDefinitions<AtemAuxOutputFeedbacks> {
	if (model.outputs.length === 0) {
		return {
			[FeedbackId.AuxBG]: undefined,
			[FeedbackId.AuxVariables]: undefined,
		}
	}
	return {
		[FeedbackId.AuxBG]: {
			type: 'boolean',
			name: 'Aux/Output: Source',
			description: 'If the input specified is selected in the aux bus specified, change style of the bank',
			options: {
				aux: AtemAuxPicker(model),
				input: AtemAuxSourcePicker(model, state.state),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const auxSource = state.state.video.auxilliaries[options.getPlainNumber('aux')]
				return auxSource === options.getPlainNumber('input')
			},
			learn: ({ options }) => {
				const auxSource = state.state.video.auxilliaries[options.getPlainNumber('aux')]

				if (auxSource !== undefined) {
					return {
						...options.getJson(),
						input: auxSource,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.AuxVariables]: {
			type: 'boolean',
			name: 'Aux/Output: Source from variables',
			description: 'If the input specified is selected in the aux bus specified, change style of the bank',
			options: {
				aux: {
					type: 'textinput',
					id: 'aux',
					label: 'AUX',
					default: '1',
					useVariables: true,
				},
				input: {
					type: 'textinput',
					id: 'input',
					label: 'Input ID',
					default: '0',
					useVariables: true,
				},
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: async ({ options }) => {
				const output = (await options.getParsedNumber('aux')) - 1
				const input = await options.getParsedNumber('input')

				const auxSource = state.state.video.auxilliaries[output]
				return auxSource === input
			},
			learn: async ({ options }) => {
				const output = (await options.getParsedNumber('aux')) - 1

				const auxSource = state.state.video.auxilliaries[output]

				if (auxSource !== undefined) {
					return {
						...options.getJson(),
						input: auxSource + '',
					}
				} else {
					return undefined
				}
			},
		},
	}
}
