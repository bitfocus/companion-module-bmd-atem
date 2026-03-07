import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../options/common.js'
import type { ModelSpec } from '../models/index.js'
import { FeedbackId } from './FeedbackId.js'
import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { getSuperSource } from 'atem-connection/dist/state/util.js'
import {
	AtemSuperSourceIdPicker,
	AtemSuperSourceArtPropertiesPickers,
	AtemSuperSourceArtSourcePicker,
	AtemSuperSourceArtOption,
	AtemSuperSourceBoxPicker,
	AtemSuperSourceBoxSourcePicker,
	type AtemSuperSourceArtProperties,
	AtemSSrcArtOptionToProtocolEnum,
	AtemSSrcArtOptionFromProtocolEnum,
} from '../input.js'
import { getSuperSourceBox, type StateWrapper } from '../state.js'
import { AtemSuperSourceProperties, AtemSuperSourcePropertiesPickers } from '../options/superSource.js'

export type AtemSuperSourceFeedbacks = {
	[FeedbackId.SSrcArtProperties]: {
		type: 'boolean'
		options: {
			ssrcId: number
		} & AtemSuperSourceArtProperties
	}
	[FeedbackId.SSrcArtSource]: {
		type: 'boolean'
		options: {
			ssrcId: number
			source: number
		}
	}
	[FeedbackId.SSrcArtOption]: {
		type: 'boolean'
		options: {
			ssrcId: number
			artOption: Enums.SuperSourceArtOption
		}
	}
	[FeedbackId.SSrcBoxSource]: {
		type: 'boolean'
		options: {
			ssrcId: number
			boxIndex: number
			source: number
		}
	}
	[FeedbackId.SSrcBoxOnAir]: {
		type: 'boolean'
		options: {
			ssrcId: number
			boxIndex: number
		}
	}
	[FeedbackId.SSrcBoxProperties]: {
		type: 'boolean'
		options: {
			ssrcId: number
			boxIndex: number
		} & AtemSuperSourceProperties
	}
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
): CompanionFeedbackDefinitions<AtemSuperSourceFeedbacks> {
	if (!model.SSrc) {
		return {
			[FeedbackId.SSrcArtProperties]: undefined,
			[FeedbackId.SSrcArtSource]: undefined,
			[FeedbackId.SSrcArtOption]: undefined,
			[FeedbackId.SSrcBoxSource]: undefined,
			[FeedbackId.SSrcBoxOnAir]: undefined,
			[FeedbackId.SSrcBoxProperties]: undefined,
		}
	}
	return {
		[FeedbackId.SSrcArtProperties]: {
			type: 'boolean',
			name: 'Supersource: Art properties',
			description: 'If the specified SuperSource art properties match, change style of the bank',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				...AtemSuperSourceArtPropertiesPickers(model, state.state, false),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const ssrc = getSuperSource(state.state, ssrcId).properties

				const props = options.properties
				if (!ssrc || !props || !Array.isArray(props)) return false

				if (props.includes('fill') && ssrc.artFillSource !== options.fill) return false
				if (props.includes('key') && ssrc.artCutSource !== options.key) return false

				if (props.includes('artOption')) {
					const currentArtOption = AtemSSrcArtOptionToProtocolEnum(options.artOption, ssrc.artOption)
					if (ssrc.artOption !== currentArtOption) return false
				}

				if (props.includes('artPreMultiplied') && ssrc.artPreMultiplied !== options.artPreMultiplied) return false
				if (props.includes('artClip') && !compareAsInt(options.artClip, ssrc.artClip, 10)) return false
				if (props.includes('artGain') && !compareAsInt(options.artGain, ssrc.artGain, 10)) return false
				if (props.includes('artInvertKey') && ssrc.artInvertKey !== options.artInvertKey) return false

				return true
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
		[FeedbackId.SSrcArtSource]: {
			// TODO - replace with FeedbackId.SSrcArtProperties
			type: 'boolean',
			name: 'Supersource: Art fill source',
			description: 'If the specified SuperSource art fill is set to the specified source, change style of the bank',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				source: AtemSuperSourceArtSourcePicker(model, state.state, 'source', 'Fill Source'),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const ssrc = getSuperSource(state.state, ssrcId)
				return ssrc.properties?.artFillSource === options.source
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const ssrc = getSuperSource(state.state, ssrcId)

				if (ssrc.properties) {
					return {
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
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				artOption: AtemSuperSourceArtOption(false),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const ssrc = getSuperSource(state.state, ssrcId)
				return ssrc.properties?.artOption === options.artOption
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const ssrc = getSuperSource(state.state, ssrcId)

				if (ssrc.properties) {
					return {
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
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				source: AtemSuperSourceBoxSourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const box = getSuperSourceBox(state.state, options.boxIndex, ssrcId)
				return box?.source === options.source
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const box = getSuperSourceBox(state.state, options.boxIndex, ssrcId)

				if (box) {
					return {
						source: box.source,
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
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const box = getSuperSourceBox(state.state, options.boxIndex, ssrcId)
				return !!(box && box.enabled)
			},
		},
		[FeedbackId.SSrcBoxProperties]: {
			type: 'boolean',
			name: 'Supersource: Box properties',
			description: 'If the specified SuperSource box properties match, change style of the bank',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				...AtemSuperSourcePropertiesPickers(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const box = getSuperSourceBox(state.state, options.boxIndex, ssrcId)

				const props = options.properties
				if (!box || !props || !Array.isArray(props)) return false

				if (props.includes('source') && box.source !== options.source) return false

				if (props.includes('size') && !compareAsInt(options.size, box.size, 1000, 10)) return false
				if (props.includes('x') && !compareAsInt(options.x, box.x, 100)) return false
				if (props.includes('y') && !compareAsInt(options.y, box.y, 100)) return false

				if (props.includes('cropEnable') && box.cropped !== options.cropEnable) return false

				if (box.cropped) {
					if (props.includes('cropTop') && !compareAsInt(options.cropTop, box.cropTop, 1000, 10)) return false
					if (props.includes('cropBottom') && !compareAsInt(options.cropBottom, box.cropBottom, 1000, 10)) return false
					if (props.includes('cropLeft') && !compareAsInt(options.cropLeft, box.cropLeft, 1000, 10)) return false
					if (props.includes('cropRight') && !compareAsInt(options.cropRight, box.cropRight, 1000, 10)) return false
				}

				return true
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const boxId = options.boxIndex
				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.boxes[boxId]
				if (ssrcConfig) {
					return {
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
