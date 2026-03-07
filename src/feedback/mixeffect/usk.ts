import type { Enums } from 'atem-connection'
import { convertOptionsFields } from '../../common.js'
import { AtemKeyFillSourcePicker, AtemMEPicker, AtemUSKPicker, AtemUpstreamKeyerTypePicker } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { FeedbackId } from '../FeedbackId.js'
import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import { getUSK, type StateWrapper } from '../../state.js'
import { CHOICES_CURRENTKEYFRAMES } from '../../choices.js'

export type AtemUpstreamKeyerFeedbacks = {
	[FeedbackId.USKOnAir]: {
		type: 'boolean'
		options: {
			mixeffect: number
			key: number
		}
	}
	[FeedbackId.USKType]: {
		type: 'boolean'
		options: {
			mixeffect: number
			key: number
			type: Enums.MixEffectKeyType
		}
	}
	[FeedbackId.USKSource]: {
		type: 'boolean'
		options: {
			mixeffect: number
			key: number
			fill: number
		}
	}
	[FeedbackId.USKSourceVariables]: {
		type: 'boolean'
		options: {
			mixeffect: string
			key: string
			fill: string
		}
	}
	[FeedbackId.USKKeyFrame]: {
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
			[FeedbackId.USKOnAir]: undefined,
			[FeedbackId.USKType]: undefined,
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
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
			}),
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }): boolean => {
				const usk = getUSK(state.state, options.mixeffect, options.key)
				return !!usk?.onAir
			},
		},
		[FeedbackId.USKType]: {
			type: 'boolean',
			name: 'Upstream key: Key type',
			description: 'If the specified upstream keyer has the specified type, change style of the bank',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				type: AtemUpstreamKeyerTypePicker(),
			}),
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }): boolean => {
				const usk = getUSK(state.state, options.mixeffect, options.key)
				return usk?.mixEffectKeyType === options.type
			},
		},
		[FeedbackId.USKSource]: {
			type: 'boolean',
			name: 'Upstream key: Fill source',
			description: 'If the input specified is selected in the USK specified, change style of the bank',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				key: AtemUSKPicker(model),
				fill: AtemKeyFillSourcePicker(model, state.state),
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(238, 238, 0),
			},
			callback: ({ options }): boolean => {
				const usk = getUSK(state.state, options.mixeffect, options.key)
				return usk?.fillSource === options.fill
			},
			learn: ({ options }) => {
				const usk = getUSK(state.state, options.mixeffect, options.key)

				if (usk) {
					return {
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
			options: convertOptionsFields({
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
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(238, 238, 0),
			},
			callback: async ({ options }) => {
				const mixeffect = (await options.mixeffect) - 1
				const key = (await options.key) - 1
				const fill = await options.fill

				const usk = getUSK(state.state, mixeffect, key)
				return usk?.fillSource === fill
			},
			learn: async ({ options }) => {
				const mixeffect = (await options.mixeffect) - 1
				const key = (await options.key) - 1

				const usk = getUSK(state.state, mixeffect, key)

				if (usk) {
					return {
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
					options: convertOptionsFields({
						mixeffect: AtemMEPicker(model, 0),
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
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(238, 238, 0),
					},
					callback: ({ options }): boolean => {
						const usk = getUSK(state.state, options.mixeffect, options.key)
						return usk?.flyProperties?.isAtKeyFrame === Number(options.keyframe)
					},
					learn: ({ options }) => {
						const usk = getUSK(state.state, options.mixeffect, options.key)

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
