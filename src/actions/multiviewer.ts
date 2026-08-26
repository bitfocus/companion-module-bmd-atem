import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
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
	resolveMultiviewerIndex,
	AtemMultiviewerBorderColorPicker,
	multiviewerBorderColorFromOption,
	multiviewerBorderColorToOption,
} from '../options/multiviewer.js'
import { parseSourceIdRequired } from '../options/sources.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle, resolveTrueFalseToggle } from '../options/common.js'

export type AtemMultiviewerActions = {
	['setMvSource']: {
		options: {
			multiViewerId: number
			windowIndex: number
			source: JsonValue
		}
	}
	['multiviewerLayout']: {
		options: {
			multiViewerId: number
			topLeft: MultiviewerQuadrantState | JsonValue | undefined
			topRight: MultiviewerQuadrantState | JsonValue | undefined
			bottomLeft: MultiviewerQuadrantState | JsonValue | undefined
			bottomRight: MultiviewerQuadrantState | JsonValue | undefined
		}
	}
	['multiviewerWindowLabel']: {
		options: {
			multiViewerId: number
			windowIndex: number
			state: TrueFalseToggle
		}
	}
	['multiviewerWindowBorder']: {
		options: {
			multiViewerId: number
			windowIndex: number
			state: TrueFalseToggle
		}
	}
	['multiviewerBorderColor']: {
		options: {
			multiViewerId: number
			color: JsonValue
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
			['setMvSource']: undefined,
			['multiviewerLayout']: undefined,
			['multiviewerWindowLabel']: undefined,
			['multiviewerWindowBorder']: undefined,
			['multiviewerBorderColor']: undefined,
		}
	}
	// Some models have a multiviewer whose windows cannot be re-sourced, leaving no choices
	const sourcePicker = AtemMultiviewSourcePicker(model, state.state)

	return {
		['setMvSource']:
			sourcePicker.choices.length > 0
				? {
						name: 'Multiviewer: Change window source',
						options: convertOptionsFields({
							multiViewerId: AtemMultiviewerPicker(model),
							windowIndex: AtemMultiviewWindowPicker(model),
							source: sourcePicker,
						}),
						callback: async ({ options }) => {
							const source = parseSourceIdRequired(options.source)
							await atem?.setMultiViewerWindowSource(
								source,
								resolveMultiviewerIndex(model, options.multiViewerId),
								options.windowIndex - 1,
							)
						},
						learn: ({ options }) => {
							const window = getMultiviewerWindow(
								state.state,
								resolveMultiviewerIndex(model, options.multiViewerId),
								options.windowIndex - 1,
							)

							if (window) {
								return {
									source: window.source,
								}
							} else {
								return undefined
							}
						},
					}
				: undefined,
		['multiviewerLayout']: {
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
				const multiViewerId = resolveMultiviewerIndex(model, options.multiViewerId)

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
				const multiViewerId = resolveMultiviewerIndex(model, options.multiViewerId)

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
		['multiviewerWindowLabel']: model.multiviewerOverlay
			? {
					name: 'Multiviewer: Window label',
					options: convertOptionsFields({
						multiViewerId: AtemMultiviewerPicker(model),
						windowIndex: AtemMultiviewWindowPicker(model),
						state: {
							id: 'state',
							type: 'dropdown',
							label: 'Label',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					}),
					callback: async ({ options }) => {
						const multiViewerId = resolveMultiviewerIndex(model, options.multiViewerId)
						const window = getMultiviewerWindow(state.state, multiViewerId, options.windowIndex - 1)

						const labelVisible = resolveTrueFalseToggle(options.state, window?.overlayProperties?.labelVisible)

						await atem?.setMultiViewerWindowOverlayProperties({ labelVisible }, multiViewerId, options.windowIndex - 1)
					},
					learn: ({ options }) => {
						const window = getMultiviewerWindow(
							state.state,
							resolveMultiviewerIndex(model, options.multiViewerId),
							options.windowIndex - 1,
						)

						if (window?.overlayProperties) {
							return {
								state: window.overlayProperties.labelVisible ? 'true' : 'false',
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		['multiviewerWindowBorder']: model.multiviewerOverlay
			? {
					name: 'Multiviewer: Window border',
					options: convertOptionsFields({
						multiViewerId: AtemMultiviewerPicker(model),
						windowIndex: AtemMultiviewWindowPicker(model),
						state: {
							id: 'state',
							type: 'dropdown',
							label: 'Border',
							default: 'toggle',
							choices: CHOICES_ON_OFF_TOGGLE,
						},
					}),
					callback: async ({ options }) => {
						const multiViewerId = resolveMultiviewerIndex(model, options.multiViewerId)
						const window = getMultiviewerWindow(state.state, multiViewerId, options.windowIndex - 1)

						const borderVisible = resolveTrueFalseToggle(options.state, window?.overlayProperties?.borderVisible)

						await atem?.setMultiViewerWindowOverlayProperties({ borderVisible }, multiViewerId, options.windowIndex - 1)
					},
					learn: ({ options }) => {
						const window = getMultiviewerWindow(
							state.state,
							resolveMultiviewerIndex(model, options.multiViewerId),
							options.windowIndex - 1,
						)

						if (window?.overlayProperties) {
							return {
								state: window.overlayProperties.borderVisible ? 'true' : 'false',
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		['multiviewerBorderColor']: model.multiviewerOverlay
			? {
					name: 'Multiviewer: Border colour',
					options: convertOptionsFields({
						multiViewerId: AtemMultiviewerPicker(model),
						color: AtemMultiviewerBorderColorPicker(),
					}),
					callback: async ({ options }) => {
						const multiViewerId = resolveMultiviewerIndex(model, options.multiViewerId)

						await atem?.setMultiViewerBorderColor(multiviewerBorderColorFromOption(options.color), multiViewerId)
					},
					learn: ({ options }) => {
						const mv = getMultiviewer(state.state, resolveMultiviewerIndex(model, options.multiViewerId))

						if (mv?.borderColor) {
							return {
								color: multiviewerBorderColorToOption(mv.borderColor),
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
	}
}
