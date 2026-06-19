import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { AtemRatePicker } from '../../options/common.js'
import type { ModelSpec } from '../../models/index.js'
import { getMixEffect, type StateWrapper } from '../../state.js'
import { AtemMEPicker, resolveMixEffectIndex } from '../../options/mixEffect.js'

export type AtemFadeToBlackActions = {
	['fadeToBlackAuto']: {
		options: {
			mixeffect: number
		}
	}
	['fadeToBlackRate']: {
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
		['fadeToBlackAuto']: {
			name: 'Fade to black: Run AUTO Transition',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
			}),
			callback: async ({ options }) => {
				await atem?.fadeToBlack(resolveMixEffectIndex(model, options.mixeffect))
			},
		},
		['fadeToBlackRate']: {
			name: 'Fade to black: Change rate',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				rate: AtemRatePicker('Rate'),
			}),
			callback: async ({ options }) => {
				await atem?.setFadeToBlackRate(options.rate, resolveMixEffectIndex(model, options.mixeffect))
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, resolveMixEffectIndex(model, options.mixeffect))

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
