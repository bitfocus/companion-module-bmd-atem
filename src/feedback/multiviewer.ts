import { AtemMultiviewSourcePicker, AtemMultiviewWindowPicker, AtemMultiviewerPicker } from '../input.js'
import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './FeedbackId.js'
import { combineRgb } from '@companion-module/base'
import { getMultiviewerWindow, type StateWrapper } from '../state.js'

export interface AtemMultiviewerFeedbacks {
	[FeedbackId.MVSource]: {
		multiViewerId: number
		windowIndex: number
		source: number
	}
	[FeedbackId.MVSourceVariables]: {
		multiViewerId: string
		windowIndex: string
		source: string
	}
}

export function createMultiviewerFeedbacks(
	model: ModelSpec,
	state: StateWrapper
): MyFeedbackDefinitions<AtemMultiviewerFeedbacks> {
	if (!model.MVs) {
		return {
			[FeedbackId.MVSource]: undefined,
			[FeedbackId.MVSourceVariables]: undefined,
		}
	}
	return {
		[FeedbackId.MVSource]: {
			type: 'boolean',
			name: 'Multiviewer: Window source',
			description: 'If the specified MV window is set to the specified source, change style of the bank',
			options: {
				multiViewerId: AtemMultiviewerPicker(model),
				windowIndex: AtemMultiviewWindowPicker(model),
				source: AtemMultiviewSourcePicker(model, state.state),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const window = getMultiviewerWindow(
					state.state,
					options.getPlainNumber('multiViewerId'),
					options.getPlainNumber('windowIndex')
				)
				return window?.source === options.getPlainNumber('source')
			},
			learn: ({ options }) => {
				const window = getMultiviewerWindow(
					state.state,
					options.getPlainNumber('multiViewerId'),
					options.getPlainNumber('windowIndex')
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
		[FeedbackId.MVSourceVariables]: {
			type: 'boolean',
			name: 'Multiviewer: Window source from variables',
			description: 'If the specified MV window is set to the specified source, change style of the bank',
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
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: async ({ options }) => {
				const multiViewerId = (await options.getParsedNumber('multiViewerId')) - 1
				const windowIndex = (await options.getParsedNumber('windowIndex')) - 1
				const source = await options.getParsedNumber('source')

				const window = getMultiviewerWindow(state.state, multiViewerId, windowIndex)
				return window?.source === source
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
