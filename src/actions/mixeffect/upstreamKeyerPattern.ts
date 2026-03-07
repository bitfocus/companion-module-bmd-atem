import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { AtemMEPicker, AtemUSKPatternPropertiesPickers, AtemUSKPicker } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../ActionId.js'
import { getUSK, type StateWrapper } from '../../state.js'
import type { UpstreamKeyerPatternSettings } from 'atem-connection/dist/state/video/upstreamKeyers.js'

export type AtemUpstreamKeyerPatternActions = {
	[ActionId.USKPatternProperties]: {
		options: {
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
	}
}

export function createUpstreamKeyerPatternActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemUpstreamKeyerPatternActions> {
	if (!model.USKs || !model.DVEs) {
		return {
			[ActionId.USKPatternProperties]: undefined,
		}
	}

	return {
		[ActionId.USKPatternProperties]: {
			name: 'Upstream key: Change Pattern properties',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				...AtemUSKPatternPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const keyId = options.key - 1
				const mixEffectId = options.mixeffect - 1
				const newProps: Partial<UpstreamKeyerPatternSettings> = {}

				const props = options.properties
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
				const keyId = options.key - 1
				const mixeffectId = options.mixeffect - 1
				const usk = getUSK(state.state, mixeffectId, keyId)

				if (usk?.patternSettings) {
					return {
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
	}
}
