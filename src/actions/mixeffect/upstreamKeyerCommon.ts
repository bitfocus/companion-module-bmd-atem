import { Enums, type Atem } from 'atem-connection'
import {
	AtemKeyCutSourcePicker,
	AtemKeyFillSourcePicker,
	AtemMEPicker,
	AtemUSKMaskPropertiesPickers,
	AtemUSKFlyKeyPropertiesPickers,
	AtemUSKFlyKeyPropertiesVariablesPickers,
	AtemUSKPicker,
	AtemUpstreamKeyerTypePicker,
} from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../ActionId.js'
import type { MyActionDefinitions } from '../types.js'
import { CHOICES_KEYTRANS, type TrueFalseToggle } from '../../choices.js'
import { getUSK, type StateWrapper } from '../../state.js'
import type {
	UpstreamKeyerTypeSettings,
	UpstreamKeyerDVEBase,
	UpstreamKeyerMaskSettings,
} from 'atem-connection/dist/state/video/upstreamKeyers.js'

export interface AtemUpstreamKeyerCommonActions {
	[ActionId.USKType]: {
		mixeffect: number
		key: number
		type: Enums.MixEffectKeyType
	}
	[ActionId.USKSource]: {
		mixeffect: number
		key: number
		fill: number
		cut: number
	}
	[ActionId.USKSourceVariables]: {
		mixeffect: string
		key: string
		fill: string
		cut: string
	}
	[ActionId.USKOnAir]: {
		mixeffect: number
		key: number
		onair: TrueFalseToggle
	}
	[ActionId.USKMaskLumaChromaPattern]: {
		mixeffect: number
		key: number

		properties: Array<'maskEnabled' | 'maskTop' | 'maskBottom' | 'maskLeft' | 'maskRight'>
		maskEnabled: boolean
		maskTop: number
		maskBottom: number
		maskLeft: number
		maskRight: number
	}
	[ActionId.USKFlyKeyLumaChromaPattern]: {
		mixeffect: number
		key: number

		properties: Array<'flyEnabled' | 'positionX' | 'positionY' | 'sizeX' | 'sizeY'>
		flyEnabled: boolean
		positionX: number
		positionY: number
		sizeX: number
		sizeY: number
	}
	[ActionId.USKFlyKeyLumaChromaPatternVariables]: {
		mixeffect: string
		key: string

		properties: Array<'flyEnabled' | 'positionX' | 'positionY' | 'sizeX' | 'sizeY'>
		flyEnabled: string
		positionX: string
		positionY: string
		sizeX: string
		sizeY: string
	}
}

export function createUpstreamKeyerCommonActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemUpstreamKeyerCommonActions> {
	if (!model.USKs) {
		return {
			[ActionId.USKSource]: undefined,
			[ActionId.USKType]: undefined,
			[ActionId.USKSourceVariables]: undefined,
			[ActionId.USKOnAir]: undefined,
			[ActionId.USKMaskLumaChromaPattern]: undefined,
			[ActionId.USKFlyKeyLumaChromaPattern]: undefined,
			[ActionId.USKFlyKeyLumaChromaPatternVariables]: undefined,
		}
	}

	return {
		[ActionId.USKSource]: {
			name: 'Upstream key: Set inputs',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				fill: AtemKeyFillSourcePicker(model, state.state),
				cut: AtemKeyCutSourcePicker(model, state.state),
			},
			callback: async ({ options }) => {
				await Promise.all([
					atem?.setUpstreamKeyerFillSource(
						options.getPlainNumber('fill'),
						options.getPlainNumber('mixeffect'),
						options.getPlainNumber('key'),
					),
					atem?.setUpstreamKeyerCutSource(
						options.getPlainNumber('cut'),
						options.getPlainNumber('mixeffect'),
						options.getPlainNumber('key'),
					),
				])
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))

				if (usk) {
					return {
						...options.getJson(),
						cut: usk.cutSource,
						fill: usk.fillSource,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKType]: {
			name: 'Upstream key: Set type',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				type: AtemUpstreamKeyerTypePicker(),
			},
			callback: async ({ options }) => {
				await atem?.setUpstreamKeyerType(
					{
						mixEffectKeyType: options.getPlainNumber('type'),
					},
					options.getPlainNumber('mixeffect'),
					options.getPlainNumber('key'),
				)
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))

				if (usk) {
					return {
						...options.getJson(),
						type: usk.mixEffectKeyType,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKSourceVariables]: {
			name: 'Upstream key: Set inputs from variables',
			options: {
				mixeffect: {
					type: 'textinput',
					id: 'mixeffect',
					label: 'M/E',
					default: '1',
					useVariables: true,
				},
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
				const mixeffect = (await options.getParsedNumber('mixeffect')) - 1
				const key = (await options.getParsedNumber('key')) - 1
				const fill = await options.getParsedNumber('fill')
				const cut = await options.getParsedNumber('cut')

				if (isNaN(mixeffect) || isNaN(key) || isNaN(fill) || isNaN(cut)) return

				await Promise.all([
					atem?.setUpstreamKeyerFillSource(fill, mixeffect, key),
					atem?.setUpstreamKeyerCutSource(cut, mixeffect, key),
				])
			},
			learn: async ({ options }) => {
				const mixeffect = (await options.getParsedNumber('mixeffect')) - 1
				const key = (await options.getParsedNumber('key')) - 1

				const usk = getUSK(state.state, mixeffect, key)

				if (usk) {
					return {
						...options.getJson(),
						cut: usk.cutSource + '',
						fill: usk.fillSource + '',
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKOnAir]: {
			name: 'Upstream key: Set OnAir',
			options: {
				onair: {
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: CHOICES_KEYTRANS,
				},
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
			},
			callback: async ({ options }) => {
				const meIndex = options.getPlainNumber('mixeffect')
				const keyIndex = options.getPlainNumber('key')
				if (options.getPlainString('onair') === 'toggle') {
					const usk = getUSK(state.state, meIndex, keyIndex)
					await atem?.setUpstreamKeyerOnAir(!usk?.onAir, meIndex, keyIndex)
				} else {
					await atem?.setUpstreamKeyerOnAir(options.getPlainString('onair') === 'true', meIndex, keyIndex)
				}
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))

				if (usk) {
					return {
						...options.getJson(),
						onair: usk.onAir ? 'true' : 'false',
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKMaskLumaChromaPattern]: {
			name: 'Upstream key: Set Mask (Luma, Chroma, Pattern)',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				...AtemUSKMaskPropertiesPickers(),
			},
			callback: async ({ options }) => {
				const keyId = options.getPlainNumber('key')
				const mixEffectId = options.getPlainNumber('mixeffect')
				const newProps: Partial<UpstreamKeyerMaskSettings> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('maskEnabled')) {
						newProps.maskEnabled = options.getPlainBoolean('maskEnabled')
					}
					if (props.includes('maskTop')) {
						newProps.maskTop = options.getPlainNumber('maskTop') * 1000
					}
					if (props.includes('maskBottom')) {
						newProps.maskBottom = options.getPlainNumber('maskBottom') * 1000
					}
					if (props.includes('maskLeft')) {
						newProps.maskLeft = options.getPlainNumber('maskLeft') * 1000
					}
					if (props.includes('maskRight')) {
						newProps.maskRight = options.getPlainNumber('maskRight') * 1000
					}
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerMaskSettings(newProps, mixEffectId, keyId)
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))

				if (usk?.maskSettings) {
					return {
						...options.getJson(),
						maskEnabled: usk.maskSettings.maskEnabled,
						maskTop: usk.maskSettings.maskTop / 1000,
						maskBottom: usk.maskSettings.maskBottom / 1000,
						maskLeft: usk.maskSettings.maskLeft / 1000,
						maskRight: usk.maskSettings.maskRight / 1000,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKFlyKeyLumaChromaPattern]: {
			name: 'Upstream key: Set Flying Key (Luma, Chroma, Pattern)',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				...AtemUSKFlyKeyPropertiesPickers(),
			},
			callback: async ({ options }) => {
				const keyId = options.getPlainNumber('key')
				const mixEffectId = options.getPlainNumber('mixeffect')
				const newUSKTypeProps: Partial<UpstreamKeyerTypeSettings> = {}
				const newProps: Partial<UpstreamKeyerDVEBase> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('flyEnabled')) {
						newUSKTypeProps.flyEnabled = options.getPlainBoolean('flyEnabled')
					}
					if (props.includes('positionX')) {
						newProps.positionX = options.getPlainNumber('positionX') * 1000
					}
					if (props.includes('positionY')) {
						newProps.positionY = options.getPlainNumber('positionY') * 1000
					}
					if (props.includes('sizeX')) {
						newProps.sizeX = options.getPlainNumber('sizeX') * 1000
					}
					if (props.includes('sizeY')) {
						newProps.sizeY = options.getPlainNumber('sizeY') * 1000
					}
				}

				if (Object.keys(newProps).length === 0 || Object.keys(newUSKTypeProps).length === 0) return

				await atem?.setUpstreamKeyerDVESettings(newProps, mixEffectId, keyId)
				await atem?.setUpstreamKeyerType(newUSKTypeProps, mixEffectId, keyId)
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))

				if (usk?.dveSettings) {
					return {
						...options.getJson(),
						flyEnabled: usk.flyEnabled,
						positionX: usk.dveSettings.positionX / 1000,
						positionY: usk.dveSettings.positionY / 1000,
						sizeX: usk.dveSettings.sizeX / 1000,
						sizeY: usk.dveSettings.sizeY / 1000,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKFlyKeyLumaChromaPatternVariables]: {
			name: 'Upstream key: Set Flying Key (Luma, Chroma, Pattern) from variables',
			options: {
				mixeffect: {
					type: 'textinput',
					id: 'mixeffect',
					label: 'M/E',
					default: '1',
					useVariables: true,
				},
				key: {
					type: 'textinput',
					label: 'Key',
					id: 'key',
					default: '1',
					useVariables: true,
				},
				...AtemUSKFlyKeyPropertiesVariablesPickers(),
			},
			callback: async ({ options }) => {
				const mixEffectId = (await options.getParsedNumber('mixeffect')) - 1
				const keyId = (await options.getParsedNumber('key')) - 1
				const newUSKTypeProps: Partial<UpstreamKeyerTypeSettings> = {}
				const newProps: Partial<UpstreamKeyerDVEBase> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('flyEnabled')) {
						newUSKTypeProps.flyEnabled = await options.getParsedBoolean('flyEnabled')
					}
					if (props.includes('positionX')) {
						newProps.positionX = (await options.getParsedNumber('positionX')) * 1000
					}
					if (props.includes('positionY')) {
						newProps.positionY = (await options.getParsedNumber('positionY')) * 1000
					}
					if (props.includes('sizeX')) {
						newProps.sizeX = (await options.getParsedNumber('sizeX')) * 1000
					}
					if (props.includes('sizeY')) {
						newProps.sizeY = (await options.getParsedNumber('sizeY')) * 1000
					}
				}

				if (isNaN(mixEffectId) || isNaN(keyId)) return
				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerDVESettings(newProps, mixEffectId, keyId)

				if (Object.keys(newUSKTypeProps).length !== 0) {
					await atem?.setUpstreamKeyerType(newUSKTypeProps, mixEffectId, keyId)
				}
			},
			learn: async ({ options }) => {
				const mixEffectId = (await options.getParsedNumber('mixeffect')) - 1
				const keyId = (await options.getParsedNumber('key')) - 1
				const usk = getUSK(state.state, mixEffectId, keyId)

				if (usk?.dveSettings) {
					return {
						...options.getJson(),
						flyEnabled: usk.flyEnabled + '',
						positionX: usk.dveSettings.positionX / 1000 + '',
						positionY: usk.dveSettings.positionY / 1000 + '',
						sizeX: usk.dveSettings.sizeX / 1000 + '',
						sizeY: usk.dveSettings.sizeY / 1000 + '',
					}
				} else {
					return undefined
				}
			},
		},
	}
}
