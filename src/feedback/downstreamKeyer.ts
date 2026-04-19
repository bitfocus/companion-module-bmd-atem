import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { AtemKeyFillSourcePicker } from '../options/commonKeyer.js'
import { getDSK, type StateWrapper } from '../state.js'
import { AtemDSKPicker } from '../options/downstreamKeyer.js'

export type AtemDownstreamKeyerFeedbacks = {
	['dskOnAir']: {
		type: 'boolean'
		options: {
			key: number
		}
	}
	['dskTie']: {
		type: 'boolean'
		options: {
			key: number
		}
	}
	['dsk_source']: {
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
			['dskOnAir']: undefined,
			['dskTie']: undefined,
			['dsk_source']: undefined,
		}
	}
	return {
		['dskOnAir']: {
			type: 'boolean',
			name: 'Downstream key: OnAir',
			description: 'If the specified downstream keyer is onair, change style of the bank',
			options: convertOptionsFields({
				key: AtemDSKPicker(model, 'key'),
			}),
			defaultStyle: {
				color: 0xffffff,
				bgcolor: 0xff0000,
			},
			callback: ({ options }): boolean => {
				const dsk = getDSK(state.state, options.key - 1)
				return !!dsk?.onAir
			},
		},
		['dskTie']: {
			type: 'boolean',
			name: 'Downstream key: Tied',
			description: 'If the specified downstream keyer is tied, change style of the bank',
			options: convertOptionsFields({
				key: AtemDSKPicker(model, 'key'),
			}),
			defaultStyle: {
				color: 0xffffff,
				bgcolor: 0xff0000,
			},
			callback: ({ options }): boolean => {
				const dsk = getDSK(state.state, options.key - 1)
				return !!dsk?.properties?.tie
			},
		},
		['dsk_source']: {
			type: 'boolean',
			name: 'Downstream key: Fill source',
			description: 'If the input specified is selected in the DSK specified, change style of the bank',
			options: convertOptionsFields({
				key: AtemDSKPicker(model, 'key'),
				fill: AtemKeyFillSourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xeeee00,
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
