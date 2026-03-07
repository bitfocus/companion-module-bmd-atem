import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../options/common.js'
import { FeedbackId } from './FeedbackId.js'
import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import { AtemDSKPicker, AtemKeyFillSourcePicker } from '../input.js'
import { getDSK, type StateWrapper } from '../state.js'

export type AtemDownstreamKeyerFeedbacks = {
	[FeedbackId.DSKOnAir]: {
		type: 'boolean'
		options: {
			key: number
		}
	}
	[FeedbackId.DSKTie]: {
		type: 'boolean'
		options: {
			key: number
		}
	}
	[FeedbackId.DSKSource]: {
		type: 'boolean'
		options: {
			key: number
			fill: number
		}
	}
}

export function createDownstreamKeyerFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemDownstreamKeyerFeedbacks> {
	if (!model.DSKs) {
		return {
			[FeedbackId.DSKOnAir]: undefined,
			[FeedbackId.DSKTie]: undefined,
			[FeedbackId.DSKSource]: undefined,
		}
	}
	return {
		[FeedbackId.DSKOnAir]: {
			type: 'boolean',
			name: 'Downstream key: OnAir',
			description: 'If the specified downstream keyer is onair, change style of the bank',
			options: convertOptionsFields({
				key: AtemDSKPicker(model),
			}),
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }): boolean => {
				const dsk = getDSK(state.state, options.key - 1)
				return !!dsk?.onAir
			},
		},
		[FeedbackId.DSKTie]: {
			type: 'boolean',
			name: 'Downstream key: Tied',
			description: 'If the specified downstream keyer is tied, change style of the bank',
			options: convertOptionsFields({
				key: AtemDSKPicker(model),
			}),
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }): boolean => {
				const dsk = getDSK(state.state, options.key - 1)
				return !!dsk?.properties?.tie
			},
		},
		[FeedbackId.DSKSource]: {
			type: 'boolean',
			name: 'Downstream key: Fill source',
			description: 'If the input specified is selected in the DSK specified, change style of the bank',
			options: convertOptionsFields({
				key: AtemDSKPicker(model),
				fill: AtemKeyFillSourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(238, 238, 0),
			},
			callback: ({ options }): boolean => {
				const dsk = getDSK(state.state, options.key - 1)
				return dsk?.sources?.fillSource === options.fill
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.key - 1)

				if (dsk?.sources) {
					return {
						fill: dsk.sources.fillSource,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
