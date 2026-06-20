import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../../models/index.js'
import { getUSK, type StateWrapper } from '../../state.js'
import type {
	UpstreamKeyerLumaSettings,
	UpstreamKeyerAdvancedChromaProperties,
} from 'atem-connection/dist/state/video/upstreamKeyers.js'
import { AtemMEPicker, resolveMixEffectIndex } from '../../options/mixEffect.js'
import {
	AtemUSKLumaPropertiesPickers,
	AtemUSKAdvancedChromaPropertiesPickers,
	AtemUSKPicker,
	resolveUpstreamKeyerIndex,
} from '../../options/upstreamKeyer.js'

export type AtemUpstreamKeyerLumaChromaActions = {
	['uskLumaProperties']: {
		options: {
			mixeffect: number
			key: number

			properties: Array<'preMultiplied' | 'clip' | 'gain' | 'invert'>

			preMultiplied: boolean
			clip: number
			gain: number
			invert: boolean
		}
	}
	['uskAdvancedChromaProperties']: {
		options: {
			mixeffect: number
			key: number

			properties: AdvancedChromaPropertyKey[]

			foregroundLevel: number
			backgroundLevel: number
			keyEdge: number
			spillSuppression: number
			flareSuppression: number
			brightness: number
			contrast: number
			saturation: number
			red: number
			green: number
			blue: number
		}
	}
}

type AdvancedChromaPropertyKey = keyof UpstreamKeyerAdvancedChromaProperties

export function createUpstreamKeyerLumaChromaActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemUpstreamKeyerLumaChromaActions> {
	if (!model.USKs) {
		return {
			['uskLumaProperties']: undefined,
			['uskAdvancedChromaProperties']: undefined,
		}
	}

	return {
		['uskLumaProperties']: {
			name: 'Upstream key: Change Luma properties',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				...AtemUSKLumaPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const mixEffectId = resolveMixEffectIndex(model, options.mixeffect)
				const keyId = resolveUpstreamKeyerIndex(model, options.key)
				const newProps: Partial<UpstreamKeyerLumaSettings> = {}

				const props = options.properties
				if (props && Array.isArray(props)) {
					if (props.includes('preMultiplied')) newProps.preMultiplied = options.preMultiplied
					if (props.includes('clip')) newProps.clip = options.clip * 10
					if (props.includes('gain')) newProps.gain = options.gain * 10
					if (props.includes('invert')) newProps.invert = options.invert
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerLumaSettings(newProps, mixEffectId, keyId)
			},
			learn: ({ options }) => {
				const usk = getUSK(
					state.state,
					resolveMixEffectIndex(model, options.mixeffect),
					resolveUpstreamKeyerIndex(model, options.key),
				)

				if (usk?.lumaSettings) {
					return {
						preMultiplied: usk.lumaSettings.preMultiplied,
						clip: usk.lumaSettings.clip / 10,
						gain: usk.lumaSettings.gain / 10,
						invert: usk.lumaSettings.invert,
					}
				} else {
					return undefined
				}
			},
		},
		['uskAdvancedChromaProperties']: {
			name: 'Upstream key: Change Advanced Chroma properties',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				...AtemUSKAdvancedChromaPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const mixEffectId = resolveMixEffectIndex(model, options.mixeffect)
				const keyId = resolveUpstreamKeyerIndex(model, options.key)
				const newProps: Partial<UpstreamKeyerAdvancedChromaProperties> = {}

				const props = options.properties
				if (props && Array.isArray(props)) {
					// Every advanced-chroma property is a percentage stored in tenths
					for (const key of ADVANCED_CHROMA_KEYS) {
						if (props.includes(key)) newProps[key] = options[key] * 10
					}
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerAdvancedChromaProperties(newProps, mixEffectId, keyId)
			},
			learn: ({ options }) => {
				const usk = getUSK(
					state.state,
					resolveMixEffectIndex(model, options.mixeffect),
					resolveUpstreamKeyerIndex(model, options.key),
				)

				const properties = usk?.advancedChromaSettings?.properties
				if (properties) {
					const learned = {} as UpstreamKeyerAdvancedChromaProperties
					for (const key of ADVANCED_CHROMA_KEYS) {
						learned[key] = properties[key] / 10
					}
					return learned
				} else {
					return undefined
				}
			},
		},
	}
}

const ADVANCED_CHROMA_KEYS: AdvancedChromaPropertyKey[] = [
	'foregroundLevel',
	'backgroundLevel',
	'keyEdge',
	'spillSuppression',
	'flareSuppression',
	'brightness',
	'contrast',
	'saturation',
	'red',
	'green',
	'blue',
]
