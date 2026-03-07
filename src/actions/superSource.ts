import { Enums, VideoState, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../common.js'
import { assertNever, type CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import {
	AtemSuperSourceArtPropertiesPickers,
	AtemSuperSourceBoxPicker,
	AtemSuperSourceBoxSourcePicker,
	AtemSuperSourceIdPicker,
	AtemSuperSourcePropertiesPickers,
	AtemSuperSourcePropertiesPickersForOffset,
	type AtemSuperSourceArtProperties,
	type AtemSuperSourceProperties,
	AtemTransitionAnimationOptions,
	resolveTrueFalseToggle,
} from '../input.js'
import type { SuperSource } from 'atem-connection/dist/state/video/index.js'
import { CHOICES_KEYTRANS, type TrueFalseToggle } from '../choices.js'
import { getSuperSourceBox, type StateWrapper } from '../state.js'
import { clamp } from '../util.js'
import type { AtemTransitions } from '../transitions.js'
import type { algorithm, curve } from '../easings.js'

export type AtemSuperSourceActions = {
	[ActionId.SuperSourceArt]: {
		options: {
			ssrcId: number | undefined
		} & AtemSuperSourceArtProperties
	}
	[ActionId.SuperSourceBoxSource]: {
		options: {
			ssrcId: number | undefined
			boxIndex: number
			source: number
		}
	}
	[ActionId.SuperSourceBoxOnAir]: {
		options: {
			ssrcId: number | undefined
			boxIndex: number
			onair: TrueFalseToggle
		}
	}
	[ActionId.SuperSourceBoxProperties]: {
		options: {
			ssrcId: number | undefined
			boxIndex: number
			transitionRate: number | undefined
			transitionEasing: algorithm | undefined
			transitionCurve: curve | undefined
		} & AtemSuperSourceProperties
	}
	[ActionId.SuperSourceBoxPropertiesDelta]: {
		options: {
			ssrcId: number | undefined
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
			[ActionId.SuperSourceArt]: undefined,
			[ActionId.SuperSourceBoxSource]: undefined,
			[ActionId.SuperSourceBoxOnAir]: undefined,
			[ActionId.SuperSourceBoxProperties]: undefined,
			[ActionId.SuperSourceBoxPropertiesDelta]: undefined,
		}
	}
	return {
		[ActionId.SuperSourceArt]: {
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
					if (props.includes('fill')) newProps.artFillSource = options.fill
					if (props.includes('key')) newProps.artCutSource = options.key

					if (props.includes('artOption')) {
						const rawArtOption = options.artOption
						switch (rawArtOption) {
							case 'toggle': {
								const ssrc = state.state.video.superSources[ssrcId]

								newProps.artOption =
									ssrc?.properties?.artOption === Enums.SuperSourceArtOption.Background
										? Enums.SuperSourceArtOption.Foreground
										: Enums.SuperSourceArtOption.Background
								break
							}
							case 'background':
								newProps.artOption = Enums.SuperSourceArtOption.Background
								break
							case 'foreground':
								newProps.artOption = Enums.SuperSourceArtOption.Foreground
								break
							case 'unchanged':
								break
							default:
								assertNever(rawArtOption)
								break
						}
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

						artOption:
							ssrcConfig.artOption === Enums.SuperSourceArtOption.Foreground
								? 'foreground'
								: ssrcConfig.artOption === Enums.SuperSourceArtOption.Background
									? 'background'
									: 'unchanged',
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
		[ActionId.SuperSourceBoxSource]: {
			// TODO - combine into ActionId.SuperSourceBoxProperties
			name: 'SuperSource: Set box source',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				source: AtemSuperSourceBoxSourcePicker(model, state.state),
			}),
			callback: async ({ options }) => {
				await atem?.setSuperSourceBoxSettings(
					{
						source: options.source,
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
		[ActionId.SuperSourceBoxOnAir]: {
			// TODO - combine into ActionId.SuperSourceBoxProperties
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
		[ActionId.SuperSourceBoxProperties]: {
			name: 'SuperSource: Change box properties',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				...AtemTransitionAnimationOptions(),
				...AtemSuperSourcePropertiesPickers(model, state.state),
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

					if (props.includes('source')) newProps.source = options.source

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
		[ActionId.SuperSourceBoxPropertiesDelta]: {
			name: 'SuperSource: Offset box properties',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				...AtemSuperSourcePropertiesPickersForOffset(),
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
