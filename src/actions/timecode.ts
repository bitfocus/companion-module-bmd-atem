import { type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import { AtemAuxPicker, AtemAuxSourcePicker } from '../input.js'
import type { StateWrapper } from '../state.js'

export interface AtemTimecodeActions {
	[ActionId.Aux]: {
		aux: number
		input: number
	}
}

export function createTimecodeActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper
): MyActionDefinitions<AtemTimecodeActions> {
	if (!model.auxes) {
		return {
			[ActionId.Aux]: undefined,
		}
	}
	return {
		[ActionId.Aux]: {
			name: 'Timecode: Set source',
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
	}
}
