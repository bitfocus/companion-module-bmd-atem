import { type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import { AtemAuxPicker, AtemAuxSourcePicker } from '../input.js'
import type { StateWrapper } from '../state.js'

export interface AtemAuxOutputActions {
	[ActionId.Aux]: {
		aux: number
		input: number
	}
	[ActionId.AuxVariables]: {
		aux: string
		input: string
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
				await atem?.setAuxSource(options.getPlainNumber('input'), options.getPlainNumber('aux'))
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
				const output = await options.getParsedNumber('aux')
				const input = await options.getParsedNumber('input')

				if (!isNaN(output) && !isNaN(input)) {
					await atem?.setAuxSource(input, output - 1)
				}
			},
		},
	}
}
