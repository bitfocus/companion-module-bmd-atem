import type { ModelSpec } from '../models/index.js'
import { FeedbackId } from './FeedbackId.js'
import { assertNever, CompanionFeedbackDefinitions, JsonValue } from '@companion-module/base'
import { getMultiviewer, getMultiviewerWindow, type StateWrapper } from '../state.js'
import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import {
	AtemMultiviewerQuadrantStatePicker,
	MultiviewerQuadrantState,
	multiviewerQuadrantStateFromLayout,
	multiviewerQuadrantStateStringToState,
	AtemMultiviewSourcePicker,
	AtemMultiviewWindowPicker,
	AtemMultiviewerPicker,
} from '../options/multiviewer.js'

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
			topLeft: MultiviewerQuadrantState | JsonValue | undefined
			topRight: MultiviewerQuadrantState | JsonValue | undefined
			bottomLeft: MultiviewerQuadrantState | JsonValue | undefined
			bottomRight: MultiviewerQuadrantState | JsonValue | undefined
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
					label: 'Top left',
					...AtemMultiviewerQuadrantStatePicker(false),
				},
				topRight: {
					id: 'topRight',
					label: 'Top right',
					...AtemMultiviewerQuadrantStatePicker(false),
				},
				bottomLeft: {
					id: 'bottomLeft',
					label: 'Bottom left',
					...AtemMultiviewerQuadrantStatePicker(false),
				},
				bottomRight: {
					id: 'bottomRight',
					label: 'Bottom right',
					...AtemMultiviewerQuadrantStatePicker(false),
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

				const checkMatches = (
					selected: MultiviewerQuadrantState | JsonValue | undefined,
					value: Enums.MultiViewerLayout,
				) => {
					const parsedSelected = multiviewerQuadrantStateStringToState(selected, true)
					if (parsedSelected === null) return false

					switch (parsedSelected) {
						case 'ignore':
							return true
						case 'single':
							return (layout & value) == 0
						case 'quad':
							return (layout & value) > 0
						case 'toggle':
							// Not valid here, so treat as false
							return false
						default:
							assertNever(parsedSelected)
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

					return {
						topLeft: multiviewerQuadrantStateFromLayout(layout, Enums.MultiViewerLayout.TopLeftSmall),
						topRight: multiviewerQuadrantStateFromLayout(layout, Enums.MultiViewerLayout.TopRightSmall),
						bottomLeft: multiviewerQuadrantStateFromLayout(layout, Enums.MultiViewerLayout.BottomLeftSmall),
						bottomRight: multiviewerQuadrantStateFromLayout(layout, Enums.MultiViewerLayout.BottomRightSmall),
					}
				} else {
					return undefined
				}
			},
		},
	}
}
