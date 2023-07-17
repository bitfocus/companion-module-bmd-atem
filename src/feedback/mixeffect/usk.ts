import type { Enums } from 'atem-connection'
import { AtemKeyFillSourcePicker, AtemMEPicker, AtemUSKPicker } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import type { MyFeedbackDefinitions } from '../types.js'
import { FeedbackId } from '../index.js'
import { combineRgb, type CompanionInputFieldDropdown } from '@companion-module/base'
import { getUSK, type StateWrapper } from '../../state.js'
import { CHOICES_CURRENTKEYFRAMES } from '../../choices.js'

export interface AtemUpstreamKeyerFeedbacks {
	[FeedbackId.USKOnAir]: {
		mixeffect: number
		key: number
	}
	[FeedbackId.USKSource]: {
		mixeffect: number
		key: number
		fill: number
	}
	[FeedbackId.USKSourceVariables]: {
		mixeffect: string
		key: string
		fill: string
	}
	[FeedbackId.USKKeyFrame]: {
		mixeffect: number
		key: number
		keyframe: Enums.IsAtKeyFrame
	}
}

export function createUpstreamKeyerFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): MyFeedbackDefinitions<AtemUpstreamKeyerFeedbacks> {
	if (!model.USKs) {
		return {
			[FeedbackId.USKOnAir]: undefined,
			[FeedbackId.USKSource]: undefined,
			[FeedbackId.USKSourceVariables]: undefined,
			[FeedbackId.USKKeyFrame]: undefined,
		}
	}
	return {
		[FeedbackId.USKOnAir]: {
			type: 'boolean',
			name: 'Upstream key: OnAir state',
			description: 'If the specified upstream keyer is active, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
			},
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }): boolean => {
				const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))
				return !!usk?.onAir
			},
		},
		[FeedbackId.USKSource]: {
			type: 'boolean',
			name: 'Upstream key: Fill source',
			description: 'If the input specified is selected in the USK specified, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				fill: AtemKeyFillSourcePicker(model, state.state),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(238, 238, 0),
			},
			callback: ({ options }): boolean => {
				const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))
				return usk?.fillSource === options.getPlainNumber('fill')
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))

				if (usk) {
					return {
						...options.getJson(),
						fill: usk.fillSource,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.USKSourceVariables]: {
			type: 'boolean',
			name: 'Upstream key: Fill source from variables',
			description: 'If the input specified is selected in the USK specified, change style of the bank',
			options: {
				mixeffect: {
					type: 'textinput',
					id: 'mixeffect',
					label: 'M/E',
					default: '1',
					useVariables: true,
				},
				key: {
					type: 'textinput',
					label: 'Key',
					id: 'key',
					default: '1',
					useVariables: true,
				},
				fill: {
					type: 'textinput',
					id: 'fill',
					label: 'Fill Source',
					default: '0',
					useVariables: true,
				},
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(238, 238, 0),
			},
			callback: async ({ options }) => {
				const mixeffect = (await options.getParsedNumber('mixeffect')) - 1
				const key = (await options.getParsedNumber('key')) - 1
				const fill = await options.getParsedNumber('fill')

				const usk = getUSK(state.state, mixeffect, key)
				return usk?.fillSource === fill
			},
			learn: async ({ options }) => {
				const mixeffect = (await options.getParsedNumber('mixeffect')) - 1
				const key = (await options.getParsedNumber('key')) - 1

				const usk = getUSK(state.state, mixeffect, key)

				if (usk) {
					return {
						...options.getJson(),
						fill: usk.fillSource + '',
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.USKKeyFrame]: model.DVEs
			? {
					type: 'boolean',
					name: 'Upstream key: Key frame',
					description: 'If the USK specified is at the Key Frame specified, change style of the bank',
					options: {
						mixeffect: AtemMEPicker(model, 0),
						key: AtemUSKPicker(model),
						keyframe: {
							type: 'dropdown',
							id: 'keyframe',
							label: 'Key Frame',
							choices: CHOICES_CURRENTKEYFRAMES,
							default: CHOICES_CURRENTKEYFRAMES[0].id,
						} satisfies CompanionInputFieldDropdown,
					},
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(238, 238, 0),
					},
					callback: ({ options }): boolean => {
						const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))
						return usk?.flyProperties?.isAtKeyFrame === Number(options.getPlainNumber('keyframe'))
					},
					learn: ({ options }) => {
						const usk = getUSK(state.state, options.getPlainNumber('mixeffect'), options.getPlainNumber('key'))

						if (usk?.flyProperties) {
							return {
								...options.getJson(),
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
