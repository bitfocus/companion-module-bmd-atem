import { convertOptionsFields } from '../options/util.js'
import type { ModelSpec } from '../models/index.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { getSuperSource } from 'atem-connection/dist/state/util.js'
import { getSuperSourceBox, type StateWrapper } from '../state.js'
import {
	AtemSuperSourceIdPicker,
	type AtemSuperSourceBoxProperties,
	AtemSuperSourceBoxPropertiesPickers,
	type AtemSuperSourceArtProperties,
	AtemSSrcArtOptionToProtocolEnum,
	AtemSuperSourceArtPropertiesPickers,
	AtemSuperSourceArtOption,
	AtemSSrcArtOptionFromProtocolEnum,
	AtemSuperSourceArtSourcePicker,
	AtemSuperSourceBoxPicker,
	AtemSuperSourceBoxSourcePicker,
	type SSrcArtOption,
} from '../options/superSource.js'

export type AtemSuperSourceFeedbacks = {
	['ssrc_art_properties']: {
		type: 'boolean'
		options: {
			ssrcId: number
		} & AtemSuperSourceArtProperties
	}
	['ssrc_art_source']: {
		type: 'boolean'
		options: {
			ssrcId: number
			source: number
		}
	}
	['ssrc_art_option']: {
		type: 'boolean'
		options: {
			ssrcId: number
			artOption: SSrcArtOption
		}
	}
	['ssrc_box_source']: {
		type: 'boolean'
		options: {
			ssrcId: number
			boxIndex: number
			source: number
		}
	}
	['ssrc_box_enable']: {
		type: 'boolean'
		options: {
			ssrcId: number
			boxIndex: number
		}
	}
	['ssrc_box_properties']: {
		type: 'boolean'
		options: {
			ssrcId: number
			boxIndex: number
		} & AtemSuperSourceBoxProperties
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
			['ssrc_art_properties']: undefined,
			['ssrc_art_source']: undefined,
			['ssrc_art_option']: undefined,
			['ssrc_box_source']: undefined,
			['ssrc_box_enable']: undefined,
			['ssrc_box_properties']: undefined,
		}
	}
	return {
		['ssrc_art_properties']: {
			type: 'boolean',
			name: 'Supersource: Art properties',
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
		['ssrc_art_source']: {
			// TODO - replace with 'ssrc_art_properties'
			type: 'boolean',
			name: 'Supersource: Art fill source',
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
		['ssrc_art_option']: {
			// TODO - replace with 'ssrc_art_properties'
			type: 'boolean',
			name: 'Supersource: Art placement',
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
				const current = ssrc.properties?.artOption
				const expected = AtemSSrcArtOptionToProtocolEnum(options.artOption, current)
				return expected !== undefined && current === expected
			},
			learn: ({ options }) => {
				const ssrcId = options.ssrcId && model.SSrc > 1 ? options.ssrcId - 1 : 0
				const ssrc = getSuperSource(state.state, ssrcId)

				if (ssrc.properties) {
					return {
						artOption: AtemSSrcArtOptionFromProtocolEnum(ssrc.properties.artOption),
					}
				} else {
					return undefined
				}
			},
		},
		['ssrc_box_source']: {
			// TODO - replace with 'ssrc_box_properties'
			type: 'boolean',
			name: 'Supersource: Box source',
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
		['ssrc_box_enable']: {
			// TODO - replace with 'ssrc_box_properties'
			type: 'boolean',
			name: 'Supersource: Box state',
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
		['ssrc_box_properties']: {
			type: 'boolean',
			name: 'Supersource: Box properties',
			options: convertOptionsFields({
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				...AtemSuperSourceBoxPropertiesPickers(model, state.state),
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
