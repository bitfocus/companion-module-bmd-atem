import { type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import { AtemAuxPicker, AtemAuxSourcePicker } from '../input.js'
import type { StateWrapper } from '../state.js'
import { convertOptionsFields } from '../options/common.js'
import { CompanionActionDefinitions } from '@companion-module/base'

export type AtemAuxOutputActions = {
	[ActionId.Aux]: {
		options: {
			aux: number
			input: number
		}
	}
}

export function createAuxOutputActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemAuxOutputActions> {
	if (model.outputs.length === 0) {
		return {
			[ActionId.Aux]: undefined,
		}
	}
	return {
		[ActionId.Aux]: {
			name: 'Aux/Output: Set source',
			options: convertOptionsFields({
				aux: AtemAuxPicker(model),
				input: AtemAuxSourcePicker(model, state.state),
			}),
			callback: async ({ options }) => {
				await atem?.setAuxSource(options.input, options.aux - 1)
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
