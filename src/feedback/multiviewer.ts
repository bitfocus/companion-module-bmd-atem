import { AtemMultiviewSourcePicker, AtemMultiviewWindowPicker, AtemMultiviewerPicker } from '../input.js'
import type { ModelSpec } from '../models/index.js'
import { FeedbackId } from './FeedbackId.js'
import { assertNever, CompanionFeedbackDefinitions, DropdownChoice } from '@companion-module/base'
import { getMultiviewer, getMultiviewerWindow, type StateWrapper } from '../state.js'
import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'

type MultiviewerQuadrantState = 'single' | 'quad' | 'ignore'

const ChoicesMultiviewerQuadrantState: DropdownChoice<MultiviewerQuadrantState>[] = [
	{ id: 'ignore', label: 'Ignored' },
	{ id: 'single', label: 'Single' },
	{ id: 'quad', label: 'Quad' },
]

export type AtemMultiviewerFeedbacks = {
	[FeedbackId.MVSource]: {
		type: 'boolean'
		options: {
			multiViewerId: number
			windowIndex: number
			source: number
		}
	}
	[FeedbackId.MultiviewerLayout]: {
		type: 'boolean'
		options: {
			multiViewerId: number
			topLeft: MultiviewerQuadrantState
			topRight: MultiviewerQuadrantState
			bottomLeft: MultiviewerQuadrantState
			bottomRight: MultiviewerQuadrantState
		}
	}
}

export function createMultiviewerFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemMultiviewerFeedbacks> {
	if (!model.MVs) {
		return {
			[FeedbackId.MVSource]: undefined,
			[FeedbackId.MultiviewerLayout]: undefined,
		}
	}
	return {
		[FeedbackId.MVSource]: {
			type: 'boolean',
			name: 'Multiviewer: Window source',
			description: 'If the specified MV window is set to the specified source, change style of the bank',
			options: convertOptionsFields({
				multiViewerId: AtemMultiviewerPicker(model),
				windowIndex: AtemMultiviewWindowPicker(model),
				source: AtemMultiviewSourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const window = getMultiviewerWindow(state.state, options.multiViewerId - 1, options.windowIndex - 1)
				return window?.source === options.source
			},
			learn: ({ options }) => {
				const window = getMultiviewerWindow(state.state, options.multiViewerId - 1, options.windowIndex - 1)

				if (window) {
					return {
						source: window.source,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.MultiviewerLayout]: {
			type: 'boolean',
			name: 'Multiviewer: Layout',
			options: convertOptionsFields({
				multiViewerId: AtemMultiviewerPicker(model),
				topLeft: {
					id: 'topLeft',
					type: 'dropdown',
					label: 'Top left',
					choices: ChoicesMultiviewerQuadrantState,
					default: 'ignore',
				},
				topRight: {
					id: 'topRight',
					type: 'dropdown',
					label: 'Top right',
					choices: ChoicesMultiviewerQuadrantState,
					default: 'ignore',
				},
				bottomLeft: {
					id: 'bottomLeft',
					type: 'dropdown',
					label: 'Bottom left',
					choices: ChoicesMultiviewerQuadrantState,
					default: 'ignore',
				},
				bottomRight: {
					id: 'bottomRight',
					type: 'dropdown',
					label: 'Bottom right',
					choices: ChoicesMultiviewerQuadrantState,
					default: 'ignore',
				},
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: async ({ options }) => {
				const multiViewerId = options.multiViewerId - 1

				const mv = getMultiviewer(state.state, multiViewerId)
				const layout = mv?.properties?.layout ?? Enums.MultiViewerLayout.Default

				const checkMatches = (selected: MultiviewerQuadrantState, value: Enums.MultiViewerLayout) => {
					switch (selected) {
						case 'ignore':
							return true
						case 'single':
							return (layout & value) == 0
						case 'quad':
							return (layout & value) > 0
						default:
							assertNever(selected)
							return false
					}
				}

				return (
					checkMatches(options.topLeft, Enums.MultiViewerLayout.TopLeftSmall) &&
					checkMatches(options.topRight, Enums.MultiViewerLayout.TopRightSmall) &&
					checkMatches(options.bottomLeft, Enums.MultiViewerLayout.BottomLeftSmall) &&
					checkMatches(options.bottomRight, Enums.MultiViewerLayout.BottomRightSmall)
				)
			},
			learn: async ({ options }) => {
				const multiViewerId = options.multiViewerId - 1

				const mv = getMultiviewer(state.state, multiViewerId)

				if (mv?.properties) {
					const layout = mv.properties.layout

					const getState = (value: Enums.MultiViewerLayout) => (layout & value ? 'quad' : 'single')

					return {
						topLeft: getState(Enums.MultiViewerLayout.TopLeftSmall),
						topRight: getState(Enums.MultiViewerLayout.TopRightSmall),
						bottomLeft: getState(Enums.MultiViewerLayout.BottomLeftSmall),
						bottomRight: getState(Enums.MultiViewerLayout.BottomRightSmall),
					}
				} else {
					return undefined
				}
			},
		},
	}
}
