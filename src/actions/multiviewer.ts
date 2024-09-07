import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import { getMultiviewer, getMultiviewerWindow, type StateWrapper } from '../state.js'
import { AtemMultiviewerPicker, AtemMultiviewWindowPicker, AtemMultiviewSourcePicker } from '../input.js'
import type { MyDropdownChoice } from '../common.js'
import { assertNever } from '@companion-module/base'

type MultiviewerQuadrantState = 'single' | 'quad' | 'ignore' | 'toggle'

const ChoicesMultiviewerQuadrantState: MyDropdownChoice<MultiviewerQuadrantState>[] = [
	{ id: 'ignore', label: 'Unchanged' },
	{ id: 'toggle', label: 'Toggle' },
	{ id: 'single', label: 'Single' },
	{ id: 'quad', label: 'Quad' },
]

export interface AtemMultiviewerActions {
	[ActionId.MultiviewerWindowSource]: {
		multiViewerId: number
		windowIndex: number
		source: number
	}
	[ActionId.MultiviewerWindowSourceVariables]: {
		multiViewerId: string
		windowIndex: string
		source: string
	}
	[ActionId.MultiviewerLayout]: {
		multiViewerId: string
		topLeft: MultiviewerQuadrantState
		topRight: MultiviewerQuadrantState
		bottomLeft: MultiviewerQuadrantState
		bottomRight: MultiviewerQuadrantState
	}
}

export function createMultiviewerActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemMultiviewerActions> {
	if (!model.MVs) {
		return {
			[ActionId.MultiviewerWindowSource]: undefined,
			[ActionId.MultiviewerWindowSourceVariables]: undefined,
			[ActionId.MultiviewerLayout]: undefined,
		}
	}
	return {
		[ActionId.MultiviewerWindowSource]: {
			name: 'Multiviewer: Change window source',
			options: {
				multiViewerId: AtemMultiviewerPicker(model),
				windowIndex: AtemMultiviewWindowPicker(model),
				source: AtemMultiviewSourcePicker(model, state.state),
			},
			callback: async ({ options }) => {
				await atem?.setMultiViewerWindowSource(
					options.getPlainNumber('source'),
					options.getPlainNumber('multiViewerId'),
					options.getPlainNumber('windowIndex'),
				)
			},
			learn: ({ options }) => {
				const window = getMultiviewerWindow(
					state.state,
					options.getPlainNumber('multiViewerId'),
					options.getPlainNumber('windowIndex'),
				)

				if (window) {
					return {
						...options.getJson(),
						source: window.source,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.MultiviewerWindowSourceVariables]: {
			name: 'Multiviewer: Change window source from variables',
			options: {
				multiViewerId: {
					type: 'textinput',
					id: 'multiViewerId',
					label: 'MV',
					default: '1',
					useVariables: true,
				},
				windowIndex: {
					type: 'textinput',
					id: 'windowIndex',
					label: 'Window #',
					default: '1',
					useVariables: true,
				},
				source: {
					type: 'textinput',
					id: 'source',
					label: 'Source',
					default: '1',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const multiViewerId = (await options.getParsedNumber('multiViewerId')) - 1
				const windowIndex = (await options.getParsedNumber('windowIndex')) - 1
				const source = await options.getParsedNumber('source')

				if (isNaN(multiViewerId) || isNaN(windowIndex) || isNaN(source)) return

				await atem?.setMultiViewerWindowSource(source, multiViewerId, windowIndex)
			},
			learn: async ({ options }) => {
				const multiViewerId = (await options.getParsedNumber('multiViewerId')) - 1
				const windowIndex = (await options.getParsedNumber('windowIndex')) - 1

				const window = getMultiviewerWindow(state.state, multiViewerId, windowIndex)

				if (window) {
					return {
						...options.getJson(),
						source: window.source + '',
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.MultiviewerLayout]: {
			name: 'Multiviewer: Change layout',
			options: {
				multiViewerId: {
					type: 'textinput',
					id: 'multiViewerId',
					label: 'MV',
					default: '1',
					useVariables: true,
				},
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
			},
			callback: async ({ options }) => {
				const multiViewerId = (await options.getParsedNumber('multiViewerId')) - 1

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

				updateLayout(options.getPlainString('topLeft'), Enums.MultiViewerLayout.TopLeftSmall)
				updateLayout(options.getPlainString('topRight'), Enums.MultiViewerLayout.TopRightSmall)
				updateLayout(options.getPlainString('bottomLeft'), Enums.MultiViewerLayout.BottomLeftSmall)
				updateLayout(options.getPlainString('bottomRight'), Enums.MultiViewerLayout.BottomRightSmall)

				if (isNaN(multiViewerId) || isNaN(layout)) return

				await atem?.setMultiViewerProperties({ layout }, multiViewerId)
			},
			learn: async ({ options }) => {
				const multiViewerId = (await options.getParsedNumber('multiViewerId')) - 1

				const mv = getMultiviewer(state.state, multiViewerId)

				if (mv?.properties) {
					const layout = mv.properties.layout

					const getState = (value: Enums.MultiViewerLayout) => (layout & value ? 'quad' : 'single')

					return {
						...options.getJson(),
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
