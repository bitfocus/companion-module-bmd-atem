import { type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import { CHOICES_KEYTRANS, CHOICES_ON_OFF_TOGGLE, GetDSKIdChoices, type TrueFalseToggle } from '../choices.js'
import type { DownstreamKeyerMask, DownstreamKeyerGeneral } from 'atem-connection/dist/state/video/downstreamKeyers.js'
import {
	AtemDSKPicker,
	AtemKeyFillSourcePicker,
	AtemKeyCutSourcePicker,
	AtemRatePicker,
	AtemDSKMaskPropertiesPickers,
	AtemDSKPreMultipliedKeyPropertiesPickers,
} from '../input.js'
import { getDSK, type StateWrapper } from '../state.js'

export interface AtemDownstreamKeyerActions {
	[ActionId.DSKSource]: {
		key: number
		fill: number
		cut: number
	}
	[ActionId.DSKSourceVariables]: {
		key: string
		fill: string
		cut: string
	}
	[ActionId.DSKRate]: {
		key: number
		rate: number
	}
	[ActionId.DSKMask]: {
		key: number

		properties: Array<'maskEnabled' | 'maskTop' | 'maskBottom' | 'maskLeft' | 'maskRight'>
		maskEnabled: boolean
		maskTop: number
		maskBottom: number
		maskLeft: number
		maskRight: number
	}
	[ActionId.DSKPreMultipliedKey]: {
		key: number

		properties: Array<'preMultiply' | 'clip' | 'gain' | 'invert'>
		preMultiply: boolean
		clip: number
		gain: number
		invert: boolean
	}
	[ActionId.DSKAuto]: {
		downstreamKeyerId: number
	}
	[ActionId.DSKOnAir]: {
		key: number
		onair: TrueFalseToggle
	}
	[ActionId.DSKTie]: {
		key: number
		state: TrueFalseToggle
	}
}

export function createDownstreamKeyerActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemDownstreamKeyerActions> {
	if (!model.DSKs) {
		return {
			[ActionId.DSKSource]: undefined,
			[ActionId.DSKSourceVariables]: undefined,
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
			options: {
				key: AtemDSKPicker(model),
				fill: AtemKeyFillSourcePicker(model, state.state),
				cut: AtemKeyCutSourcePicker(model, state.state),
			},
			callback: async ({ options }) => {
				await Promise.all([
					atem?.setDownstreamKeyFillSource(options.getPlainNumber('fill'), options.getPlainNumber('key')),
					atem?.setDownstreamKeyCutSource(options.getPlainNumber('cut'), options.getPlainNumber('key')),
				])
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))

				if (dsk?.sources) {
					return {
						...options.getJson(),
						fill: dsk.sources.fillSource,
						cut: dsk.sources.cutSource,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DSKSourceVariables]: {
			name: 'Downstream key: Set inputs from variables',
			options: {
				key: {
					type: 'textinput',
					label: 'Key',
					id: 'key',
					default: '1',
					useVariables: true,
				},
				fill: {
					type: 'textinput',
					id: 'fill',
					label: 'Fill Source',
					default: '0',
					useVariables: true,
				},
				cut: {
					type: 'textinput',
					id: 'cut',
					label: 'Key Source',
					default: '0',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const key = (await options.getParsedNumber('key')) - 1
				const fill = await options.getParsedNumber('fill')
				const cut = await options.getParsedNumber('cut')

				if (isNaN(key) || isNaN(fill) || isNaN(cut)) return

				await Promise.all([atem?.setDownstreamKeyFillSource(fill, key), atem?.setDownstreamKeyCutSource(cut, key)])
			},
			learn: async ({ options }) => {
				const key = (await options.getParsedNumber('key')) - 1

				const dsk = getDSK(state.state, key)

				if (dsk?.sources) {
					return {
						...options.getJson(),
						fill: dsk.sources.fillSource + '',
						cut: dsk.sources.cutSource + '',
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DSKRate]: {
			name: 'Downstream key: Set Rate',
			options: {
				key: AtemDSKPicker(model),
				rate: AtemRatePicker('Rate'),
			},
			callback: async ({ options }) => {
				await atem?.setDownstreamKeyRate(options.getPlainNumber('rate'), options.getPlainNumber('key'))
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))

				if (dsk?.properties) {
					return {
						...options.getJson(),
						rate: dsk.properties.rate,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DSKMask]: {
			name: 'Downstream key: Set Mask',
			options: {
				key: AtemDSKPicker(model),
				...AtemDSKMaskPropertiesPickers(),
			},
			callback: async ({ options }) => {
				const keyId = options.getPlainNumber('key')
				const newProps: Partial<DownstreamKeyerMask> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('maskEnabled')) {
						newProps.enabled = options.getPlainBoolean('maskEnabled')
					}
					if (props.includes('maskTop')) {
						newProps.top = options.getPlainNumber('maskTop') * 1000
					}
					if (props.includes('maskBottom')) {
						newProps.bottom = options.getPlainNumber('maskBottom') * 1000
					}
					if (props.includes('maskLeft')) {
						newProps.left = options.getPlainNumber('maskLeft') * 1000
					}
					if (props.includes('maskRight')) {
						newProps.right = options.getPlainNumber('maskRight') * 1000
					}
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setDownstreamKeyMaskSettings(newProps, keyId)
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))

				if (dsk?.properties?.mask) {
					return {
						...options.getJson(),
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
			options: {
				key: AtemDSKPicker(model),
				...AtemDSKPreMultipliedKeyPropertiesPickers(),
			},
			callback: async ({ options }) => {
				const keyId = options.getPlainNumber('key')
				const newProps: Partial<DownstreamKeyerGeneral> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('preMultiply')) {
						newProps.preMultiply = options.getPlainBoolean('preMultiply')
					}
					if (props.includes('clip')) {
						newProps.clip = options.getPlainNumber('clip') * 10
					}
					if (props.includes('gain')) {
						newProps.gain = options.getPlainNumber('gain') * 10
					}
					if (props.includes('invert')) {
						newProps.invert = options.getPlainBoolean('invert')
					}
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setDownstreamKeyGeneralProperties(newProps, keyId)
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))

				if (dsk?.properties) {
					return {
						...options.getJson(),
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
			options: {
				downstreamKeyerId: {
					type: 'dropdown',
					id: 'downstreamKeyerId',
					label: 'DSK',
					default: 0,
					choices: GetDSKIdChoices(model),
				},
			},
			callback: async ({ options }) => {
				await atem?.autoDownstreamKey(options.getPlainNumber('downstreamKeyerId'))
			},
		},
		[ActionId.DSKOnAir]: {
			name: 'Downstream key: Set OnAir',
			options: {
				onair: {
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: CHOICES_KEYTRANS,
				},
				key: AtemDSKPicker(model),
			},
			callback: async ({ options }) => {
				const keyIndex = options.getPlainNumber('key')
				if (options.getPlainString('onair') === 'toggle') {
					const dsk = getDSK(state.state, keyIndex)
					await atem?.setDownstreamKeyOnAir(!dsk?.onAir, keyIndex)
				} else {
					await atem?.setDownstreamKeyOnAir(options.getPlainString('onair') === 'true', keyIndex)
				}
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))

				if (dsk) {
					return {
						...options.getJson(),
						onair: dsk.onAir ? 'true' : 'false',
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DSKTie]: {
			name: 'Downstream key: Set Tied',
			options: {
				state: {
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'true',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
				key: AtemDSKPicker(model),
			},
			callback: async ({ options }) => {
				const keyIndex = options.getPlainNumber('key')
				if (options.getPlainString('state') === 'toggle') {
					const dsk = getDSK(state.state, keyIndex)
					await atem?.setDownstreamKeyTie(!dsk?.properties?.tie, keyIndex)
				} else {
					await atem?.setDownstreamKeyTie(options.getPlainString('state') === 'true', keyIndex)
				}
			},
			learn: ({ options }) => {
				const dsk = getDSK(state.state, options.getPlainNumber('key'))

				if (dsk?.properties) {
					return {
						...options.getJson(),
						state: dsk.properties.tie ? 'true' : 'false',
					}
				} else {
					return undefined
				}
			},
		},
	}
}
