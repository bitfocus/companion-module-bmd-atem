import { Enums, VideoState, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import {
	AtemSuperSourceArtPropertiesPickers,
	AtemSuperSourceBoxPicker,
	AtemSuperSourceBoxSourcePicker,
	AtemSuperSourceIdPicker,
	AtemSuperSourcePropertiesPickers,
	AtemSuperSourcePropertiesPickersForOffset,
	type AtemSuperSourceArtProperties,
	type AtemSuperSourceProperties,
	AtemSuperSourceArtPropertiesVariablesPickers,
	type AtemSuperSourceArtPropertiesVariables,
} from '../input.js'
import type { SuperSource } from 'atem-connection/dist/state/video/index.js'
import { CHOICES_KEYTRANS, type TrueFalseToggle } from '../choices.js'
import { getSuperSourceBox, type StateWrapper } from '../state.js'
import { clamp } from '../util.js'

export interface AtemSuperSourceActions {
	[ActionId.SuperSourceArt]: {
		ssrcId: number | undefined
	} & AtemSuperSourceArtProperties
	[ActionId.SuperSourceArtVariables]: {
		ssrcId: number | undefined
	} & AtemSuperSourceArtPropertiesVariables
	[ActionId.SuperSourceBoxSource]: {
		ssrcId: number | undefined
		boxIndex: number
		source: number
	}
	[ActionId.SuperSourceBoxSourceVaraibles]: {
		ssrcId: string | undefined
		boxIndex: string
		source: string
	}
	[ActionId.SuperSourceBoxOnAir]: {
		ssrcId: number | undefined
		boxIndex: number
		onair: TrueFalseToggle
	}
	[ActionId.SuperSourceBoxProperties]: {
		ssrcId: number | undefined
		boxIndex: number
	} & AtemSuperSourceProperties
	[ActionId.SuperSourceBoxPropertiesDelta]: {
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

export function createSuperSourceActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper
): MyActionDefinitions<AtemSuperSourceActions> {
	if (!model.SSrc) {
		return {
			[ActionId.SuperSourceArt]: undefined,
			[ActionId.SuperSourceArtVariables]: undefined,
			[ActionId.SuperSourceBoxSource]: undefined,
			[ActionId.SuperSourceBoxSourceVaraibles]: undefined,
			[ActionId.SuperSourceBoxOnAir]: undefined,
			[ActionId.SuperSourceBoxProperties]: undefined,
			[ActionId.SuperSourceBoxPropertiesDelta]: undefined,
		}
	}
	return {
		[ActionId.SuperSourceArt]: {
			name: 'SuperSource: Set art properties',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				...AtemSuperSourceArtPropertiesPickers(model, state.state, true),
			},
			callback: async ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const newProps: Partial<VideoState.SuperSource.SuperSourceProperties> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('fill')) newProps.artFillSource = options.getPlainNumber('fill')
					if (props.includes('key')) newProps.artCutSource = options.getPlainNumber('key')

					if (props.includes('artOption')) {
						const rawArtOption = options.getRaw('artOption')
						if (rawArtOption === 'toggle') {
							const ssrc = state.state.video.superSources[ssrcId]

							newProps.artOption =
								ssrc?.properties?.artOption === Enums.SuperSourceArtOption.Background
									? Enums.SuperSourceArtOption.Foreground
									: Enums.SuperSourceArtOption.Background
						} else if (rawArtOption !== 'unchanged') {
							newProps.artOption = Number(options.getRaw('artOption'))
						}
					}

					if (props.includes('artPreMultiplied'))
						newProps.artPreMultiplied = options.getPlainBoolean('artPreMultiplied')
					if (props.includes('artClip')) newProps.artClip = options.getPlainNumber('artClip') * 10
					if (props.includes('artGain')) newProps.artGain = options.getPlainNumber('artGain') * 10
					if (props.includes('artInvertKey')) newProps.artInvertKey = options.getPlainBoolean('artInvertKey')
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setSuperSourceProperties(newProps, ssrcId)
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
		[ActionId.SuperSourceArtVariables]: {
			name: 'SuperSource: Set art sources from variables',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				...AtemSuperSourceArtPropertiesVariablesPickers(),
			},
			callback: async ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const newProps: Partial<VideoState.SuperSource.SuperSourceProperties> = {}

				const ps: Promise<any>[] = []
				const setPropAsync = <T extends keyof typeof newProps>(key: T, value: Promise<(typeof newProps)[T]>) =>
					ps.push(
						value.then((v) => {
							newProps[key] = v
						})
					)

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('fill')) setPropAsync('artFillSource', options.getParsedNumber('fill'))
					if (props.includes('key')) setPropAsync('artCutSource', options.getParsedNumber('key'))

					// if (props.includes('artOption')) {
					// 	const rawArtOption = options.getRaw('artOption')
					// 	if (rawArtOption === 'toggle') {
					// 		const ssrc = state.state.video.superSources[ssrcId]

					// 		newProps.artOption =
					// 			ssrc?.properties?.artOption === Enums.SuperSourceArtOption.Background
					// 				? Enums.SuperSourceArtOption.Foreground
					// 				: Enums.SuperSourceArtOption.Background
					// 	} else if (rawArtOption !== 'unchanged') {
					// 		newProps.artOption = Number(options.getRaw('artOption'))
					// 	}
					// }

					// if (props.includes('artPreMultiplied'))
					// 	newProps.artPreMultiplied = options.getPlainBoolean('artPreMultiplied')
					// if (props.includes('artClip')) newProps.artClip = options.getPlainNumber('artClip') * 10
					// if (props.includes('artGain')) newProps.artGain = options.getPlainNumber('artGain') * 10
					// if (props.includes('artInvertKey')) newProps.artInvertKey = options.getPlainBoolean('artInvertKey')
				}

				await Promise.all(ps)

				if (Object.keys(newProps).length === 0) return

				await atem?.setSuperSourceProperties(newProps, ssrcId)
			},
			learn: ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.properties
				if (ssrcConfig) {
					return {
						...options.getJson(),
						fill: ssrcConfig.artFillSource + '',
						key: ssrcConfig.artCutSource + '',

						// artOption: ssrcConfig.artOption,
						// artPreMultiplied: ssrcConfig.artPreMultiplied,
						// artClip: ssrcConfig.artClip / 10,
						// artGain: ssrcConfig.artGain / 10,
						// artInvertKey: ssrcConfig.artInvertKey,
					}
				} else {
					return undefined
				}
			},
		},

		[ActionId.SuperSourceBoxSource]: {
			// TODO - combine into ActionId.SuperSourceBoxProperties
			name: 'SuperSource: Set box source',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				source: AtemSuperSourceBoxSourcePicker(model, state.state),
			},
			callback: async ({ options }) => {
				await atem?.setSuperSourceBoxSettings(
					{
						source: options.getPlainNumber('source'),
					},
					options.getPlainNumber('boxIndex'),
					options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				)
			},
			learn: ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const boxId = options.getPlainNumber('boxIndex')

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.boxes[boxId]
				if (ssrcConfig) {
					return {
						...options.getJson(),
						source: ssrcConfig.source,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.SuperSourceBoxSourceVaraibles]: {
			// TODO - combine into ActionId.SuperSourceBoxProperties
			name: 'SuperSource: Set box source from variables',
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
			callback: async ({ options }) => {
				const ssrcId =
					options.getRaw('ssrcId') && model.SSrc > 1 ? Number(await options.getParsedNumber('ssrcId')) - 1 : 0
				const boxIndex = (await options.getParsedNumber('boxIndex')) - 1
				const source = await options.getParsedNumber('source')

				if (isNaN(ssrcId) || isNaN(boxIndex) || isNaN(source)) return

				await atem?.setSuperSourceBoxSettings(
					{
						source: source,
					},
					boxIndex,
					ssrcId
				)
			},
			learn: async ({ options }) => {
				const ssrcId =
					options.getRaw('ssrcId') && model.SSrc > 1 ? Number(await options.getParsedNumber('ssrcId')) - 1 : 0
				const boxId = (await options.getParsedNumber('boxIndex')) - 1

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.boxes[boxId]
				if (ssrcConfig) {
					return {
						...options.getJson(),
						source: ssrcConfig.source + '',
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.SuperSourceBoxOnAir]: {
			// TODO - combine into ActionId.SuperSourceBoxProperties
			name: 'SuperSource: Set box enabled',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				onair: {
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: CHOICES_KEYTRANS,
				},
			},
			callback: async ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const boxIndex = options.getPlainNumber('boxIndex')

				if (options.getRaw('onair') === 'toggle') {
					const box = getSuperSourceBox(state.state, boxIndex, ssrcId)
					await atem?.setSuperSourceBoxSettings(
						{
							enabled: !box?.enabled,
						},
						boxIndex,
						ssrcId
					)
				} else {
					await atem?.setSuperSourceBoxSettings(
						{
							enabled: options.getRaw('onair') === 'true',
						},
						boxIndex,
						ssrcId
					)
				}
			},
			learn: ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const boxId = options.getPlainNumber('boxIndex')

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.boxes[boxId]
				if (ssrcConfig) {
					return {
						...options.getJson(),
						onair: ssrcConfig.enabled ? 'true' : 'false',
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.SuperSourceBoxProperties]: {
			name: 'SuperSource: Change box properties',
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				...AtemSuperSourcePropertiesPickers(model, state.state),
			},
			callback: async ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const boxIndex = options.getPlainNumber('boxIndex')

				const newProps: Partial<SuperSource.SuperSourceBox> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('onair')) {
						if (options.getPlainString('onair') === 'toggle') {
							const box = getSuperSourceBox(state.state, boxIndex, ssrcId)
							newProps.enabled = !box?.enabled
						} else {
							newProps.enabled = options.getPlainString('onair') === 'true'
						}
					}

					if (props.includes('source')) newProps.source = options.getPlainNumber('source')

					if (props.includes('size')) newProps.size = options.getPlainNumber('size') * 1000
					if (props.includes('x')) newProps.x = options.getPlainNumber('x') * 100
					if (props.includes('y')) newProps.y = options.getPlainNumber('y') * 100

					if (props.includes('cropEnable')) newProps.cropped = options.getPlainBoolean('cropEnable')
					if (props.includes('cropTop')) newProps.cropTop = options.getPlainNumber('cropTop') * 1000
					if (props.includes('cropBottom')) newProps.cropBottom = options.getPlainNumber('cropBottom') * 1000
					if (props.includes('cropLeft')) newProps.cropLeft = options.getPlainNumber('cropLeft') * 1000
					if (props.includes('cropRight')) newProps.cropRight = options.getPlainNumber('cropRight') * 1000
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setSuperSourceBoxSettings(newProps, boxIndex, ssrcId)
			},
			learn: ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const boxId = options.getPlainNumber('boxIndex')

				const ssrcConfig = state.state.video.superSources?.[ssrcId]?.boxes[boxId]
				if (ssrcConfig) {
					return {
						...options.getJson(),
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
			options: {
				ssrcId: AtemSuperSourceIdPicker(model),
				boxIndex: AtemSuperSourceBoxPicker(),
				...AtemSuperSourcePropertiesPickersForOffset(),
			},
			callback: async ({ options }) => {
				const ssrcId = options.getRaw('ssrcId') && model.SSrc > 1 ? Number(options.getRaw('ssrcId')) : 0
				const boxIndex = options.getPlainNumber('boxIndex')

				const newProps: Partial<SuperSource.SuperSourceBox> = {}

				const box = getSuperSourceBox(state.state, boxIndex, ssrcId)

				const props = options.getRaw('properties')
				if (box && props && Array.isArray(props)) {
					if (props.includes('size')) newProps.size = clamp(0, 1000, box.size + options.getPlainNumber('size') * 1000)
					if (props.includes('x')) newProps.x = clamp(-4800, 4800, box.x + options.getPlainNumber('x') * 100)
					if (props.includes('y')) newProps.y = clamp(-2700, 2700, box.y + options.getPlainNumber('y') * 100)

					if (props.includes('cropTop'))
						newProps.cropTop = clamp(0, 18000, box.cropTop + options.getPlainNumber('cropTop') * 1000)
					if (props.includes('cropBottom'))
						newProps.cropBottom = clamp(0, 18000, box.cropBottom + options.getPlainNumber('cropBottom') * 1000)
					if (props.includes('cropLeft'))
						newProps.cropLeft = clamp(0, 32000, box.cropLeft + options.getPlainNumber('cropLeft') * 1000)
					if (props.includes('cropRight'))
						newProps.cropRight = clamp(0, 32000, box.cropRight + options.getPlainNumber('cropRight') * 1000)
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setSuperSourceBoxSettings(newProps, boxIndex, ssrcId)
			},
		},
	}
}
