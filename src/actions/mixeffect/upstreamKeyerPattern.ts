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
				const keyId = options.getPlainNumber('key')
				const mixEffectId = options.getPlainNumber('mixeffect')
				const newProps: Partial<UpstreamKeyerPatternSettings> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('style')) {
						newProps.style = options.getPlainNumber('style')
					}
					if (props.includes('size')) {
						newProps.size = options.getPlainNumber('size') * 100
					}
					if (props.includes('symmetry')) {
						newProps.symmetry = options.getPlainNumber('symmetry') * 100
					}
					if (props.includes('softness')) {
						newProps.softness = options.getPlainNumber('softness') * 100
					}
					if (props.includes('positionX')) {
						newProps.positionX = options.getPlainNumber('positionX') * 10000
					}
					if (props.includes('positionY')) {
						newProps.positionY = options.getPlainNumber('positionY') * 10000
					}
					if (props.includes('invert')) {
						newProps.invert = options.getPlainBoolean('invert')
					}
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerPatternSettings(newProps, mixEffectId, keyId)
			},
			learn: async ({ options }) => {
				const keyId = options.getPlainNumber('key')
				const mixeffectId = options.getPlainNumber('mixeffect')
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
				const mixEffectId = (await options.getParsedNumber('mixeffect')) - 1
				const keyId = (await options.getParsedNumber('key')) - 1
				const newProps: Partial<UpstreamKeyerPatternSettings> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('style')) {
						newProps.style = await options.getParsedNumber('style')
					}
					if (props.includes('size')) {
						newProps.size = (await options.getParsedNumber('size')) * 100
					}
					if (props.includes('symmetry')) {
						newProps.symmetry = (await options.getParsedNumber('symmetry')) * 100
					}
					if (props.includes('softness')) {
						newProps.softness = (await options.getParsedNumber('softness')) * 100
					}
					if (props.includes('positionX')) {
						newProps.positionX = (await options.getParsedNumber('positionX')) * 10000
					}
					if (props.includes('positionY')) {
						newProps.positionY = (await options.getParsedNumber('positionY')) * 10000
					}
					if (props.includes('invert')) {
						newProps.invert = await options.getParsedBoolean('invert')
					}
				}

				if (isNaN(mixEffectId) || isNaN(keyId)) return
				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerPatternSettings(newProps, mixEffectId, keyId)
			},
			learn: async ({ options }) => {
				const mixeffect = (await options.getParsedNumber('mixeffect')) - 1
				const key = (await options.getParsedNumber('key')) - 1
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
