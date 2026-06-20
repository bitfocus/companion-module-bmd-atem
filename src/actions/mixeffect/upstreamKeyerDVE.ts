import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { CompanionActionDefinitions, JsonValue } from '@companion-module/base'
import {
	AtemUSKDVEPropertiesPickers,
	AtemUSKDVEPropertiesOffsetPickers,
	AtemUSKKeyframePropertiesPickers,
	CHOICES_FLYDIRECTIONS,
} from '../../options/upstreamKeyer-dve.js'
import type { ModelSpec } from '../../models/index.js'
import { clamp } from '../../util.js'
import { getUSK, type StateWrapper } from '../../state.js'
import type {
	UpstreamKeyerDVESettings,
	UpstreamKeyerFlyKeyframe,
} from 'atem-connection/dist/state/video/upstreamKeyers.js'
import type { AtemTransitions, TransitionOptions } from '../../transitions.js'
import { AtemTransitionAnimationOptions } from '../../options/fade.js'
import { AtemMEPicker, resolveMixEffectIndex } from '../../options/mixEffect.js'
import {
	AtemFlyKeyKeyFramePicker,
	type FlyKeyKeyFrameString,
	flyKeyKeyFrameStringToEnum,
	AtemUSKPicker,
	resolveUpstreamKeyerIndex,
} from '../../options/upstreamKeyer.js'

export type AtemUpstreamKeyerDVEActions = {
	['uskDveProperties']: {
		options: {
			mixeffect: number
			key: number

			properties: Array<
				| 'positionX'
				| 'positionY'
				| 'sizeX'
				| 'sizeY'
				| 'rotation'
				| 'maskEnabled'
				| 'maskTop'
				| 'maskBottom'
				| 'maskLeft'
				| 'maskRight'
				| 'shadowEnabled'
				| 'lightSourceDirection'
				| 'lightSourceAltitude'
				| 'borderEnabled'
				| 'borderHue'
				| 'borderSaturation'
				| 'borderLuma'
				| 'borderBevel'
				| 'borderOuterWidth'
				| 'borderInnerWidth'
				| 'borderOuterSoftness'
				| 'borderInnerSoftness'
				| 'borderOpacity'
				| 'borderBevelPosition'
				| 'borderBevelSoftness'
				| 'rate'
			>

			positionX: number
			positionY: number
			sizeX: number
			sizeY: number
			rotation: number
			maskEnabled: boolean
			maskTop: number
			maskBottom: number
			maskLeft: number
			maskRight: number
			shadowEnabled: boolean
			lightSourceDirection: number
			lightSourceAltitude: number
			borderEnabled: boolean
			borderHue: number
			borderSaturation: number
			borderLuma: number
			borderBevel: Enums.BorderBevel
			borderOuterWidth: number
			borderInnerWidth: number
			borderOuterSoftness: number
			borderInnerSoftness: number
			borderOpacity: number
			borderBevelPosition: number
			borderBevelSoftness: number
			rate: number
		} & TransitionOptions
	}
	['uskDvePropertiesDelta']: {
		options: {
			mixeffect: number
			key: number

			properties: Array<
				'positionX' | 'positionY' | 'sizeX' | 'sizeY' | 'rotation' | 'maskTop' | 'maskBottom' | 'maskLeft' | 'maskRight'
			>

			positionX: number
			positionY: number
			sizeX: number
			sizeY: number
			rotation: number
			maskTop: number
			maskBottom: number
			maskLeft: number
			maskRight: number
		}
	}
	['uskSetKeyframe']: {
		options: {
			mixeffect: number
			key: number
			keyframe: FlyKeyKeyFrameString | JsonValue | undefined

			properties: Array<
				| 'positionX'
				| 'positionY'
				| 'sizeX'
				| 'sizeY'
				| 'rotation'
				| 'maskTop'
				| 'maskBottom'
				| 'maskLeft'
				| 'maskRight'
				| 'shadowEnabled'
				| 'lightSourceDirection'
				| 'lightSourceAltitude'
				| 'borderEnabled'
				| 'borderHue'
				| 'borderSaturation'
				| 'borderLuma'
				| 'borderOuterWidth'
				| 'borderInnerWidth'
				| 'borderOuterSoftness'
				| 'borderInnerSoftness'
				| 'borderOpacity'
				| 'borderBevelPosition'
				| 'borderBevelSoftness'
			>

			positionX: number
			positionY: number
			sizeX: number
			sizeY: number
			rotation: number
			maskTop: number
			maskBottom: number
			maskLeft: number
			maskRight: number
			lightSourceDirection: number
			lightSourceAltitude: number
			borderHue: number
			borderSaturation: number
			borderLuma: number
			borderOuterWidth: number
			borderInnerWidth: number
			borderOuterSoftness: number
			borderInnerSoftness: number
			borderOpacity: number
			borderBevelPosition: number
			borderBevelSoftness: number
		}
	}
	['uskStoreKeyframe']: {
		options: {
			mixeffect: number
			key: number
			keyframe: FlyKeyKeyFrameString | JsonValue | undefined
		}
	}
	['uskFly']: {
		options: {
			mixeffect: number
			key: number
			keyframe: FlyKeyKeyFrameString | JsonValue | undefined
		}
	}
	['uskFlyInfinite']: {
		options: {
			mixeffect: number
			key: number
			flydirection: Enums.FlyKeyDirection
		}
	}
}

export function createUpstreamKeyerDVEActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions<AtemUpstreamKeyerDVEActions> {
	if (!model.USKs || !model.DVEs) {
		return {
			['uskDveProperties']: undefined,
			['uskDvePropertiesDelta']: undefined,
			['uskSetKeyframe']: undefined,
			['uskStoreKeyframe']: undefined,
			['uskFly']: undefined,
			['uskFlyInfinite']: undefined,
		}
	}

	return {
		['uskDveProperties']: {
			name: 'Upstream key: Change DVE properties',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				...AtemTransitionAnimationOptions(),
				...AtemUSKDVEPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const keyId = resolveUpstreamKeyerIndex(model, options.key)
				const mixEffectId = resolveMixEffectIndex(model, options.mixeffect)
				const newProps: Partial<UpstreamKeyerDVESettings> = {}

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
					if (props.includes('sizeX')) {
						newProps.sizeX = options.sizeX * 1000
					}
					if (props.includes('sizeY')) {
						newProps.sizeY = options.sizeY * 1000
					}
					if (props.includes('positionX')) {
						newProps.positionX = options.positionX * 1000
					}
					if (props.includes('positionY')) {
						newProps.positionY = options.positionY * 1000
					}
					if (props.includes('rotation')) {
						newProps.rotation = options.rotation * 10
					}
					if (props.includes('borderOuterWidth')) {
						newProps.borderOuterWidth = options.borderOuterWidth * 100
					}
					if (props.includes('borderInnerWidth')) {
						newProps.borderInnerWidth = options.borderInnerWidth * 100
					}
					if (props.includes('borderOuterSoftness')) {
						newProps.borderOuterSoftness = options.borderOuterSoftness
					}
					if (props.includes('borderInnerSoftness')) {
						newProps.borderInnerSoftness = options.borderInnerSoftness
					}
					if (props.includes('borderBevelSoftness')) {
						newProps.borderBevelSoftness = options.borderBevelSoftness
					}
					if (props.includes('borderBevelPosition')) {
						newProps.borderBevelPosition = options.borderBevelPosition
					}
					if (props.includes('borderOpacity')) {
						newProps.borderOpacity = options.borderOpacity
					}
					if (props.includes('borderHue')) {
						newProps.borderHue = options.borderHue * 10
					}
					if (props.includes('borderSaturation')) {
						newProps.borderSaturation = options.borderSaturation * 10
					}
					if (props.includes('borderLuma')) {
						newProps.borderLuma = options.borderLuma * 10
					}
					if (props.includes('lightSourceDirection')) {
						newProps.lightSourceDirection = options.lightSourceDirection * 10
					}
					if (props.includes('lightSourceAltitude')) {
						newProps.lightSourceAltitude = options.lightSourceAltitude
					}
					if (props.includes('borderEnabled')) {
						newProps.borderEnabled = options.borderEnabled
					}
					if (props.includes('shadowEnabled')) {
						newProps.shadowEnabled = options.shadowEnabled
					}
					if (props.includes('borderBevel')) {
						newProps.borderBevel = options.borderBevel
					}
					if (props.includes('rate')) {
						newProps.rate = options.rate
					}
				}

				if (Object.keys(newProps).length === 0) return

				await transitions.runForProperties(
					`me.${mixEffectId}.keyer.${keyId}.dveSettings`,
					async (props) => {
						await atem?.setUpstreamKeyerDVESettings(props, mixEffectId, keyId)
					},
					options,
					[
						'positionX',
						'positionY',
						'sizeX',
						'sizeY',
						'rotation',
						'maskTop',
						'maskBottom',
						'maskLeft',
						'maskRight',
						'lightSourceDirection',
						'lightSourceAltitude',
						'borderHue',
						'borderSaturation',
						'borderLuma',
						'borderBevel',
						'borderOuterWidth',
						'borderInnerWidth',
						'borderOuterSoftness',
						'borderInnerSoftness',
						'borderOpacity',
						'borderBevelPosition',
						'borderBevelSoftness',
					],
					newProps,
					state.state.video.mixEffects[mixEffectId]?.upstreamKeyers[keyId]?.dveSettings,
				)
			},
			learn: ({ options }) => {
				const usk = getUSK(
					state.state,
					resolveMixEffectIndex(model, options.mixeffect),
					resolveUpstreamKeyerIndex(model, options.key),
				)

				if (usk?.dveSettings) {
					return {
						maskEnabled: usk.dveSettings.maskEnabled,
						maskTop: usk.dveSettings.maskTop / 1000,
						maskBottom: usk.dveSettings.maskBottom / 1000,
						maskLeft: usk.dveSettings.maskLeft / 1000,
						maskRight: usk.dveSettings.maskRight / 1000,
						sizeX: usk.dveSettings.sizeX / 1000,
						sizeY: usk.dveSettings.sizeY / 1000,
						positionX: usk.dveSettings.positionX / 1000,
						positionY: usk.dveSettings.positionY / 1000,
						rotation: usk.dveSettings.rotation / 10,
						borderOuterWidth: usk.dveSettings.borderOuterWidth / 100,
						borderInnerWidth: usk.dveSettings.borderInnerWidth / 100,
						borderOuterSoftness: usk.dveSettings.borderOuterSoftness,
						borderInnerSoftness: usk.dveSettings.borderInnerSoftness,
						borderBevelSoftness: usk.dveSettings.borderBevelSoftness,
						borderBevelPosition: usk.dveSettings.borderBevelPosition,
						borderOpacity: usk.dveSettings.borderOpacity,
						borderHue: usk.dveSettings.borderHue / 10,
						borderSaturation: usk.dveSettings.borderSaturation / 10,
						borderLuma: usk.dveSettings.borderLuma / 10,
						lightSourceDirection: usk.dveSettings.lightSourceDirection / 10,
						lightSourceAltitude: usk.dveSettings.lightSourceAltitude,
						borderEnabled: usk.dveSettings.borderEnabled,
						shadowEnabled: usk.dveSettings.shadowEnabled,
						borderBevel: usk.dveSettings.borderBevel,
						rate: usk.dveSettings.rate,
					}
				} else {
					return undefined
				}
			},
		},
		['uskDvePropertiesDelta']: {
			name: 'Upstream key: Offset DVE properties',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				...AtemUSKDVEPropertiesOffsetPickers(),
			}),
			callback: async ({ options }) => {
				const mixEffectId = resolveMixEffectIndex(model, options.mixeffect)
				const keyId = resolveUpstreamKeyerIndex(model, options.key)
				const dve = getUSK(state.state, mixEffectId, keyId)?.dveSettings

				const newProps: Partial<UpstreamKeyerDVESettings> = {}

				const props = options.properties
				if (dve && props && Array.isArray(props)) {
					if (props.includes('positionX'))
						newProps.positionX = clamp(-1000000, 1000000, dve.positionX + options.positionX * 1000)
					if (props.includes('positionY'))
						newProps.positionY = clamp(-1000000, 1000000, dve.positionY + options.positionY * 1000)
					if (props.includes('sizeX')) newProps.sizeX = clamp(0, 99990, dve.sizeX + options.sizeX * 1000)
					if (props.includes('sizeY')) newProps.sizeY = clamp(0, 99990, dve.sizeY + options.sizeY * 1000)
					if (props.includes('rotation')) newProps.rotation = clamp(0, 3600, dve.rotation + options.rotation * 10)
					if (props.includes('maskTop')) newProps.maskTop = clamp(0, 38000, dve.maskTop + options.maskTop * 1000)
					if (props.includes('maskBottom'))
						newProps.maskBottom = clamp(0, 38000, dve.maskBottom + options.maskBottom * 1000)
					if (props.includes('maskLeft')) newProps.maskLeft = clamp(0, 52000, dve.maskLeft + options.maskLeft * 1000)
					if (props.includes('maskRight'))
						newProps.maskRight = clamp(0, 52000, dve.maskRight + options.maskRight * 1000)
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setUpstreamKeyerDVESettings(newProps, mixEffectId, keyId)
			},
		},
		['uskSetKeyframe']: {
			name: 'Upstream key: Set Keyframe from values',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				keyframe: AtemFlyKeyKeyFramePicker(),
				...AtemUSKKeyframePropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const mixEffectId = resolveMixEffectIndex(model, options.mixeffect)
				const keyId = resolveUpstreamKeyerIndex(model, options.key)
				const keyframeId = flyKeyKeyFrameStringToEnum(options.keyframe)
				if (keyframeId !== Enums.FlyKeyKeyFrame.A && keyframeId !== Enums.FlyKeyKeyFrame.B)
					throw new Error(`Cannot set invalid keyfame: ${JSON.stringify(options.keyframe)}`)

				const properties: Partial<UpstreamKeyerFlyKeyframe> = {}

				const props = options.properties
				if (props && Array.isArray(props)) {
					if (props.includes('maskTop')) {
						properties.maskTop = options.maskTop * 1000
					}
					if (props.includes('maskBottom')) {
						properties.maskBottom = options.maskBottom * 1000
					}
					if (props.includes('maskLeft')) {
						properties.maskLeft = options.maskLeft * 1000
					}
					if (props.includes('maskRight')) {
						properties.maskRight = options.maskRight * 1000
					}
					if (props.includes('sizeX')) {
						properties.sizeX = options.sizeX * 1000
					}
					if (props.includes('sizeY')) {
						properties.sizeY = options.sizeY * 1000
					}
					if (props.includes('positionX')) {
						properties.positionX = options.positionX * 1000
					}
					if (props.includes('positionY')) {
						properties.positionY = options.positionY * 1000
					}
					if (props.includes('rotation')) {
						properties.rotation = options.rotation * 10
					}
					if (props.includes('borderOuterWidth')) {
						properties.borderOuterWidth = options.borderOuterWidth * 100
					}
					if (props.includes('borderInnerWidth')) {
						properties.borderInnerWidth = options.borderInnerWidth * 100
					}
					if (props.includes('borderOuterSoftness')) {
						properties.borderOuterSoftness = options.borderOuterSoftness
					}
					if (props.includes('borderInnerSoftness')) {
						properties.borderInnerSoftness = options.borderInnerSoftness
					}
					if (props.includes('borderBevelSoftness')) {
						properties.borderBevelSoftness = options.borderBevelSoftness
					}
					if (props.includes('borderBevelPosition')) {
						properties.borderBevelPosition = options.borderBevelPosition
					}
					if (props.includes('borderOpacity')) {
						properties.borderOpacity = options.borderOpacity
					}
					if (props.includes('borderHue')) {
						properties.borderHue = options.borderHue * 10
					}
					if (props.includes('borderSaturation')) {
						properties.borderSaturation = options.borderSaturation * 10
					}
					if (props.includes('borderLuma')) {
						properties.borderLuma = options.borderLuma * 10
					}
					if (props.includes('lightSourceDirection')) {
						properties.lightSourceDirection = options.lightSourceDirection * 10
					}
					if (props.includes('lightSourceAltitude')) {
						properties.lightSourceAltitude = options.lightSourceAltitude
					}
				}

				if (Object.keys(properties).length === 0) return

				await atem?.setUpstreamKeyerFlyKeyKeyframe(mixEffectId, keyId, keyframeId, properties)
			},
			learn: ({ options }) => {
				const usk = getUSK(
					state.state,
					resolveMixEffectIndex(model, options.mixeffect),
					resolveUpstreamKeyerIndex(model, options.key),
				)

				if (usk?.dveSettings) {
					return {
						maskTop: usk.dveSettings.maskTop / 1000,
						maskBottom: usk.dveSettings.maskBottom / 1000,
						maskLeft: usk.dveSettings.maskLeft / 1000,
						maskRight: usk.dveSettings.maskRight / 1000,
						sizeX: usk.dveSettings.sizeX / 1000,
						sizeY: usk.dveSettings.sizeY / 1000,
						positionX: usk.dveSettings.positionX / 1000,
						positionY: usk.dveSettings.positionY / 1000,
						rotation: usk.dveSettings.rotation / 10,
						borderOuterWidth: usk.dveSettings.borderOuterWidth / 100,
						borderInnerWidth: usk.dveSettings.borderInnerWidth / 100,
						borderOuterSoftness: usk.dveSettings.borderOuterSoftness,
						borderInnerSoftness: usk.dveSettings.borderInnerSoftness,
						borderBevelSoftness: usk.dveSettings.borderBevelSoftness,
						borderBevelPosition: usk.dveSettings.borderBevelPosition,
						borderOpacity: usk.dveSettings.borderOpacity,
						borderHue: usk.dveSettings.borderHue / 10,
						borderSaturation: usk.dveSettings.borderSaturation / 10,
						borderLuma: usk.dveSettings.borderLuma / 10,
						lightSourceDirection: usk.dveSettings.lightSourceDirection / 10,
						lightSourceAltitude: usk.dveSettings.lightSourceAltitude,
					}
				} else {
					return undefined
				}
			},
		},
		['uskStoreKeyframe']: {
			name: 'Upstream key: Set keyframe from current key state',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				keyframe: AtemFlyKeyKeyFramePicker(),
			}),
			callback: async ({ options }) => {
				const keyframeId = flyKeyKeyFrameStringToEnum(options.keyframe)
				if (keyframeId !== Enums.FlyKeyKeyFrame.A && keyframeId !== Enums.FlyKeyKeyFrame.B)
					throw new Error(`Cannot set invalid keyfame: ${JSON.stringify(options.keyframe)}`)

				await atem?.storeUpstreamKeyerFlyKeyKeyframe(
					resolveMixEffectIndex(model, options.mixeffect),
					resolveUpstreamKeyerIndex(model, options.key),
					keyframeId,
				)
			},
		},
		['uskFly']: {
			name: 'Upstream key: fly to keyframe',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				keyframe: AtemFlyKeyKeyFramePicker(true),
			}),
			callback: async ({ options }) => {
				const keyframeId = flyKeyKeyFrameStringToEnum(options.keyframe, true)
				if (
					keyframeId !== Enums.FlyKeyKeyFrame.A &&
					keyframeId !== Enums.FlyKeyKeyFrame.B &&
					keyframeId !== Enums.FlyKeyKeyFrame.Full
				)
					throw new Error(`Cannot set invalid keyfame: ${JSON.stringify(options.keyframe)}`)

				await atem?.runUpstreamKeyerFlyKeyTo(
					resolveMixEffectIndex(model, options.mixeffect),
					resolveUpstreamKeyerIndex(model, options.key),
					keyframeId,
				)
			},
			learn: ({ options }) => {
				const usk = getUSK(
					state.state,
					resolveMixEffectIndex(model, options.mixeffect),
					resolveUpstreamKeyerIndex(model, options.key),
				)

				if (usk?.flyProperties) {
					return {
						keyframe: usk.flyProperties.isAtKeyFrame,
					}
				} else {
					return undefined
				}
			},
		},
		['uskFlyInfinite']: {
			name: 'Upstream key: fly to infinite',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				key: AtemUSKPicker(model),
				flydirection: {
					type: 'dropdown',
					id: 'flydirection',
					label: 'Fly direction',
					choices: CHOICES_FLYDIRECTIONS,
					default: CHOICES_FLYDIRECTIONS[0].id,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				await atem?.runUpstreamKeyerFlyKeyToInfinite(
					resolveMixEffectIndex(model, options.mixeffect),
					resolveUpstreamKeyerIndex(model, options.key),
					options.flydirection,
				)
			},
			learn: ({ options }) => {
				const usk = getUSK(
					state.state,
					resolveMixEffectIndex(model, options.mixeffect),
					resolveUpstreamKeyerIndex(model, options.key),
				)

				if (usk?.flyProperties) {
					return {
						flydirection: usk.flyProperties.runToInfiniteIndex,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
