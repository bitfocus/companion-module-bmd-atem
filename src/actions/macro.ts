import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../choices.js'
import type { StateWrapper } from '../state.js'
import { resolveTrueFalseToggle } from '../input.js'
import { AtemMacroPicker } from '../options/macro.js'

export type AtemMacroActions = {
	[ActionId.MacroRun]: {
		options: {
			macro: number
			action: 'run' | 'runContinue'
		}
	}
	[ActionId.MacroContinue]: {
		options: Record<string, never>
	}
	[ActionId.MacroStop]: {
		options: Record<string, never>
	}
	[ActionId.MacroLoop]: {
		options: {
			loop: TrueFalseToggle
		}
	}
}

export function createMacroActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemMacroActions> {
	if (!model.macros) {
		return {
			[ActionId.MacroRun]: undefined,
			[ActionId.MacroContinue]: undefined,
			[ActionId.MacroStop]: undefined,
			[ActionId.MacroLoop]: undefined,
		}
	}
	return {
		[ActionId.MacroRun]: {
			name: 'Macro: Run',
			options: convertOptionsFields({
				macro: AtemMacroPicker(model, state.state, 'macro'),
				action: {
					type: 'dropdown',
					id: 'action',
					label: 'Action',
					default: 'run',
					choices: [
						{ id: 'run', label: 'Run' },
						{ id: 'runContinue', label: 'Run/Continue' },
					],
					disableAutoExpression: true,
				},
			}),
			callback: async ({ options }) => {
				const macroIndex = options.macro - 1
				const { macroPlayer, macroRecorder } = state.state.macro
				if (options.action === 'runContinue' && macroPlayer.isWaiting && macroPlayer.macroIndex === macroIndex) {
					await atem?.macroContinue()
				} else if (macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex) {
					await atem?.macroStopRecord()
				} else {
					await atem?.macroRun(macroIndex)
				}
			},
		},
		[ActionId.MacroContinue]: {
			name: 'Macro: Continue',
			options: convertOptionsFields({}),
			callback: async () => {
				await atem?.macroContinue()
			},
		},
		[ActionId.MacroStop]: {
			name: 'Macro: Stop',
			options: convertOptionsFields({}),
			callback: async () => {
				await atem?.macroStop()
			},
		},
		[ActionId.MacroLoop]: {
			name: 'Macro: Loop',
			options: convertOptionsFields({
				loop: {
					id: 'loop',
					type: 'dropdown',
					label: 'Loop',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				const newState = resolveTrueFalseToggle(options.loop, state.state.macro.macroPlayer.loop)

				await atem?.macroSetLoop(newState)
			},
		},
	}
}
