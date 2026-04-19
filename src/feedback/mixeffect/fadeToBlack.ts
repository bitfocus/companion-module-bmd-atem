import { AtemFadeToBlackStatePicker } from '../../options/fadeToBlack.js'
import { convertOptionsFields } from '../../options/util.js'
import type { ModelSpec } from '../../models/index.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { getMixEffect, type StateWrapper } from '../../state.js'
import { AtemMEPicker } from '../../options/mixEffect.js'
import { AtemRatePicker } from '../../options/common.js'

export type AtemFadeToBlackFeedbacks = {
	['fadeToBlackIsBlack']: {
		type: 'boolean'
		options: {
			mixeffect: number
			state: 'on' | 'off' | 'fading'
		}
	}
	['fadeToBlackRate']: {
		type: 'boolean'
		options: {
			mixeffect: number
			rate: number
		}
	}
}

export function createFadeToBlackFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemFadeToBlackFeedbacks> {
	return {
		['fadeToBlackIsBlack']: {
			type: 'boolean',
			name: 'Fade to black: Active',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				state: AtemFadeToBlackStatePicker(),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.mixeffect - 1)
				if (me && me.fadeToBlack) {
					switch (options.state) {
						case 'off':
							return !me.fadeToBlack.isFullyBlack && !me.fadeToBlack.inTransition
						case 'fading':
							return me.fadeToBlack.inTransition
						default:
							// on
							return !me.fadeToBlack.inTransition && me.fadeToBlack.isFullyBlack
					}
				}
				return false
			},
		},
		['fadeToBlackRate']: {
			type: 'boolean',
			name: 'Fade to black: Rate',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				rate: AtemRatePicker('Rate'),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.mixeffect - 1)
				const rate = options.rate
				return me?.fadeToBlack?.rate === rate
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
