import { type Atem } from 'atem-connection'
import { convertOptionsFields, WithDropdownPropertiesPicker } from '../../options/util.js'
import type { CompanionActionDefinitions, JsonValue } from '@companion-module/base'
import { AtemKeyCutSourcePicker, AtemKeyFillSourcePicker, AtemUSKPicker, resolveTrueFalseToggle } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../ActionId.js'
import { CHOICES_KEYTRANS, type TrueFalseToggle } from '../../choices.js'
import { getUSK, type StateWrapper } from '../../state.js'
import type {
	UpstreamKeyerTypeSettings,
	UpstreamKeyerDVEBase,
	UpstreamKeyerMaskSettings,
} from 'atem-connection/dist/state/video/upstreamKeyers.js'
import { AtemMEPicker } from '../../options/mixEffect.js'
import {
	AtemUpstreamKeyerTypePicker,
	AtemUSKFlyKeyPropertiesPickers,
	upstreamKeyerTypeEnumToString,
	UpstreamKeyerTypeString,
	upstreamKeyerTypeStringToEnum,
} from '../../options/upstreamKeyer.js'
import { MaskPropertiesPickers } from '../../options/common.js'

export type AtemUpstreamKeyerCommonActions = {
	[ActionId.USKType]: {
		options: {
			mixeffect: number
			key: number
			type: UpstreamKeyerTypeString | JsonValue | undefined
		}
	}
	[ActionId.USKSource]: {
		options: {
			mixeffect: number
			key: number
			fill: number
			cut: number
		}
	}
	[ActionId.USKOnAir]: {
		options: {
			mixeffect: number
			key: number
			onair: TrueFalseToggle
		}
	}
	[ActionId.USKMaskLumaChromaPattern]: {
		options: {
			mixeffect: number
			key: number

			properties: Array<'maskEnabled' | 'maskTop' | 'maskBottom' | 'maskLeft' | 'maskRight'>
			maskEnabled: boolean
			maskTop: number
			maskBottom: number
			maskLeft: number
			maskRight: number
		}
	}
	[ActionId.USKFlyKeyLumaChromaPattern]: {
		options: {
			mixeffect: number
			key: number

			properties: Array<'flyEnabled' | 'positionX' | 'positionY' | 'sizeX' | 'sizeY'>
			flyEnabled: boolean
			positionX: number
			positionY: number
			sizeX: number
			sizeY: number
		}
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
			[ActionId.USKOnAir]: undefined,
			[ActionId.USKMaskLumaChromaPattern]: undefined,
			[ActionId.USKFlyKeyLumaChromaPattern]: undefined,
		}
	}

	return {
		[ActionId.USKSource]: {
			name: 'Upstream key: Set inputs',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				fill: AtemKeyFillSourcePicker(model, state.state),
				cut: AtemKeyCutSourcePicker(model, state.state),
			}),
			callback: async ({ options }) => {
				await Promise.all([
					atem?.setUpstreamKeyerFillSource(options.fill, options.mixeffect - 1, options.key - 1),
					atem?.setUpstreamKeyerCutSource(options.cut, options.mixeffect - 1, options.key - 1),
				])
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)

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
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				type: AtemUpstreamKeyerTypePicker(),
			}),
			callback: async ({ options }) => {
				const parsedType = upstreamKeyerTypeStringToEnum(options.type)
				if (parsedType === null) return // Not valid

				await atem?.setUpstreamKeyerType(
					{
						mixEffectKeyType: parsedType,
					},
					options.mixeffect - 1,
					options.key - 1,
				)
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)

				if (usk) {
					return {
						type: upstreamKeyerTypeEnumToString(usk.mixEffectKeyType),
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKOnAir]: {
			name: 'Upstream key: Set OnAir',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
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
				const meIndex = options.mixeffect - 1
				const keyIndex = options.key - 1

				const onAir = resolveTrueFalseToggle(options.onair, getUSK(state.state, meIndex, keyIndex)?.onAir)
				await atem?.setUpstreamKeyerOnAir(onAir, meIndex, keyIndex)
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)

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
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				...WithDropdownPropertiesPicker(MaskPropertiesPickers(16, 9, false)),
			}),
			callback: async ({ options }) => {
				const keyId = options.key - 1
				const mixEffectId = options.mixeffect - 1
				const newProps: Partial<UpstreamKeyerMaskSettings> = {}

				const props = options.properties
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
				const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)

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
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				...AtemUSKFlyKeyPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const keyId = options.key - 1
				const mixEffectId = options.mixeffect - 1
				const newUSKTypeProps: Partial<UpstreamKeyerTypeSettings> = {}
				const newProps: Partial<UpstreamKeyerDVEBase> = {}

				const props = options.properties
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
				const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)

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
	}
}
