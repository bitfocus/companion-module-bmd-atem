import { convertOptionsFields } from '../../options/common.js'
import type { ModelSpec } from '../../models/index.js'
import { FeedbackId } from '../FeedbackId.js'
import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { getMixEffect, type StateWrapper } from '../../state.js'
import { AtemMEPicker, AtemMESourcePicker } from '../../options/mixEffect.js'

export type AtemProgramFeedbacks = {
	[FeedbackId.Program]: {
		type: 'boolean'
		options: {
			mixeffect: number
			input: number
		}
	}
}

export function createProgramFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemProgramFeedbacks> {
	return {
		[FeedbackId.Program]: {
			type: 'boolean',
			name: 'ME: One ME program source',
			description: 'If the input specified is selected in program on the M/E stage specified, change style of the bank',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				input: AtemMESourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.mixeffect - 1)
				return me?.programInput === options.input
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.mixeffect - 1)

				if (me) {
					return {
						input: me.programInput,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
