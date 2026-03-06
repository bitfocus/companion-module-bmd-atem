import { AtemMEPicker, AtemMESourcePicker } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import type { MyFeedbackDefinitions } from '../types.js'
import { FeedbackId } from '../FeedbackId.js'
import { combineRgb } from '@companion-module/base'
import { getMixEffect, type StateWrapper } from '../../state.js'

export type AtemPreviewFeedbacks = {
	[FeedbackId.PreviewBG]: {
		type: 'boolean'
		options: {
			mixeffect: number
			input: number
		}
	}
	[FeedbackId.PreviewVariables]: {
		type: 'boolean'
		options: {
			mixeffect: string
			input: string
		}
	}
	[FeedbackId.PreviewBG2]: {
		type: 'boolean'
		options: {
			mixeffect1: number
			input1: number
			mixeffect2: number
			input2: number
		}
	}
	[FeedbackId.PreviewBG3]: {
		type: 'boolean'
		options: {
			mixeffect1: number
			input1: number
			mixeffect2: number
			input2: number
			mixeffect3: number
			input3: number
		}
	}
	[FeedbackId.PreviewBG4]: {
		type: 'boolean'
		options: {
			mixeffect1: number
			input1: number
			mixeffect2: number
			input2: number
			mixeffect3: number
			input3: number
			mixeffect4: number
			input4: number
		}
	}
}

export function createPreviewFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): MyFeedbackDefinitions<AtemPreviewFeedbacks> {
	return {
		[FeedbackId.PreviewBG]: {
			type: 'boolean',
			name: 'ME: One ME preview source',
			description: 'If the input specified is selected in preview on the M/E stage specified, change style of the bank',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				input: AtemMESourcePicker(model, state.state, 0),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: ({ options }): boolean => {
				const me = getMixEffect(state.state, options.mixeffect)
				return me?.previewInput === options.input
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.mixeffect)

				if (me) {
					return {
						input: me.previewInput,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.PreviewVariables]: {
			type: 'boolean',
			name: 'ME: One ME preview source from variables',
			description: 'If the input specified is selected in preview on the M/E stage specified, change style of the bank',
			options: {
				mixeffect: {
					type: 'textinput',
					id: 'mixeffect',
					label: 'M/E',
					default: '1',
					useVariables: true,
				},
				input: {
					type: 'textinput',
					id: 'input',
					label: 'Input ID',
					default: '0',
					useVariables: true,
				},
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: async ({ options }) => {
				const mixeffect = (await options.mixeffect) - 1
				const input = await options.input

				const me = getMixEffect(state.state, mixeffect)
				return me?.previewInput === input
			},
			learn: async ({ options }) => {
				const mixeffect = (await options.mixeffect) - 1

				const me = getMixEffect(state.state, mixeffect)

				if (me) {
					return {
						input: me.previewInput + '',
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.PreviewBG2]:
			model.MEs >= 2
				? {
						type: 'boolean',
						name: 'ME: Two ME preview sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: {
							mixeffect1: AtemMEPicker(model, 1),
							input1: AtemMESourcePicker(model, state.state, 1),
							mixeffect2: AtemMEPicker(model, 2),
							input2: AtemMESourcePicker(model, state.state, 2),
						},
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: ({ options }): boolean => {
							const me1 = getMixEffect(state.state, options.mixeffect1)
							const me2 = getMixEffect(state.state, options.mixeffect2)
							return me1?.previewInput === options.input1 && me2?.previewInput === options.input2
						},
						learn: ({ options }) => {
							const me1 = getMixEffect(state.state, options.mixeffect1)
							const me2 = getMixEffect(state.state, options.mixeffect2)

							if (me1 && me2) {
								return {
									input1: me1.previewInput,
									input2: me2.previewInput,
								}
							} else {
								return undefined
							}
						},
					}
				: undefined,
		[FeedbackId.PreviewBG3]:
			model.MEs >= 3
				? {
						type: 'boolean',
						name: 'ME: Three ME preview sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: {
							mixeffect1: AtemMEPicker(model, 1),
							input1: AtemMESourcePicker(model, state.state, 1),
							mixeffect2: AtemMEPicker(model, 2),
							input2: AtemMESourcePicker(model, state.state, 2),
							mixeffect3: AtemMEPicker(model, 3),
							input3: AtemMESourcePicker(model, state.state, 3),
						},
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: ({ options }): boolean => {
							const me1 = getMixEffect(state.state, options.mixeffect1)
							const me2 = getMixEffect(state.state, options.mixeffect2)
							const me3 = getMixEffect(state.state, options.mixeffect3)
							return (
								me1?.previewInput === options.input1 &&
								me2?.previewInput === options.input2 &&
								me3?.previewInput === options.input3
							)
						},
						learn: ({ options }) => {
							const me1 = getMixEffect(state.state, options.mixeffect1)
							const me2 = getMixEffect(state.state, options.mixeffect2)
							const me3 = getMixEffect(state.state, options.mixeffect3)

							if (me1 && me2 && me3) {
								return {
									input1: me1.previewInput,
									input2: me2.previewInput,
									input3: me3.previewInput,
								}
							} else {
								return undefined
							}
						},
					}
				: undefined,
		[FeedbackId.PreviewBG4]:
			model.MEs >= 4
				? {
						type: 'boolean',
						name: 'ME: Four ME preview sources',
						description:
							'If the inputs specified are in use by program on the M/E stage specified, change style of the bank',
						options: {
							mixeffect1: AtemMEPicker(model, 1),
							input1: AtemMESourcePicker(model, state.state, 1),
							mixeffect2: AtemMEPicker(model, 2),
							input2: AtemMESourcePicker(model, state.state, 2),
							mixeffect3: AtemMEPicker(model, 3),
							input3: AtemMESourcePicker(model, state.state, 3),
							mixeffect4: AtemMEPicker(model, 4),
							input4: AtemMESourcePicker(model, state.state, 4),
						},
						defaultStyle: {
							color: combineRgb(0, 0, 0),
							bgcolor: combineRgb(0, 255, 0),
						},
						callback: ({ options }): boolean => {
							const me1 = getMixEffect(state.state, options.mixeffect1)
							const me2 = getMixEffect(state.state, options.mixeffect2)
							const me3 = getMixEffect(state.state, options.mixeffect3)
							const me4 = getMixEffect(state.state, options.mixeffect4)
							return (
								me1?.previewInput === options.input1 &&
								me2?.previewInput === options.input2 &&
								me3?.previewInput === options.input3 &&
								me4?.previewInput === options.input4
							)
						},
						learn: ({ options }) => {
							const me1 = getMixEffect(state.state, options.mixeffect1)
							const me2 = getMixEffect(state.state, options.mixeffect2)
							const me3 = getMixEffect(state.state, options.mixeffect3)
							const me4 = getMixEffect(state.state, options.mixeffect4)

							if (me1 && me2 && me3 && me4) {
								return {
									input1: me1.previewInput,
									input2: me2.previewInput,
									input3: me3.previewInput,
									input4: me4.previewInput,
								}
							} else {
								return undefined
							}
						},
					}
				: undefined,
	}
}
