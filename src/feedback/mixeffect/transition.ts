import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { ModelSpec } from '../../models/index.js'
import type { CompanionFeedbackDefinitions, JsonValue } from '@companion-module/base'
import { getMixEffect, type StateWrapper } from '../../state.js'
import { assertUnreachable } from '../../util.js'
import {
	AtemMEPicker,
	AtemTransitionStylePicker,
	transitionStyleEnumToString,
	type TransitionStyleString,
	transitionStyleStringToEnum,
} from '../../options/mixEffect.js'
import { AtemRatePicker } from '../../options/common.js'
import {
	AtemTransitionSelectionPicker,
	calculateTransitionSelection,
	type TransitionSelectionComponent,
	AtemMatchMethod,
} from '../../options/transition.js'

export type AtemTransitionFeedbacks = {
	['previewTransition']: {
		type: 'boolean'
		options: {
			mixeffect: number
		}
	}
	['transitionStyle']: {
		type: 'boolean'
		options: {
			mixeffect: number
			style: TransitionStyleString | JsonValue | undefined
		}
	}
	['transitionSelection']: {
		type: 'boolean'
		options: {
			mixeffect: number
			matchmethod: 'exact' | 'contains' | 'not-contain'
			selection: TransitionSelectionComponent[]
		}
	}
	['transitionRate']: {
		type: 'boolean'
		options: {
			mixeffect: number
			style: TransitionStyleString | JsonValue | undefined
			rate: number
		}
	}
	['inTransition']: {
		type: 'boolean'
		options: {
			mixeffect: number
		}
	}
}

export function createTransitionFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemTransitionFeedbacks> {
	return {
		['previewTransition']: {
			type: 'boolean',
			name: 'Transition: Preview',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.mixeffect - 1)
				return !!me?.transitionPreview
			},
		},
		['transitionStyle']: {
			type: 'boolean',
			name: 'Transition: Style',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				style: AtemTransitionStylePicker(model.media.clips === 0),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.mixeffect - 1)
				const parsedStyle = transitionStyleStringToEnum(options.style)
				if (parsedStyle === null) return false
				return me?.transitionProperties.nextStyle === parsedStyle
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.mixeffect - 1)

				if (me) {
					return {
						style: transitionStyleEnumToString(me.transitionProperties.nextStyle),
					}
				} else {
					return undefined
				}
			},
		},
		['transitionSelection']: {
			type: 'boolean',
			name: 'Transition: Selection',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				matchmethod: AtemMatchMethod(),
				selection: AtemTransitionSelectionPicker(model),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.mixeffect - 1)
				const expectedSelection = calculateTransitionSelection(model.USKs, options.selection)
				if (me) {
					switch (options.matchmethod) {
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
		['transitionRate']: {
			type: 'boolean',
			name: 'Transition: Rate',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				style: AtemTransitionStylePicker(true),
				rate: AtemRatePicker('Transition Rate'),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.mixeffect - 1)
				if (me?.transitionSettings) {
					const parsedStyle = transitionStyleStringToEnum(options.style)
					if (parsedStyle === null) return false // Not valid

					const rate = options.rate
					switch (parsedStyle) {
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
							assertUnreachable(parsedStyle)
					}
				}
				return false
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.mixeffect - 1)

				if (me?.transitionSettings) {
					const parsedStyle = transitionStyleStringToEnum(options.style)
					if (parsedStyle === null) return // Not valid

					switch (parsedStyle) {
						case Enums.TransitionStyle.MIX:
							return {
								rate: me.transitionSettings.mix?.rate ?? 1,
							}
						case Enums.TransitionStyle.DIP:
							return {
								rate: me.transitionSettings.dip?.rate ?? 1,
							}
						case Enums.TransitionStyle.WIPE:
							return {
								rate: me.transitionSettings.wipe?.rate ?? 1,
							}
						case Enums.TransitionStyle.DVE:
							return {
								rate: me.transitionSettings.DVE?.rate ?? 1,
							}
						case Enums.TransitionStyle.STING:
							return undefined
						default:
							assertUnreachable(parsedStyle)
							return undefined
					}
				} else {
					return undefined
				}
			},
		},
		['inTransition']: {
			type: 'boolean',
			name: 'Transition: Active/Running',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.mixeffect - 1)
				return !!me?.transitionPosition?.inTransition
			},
		},
	}
}
