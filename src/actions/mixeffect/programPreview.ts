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
	[ActionId.Preview]: {
		options: {
			mixeffect: number
			input: number
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
			position: number
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
				await atem?.changeProgramInput(options.input, options.mixeffect - 1)
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.mixeffect - 1)

				if (me) {
					return {
						input: me.programInput,
					}
				} else {
					return undefined
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
				await atem?.changePreviewInput(options.input, options.mixeffect - 1)
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.mixeffect - 1)

				if (me) {
					return {
						input: me.previewInput,
					}
				} else {
					return undefined
				}
			},
		},

		[ActionId.Cut]: {
			name: 'ME: Perform CUT transition',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
			}),
			callback: async ({ options }) => {
				await atem?.cut(options.mixeffect - 1)
			},
		},
		[ActionId.Auto]: {
			name: 'ME: Perform AUTO transition',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),
			}),
			callback: async ({ options }) => {
				await atem?.autoTransition(options.mixeffect - 1)
			},
		},

		[ActionId.TBar]: {
			name: 'ME: Set TBar position',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model, 0),

				position: {
					type: 'number',
					id: 'position',
					label: 'Position',
					default: 0,
					min: 0,
					max: 100,
					step: 1,
				},

				...FadeDurationFields,
			}),
			callback: async ({ options }) => {
				const meIndex = options.mixeffect - 1
				const position = options.position
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
