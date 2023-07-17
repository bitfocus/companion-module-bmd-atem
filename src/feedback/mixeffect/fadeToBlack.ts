import { AtemFadeToBlackStatePicker, AtemMEPicker, AtemRatePicker } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import type { MyFeedbackDefinitions } from '../types.js'
import { FeedbackId } from '../index.js'
import { combineRgb } from '@companion-module/base'
import { getMixEffect, type StateWrapper } from '../../state.js'

export interface AtemFadeToBlackFeedbacks {
	[FeedbackId.FadeToBlackIsBlack]: {
		mixeffect: number
		state: 'on' | 'off' | 'fading'
	}
	[FeedbackId.FadeToBlackRate]: {
		mixeffect: number
		rate: number
	}
}

export function createFadeToBlackFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): MyFeedbackDefinitions<AtemFadeToBlackFeedbacks> {
	return {
		[FeedbackId.FadeToBlackIsBlack]: {
			type: 'boolean',
			name: 'Fade to black: Active',
			description: 'If the specified fade to black is active, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				state: AtemFadeToBlackStatePicker(),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))
				if (me && me.fadeToBlack) {
					switch (options.getPlainString('state')) {
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
		[FeedbackId.FadeToBlackRate]: {
			type: 'boolean',
			name: 'Fade to black: Rate',
			description: 'If the specified fade to black rate matches, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				rate: AtemRatePicker('Rate'),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))
				const rate = options.getPlainNumber('rate')
				return me?.fadeToBlack?.rate === rate
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
