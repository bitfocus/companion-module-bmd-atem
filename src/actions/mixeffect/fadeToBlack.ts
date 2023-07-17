import { type Atem } from 'atem-connection'
import { AtemMEPicker, AtemRatePicker } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../index.js'
import type { MyActionDefinitions } from './../types.js'
import { getMixEffect, type StateWrapper } from '../../state.js'

export interface AtemFadeToBlackActions {
	[ActionId.FadeToBlackAuto]: {
		mixeffect: number
	}
	[ActionId.FadeToBlackRate]: {
		mixeffect: number
		rate: number
	}
}

export function createFadeToBlackActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemFadeToBlackActions> {
	return {
		[ActionId.FadeToBlackAuto]: {
			name: 'Fade to black: Run AUTO Transition',
			options: {
				mixeffect: AtemMEPicker(model, 0),
			},
			callback: async ({ options }) => {
				await atem?.fadeToBlack(options.getPlainNumber('mixeffect'))
			},
		},
		[ActionId.FadeToBlackRate]: {
			name: 'Fade to black: Change rate',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				rate: AtemRatePicker('Rate'),
			},
			callback: async ({ options }) => {
				await atem?.setFadeToBlackRate(options.getPlainNumber('rate'), options.getPlainNumber('mixeffect'))
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))

				if (me?.fadeToBlack) {
					return {
						...options.getJson(),
						rate: me.fadeToBlack.rate,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
