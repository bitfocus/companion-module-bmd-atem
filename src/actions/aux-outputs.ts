import { type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import { AtemAuxPicker, AtemAuxSourcePicker } from '../input.js'
import type { StateWrapper } from '../state.js'

export type AtemAuxOutputActions = {
	[ActionId.Aux]: {
		options: {
			aux: number
			input: number
		}
	}
	[ActionId.AuxVariables]: {
		options: {
			aux: string
			input: string
		}
	}
}

export function createAuxOutputActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemAuxOutputActions> {
	if (model.outputs.length === 0) {
		return {
			[ActionId.Aux]: undefined,
			[ActionId.AuxVariables]: undefined,
		}
	}
	return {
		[ActionId.Aux]: {
			name: 'Aux/Output: Set source',
			options: {
				aux: AtemAuxPicker(model),
				input: AtemAuxSourcePicker(model, state.state),
			},
			callback: async ({ options }) => {
				await atem?.setAuxSource(options.input, optionsaux)
			},
			learn: ({ options }) => {
				const auxSource = state.state.video.auxilliaries[options.aux]

				if (auxSource !== undefined) {
					return {
						input: auxSource,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.AuxVariables]: {
			name: 'Aux/Output: Set source from variables',
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
			callback: async ({ options }) => {
				const output = await options.aux
				const input = await options.input

				if (!isNaN(output) && !isNaN(input)) {
					await atem?.setAuxSource(input, output - 1)
				}
			},
		},
	}
}
