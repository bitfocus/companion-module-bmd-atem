import { VideoState, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionActionDefinitions, JsonValue } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import type { SuperSource } from 'atem-connection/dist/state/video/index.js'
import { CHOICES_KEYTRANS, type TrueFalseToggle, resolveTrueFalseToggle } from '../options/common.js'
import { getSuperSourceBox, type StateWrapper } from '../state.js'
import { clamp } from '../util.js'
import type { AtemTransitions, TransitionOptions } from '../transitions.js'
import {
	AtemSuperSourceIdPicker,
	AtemSuperSourceBoxPropertiesPickers,
	AtemSuperSourceArtPropertiesPickers,
	AtemSSrcArtOptionToProtocolEnum,
	AtemSSrcArtOptionFromProtocolEnum,
	AtemSuperSourceBoxPicker,
	AtemSuperSourceBoxSourcePicker,
	AtemSuperSourceBoxPropertiesPickersForOffset,
	AtemSuperSourceBorderPropertiesPickers,
	AtemSuperSourceBoxBorderPropertiesPickers,
	AtemSuperSourceBoxPickerWithAll,
	type AtemSuperSourceBoxProperties,
	type AtemSuperSourceArtProperties,
	type AtemSuperSourceBorderProperties,
	type AtemSuperSourceBoxBorderProperties,
} from '../options/superSource.js'
import { parseSourceIdRequired } from '../options/sources.js'
import { AtemTransitionAnimationOptions } from '../options/fade.js'

export type AtemSuperSourceActions = {
	['ssrcArt']: {
		options: {
			ssrcId: number
		} & AtemSuperSourceArtProperties
	}
	['ssrcBorder']: {
		options: {
			ssrcId: number
		} & AtemSuperSourceBorderProperties
	}
	['ssrcBoxBorder']: {
		options: {
			ssrcId: number
			boxIndex: number
		} & AtemSuperSourceBoxBorderProperties
	}
	['setSsrcBoxSource']: {
		options: {
			ssrcId: number
			boxIndex: number
			source: JsonValue
		}
	}
	['setSsrcBoxEnable']: {
		options: {
			ssrcId: number
			boxIndex: number
			onair: TrueFalseToggle
		}
	}
	['setSsrcBoxProperties']: {
		options: {
			ssrcId: number
			boxIndex: number
		} & TransitionOptions &
			AtemSuperSourceBoxProperties
	}
	['setSsrcBoxPropertiesDelta']: {
		options: {
			ssrcId: number
			boxIndex: number

			properties: Array<'size' | 'x' | 'y' | 'cropTop' | 'cropBottom' | 'cropLeft' | 'cropRight'>
			size: number
			x: number
			y: number
			cropTop: number
			cropBottom: number
			cropLeft: number
			cropRight: number
		}
	}
}

export function createSuperSourceActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions<AtemSuperSourceActions> {
	if (!model.SSrc) {
		return {
			['ssrcArt']: undefined,
			['ssrcBorder']: undefined,
			['ssrcBoxBorder']: undefined,
			['setSsrcBoxSource']: undefined,
			['setSsrcBoxEnable']: undefined,
			['setSsrcBoxProperties']: undefined,
			['setSsrcBoxPropertiesDelta']: undefined,
		}
	}
	return {
		['ssrcArt']: {
			name: 'SuperSource: Set art properties',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				...AtemSuperSourceArtPropertiesPickers(model, state.state, true),
			}),
			callback: async ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const newProps: Partial<VideoState.SuperSource.SuperSourceProperties> = {}

				const props = options.properties
				if (props && Array.isArray(props)) {
					if (props.includes('fill')) newProps.artFillSource = parseSourceIdRequired(options.fill)
					if (props.includes('key')) newProps.artCutSource = parseSourceIdRequired(options.key)

					if (props.includes('artOption')) {
						const ssrc = state.state.video.superSources[ssrcId]
						const newArtOption = AtemSSrcArtOptionToProtocolEnum(options.artOption, ssrc?.properties?.artOption)
						if (newArtOption !== undefined) newProps.artOption = newArtOption
					}

					if (props.includes('artPreMultiplied')) newProps.artPreMultiplied = options.artPreMultiplied
					if (props.includes('artClip')) newProps.artClip = options.artClip * 10
					if (props.includes('artGain')) newProps.artGain = options.artGain * 10
					if (props.includes('artInvertKey')) newProps.artInvertKey = options.artInvertKey
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setSuperSourceProperties(newProps, ssrcId)
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.properties
				if (ssrcConfig) {
					return {
						fill: ssrcConfig.artFillSource,
						key: ssrcConfig.artCutSource,

						artOption: AtemSSrcArtOptionFromProtocolEnum(ssrcConfig.artOption),
						artPreMultiplied: ssrcConfig.artPreMultiplied,
						artClip: ssrcConfig.artClip / 10,
						artGain: ssrcConfig.artGain / 10,
						artInvertKey: ssrcConfig.artInvertKey,
					}
				} else {
					return undefined
				}
			},
		},
		['ssrcBorder']: {
			name: 'SuperSource: Set border properties',
			description: model.superSourceBoxBorder
				? 'On this model the border is per-box: this action applies to all boxes and all sides, and the bevel/softness/light-source options have no effect. Use "SuperSource: Set box border properties" for full per-box, per-side control.'
				: undefined,
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				...AtemSuperSourceBorderPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0

				const props = options.properties
				if (!props || !Array.isArray(props)) return

				if (model.superSourceBoxBorder) {
					// Newer models use a per-box border. Map the overlapping properties onto all boxes and all
					// sides; the bevel/softness/light-source properties are not supported and are ignored.
					const boxProps: Partial<VideoState.SuperSource.SuperSourceBoxBorder> = {}

					if (props.includes('borderEnabled')) boxProps.borderEnabled = options.borderEnabled
					if (props.includes('borderOuterWidth')) {
						boxProps.borderWidthOutHorizontal = options.borderOuterWidth * 100
						boxProps.borderWidthOutVertical = options.borderOuterWidth * 100
					}
					if (props.includes('borderInnerWidth')) {
						boxProps.borderWidthInLeft = options.borderInnerWidth * 100
						boxProps.borderWidthInRight = options.borderInnerWidth * 100
						boxProps.borderWidthInTop = options.borderInnerWidth * 100
						boxProps.borderWidthInBottom = options.borderInnerWidth * 100
					}
					if (props.includes('borderHue')) boxProps.borderHue = options.borderHue * 10
					if (props.includes('borderSaturation')) boxProps.borderSaturation = options.borderSaturation * 10
					if (props.includes('borderLuma')) boxProps.borderLuma = options.borderLuma * 10

					if (Object.keys(boxProps).length === 0) return

					await atem?.setSuperSourceBoxBorder(boxProps, null, ssrcId)
					return
				}

				const newProps: Partial<VideoState.SuperSource.SuperSourceBorder> = {}

				if (props.includes('borderEnabled')) newProps.borderEnabled = options.borderEnabled
				if (props.includes('borderBevel')) newProps.borderBevel = options.borderBevel

				if (props.includes('borderOuterWidth')) newProps.borderOuterWidth = options.borderOuterWidth * 100
				if (props.includes('borderInnerWidth')) newProps.borderInnerWidth = options.borderInnerWidth * 100

				if (props.includes('borderOuterSoftness')) newProps.borderOuterSoftness = options.borderOuterSoftness
				if (props.includes('borderInnerSoftness')) newProps.borderInnerSoftness = options.borderInnerSoftness
				if (props.includes('borderBevelSoftness')) newProps.borderBevelSoftness = options.borderBevelSoftness
				if (props.includes('borderBevelPosition')) newProps.borderBevelPosition = options.borderBevelPosition

				if (props.includes('borderHue')) newProps.borderHue = options.borderHue * 10
				if (props.includes('borderSaturation')) newProps.borderSaturation = options.borderSaturation * 10
				if (props.includes('borderLuma')) newProps.borderLuma = options.borderLuma * 10

				if (props.includes('borderLightSourceDirection'))
					newProps.borderLightSourceDirection = options.borderLightSourceDirection * 10
				if (props.includes('borderLightSourceAltitude'))
					newProps.borderLightSourceAltitude = options.borderLightSourceAltitude

				if (Object.keys(newProps).length === 0) return

				await atem?.setSuperSourceBorder(newProps, ssrcId)
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0

				if (model.superSourceBoxBorder) {
					// Sample the first box, as this action controls all boxes together
					const boxBorder = state.state.video.superSources?.[ssrcId]?.boxes[0]?.border
					if (boxBorder) {
						return {
							borderEnabled: boxBorder.borderEnabled,
							borderOuterWidth: boxBorder.borderWidthOutHorizontal / 100,
							borderInnerWidth: boxBorder.borderWidthInLeft / 100,
							borderHue: boxBorder.borderHue / 10,
							borderSaturation: boxBorder.borderSaturation / 10,
							borderLuma: boxBorder.borderLuma / 10,
						}
					} else {
						return undefined
					}
				}

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.border
				if (ssrcConfig) {
					return {
						borderEnabled: ssrcConfig.borderEnabled,
						borderBevel: ssrcConfig.borderBevel,
						borderOuterWidth: ssrcConfig.borderOuterWidth / 100,
						borderInnerWidth: ssrcConfig.borderInnerWidth / 100,
						borderOuterSoftness: ssrcConfig.borderOuterSoftness,
						borderInnerSoftness: ssrcConfig.borderInnerSoftness,
						borderBevelSoftness: ssrcConfig.borderBevelSoftness,
						borderBevelPosition: ssrcConfig.borderBevelPosition,
						borderHue: ssrcConfig.borderHue / 10,
						borderSaturation: ssrcConfig.borderSaturation / 10,
						borderLuma: ssrcConfig.borderLuma / 10,
						borderLightSourceDirection: ssrcConfig.borderLightSourceDirection / 10,
						borderLightSourceAltitude: ssrcConfig.borderLightSourceAltitude,
					}
				} else {
					return undefined
				}
			},
		},
		['ssrcBoxBorder']: model.superSourceBoxBorder
			? {
					name: 'SuperSource: Set box border properties',
					options: convertOptionsFields({
						ssrcId: AtemSuperSourceIdPicker(model),
						boxIndex: AtemSuperSourceBoxPickerWithAll(),
						...AtemSuperSourceBoxBorderPropertiesPickers(),
					}),
					callback: async ({ options }) => {
						const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
						// Box 0 in the picker means "all boxes", which the library expresses as null
						const box = options.boxIndex === 0 ? null : options.boxIndex - 1

						const newProps: Partial<VideoState.SuperSource.SuperSourceBoxBorder> = {}

						const props = options.properties
						if (props && Array.isArray(props)) {
							if (props.includes('borderEnabled')) newProps.borderEnabled = options.borderEnabled

							if (props.includes('borderWidthOutHorizontal'))
								newProps.borderWidthOutHorizontal = options.borderWidthOutHorizontal * 100
							if (props.includes('borderWidthOutVertical'))
								newProps.borderWidthOutVertical = options.borderWidthOutVertical * 100
							if (props.includes('borderWidthInLeft')) newProps.borderWidthInLeft = options.borderWidthInLeft * 100
							if (props.includes('borderWidthInRight')) newProps.borderWidthInRight = options.borderWidthInRight * 100
							if (props.includes('borderWidthInTop')) newProps.borderWidthInTop = options.borderWidthInTop * 100
							if (props.includes('borderWidthInBottom'))
								newProps.borderWidthInBottom = options.borderWidthInBottom * 100

							if (props.includes('borderHue')) newProps.borderHue = options.borderHue * 10
							if (props.includes('borderSaturation')) newProps.borderSaturation = options.borderSaturation * 10
							if (props.includes('borderLuma')) newProps.borderLuma = options.borderLuma * 10
						}

						if (Object.keys(newProps).length === 0) return

						await atem?.setSuperSourceBoxBorder(newProps, box, ssrcId)
					},
					learn: ({ options }) => {
						const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
						// For "all boxes" sample the first box
						const boxId = options.boxIndex === 0 ? 0 : options.boxIndex - 1

						const boxBorder = state.state.video.superSources?.[ssrcId]?.boxes[boxId]?.border
						if (boxBorder) {
							return {
								borderEnabled: boxBorder.borderEnabled,
								borderWidthOutHorizontal: boxBorder.borderWidthOutHorizontal / 100,
								borderWidthOutVertical: boxBorder.borderWidthOutVertical / 100,
								borderWidthInLeft: boxBorder.borderWidthInLeft / 100,
								borderWidthInRight: boxBorder.borderWidthInRight / 100,
								borderWidthInTop: boxBorder.borderWidthInTop / 100,
								borderWidthInBottom: boxBorder.borderWidthInBottom / 100,
								borderHue: boxBorder.borderHue / 10,
								borderSaturation: boxBorder.borderSaturation / 10,
								borderLuma: boxBorder.borderLuma / 10,
							}
						} else {
							return undefined
						}
					},
				}
			: undefined,
		['setSsrcBoxSource']: {
			// TODO - combine into 'setSsrcBoxProperties'
			name: 'SuperSource: Set box source',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				source: AtemSuperSourceBoxSourcePicker(model, state.state),
			}),
			callback: async ({ options }) => {
				const source = parseSourceIdRequired(options.source)
				await atem?.setSuperSourceBoxSettings(
					{
						source: source,
					},
					options.boxIndex - 1,
					options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0,
				)
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const boxId = options.boxIndex - 1

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.boxes[boxId]
				if (ssrcConfig) {
					return {
						source: ssrcConfig.source,
					}
				} else {
					return undefined
				}
			},
		},
		['setSsrcBoxEnable']: {
			// TODO - combine into 'setSsrcBoxProperties'
			name: 'SuperSource: Set box enabled',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
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
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const boxIndex = options.boxIndex - 1

				const box = getSuperSourceBox(state.state, boxIndex, ssrcId)
				const newState = resolveTrueFalseToggle(options.onair, box?.enabled)

				await atem?.setSuperSourceBoxSettings(
					{
						enabled: newState,
					},
					boxIndex,
					ssrcId,
				)
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const boxId = options.boxIndex - 1

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.boxes[boxId]
				if (ssrcConfig) {
					return {
						onair: ssrcConfig.enabled ? 'true' : 'false',
					}
				} else {
					return undefined
				}
			},
		},
		['setSsrcBoxProperties']: {
			name: 'SuperSource: Change box properties',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				...AtemTransitionAnimationOptions(),
				...AtemSuperSourceBoxPropertiesPickers(model, state.state),
			}),
			callback: async ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const boxIndex = options.boxIndex - 1

				const newProps: Partial<SuperSource.SuperSourceBox> = {}

				const props = options.properties
				if (props && Array.isArray(props)) {
					if (props.includes('onair')) {
						if (options.onair === 'toggle') {
							const box = getSuperSourceBox(state.state, boxIndex, ssrcId)
							newProps.enabled = !box?.enabled
						} else {
							newProps.enabled = options.onair === 'true'
						}
					}

					if (props.includes('source')) newProps.source = parseSourceIdRequired(options.source)

					if (props.includes('size')) newProps.size = options.size * 1000
					if (props.includes('x')) newProps.x = options.x * 100
					if (props.includes('y')) newProps.y = options.y * 100

					if (props.includes('cropEnable')) newProps.cropped = options.cropEnable
					if (props.includes('cropTop')) newProps.cropTop = options.cropTop * 1000
					if (props.includes('cropBottom')) newProps.cropBottom = options.cropBottom * 1000
					if (props.includes('cropLeft')) newProps.cropLeft = options.cropLeft * 1000
					if (props.includes('cropRight')) newProps.cropRight = options.cropRight * 1000
				}

				if (Object.keys(newProps).length === 0) return

				await transitions.runForProperties(
					`superSource.${ssrcId}.box.${boxIndex}`,
					async (props) => {
						await atem?.setSuperSourceBoxSettings(props, boxIndex, ssrcId)
					},
					options,
					['size', 'x', 'y', 'cropTop', 'cropBottom', 'cropLeft', 'cropRight'],
					newProps,
					state.state.video.superSources[ssrcId]?.boxes[boxIndex],
				)
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const boxId = options.boxIndex - 1

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.boxes[boxId]
				if (ssrcConfig) {
					return {
						onair: ssrcConfig.enabled ? 'true' : 'false',
						source: ssrcConfig.source,
						size: ssrcConfig.size / 1000,
						x: ssrcConfig.x / 100,
						y: ssrcConfig.y / 100,
						cropEnable: ssrcConfig.cropped,
						cropTop: ssrcConfig.cropTop / 1000,
						cropBottom: ssrcConfig.cropBottom / 1000,
						cropLeft: ssrcConfig.cropLeft / 1000,
						cropRight: ssrcConfig.cropRight / 1000,
					}
				} else {
					return undefined
				}
			},
		},
		['setSsrcBoxPropertiesDelta']: {
			name: 'SuperSource: Offset box properties',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				...AtemSuperSourceBoxPropertiesPickersForOffset(),
			}),
			callback: async ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const boxIndex = options.boxIndex - 1

				const newProps: Partial<SuperSource.SuperSourceBox> = {}

				const box = getSuperSourceBox(state.state, boxIndex, ssrcId)

				const props = options.properties
				if (box && props && Array.isArray(props)) {
					if (props.includes('size')) newProps.size = clamp(0, 1000, box.size + options.size * 1000)
					if (props.includes('x')) newProps.x = clamp(-4800, 4800, box.x + options.x * 100)
					if (props.includes('y')) newProps.y = clamp(-2700, 2700, box.y + options.y * 100)

					if (props.includes('cropTop')) newProps.cropTop = clamp(0, 18000, box.cropTop + options.cropTop * 1000)
					if (props.includes('cropBottom'))
						newProps.cropBottom = clamp(0, 18000, box.cropBottom + options.cropBottom * 1000)
					if (props.includes('cropLeft')) newProps.cropLeft = clamp(0, 32000, box.cropLeft + options.cropLeft * 1000)
					if (props.includes('cropRight'))
						newProps.cropRight = clamp(0, 32000, box.cropRight + options.cropRight * 1000)
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setSuperSourceBoxSettings(newProps, boxIndex, ssrcId)
			},
		},
	}
}
