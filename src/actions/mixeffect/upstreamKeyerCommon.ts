import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
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
): CompanionActionDefinitions<AtemUpstreamKeyerCommonActions> {
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
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				fill: AtemKeyFillSourcePicker(model, state.state),
				cut: AtemKeyCutSourcePicker(model, state.state),
			}),
			callback: async ({ options }) => {
				await Promise.all([
					atem?.setUpstreamKeyerFillSource(options.fill, options.mixeffect, options.key),
					atem?.setUpstreamKeyerCutSource(options.cut, options.mixeffect, options.key),
				])
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect, options.key)

				if (usk) {
					return {
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
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				type: AtemUpstreamKeyerTypePicker(),
			}),
			callback: async ({ options }) => {
				await atem?.setUpstreamKeyerType(
					{
						mixEffectKeyType: options.type,
					},
					options.mixeffect,
					options.key,
				)
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect, options.key)

				if (usk) {
					return {
						type: usk.mixEffectKeyType,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKSourceVariables]: {
			name: 'Upstream key: Set inputs from variables',
			options: convertOptionsFields({
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
			}),
			callback: async ({ options }) => {
				const mixeffect = (await options.mixeffect) - 1
				const key = (await options.key) - 1
				const fill = await options.fill
				const cut = await options.cut

				if (isNaN(mixeffect) || isNaN(key) || isNaN(fill) || isNaN(cut)) return

				await Promise.all([
					atem?.setUpstreamKeyerFillSource(fill, mixeffect, key),
					atem?.setUpstreamKeyerCutSource(cut, mixeffect, key),
				])
			},
			learn: async ({ options }) => {
				const mixeffect = (await options.mixeffect) - 1
				const key = (await options.key) - 1

				const usk = getUSK(state.state, mixeffect, key)

				if (usk) {
					return {
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
			options: convertOptionsFields({
				onair: {
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: CHOICES_KEYTRANS,
				},
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
			}),
			callback: async ({ options }) => {
				const meIndex = options.mixeffect
				const keyIndex = options.key
				if (options.onair === 'toggle') {
					const usk = getUSK(state.state, meIndex, keyIndex)
					await atem?.setUpstreamKeyerOnAir(!usk?.onAir, meIndex, keyIndex)
				} else {
					await atem?.setUpstreamKeyerOnAir(options.onair === 'true', meIndex, keyIndex)
				}
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect, options.key)

				if (usk) {
					return {
						onair: usk.onAir ? 'true' : 'false',
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKMaskLumaChromaPattern]: {
			name: 'Upstream key: Set Mask (Luma, Chroma, Pattern)',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				...AtemUSKMaskPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const keyId = options.key
				const mixEffectId = options.mixeffect
				const newProps: Partial<UpstreamKeyerMaskSettings> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('maskEnabled')) {
						newProps.maskEnabled = options.maskEnabled
					}
					if (props.includes('maskTop')) {
						newProps.maskTop = options.maskTop * 1000
					}
					if (props.includes('maskBottom')) {
						newProps.maskBottom = options.maskBottom * 1000
					}
					if (props.includes('maskLeft')) {
						newProps.maskLeft = options.maskLeft * 1000
					}
					if (props.includes('maskRight')) {
						newProps.maskRight = options.maskRight * 1000
					}
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerMaskSettings(newProps, mixEffectId, keyId)
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect, options.key)

				if (usk?.maskSettings) {
					return {
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
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				...AtemUSKFlyKeyPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const keyId = options.key
				const mixEffectId = options.mixeffect
				const newUSKTypeProps: Partial<UpstreamKeyerTypeSettings> = {}
				const newProps: Partial<UpstreamKeyerDVEBase> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('flyEnabled')) {
						newUSKTypeProps.flyEnabled = options.flyEnabled
					}
					if (props.includes('positionX')) {
						newProps.positionX = options.positionX * 1000
					}
					if (props.includes('positionY')) {
						newProps.positionY = options.positionY * 1000
					}
					if (props.includes('sizeX')) {
						newProps.sizeX = options.sizeX * 1000
					}
					if (props.includes('sizeY')) {
						newProps.sizeY = options.sizeY * 1000
					}
				}

				if (Object.keys(newProps).length === 0 || Object.keys(newUSKTypeProps).length === 0) return

				await atem?.setUpstreamKeyerDVESettings(newProps, mixEffectId, keyId)
				await atem?.setUpstreamKeyerType(newUSKTypeProps, mixEffectId, keyId)
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect, options.key)

				if (usk?.dveSettings) {
					return {
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
			options: convertOptionsFields({
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
			}),
			callback: async ({ options }) => {
				const mixEffectId = (await options.mixeffect) - 1
				const keyId = (await options.key) - 1
				const newUSKTypeProps: Partial<UpstreamKeyerTypeSettings> = {}
				const newProps: Partial<UpstreamKeyerDVEBase> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('flyEnabled')) {
						newUSKTypeProps.flyEnabled = await options.flyEnabled
					}
					if (props.includes('positionX')) {
						newProps.positionX = (await options.positionX) * 1000
					}
					if (props.includes('positionY')) {
						newProps.positionY = (await options.positionY) * 1000
					}
					if (props.includes('sizeX')) {
						newProps.sizeX = (await options.sizeX) * 1000
					}
					if (props.includes('sizeY')) {
						newProps.sizeY = (await options.sizeY) * 1000
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
				const mixEffectId = (await options.mixeffect) - 1
				const keyId = (await options.key) - 1
				const usk = getUSK(state.state, mixEffectId, keyId)

				if (usk?.dveSettings) {
					return {
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
