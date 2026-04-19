import type { Enums } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { ModelSpec } from '../../models/index.js'
import type { CompanionFeedbackDefinitions, JsonValue } from '@companion-module/base'
import { getUSK, type StateWrapper } from '../../state.js'
import { AtemMEPicker } from '../../options/mixEffect.js'
import {
	AtemUpstreamKeyerTypePicker,
	upstreamKeyerTypeEnumToString,
	type UpstreamKeyerTypeString,
	upstreamKeyerTypeStringToEnum,
	AtemUSKPicker,
} from '../../options/upstreamKeyer.js'
import { AtemKeyFillSourcePicker } from '../../options/commonKeyer.js'
import { CHOICES_CURRENTKEYFRAMES } from '../../options/upstreamKeyer-dve.js'

export type AtemUpstreamKeyerFeedbacks = {
	['uskOnAir']: {
		type: 'boolean'
		options: {
			mixeffect: number
			key: number
		}
	}
	['usk_type']: {
		type: 'boolean'
		options: {
			mixeffect: number
			key: number
			type: UpstreamKeyerTypeString | JsonValue | undefined
		}
	}
	['usk_source']: {
		type: 'boolean'
		options: {
			mixeffect: number
			key: number
			fill: number
		}
	}
	['usk_keyframe']: {
		type: 'boolean'
		options: {
			mixeffect: number
			key: number
			keyframe: Enums.IsAtKeyFrame
		}
	}
}

export function createUpstreamKeyerFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemUpstreamKeyerFeedbacks> {
	if (!model.USKs) {
		return {
			['uskOnAir']: undefined,
			['usk_type']: undefined,
			['usk_source']: undefined,
			['usk_keyframe']: undefined,
		}
	}
	return {
		['uskOnAir']: {
			type: 'boolean',
			name: 'Upstream key: OnAir state',
			description: 'If the specified upstream keyer is active, change style of the bank',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
			}),
			defaultStyle: {
				color: 0xffffff,
				bgcolor: 0xff0000,
			},
			callback: ({ options }): boolean => {
				const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)
				return !!usk?.onAir
			},
		},
		['usk_type']: {
			type: 'boolean',
			name: 'Upstream key: Key type',
			description: 'If the specified upstream keyer has the specified type, change style of the bank',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				type: AtemUpstreamKeyerTypePicker(),
			}),
			defaultStyle: {
				color: 0xffffff,
				bgcolor: 0xff0000,
			},
			callback: ({ options }): boolean => {
				const parsedType = upstreamKeyerTypeStringToEnum(options.type)
				if (parsedType === null) return false

				const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)
				return usk?.mixEffectKeyType === parsedType
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
		['usk_source']: {
			type: 'boolean',
			name: 'Upstream key: Fill source',
			description: 'If the input specified is selected in the USK specified, change style of the bank',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				fill: AtemKeyFillSourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xeeee00,
			},
			callback: ({ options }): boolean => {
				const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)
				return usk?.fillSource === options.fill
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)

				if (usk) {
					return {
						fill: usk.fillSource,
					}
				} else {
					return undefined
				}
			},
		},
		['usk_keyframe']: model.DVEs
			? {
					type: 'boolean',
					name: 'Upstream key: Key frame',
					description: 'If the USK specified is at the Key Frame specified, change style of the bank',
					options: convertOptionsFields({
						mixeffect: AtemMEPicker(model),
						key: AtemUSKPicker(model),
						keyframe: {
							type: 'dropdown',
							id: 'keyframe',
							label: 'Key Frame',
							choices: CHOICES_CURRENTKEYFRAMES,
							default: CHOICES_CURRENTKEYFRAMES[0].id,
							disableAutoExpression: true, // TODO: Until the options are simplified
						},
					}),
					defaultStyle: {
						color: 0x000000,
						bgcolor: 0xeeee00,
					},
					callback: ({ options }): boolean => {
						const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)
						return usk?.flyProperties?.isAtKeyFrame === Number(options.keyframe)
					},
					learn: ({ options }) => {
						const usk = getUSK(state.state, options.mixeffect - 1, options.key - 1)

						if (usk?.flyProperties) {
							return {
								keyframe: usk.flyProperties.isAtKeyFrame,
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
	}
}
