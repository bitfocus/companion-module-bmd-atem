import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import { getMultiviewer, getMultiviewerWindow, type StateWrapper } from '../state.js'
import { AtemMultiviewerPicker, AtemMultiviewWindowPicker, AtemMultiviewSourcePicker } from '../input.js'
import { convertOptionsFields } from '../common.js'
import { assertNever, CompanionActionDefinitions, DropdownChoice } from '@companion-module/base'

type MultiviewerQuadrantState = 'single' | 'quad' | 'ignore' | 'toggle'

const ChoicesMultiviewerQuadrantState: DropdownChoice<MultiviewerQuadrantState>[] = [
	{ id: 'ignore', label: 'Unchanged' },
	{ id: 'toggle', label: 'Toggle' },
	{ id: 'single', label: 'Single' },
	{ id: 'quad', label: 'Quad' },
]

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
			topLeft: MultiviewerQuadrantState
			topRight: MultiviewerQuadrantState
			bottomLeft: MultiviewerQuadrantState
			bottomRight: MultiviewerQuadrantState
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
			callback: async ({ options }) => {
				const multiViewerId = options.multiViewerId - 1

				const mv = getMultiviewer(state.state, multiViewerId)
				let layout: Enums.MultiViewerLayout = mv?.properties?.layout ?? Enums.MultiViewerLayout.Default

				const updateLayout = (selected: MultiviewerQuadrantState, value: Enums.MultiViewerLayout) => {
					if (selected === 'toggle') selected = layout & value ? 'single' : 'quad'

					switch (selected) {
						case 'ignore':
							break
						case 'single':
							layout = ~(~layout | value)
							break
						case 'quad':
							layout = layout | value
							break
						default:
							assertNever(selected)
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
