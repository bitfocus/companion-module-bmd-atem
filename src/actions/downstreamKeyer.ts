import { type Atem } from 'atem-connection'
import { convertOptionsFields, WithDropdownPropertiesPicker } from '../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import { CHOICES_KEYTRANS, CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../choices.js'
import type { DownstreamKeyerMask, DownstreamKeyerGeneral } from 'atem-connection/dist/state/video/downstreamKeyers.js'
import { getDSK, type StateWrapper } from '../state.js'
import { AtemRatePicker, MaskPropertiesPickers } from '../options/common.js'
import { AtemDSKPicker, AtemDSKPreMultipliedKeyPropertiesPickers } from '../options/downstreamKeyer.js'
import { AtemKeyFillSourcePicker, AtemKeyCutSourcePicker } from '../options/commonKeyer.js'

export type AtemDownstreamKeyerActions = {
	[ActionId.DSKSource]: {
		options: {
			key: number
			fill: number
			cut: number
		}
	}
	[ActionId.DSKRate]: {
		options: {
			key: number
			rate: number
		}
	}
	[ActionId.DSKMask]: {
		options: {
			key: number

			properties: Array<'maskEnabled' | 'maskTop' | 'maskBottom' | 'maskLeft' | 'maskRight'>
			maskEnabled: boolean
			maskTop: number
			maskBottom: number
			maskLeft: number
			maskRight: number
		}
	}
	[ActionId.DSKPreMultipliedKey]: {
		options: {
			key: number

			properties: Array<'preMultiply' | 'clip' | 'gain' | 'invert'>
			preMultiply: boolean
			clip: number
			gain: number
			invert: boolean
		}
	}
	[ActionId.DSKAuto]: {
		options: {
			downstreamKeyerId: number
		}
	}
	[ActionId.DSKOnAir]: {
		options: {
			key: number
			onair: TrueFalseToggle
		}
	}
	[ActionId.DSKTie]: {
		options: {
			key: number
			state: TrueFalseToggle
		}
	}
}

export function createDownstreamKeyerActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemDownstreamKeyerActions> {
	if (!model.DSKs) {
		return {
			[ActionId.DSKSource]: undefined,
			[ActionId.DSKRate]: undefined,
			[ActionId.DSKMask]: undefined,
			[ActionId.DSKPreMultipliedKey]: undefined,
			[ActionId.DSKAuto]: undefined,
			[ActionId.DSKOnAir]: undefined,
			[ActionId.DSKTie]: undefined,
		}
	}
	return {
		[ActionId.DSKSource]: {
			name: 'Downstream key: Set inputs',
			options: convertOptionsFields({
				key: AtemDSKPicker(model, 'key'),
				fill: AtemKeyFillSourcePicker(model, state.state),
				cut: AtemKeyCutSourcePicker(model, state.state),
			}),
			callback: async ({ options }) => {
				await Promise.all([
					atem?.setDownstreamKeyFillSource(options.fill, options.key - 1),
					atem?.setDownstreamKeyCutSource(options.cut, options.key - 1),
				])
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.key - 1)

				if (dsk?.sources) {
					return {
						fill: dsk.sources.fillSource,
						cut: dsk.sources.cutSource,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DSKRate]: {
			name: 'Downstream key: Set Rate',
			options: convertOptionsFields({
				key: AtemDSKPicker(model, 'key'),
				rate: AtemRatePicker('Rate'),
			}),
			callback: async ({ options }) => {
				await atem?.setDownstreamKeyRate(options.rate, options.key - 1)
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.key - 1)

				if (dsk?.properties) {
					return {
						rate: dsk.properties.rate,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DSKMask]: {
			name: 'Downstream key: Set Mask',
			options: convertOptionsFields({
				key: AtemDSKPicker(model, 'key'),
				...WithDropdownPropertiesPicker(MaskPropertiesPickers(16, 9, false)),
			}),
			callback: async ({ options }) => {
				const keyId = options.key - 1
				const newProps: Partial<DownstreamKeyerMask> = {}

				const props = options.properties
				if (props && Array.isArray(props)) {
					if (props.includes('maskEnabled')) {
						newProps.enabled = options.maskEnabled
					}
					if (props.includes('maskTop')) {
						newProps.top = options.maskTop * 1000
					}
					if (props.includes('maskBottom')) {
						newProps.bottom = options.maskBottom * 1000
					}
					if (props.includes('maskLeft')) {
						newProps.left = options.maskLeft * 1000
					}
					if (props.includes('maskRight')) {
						newProps.right = options.maskRight * 1000
					}
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setDownstreamKeyMaskSettings(newProps, keyId)
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.key - 1)

				if (dsk?.properties?.mask) {
					return {
						maskEnabled: dsk.properties.mask.enabled,
						maskTop: dsk.properties.mask.top / 1000,
						maskBottom: dsk.properties.mask.bottom / 1000,
						maskLeft: dsk.properties.mask.left / 1000,
						maskRight: dsk.properties.mask.right / 1000,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DSKPreMultipliedKey]: {
			name: 'Downstream key: Set Pre Multiplied Key',
			options: convertOptionsFields({
				key: AtemDSKPicker(model, 'key'),
				...AtemDSKPreMultipliedKeyPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const keyId = options.key - 1
				const newProps: Partial<DownstreamKeyerGeneral> = {}

				const props = options.properties
				if (props && Array.isArray(props)) {
					if (props.includes('preMultiply')) {
						newProps.preMultiply = options.preMultiply
					}
					if (props.includes('clip')) {
						newProps.clip = options.clip * 10
					}
					if (props.includes('gain')) {
						newProps.gain = options.gain * 10
					}
					if (props.includes('invert')) {
						newProps.invert = options.invert
					}
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setDownstreamKeyGeneralProperties(newProps, keyId)
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.key - 1)

				if (dsk?.properties) {
					return {
						preMultiply: dsk.properties.preMultiply,
						clip: dsk.properties.clip / 10,
						gain: dsk.properties.gain / 10,
						invert: dsk.properties.invert,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DSKAuto]: {
			name: 'Downstream key: Run AUTO Transition',
			options: convertOptionsFields({
				downstreamKeyerId: AtemDSKPicker(model, 'downstreamKeyerId'),
			}),
			callback: async ({ options }) => {
				await atem?.autoDownstreamKey(options.downstreamKeyerId - 1)
			},
		},
		[ActionId.DSKOnAir]: {
			name: 'Downstream key: Set OnAir',
			options: convertOptionsFields({
				key: AtemDSKPicker(model, 'key'),
				onair: {
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: CHOICES_KEYTRANS,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				const keyIndex = options.key - 1
				if (options.onair === 'toggle') {
					const dsk = getDSK(state.state, keyIndex)
					await atem?.setDownstreamKeyOnAir(!dsk?.onAir, keyIndex)
				} else {
					await atem?.setDownstreamKeyOnAir(options.onair === 'true', keyIndex)
				}
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.key - 1)

				if (dsk) {
					return {
						onair: dsk.onAir ? 'true' : 'false',
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DSKTie]: {
			name: 'Downstream key: Set Tied',
			options: convertOptionsFields({
				key: AtemDSKPicker(model, 'key'),
				state: {
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'true',
					choices: CHOICES_ON_OFF_TOGGLE,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				const keyIndex = options.key - 1
				if (options.state === 'toggle') {
					const dsk = getDSK(state.state, keyIndex)
					await atem?.setDownstreamKeyTie(!dsk?.properties?.tie, keyIndex)
				} else {
					await atem?.setDownstreamKeyTie(options.state === 'true', keyIndex)
				}
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.key - 1)

				if (dsk?.properties) {
					return {
						state: dsk.properties.tie ? 'true' : 'false',
					}
				} else {
					return undefined
				}
			},
		},
	}
}
