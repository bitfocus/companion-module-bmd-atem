import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './index.js'
import { combineRgb } from '@companion-module/base'
import { AtemDSKPicker, AtemKeyFillSourcePicker } from '../input.js'
import { getDSK, type StateWrapper } from '../state.js'

export interface AtemDownstreamKeyerFeedbacks {
	[FeedbackId.DSKOnAir]: {
		key: number
	}
	[FeedbackId.DSKTie]: {
		key: number
	}
	[FeedbackId.DSKSource]: {
		key: number
		fill: number
	}
	[FeedbackId.DSKSourceVariables]: {
		key: string
		fill: string
	}
}

export function createDownstreamKeyerFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): MyFeedbackDefinitions<AtemDownstreamKeyerFeedbacks> {
	if (!model.DSKs) {
		return {
			[FeedbackId.DSKOnAir]: undefined,
			[FeedbackId.DSKTie]: undefined,
			[FeedbackId.DSKSource]: undefined,
			[FeedbackId.DSKSourceVariables]: undefined,
		}
	}
	return {
		[FeedbackId.DSKOnAir]: {
			type: 'boolean',
			name: 'Downstream key: OnAir',
			description: 'If the specified downstream keyer is onair, change style of the bank',
			options: {
				key: AtemDSKPicker(model),
			},
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }): boolean => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))
				return !!dsk?.onAir
			},
		},
		[FeedbackId.DSKTie]: {
			type: 'boolean',
			name: 'Downstream key: Tied',
			description: 'If the specified downstream keyer is tied, change style of the bank',
			options: {
				key: AtemDSKPicker(model),
			},
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }): boolean => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))
				return !!dsk?.properties?.tie
			},
		},
		[FeedbackId.DSKSource]: {
			type: 'boolean',
			name: 'Downstream key: Fill source',
			description: 'If the input specified is selected in the DSK specified, change style of the bank',
			options: {
				key: AtemDSKPicker(model),
				fill: AtemKeyFillSourcePicker(model, state.state),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(238, 238, 0),
			},
			callback: ({ options }): boolean => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))
				return dsk?.sources?.fillSource === options.getPlainNumber('fill')
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))

				if (dsk?.sources) {
					return {
						...options.getJson(),
						fill: dsk.sources.fillSource,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.DSKSourceVariables]: {
			type: 'boolean',
			name: 'Downstream key: Fill source from variables',
			description: 'If the input specified is selected in the DSK specified, change style of the bank',
			options: {
				key: {
					type: 'textinput',
					label: 'Key',
					id: 'key',
					default: '1',
					useVariables: true,
				},
				fill: {
					type: 'textinput',
					id: 'fill',
					label: 'Fill Source',
					default: '0',
					useVariables: true,
				},
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(238, 238, 0),
			},
			callback: async ({ options }) => {
				const key = (await options.getParsedNumber('key')) - 1
				const fill = await options.getParsedNumber('fill')

				const dsk = getDSK(state.state, key)
				return dsk?.sources?.fillSource === fill
			},
			learn: async ({ options }) => {
				const key = (await options.getParsedNumber('key')) - 1

				const dsk = getDSK(state.state, key)

				if (dsk?.sources) {
					return {
						...options.getJson(),
						fill: dsk.sources.fillSource + '',
					}
				} else {
					return undefined
				}
			},
		},
	}
}
