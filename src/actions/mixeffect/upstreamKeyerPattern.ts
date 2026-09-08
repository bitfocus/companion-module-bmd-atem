import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { CompanionActionDefinitions, JsonValue } from '@companion-module/base'
import type { ModelSpec } from '../../models/index.js'
import { getUSK, type StateWrapper } from '../../state.js'
import type { UpstreamKeyerPatternSettings } from 'atem-connection/dist/state/video/upstreamKeyers.js'
import { AtemMEPicker, resolveMixEffectIndex } from '../../options/mixEffect.js'
import {
	AtemUSKPatternPropertiesPickers,
	AtemUSKPicker,
	resolveUpstreamKeyerIndex,
} from '../../options/upstreamKeyer.js'
import { wipePatternEnumToString, wipePatternStringToEnum } from '../../options/transition.js'

export type AtemUpstreamKeyerPatternActions = {
	['uskPatternProperties']: {
		options: {
			mixeffect: number
			key: number

			properties: Array<'style' | 'size' | 'symmetry' | 'softness' | 'positionX' | 'positionY' | 'invert'>

			style: JsonValue | undefined
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
			['uskPatternProperties']: undefined,
		}
	}

	return {
		['uskPatternProperties']: {
			name: 'Upstream key: Change Pattern properties',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				...AtemUSKPatternPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const keyId = resolveUpstreamKeyerIndex(model, options.key)
				const mixEffectId = resolveMixEffectIndex(model, options.mixeffect)
				const newProps: Partial<UpstreamKeyerPatternSettings> = {}

				const props = options.properties
				if (props && Array.isArray(props)) {
					if (props.includes('style')) {
						const style = resolvePatternStyle(options.style)
						if (style !== null) newProps.style = style
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
				const keyId = resolveUpstreamKeyerIndex(model, options.key)
				const mixeffectId = resolveMixEffectIndex(model, options.mixeffect)
				const usk = getUSK(state.state, mixeffectId, keyId)

				if (usk?.patternSettings) {
					return {
						style: wipePatternEnumToString(usk.patternSettings.style),
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

export function resolvePatternStyle(value: Enums.Pattern | JsonValue | undefined): Enums.Pattern | null {
	const namedPattern = wipePatternStringToEnum(value)
	if (namedPattern !== null) return namedPattern

	// Preserve stored actions created before pattern choices changed from protocol numbers to names.
	const numericValue =
		typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : Number.NaN
	return Number.isInteger(numericValue) &&
		numericValue >= Enums.Pattern.LeftToRightBar &&
		numericValue <= Enums.Pattern.TopRightDiagonal
		? numericValue
		: null
}
