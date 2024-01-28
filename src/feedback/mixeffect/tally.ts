import { AtemMESourcePicker } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import type { MyFeedbackDefinitions } from '../types.js'
import { FeedbackId } from '../FeedbackId.js'
import { combineRgb } from '@companion-module/base'
import type { StateWrapper } from '../../state.js'
import { calculateTallyForInputId } from '../../util.js'
import { GetSourcesListForType, SourcesToChoices } from '../../choices.js'

export interface AtemTallyFeedbacks {
	[FeedbackId.ProgramTally]: {
		input: number
	}
	[FeedbackId.PreviewTally]: {
		input: number
	}
	[FeedbackId.AdvancedTally]: {
		inputIds: number[]
		input: number
	}
}

export function createTallyFeedbacks(model: ModelSpec, state: StateWrapper): MyFeedbackDefinitions<AtemTallyFeedbacks> {
	return {
		[FeedbackId.ProgramTally]: {
			type: 'boolean',
			name: 'Tally: Program',
			description: 'If the input specified has an active progam tally light, change style of the bank',
			options: {
				input: AtemMESourcePicker(model, state.state, 0),
			},
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }): boolean => {
				const source = state.tally[options.getPlainNumber('input')]
				return !!source?.program
			},
		},
		[FeedbackId.PreviewTally]: {
			type: 'boolean',
			name: 'Tally: Preview',
			description: 'If the input specified has an active preview tally light, change style of the bank',
			options: {
				input: AtemMESourcePicker(model, state.state, 0),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const source = state.tally[options.getPlainNumber('input')]
				return !!source?.preview
			},
		},
		[FeedbackId.AdvancedTally]: {
			type: 'boolean',
			name: 'Tally: Advanced',
			description: 'Check if the input specified is active in one of the selected outputs/mixes',
			options: {
				inputIds: {
					id: `inputIds`,
					label: `Mixes`,
					type: 'multidropdown',
					default: [10010],
					choices: SourcesToChoices(GetSourcesListForType(model, state.state, 'tally')),
				},
				input: AtemMESourcePicker(model, state.state, 0),
			},
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }): boolean => {
				const selectedInputIds = options.getRaw('inputIds') ?? []
				if (!Array.isArray(selectedInputIds)) return false

				const matchInputId = options.getPlainNumber('input')

				for (const inputId of selectedInputIds) {
					const cacheEntry = state.tallyCache.get(Number(inputId))
					if (cacheEntry && cacheEntry.lastVisibleInputs.includes(matchInputId)) {
						return true
					}
				}

				return false
			},
			subscribe: ({ id, options }): void => {
				const selectedInputIds = options.getRaw('inputIds') ?? []
				if (!Array.isArray(selectedInputIds)) return

				for (const inputId of selectedInputIds) {
					if (typeof inputId !== 'number') continue

					const cacheEntry = state.tallyCache.get(inputId)
					if (cacheEntry) {
						cacheEntry.referencedFeedbackIds.add(id)
					} else {
						state.tallyCache.set(inputId, {
							referencedFeedbackIds: new Set([id]),
							lastVisibleInputs: calculateTallyForInputId(state.state, inputId),
						})
					}
				}
			},
			unsubscribe: ({ id }): void => {
				for (const tally of state.tallyCache.values()) {
					tally.referencedFeedbackIds.delete(id)
				}
			},
		},
	}
}
