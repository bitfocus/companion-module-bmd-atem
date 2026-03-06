import { Enums, type Atem } from 'atem-connection'
import {
	AtemMEPicker,
	AtemUSKPatternPropertiesPickers,
	AtemUSKPatternPropertiesVariablesPickers,
	AtemUSKPicker,
} from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../ActionId.js'
import type { MyActionDefinitions } from '../types.js'
import { getUSK, type StateWrapper } from '../../state.js'
import type { UpstreamKeyerPatternSettings } from 'atem-connection/dist/state/video/upstreamKeyers.js'

export interface AtemUpstreamKeyerPatternActions {
	[ActionId.USKPatternProperties]: {
		mixeffect: number
		key: number

		properties: Array<'style' | 'size' | 'symmetry' | 'softness' | 'positionX' | 'positionY' | 'invert'>

		style: Enums.Pattern
		size: number
		symmetry: number
		softness: number
		positionX: number
		positionY: number
		invert: boolean
	}
	[ActionId.USKPatternPropertiesVariables]: {
		mixeffect: string
		key: string

		properties: Array<'style' | 'size' | 'symmetry' | 'softness' | 'positionX' | 'positionY' | 'invert'>

		style: string
		size: string
		symmetry: string
		softness: string
		positionX: string
		positionY: string
		invert: string
	}
}

export function createUpstreamKeyerPatternActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemUpstreamKeyerPatternActions> {
	if (!model.USKs || !model.DVEs) {
		return {
			[ActionId.USKPatternProperties]: undefined,
			[ActionId.USKPatternPropertiesVariables]: undefined,
		}
	}

	return {
		[ActionId.USKPatternProperties]: {
			name: 'Upstream key: Change Pattern properties',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				...AtemUSKPatternPropertiesPickers(),
			},
			callback: async ({ options }) => {
				const keyId = options.key
				const mixEffectId = options.mixeffect
				const newProps: Partial<UpstreamKeyerPatternSettings> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('style')) {
						newProps.style = options.style
					}
					if (props.includes('size')) {
						newProps.size = options.size * 100
					}
					if (props.includes('symmetry')) {
						newProps.symmetry = options.symmetry * 100
					}
					if (props.includes('softness')) {
						newProps.softness = options.softness * 100
					}
					if (props.includes('positionX')) {
						newProps.positionX = options.positionX * 10000
					}
					if (props.includes('positionY')) {
						newProps.positionY = options.positionY * 10000
					}
					if (props.includes('invert')) {
						newProps.invert = options.invert
					}
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerPatternSettings(newProps, mixEffectId, keyId)
			},
			learn: async ({ options }) => {
				const keyId = options.key
				const mixeffectId = options.mixeffect
				const usk = getUSK(state.state, mixeffectId, keyId)

				if (usk?.patternSettings) {
					return {
						...options.getJson(),
						style: usk.patternSettings.style,
						size: usk.patternSettings.size / 100,
						symmetry: usk.patternSettings.symmetry / 100,
						softness: usk.patternSettings.softness / 100,
						positionX: usk.patternSettings.positionX / 10000,
						positionY: usk.patternSettings.positionY / 10000,
						invert: usk.patternSettings.invert,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.USKPatternPropertiesVariables]: {
			name: 'Upstream key: Change Pattern properties from variables',
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
				...AtemUSKPatternPropertiesVariablesPickers(),
			},
			callback: async ({ options }) => {
				const mixEffectId = (await options.mixeffect) - 1
				const keyId = (await options.key) - 1
				const newProps: Partial<UpstreamKeyerPatternSettings> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('style')) {
						newProps.style = await options.style
					}
					if (props.includes('size')) {
						newProps.size = (await options.size) * 100
					}
					if (props.includes('symmetry')) {
						newProps.symmetry = (await options.symmetry) * 100
					}
					if (props.includes('softness')) {
						newProps.softness = (await options.softness) * 100
					}
					if (props.includes('positionX')) {
						newProps.positionX = (await options.positionX) * 10000
					}
					if (props.includes('positionY')) {
						newProps.positionY = (await options.positionY) * 10000
					}
					if (props.includes('invert')) {
						newProps.invert = await options.invert
					}
				}

				if (isNaN(mixEffectId) || isNaN(keyId)) return
				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerPatternSettings(newProps, mixEffectId, keyId)
			},
			learn: async ({ options }) => {
				const mixeffect = (await options.mixeffect) - 1
				const key = (await options.key) - 1
				const usk = getUSK(state.state, mixeffect, key)

				if (usk?.patternSettings) {
					return {
						...options.getJson(),
						style: usk.patternSettings.style + '',
						size: usk.patternSettings.size / 100 + '',
						symmetry: usk.patternSettings.symmetry / 100 + '',
						softness: usk.patternSettings.softness / 100 + '',
						positionX: usk.patternSettings.positionX / 10000 + '',
						positionY: usk.patternSettings.positionY / 10000 + '',
						invert: usk.patternSettings.invert + '',
					}
				} else {
					return undefined
				}
			},
		},
	}
}
