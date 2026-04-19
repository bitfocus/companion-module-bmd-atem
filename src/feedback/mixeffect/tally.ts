import { AtemMESourcePicker } from '../../options/mixEffect.js'
import { convertOptionsFields, SourcesToChoices } from '../../options/util.js'
import type { ModelSpec } from '../../models/index.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { StateWrapper } from '../../state.js'
import { calculateTallyForInputId } from '../../util.js'
import { GetSourcesListForType } from '../../options/sources.js'
import { isEqual } from 'lodash-es'

export type AtemTallyFeedbacks = {
	['program_tally']: {
		type: 'boolean'
		options: {
			input: number
		}
	}
	['preview_tally']: {
		type: 'boolean'
		options: {
			input: number
		}
	}
	['advanced_tally']: {
		type: 'boolean'
		options: {
			inputIds: number[]
			input: number
		}
	}
}

export function createTallyFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemTallyFeedbacks> {
	return {
		['program_tally']: {
			type: 'boolean',
			name: 'Tally: Program',
			options: convertOptionsFields({
				input: AtemMESourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0xffffff,
				bgcolor: 0xff0000,
			},
			callback: ({ options }): boolean => {
				const source = state.tally[options.input]
				return !!source?.program
			},
		},
		['preview_tally']: {
			type: 'boolean',
			name: 'Tally: Preview',
			options: convertOptionsFields({
				input: AtemMESourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: ({ options }): boolean => {
				const source = state.tally[options.input]
				return !!source?.preview
			},
		},
		['advanced_tally']: {
			type: 'boolean',
			name: 'Tally: Advanced',
			description: 'Check if the input specified is active in one of the selected outputs/mixes',
			options: convertOptionsFields({
				inputIds: {
					id: `inputIds`,
					label: `Mixes`,
					type: 'multidropdown',
					default: [10010],
					choices: SourcesToChoices(GetSourcesListForType(model, state.state, 'tally')),
					sortSelection: true,
				},
				input: AtemMESourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0xffffff,
				bgcolor: 0xff0000,
			},
			callback: ({ id, options, previousOptions }): boolean => {
				// Resubscribe if needed
				if (!previousOptions || !isEqual(previousOptions.inputIds, options.inputIds)) {
					// Remove old subscriptions
					for (const tally of state.tallyCache.values()) {
						tally.referencedFeedbackIds.delete(id)
					}

					const selectedInputIds = options.inputIds
					if (Array.isArray(selectedInputIds)) {
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
					}
				}

				const selectedInputIds = options.inputIds
				if (!Array.isArray(selectedInputIds)) return false

				const matchInputId = options.input

				for (const inputId of selectedInputIds) {
					const cacheEntry = state.tallyCache.get(Number(inputId))
					if (cacheEntry && cacheEntry.lastVisibleInputs.includes(matchInputId)) {
						return true
					}
				}

				return false
			},
			unsubscribe: ({ id }): void => {
				for (const tally of state.tallyCache.values()) {
					tally.referencedFeedbackIds.delete(id)
				}
			},
		},
	}
}
