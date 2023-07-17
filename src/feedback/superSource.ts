import { Enums } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './index.js'
import { combineRgb } from '@companion-module/base'
import { getSuperSource } from 'atem-connection/dist/state/util.js'
import {
	AtemSuperSourceIdPicker,
	AtemSuperSourceArtPropertiesPickers,
	AtemSuperSourceArtSourcePicker,
	AtemSuperSourceArtOption,
	AtemSuperSourceBoxPicker,
	AtemSuperSourceBoxSourcePicker,
	AtemSuperSourcePropertiesPickers,
	type AtemSuperSourceArtProperties,
	type AtemSuperSourceProperties,
} from '../input.js'
import { getSuperSourceBox, type StateWrapper } from '../state.js'

export interface AtemSuperSourceFeedbacks {
	[FeedbackId.SSrcArtProperties]: {
		ssrcId: number | undefined
	} & AtemSuperSourceArtProperties
	[FeedbackId.SSrcArtSource]: {
		ssrcId: number | undefined
		source: number
	}
	[FeedbackId.SSrcArtOption]: {
		ssrcId: number | undefined
		artOption: Enums.SuperSourceArtOption
	}
	[FeedbackId.SSrcBoxSource]: {
		ssrcId: number | undefined
		boxIndex: number
		source: number
	}
	[FeedbackId.SSrcBoxSourceVariables]: {
		ssrcId: string | undefined
		boxIndex: string
		source: string
	}
	[FeedbackId.SSrcBoxOnAir]: {
		ssrcId: number | undefined
		boxIndex: number
	}
	[FeedbackId.SSrcBoxProperties]: {
		ssrcId: number | undefined
		boxIndex: number
	} & AtemSuperSourceProperties
}

function compareAsInt(value: number, actual: number, targetScale: number, actualRounding = 1): boolean {
	const targetVal = value * targetScale
	if (actualRounding) {
		actual = actualRounding * Math.round(actual / actualRounding)
	}
	return targetVal === actual
}

export function createSuperSourceFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): MyFeedbackDefinitions<AtemSuperSourceFeedbacks> {
	if (!model.SSrc) {
		return {
			[FeedbackId.SSrcArtProperties]: undefined,
			[FeedbackId.SSrcArtSource]: undefined,
			[FeedbackId.SSrcArtOption]: undefined,
			[FeedbackId.SSrcBoxSource]: undefined,
			[FeedbackId.SSrcBoxSourceVariables]: undefined,
			[FeedbackId.SSrcBoxOnAir]: undefined,
			[FeedbackId.SSrcBoxProperties]: undefined,
		}
	}
	return {
		[FeedbackId.SSrcArtProperties]: {
			type: 'boolean',
			name: 'Supersource: Art properties',
			description: 'If the specified SuperSource art properties match, change style of the bank',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				...AtemSuperSourceArtPropertiesPickers(model, state.state, false),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const ssrc = getSuperSource(state.state, ssrcId).properties

				const props = options.getRaw('properties')
				if (!ssrc || !props || !Array.isArray(props)) return false

				if (props.includes('fill') && ssrc.artFillSource !== options.getPlainNumber('fill')) return false
				if (props.includes('key') && ssrc.artCutSource !== options.getPlainNumber('key')) return false

				if (props.includes('artOption') && ssrc.artOption !== options.getRaw('artOption')) return false
				if (props.includes('artPreMultiplied') && ssrc.artPreMultiplied !== options.getPlainBoolean('artPreMultiplied'))
					return false
				if (props.includes('artClip') && !compareAsInt(options.getPlainNumber('artClip'), ssrc.artClip, 10))
					return false
				if (props.includes('artGain') && !compareAsInt(options.getPlainNumber('artGain'), ssrc.artGain, 10))
					return false
				if (props.includes('artInvertKey') && ssrc.artInvertKey !== options.getPlainBoolean('artInvertKey'))
					return false

				return true
			},
			learn: ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.properties
				if (ssrcConfig) {
					return {
						...options.getJson(),
						fill: ssrcConfig.artFillSource,
						key: ssrcConfig.artCutSource,

						artOption: ssrcConfig.artOption,
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
		[FeedbackId.SSrcArtSource]: {
			// TODO - replace with FeedbackId.SSrcArtProperties
			type: 'boolean',
			name: 'Supersource: Art fill source',
			description: 'If the specified SuperSource art fill is set to the specified source, change style of the bank',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				source: AtemSuperSourceArtSourcePicker(model, state.state, 'source', 'Fill Source'),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const ssrc = getSuperSource(state.state, ssrcId)
				return ssrc.properties?.artFillSource === options.getPlainNumber('source')
			},
			learn: ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const ssrc = getSuperSource(state.state, ssrcId)

				if (ssrc.properties) {
					return {
						...options.getJson(),
						source: ssrc.properties.artFillSource,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.SSrcArtOption]: {
			// TODO - replace with FeedbackId.SSrcArtProperties
			type: 'boolean',
			name: 'Supersource: Art placement',
			description: 'If the specified SuperSource art is placed in the foreground/background, change style of the bank',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				artOption: AtemSuperSourceArtOption(false),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const ssrc = getSuperSource(state.state, ssrcId)
				return ssrc.properties?.artOption === options.getRaw('artOption')
			},
			learn: ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const ssrc = getSuperSource(state.state, ssrcId)

				if (ssrc.properties) {
					return {
						...options.getJson(),
						artOption: ssrc.properties.artOption,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.SSrcBoxSource]: {
			// TODO - replace with FeedbackId.SSrcBoxProperties
			type: 'boolean',
			name: 'Supersource: Box source',
			description: 'If the specified SuperSource box is set to the specified source, change style of the bank',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				source: AtemSuperSourceBoxSourcePicker(model, state.state),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const box = getSuperSourceBox(state.state, options.getPlainNumber('boxIndex'), ssrcId)
				return box?.source === options.getPlainNumber('source')
			},
			learn: ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const box = getSuperSourceBox(state.state, options.getPlainNumber('boxIndex'), ssrcId)

				if (box) {
					return {
						...options.getJson(),
						source: box.source,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.SSrcBoxSourceVariables]: {
			// TODO - replace with FeedbackId.SSrcBoxProperties
			type: 'boolean',
			name: 'Supersource: Box source from variables',
			description: 'If the specified SuperSource box is set to the specified source, change style of the bank',
			options: {
				ssrcId:
					model.SSrc > 1
						? {
								type: 'textinput',
								id: 'ssrcId',
								label: 'Super Source',
								default: '1',
								useVariables: true,
							}
						: undefined,
				boxIndex: {
					type: 'textinput',
					id: 'boxIndex',
					label: 'Box #',
					default: '1',
					useVariables: true,
				},
				source: {
					type: 'textinput',
					id: 'source',
					label: 'Source',
					default: '1',
					useVariables: true,
				},
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: async ({ options }) => {
				const ssrcId =
					options.getRaw('ssrcId') && model.SSrc > 1 ? Number(await options.getParsedNumber('ssrcId')) - 1 : 0
				const boxIndex = (await options.getParsedNumber('boxIndex')) - 1
				const source = await options.getParsedNumber('source')

				const box = getSuperSourceBox(state.state, boxIndex, ssrcId)
				return box?.source === source
			},
			learn: async ({ options }) => {
				const ssrcId =
					options.getRaw('ssrcId') && model.SSrc > 1 ? Number(await options.getParsedNumber('ssrcId')) - 1 : 0
				const boxIndex = (await options.getParsedNumber('boxIndex')) - 1

				const box = getSuperSourceBox(state.state, boxIndex, ssrcId)

				if (box) {
					return {
						...options.getJson(),
						source: box.source + '',
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.SSrcBoxOnAir]: {
			// TODO - replace with FeedbackId.SSrcBoxProperties
			type: 'boolean',
			name: 'Supersource: Box state',
			description: 'If the specified SuperSource box is enabled, change style of the bank',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const box = getSuperSourceBox(state.state, options.getPlainNumber('boxIndex'), ssrcId)
				return !!(box && box.enabled)
			},
		},
		[FeedbackId.SSrcBoxProperties]: {
			type: 'boolean',
			name: 'Supersource: Box properties',
			description: 'If the specified SuperSource box properties match, change style of the bank',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				...AtemSuperSourcePropertiesPickers(model, state.state),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const box = getSuperSourceBox(state.state, options.getPlainNumber('boxIndex'), ssrcId)

				const props = options.getRaw('properties')
				if (!box || !props || !Array.isArray(props)) return false

				if (props.includes('source') && box.source !== options.getPlainNumber('source')) return false

				if (props.includes('size') && !compareAsInt(options.getPlainNumber('size'), box.size, 1000, 10)) return false
				if (props.includes('x') && !compareAsInt(options.getPlainNumber('x'), box.x, 100)) return false
				if (props.includes('y') && !compareAsInt(options.getPlainNumber('y'), box.y, 100)) return false

				if (props.includes('cropEnable') && box.cropped !== options.getPlainBoolean('cropEnable')) return false

				if (box.cropped) {
					if (props.includes('cropTop') && !compareAsInt(options.getPlainNumber('cropTop'), box.cropTop, 1000, 10))
						return false
					if (
						props.includes('cropBottom') &&
						!compareAsInt(options.getPlainNumber('cropBottom'), box.cropBottom, 1000, 10)
					)
						return false
					if (props.includes('cropLeft') && !compareAsInt(options.getPlainNumber('cropLeft'), box.cropLeft, 1000, 10))
						return false
					if (
						props.includes('cropRight') &&
						!compareAsInt(options.getPlainNumber('cropRight'), box.cropRight, 1000, 10)
					)
						return false
				}

				return true
			},
			learn: ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const boxId = options.getPlainNumber('boxIndex')
				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.boxes[boxId]
				if (ssrcConfig) {
					return {
						...options.getJson(),
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
	}
}
