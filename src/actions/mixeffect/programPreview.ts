import type { Atem } from 'atem-connection'
import { convertOptionsFields } from '../../common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { getMixEffect } from 'atem-connection/dist/state/util.js'
import { AtemMEPicker, AtemMESourcePicker, FadeDurationFields, type FadeDurationFieldsType } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../ActionId.js'
import type { StateWrapper } from '../../state.js'
import type { AtemTransitions } from '../../transitions.js'

export type AtemProgramPreviewActions = {
	[ActionId.Program]: {
		options: {
			mixeffect: number
			input: number
		}
	}
	[ActionId.ProgramVariables]: {
		options: {
			mixeffect: string
			input: string
		}
	}
	[ActionId.Preview]: {
		options: {
			mixeffect: number
			input: number
		}
	}
	[ActionId.PreviewVariables]: {
		options: {
			mixeffect: string
			input: string
		}
	}
	[ActionId.Cut]: {
		options: {
			mixeffect: number
		}
	}
	[ActionId.Auto]: {
		options: {
			mixeffect: number
		}
	}
	[ActionId.TBar]: {
		options: {
			mixeffect: number
			position: string
		} & FadeDurationFieldsType
	}
}

export function createProgramPreviewActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions<AtemProgramPreviewActions> {
	return {
		[ActionId.Program]: {
			name: 'ME: Set Program input',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				input: AtemMESourcePicker(model, state.state, 0),
			}),
			callback: async ({ options }) => {
				await atem?.changeProgramInput(options.input, options.mixeffect)
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.mixeffect)

				if (me) {
					return {
						input: me.programInput,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.ProgramVariables]: {
			name: 'ME: Set Program input from variables',
			options: convertOptionsFields({
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
			}),
			callback: async ({ options }) => {
				const mixeffect = options.mixeffect
				const input = options.input

				if (!isNaN(mixeffect) && !isNaN(input)) {
					await atem?.changeProgramInput(input, mixeffect - 1)
				}
			},
		},

		[ActionId.Preview]: {
			name: 'ME: Set Preview input',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
				input: AtemMESourcePicker(model, state.state, 0),
			}),
			callback: async ({ options }) => {
				await atem?.changePreviewInput(options.input, options.mixeffect)
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
		[ActionId.PreviewVariables]: {
			name: 'ME: Set Preview input from variables',
			options: convertOptionsFields({
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
			}),
			callback: async ({ options }) => {
				const mixeffect = options.mixeffect
				const input = options.input

				if (!isNaN(mixeffect) && !isNaN(input)) {
					await atem?.changePreviewInput(input, mixeffect - 1)
				}
			},
		},

		[ActionId.Cut]: {
			name: 'ME: Perform CUT transition',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
			}),
			callback: async ({ options }) => {
				await atem?.cut(options.mixeffect)
			},
		},
		[ActionId.Auto]: {
			name: 'ME: Perform AUTO transition',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
			}),
			callback: async ({ options }) => {
				await atem?.autoTransition(options.mixeffect)
			},
		},

		[ActionId.TBar]: {
			name: 'ME: Set TBar position',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),

				position: {
					type: 'textinput',
					id: 'position',
					label: 'Position (0 - 100)',
					default: '0',
					useVariables: true,
				},

				...FadeDurationFields,
			}),
			callback: async ({ options }) => {
				const position = await options.position
				if (isNaN(position)) return

				const meIndex = options.mixeffect
				const meState = getMixEffect(state.state, meIndex)

				await transitions.runForFadeOptions(
					`me.${meIndex}.tbar`,
					async (value) => {
						await atem?.setTransitionPosition(value, meIndex)
					},
					meState?.transitionPosition.handlePosition,
					position * 100,
					options,
				)
			},
		},
	}
}
