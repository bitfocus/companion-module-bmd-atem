import { Enums } from 'atem-connection'
import {
	AtemMEPicker,
	AtemMatchMethod,
	AtemRatePicker,
	AtemTransitionSelectionPicker,
	AtemTransitionStylePicker,
} from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import type { MyFeedbackDefinitions } from '../types.js'
import { FeedbackId } from '../FeedbackId.js'
import { combineRgb } from '@companion-module/base'
import { getMixEffect, type StateWrapper } from '../../state.js'
import { calculateTransitionSelection, assertUnreachable } from '../../util.js'

export interface AtemTransitionFeedbacks {
	[FeedbackId.PreviewTransition]: {
		mixeffect: number
	}
	[FeedbackId.TransitionStyle]: {
		mixeffect: number
		style: Enums.TransitionStyle
	}
	[FeedbackId.TransitionSelection]: {
		mixeffect: number
		matchmethod: 'exact' | 'contains' | 'not-contain'
		selection: ('background' | string)[]
	}
	[FeedbackId.TransitionRate]: {
		mixeffect: number
		style: Enums.TransitionStyle
		rate: number
	}
	[FeedbackId.InTransition]: {
		mixeffect: number
	}
}

export function createTransitionFeedbacks(
	model: ModelSpec,
	state: StateWrapper
): MyFeedbackDefinitions<AtemTransitionFeedbacks> {
	return {
		[FeedbackId.PreviewTransition]: {
			type: 'boolean',
			name: 'Transition: Preview',
			description: 'If the specified transition is being previewed, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))
				return !!me?.transitionPreview
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))

				if (me) {
					return {
						...options.getJson(),
						state: me.transitionPreview + '',
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.TransitionStyle]: {
			type: 'boolean',
			name: 'Transition: Style',
			description: 'If the specified transition style is active, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				style: AtemTransitionStylePicker(model.media.clips === 0),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))
				return me?.transitionProperties.nextStyle === options.getPlainNumber('style')
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))

				if (me) {
					return {
						...options.getJson(),
						style: me.transitionProperties.nextStyle,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.TransitionSelection]: {
			type: 'boolean',
			name: 'Transition: Selection',
			description: 'If the specified transition selection is active, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				matchmethod: AtemMatchMethod(),
				selection: AtemTransitionSelectionPicker(model),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))
				const expectedSelection = calculateTransitionSelection(model.USKs, options.getRaw('selection'))
				if (me) {
					switch (options.getPlainString('matchmethod')) {
						case 'exact':
							return me.transitionProperties.nextSelection.join(',') === expectedSelection.join(',')
						case 'contains':
							return expectedSelection.every((s) => me.transitionProperties.nextSelection.includes(s))
						case 'not-contain':
							return !expectedSelection.find((s) => me.transitionProperties.nextSelection.includes(s))
					}
				}
				return false
			},
		},
		[FeedbackId.TransitionRate]: {
			type: 'boolean',
			name: 'Transition: Rate',
			description: 'If the specified transition rate is active, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				style: AtemTransitionStylePicker(true),
				rate: AtemRatePicker('Transition Rate'),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))
				if (me?.transitionSettings) {
					const style = options.getPlainNumber('style')
					const rate = options.getPlainNumber('rate')
					switch (style) {
						case Enums.TransitionStyle.MIX:
							return me.transitionSettings.mix?.rate === rate
						case Enums.TransitionStyle.DIP:
							return me.transitionSettings.dip?.rate === rate
						case Enums.TransitionStyle.WIPE:
							return me.transitionSettings.wipe?.rate === rate
						case Enums.TransitionStyle.DVE:
							return me.transitionSettings.DVE?.rate === rate
						case Enums.TransitionStyle.STING:
							break
						default:
							assertUnreachable(style)
					}
				}
				return false
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))

				if (me?.transitionSettings) {
					const style = options.getPlainNumber('style')
					switch (style) {
						case Enums.TransitionStyle.MIX:
							return {
								...options.getJson(),
								rate: me.transitionSettings.mix?.rate ?? 1,
							}
						case Enums.TransitionStyle.DIP:
							return {
								...options.getJson(),
								rate: me.transitionSettings.dip?.rate ?? 1,
							}
						case Enums.TransitionStyle.WIPE:
							return {
								...options.getJson(),
								rate: me.transitionSettings.wipe?.rate ?? 1,
							}
						case Enums.TransitionStyle.DVE:
							return {
								...options.getJson(),
								rate: me.transitionSettings.DVE?.rate ?? 1,
							}
						case Enums.TransitionStyle.STING:
							return undefined
						default:
							assertUnreachable(style)
							return undefined
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.InTransition]: {
			type: 'boolean',
			name: 'Transition: Active/Running',
			description: 'If the specified transition is active, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))
				return !!me?.transitionPosition?.inTransition
			},
		},
	}
}
