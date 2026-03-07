import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { AtemMEPicker, AtemRatePicker } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../ActionId.js'
import { getMixEffect, type StateWrapper } from '../../state.js'

export type AtemFadeToBlackActions = {
	[ActionId.FadeToBlackAuto]: {
		options: {
			mixeffect: number
		}
	}
	[ActionId.FadeToBlackRate]: {
		options: {
			mixeffect: number
			rate: number
		}
	}
}

export function createFadeToBlackActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemFadeToBlackActions> {
	return {
		[ActionId.FadeToBlackAuto]: {
			name: 'Fade to black: Run AUTO Transition',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
			}),
			callback: async ({ options }) => {
				await atem?.fadeToBlack(options.mixeffect - 1)
			},
		},
		[ActionId.FadeToBlackRate]: {
			name: 'Fade to black: Change rate',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				rate: AtemRatePicker('Rate'),
			}),
			callback: async ({ options }) => {
				await atem?.setFadeToBlackRate(options.rate, options.mixeffect - 1)
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.mixeffect - 1)

				if (me?.fadeToBlack) {
					return {
						rate: me.fadeToBlack.rate,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
