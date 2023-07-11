import type { Atem } from 'atem-connection'
import { getMixEffect } from 'atem-connection/dist/state/util.js'
import { AtemMEPicker, AtemMESourcePicker, FadeDurationChoice } from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../../actions.js'
import type { MyActionDefinitions } from '../types.js'
import type { StateWrapper } from '../../state.js'
import type { AtemTransitions } from '../../transitions.js'

export interface AtemProgramPreviewActions {
	[ActionId.Program]: {
		mixeffect: number
		input: number
	}
	[ActionId.ProgramVariables]: {
		mixeffect: string
		input: string
	}
	[ActionId.Preview]: {
		mixeffect: number
		input: number
	}
	[ActionId.PreviewVariables]: {
		mixeffect: string
		input: string
	}
	[ActionId.Cut]: {
		mixeffect: number
	}
	[ActionId.Auto]: {
		mixeffect: number
	}
	[ActionId.TBar]: {
		mixeffect: number
		position: string
		fadeDuration: number
	}
}

export function createProgramPreviewActions(
	atem: Atem | undefined,
	model: ModelSpec,
	transitions: AtemTransitions,
	state: StateWrapper,
): MyActionDefinitions<AtemProgramPreviewActions> {
	return {
		[ActionId.Program]: {
			name: 'ME: Set Program input',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				input: AtemMESourcePicker(model, state.state, 0),
			},
			callback: async ({ options }) => {
				await atem?.changeProgramInput(options.getPlainNumber('input'), options.getPlainNumber('mixeffect'))
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))

				if (me) {
					return {
						...options.getJson(),
						input: me.programInput,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.ProgramVariables]: {
			name: 'ME: Set Program input from variables',
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
			callback: async ({ options }) => {
				const mixeffect = await options.getParsedNumber('mixeffect')
				const input = await options.getParsedNumber('input')

				if (!isNaN(mixeffect) && !isNaN(input)) {
					await atem?.changeProgramInput(input, mixeffect - 1)
				}
			},
		},
		[ActionId.Preview]: {
			name: 'ME: Set Preview input',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				input: AtemMESourcePicker(model, state.state, 0),
			},
			callback: async ({ options }) => {
				await atem?.changePreviewInput(options.getPlainNumber('input'), options.getPlainNumber('mixeffect'))
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))

				if (me) {
					return {
						...options.getJson(),
						input: me.previewInput,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.PreviewVariables]: {
			name: 'ME: Set Preview input from variables',
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
			callback: async ({ options }) => {
				const mixeffect = await options.getParsedNumber('mixeffect')
				const input = await options.getParsedNumber('input')

				if (!isNaN(mixeffect) && !isNaN(input)) {
					await atem?.changePreviewInput(input, mixeffect - 1)
				}
			},
		},

		[ActionId.Cut]: {
			name: 'ME: Perform CUT transition',
			options: {
				mixeffect: AtemMEPicker(model, 0),
			},
			callback: async ({ options }) => {
				await atem?.cut(options.getPlainNumber('mixeffect'))
			},
		},
		[ActionId.Auto]: {
			name: 'ME: Perform AUTO transition',
			options: {
				mixeffect: AtemMEPicker(model, 0),
			},
			callback: async ({ options }) => {
				await atem?.autoTransition(options.getPlainNumber('mixeffect'))
			},
		},

		[ActionId.TBar]: {
			name: 'ME: Set TBar position',
			options: {
				mixeffect: AtemMEPicker(model, 0),

				position: {
					type: 'textinput',
					id: 'position',
					label: 'Position (0 - 100)',
					default: '0',
					useVariables: true,
				},

				fadeDuration: FadeDurationChoice,
			},
			callback: async ({ options }) => {
				const position = await options.getParsedNumber('position')
				if (isNaN(position)) return

				const meIndex = options.getPlainNumber('mixeffect')
				const meState = getMixEffect(state.state, meIndex)

				await transitions.run(
					`me.${meIndex}.tbar`,
					async (value) => {
						await atem?.setTransitionPosition(value, meIndex)
					},
					meState?.transitionPosition.handlePosition,
					position * 100,
					options.getPlainNumber('fadeDuration'),
				)
			},
		},
	}
}
