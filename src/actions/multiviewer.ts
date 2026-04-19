import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import { getMultiviewer, getMultiviewerWindow, type StateWrapper } from '../state.js'
import { convertOptionsFields } from '../options/util.js'
import { assertNever, type CompanionActionDefinitions, type JsonValue } from '@companion-module/base'
import {
	AtemMultiviewerQuadrantStatePicker,
	type MultiviewerQuadrantState,
	multiviewerQuadrantStateFromLayout,
	multiviewerQuadrantStateStringToState,
	AtemMultiviewerPicker,
	AtemMultiviewWindowPicker,
	AtemMultiviewSourcePicker,
} from '../options/multiviewer.js'

export type AtemMultiviewerActions = {
	[ActionId.MultiviewerWindowSource]: {
		options: {
			multiViewerId: number
			windowIndex: number
			source: number
		}
	}
	[ActionId.MultiviewerLayout]: {
		options: {
			multiViewerId: number
			topLeft: MultiviewerQuadrantState | JsonValue | undefined
			topRight: MultiviewerQuadrantState | JsonValue | undefined
			bottomLeft: MultiviewerQuadrantState | JsonValue | undefined
			bottomRight: MultiviewerQuadrantState | JsonValue | undefined
		}
	}
}

export function createMultiviewerActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemMultiviewerActions> {
	if (!model.MVs) {
		return {
			[ActionId.MultiviewerWindowSource]: undefined,
			[ActionId.MultiviewerLayout]: undefined,
		}
	}
	return {
		[ActionId.MultiviewerWindowSource]: {
			name: 'Multiviewer: Change window source',
			options: convertOptionsFields({
				multiViewerId: AtemMultiviewerPicker(model),
				windowIndex: AtemMultiviewWindowPicker(model),
				source: AtemMultiviewSourcePicker(model, state.state),
			}),
			callback: async ({ options }) => {
				await atem?.setMultiViewerWindowSource(options.source, options.multiViewerId - 1, options.windowIndex - 1)
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
		[ActionId.MultiviewerLayout]: {
			name: 'Multiviewer: Change layout',
			options: convertOptionsFields({
				multiViewerId: AtemMultiviewerPicker(model),
				topLeft: {
					id: 'topLeft',
					label: 'Top left',
					...AtemMultiviewerQuadrantStatePicker(true),
				},
				topRight: {
					id: 'topRight',
					label: 'Top right',
					...AtemMultiviewerQuadrantStatePicker(true),
				},
				bottomLeft: {
					id: 'bottomLeft',
					label: 'Bottom left',
					...AtemMultiviewerQuadrantStatePicker(true),
				},
				bottomRight: {
					id: 'bottomRight',
					label: 'Bottom right',
					...AtemMultiviewerQuadrantStatePicker(true),
				},
			}),
			callback: async ({ options }) => {
				const multiViewerId = options.multiViewerId - 1

				const mv = getMultiviewer(state.state, multiViewerId)
				let layout: Enums.MultiViewerLayout = mv?.properties?.layout ?? Enums.MultiViewerLayout.Default

				const updateLayout = (
					selected: MultiviewerQuadrantState | JsonValue | undefined,
					value: Enums.MultiViewerLayout,
				) => {
					let parsedSelected = multiviewerQuadrantStateStringToState(selected, true)
					if (parsedSelected === null) return

					if (parsedSelected === 'toggle') parsedSelected = layout & value ? 'single' : 'quad'

					switch (parsedSelected) {
						case 'ignore':
							break
						case 'single':
							layout = ~(~layout | value)
							break
						case 'quad':
							layout = layout | value
							break
						default:
							assertNever(parsedSelected)
							break
					}
				}

				updateLayout(options.topLeft, Enums.MultiViewerLayout.TopLeftSmall)
				updateLayout(options.topRight, Enums.MultiViewerLayout.TopRightSmall)
				updateLayout(options.bottomLeft, Enums.MultiViewerLayout.BottomLeftSmall)
				updateLayout(options.bottomRight, Enums.MultiViewerLayout.BottomRightSmall)

				if (isNaN(multiViewerId) || isNaN(layout)) return

				await atem?.setMultiViewerProperties({ layout }, multiViewerId)
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
