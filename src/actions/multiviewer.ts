import { type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from '../actions.js'
import type { MyActionDefinitions } from './types.js'
import { getMultiviewerWindow, type StateWrapper } from '../state.js'
import { AtemMultiviewerPicker, AtemMultiviewWindowPicker, AtemMultiviewSourcePicker } from '../input.js'

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
	}
}
