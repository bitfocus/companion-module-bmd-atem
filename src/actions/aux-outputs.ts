import { type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { AtemAuxPicker, AtemAuxSourcePicker } from '../options/aux-outputs.js'
import type { StateWrapper } from '../state.js'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'

export type AtemAuxOutputActions = {
	['aux']: {
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
			['aux']: undefined,
		}
	}
	return {
		['aux']: {
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
