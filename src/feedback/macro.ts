import type { ModelSpec } from '../models/index.js'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { assertUnreachable } from '../util.js'
import type { StateWrapper } from '../state.js'
import { AtemMacroPicker } from '../options/macro.js'

export enum MacroFeedbackType {
	IsRunning = 'isRunning',
	IsWaiting = 'isWaiting',
	IsRecording = 'isRecording',
	IsUsed = 'isUsed',
}

export type AtemMacroFeedbacks = {
	['macro']: {
		type: 'boolean'
		options: {
			macroIndex: number
			state: MacroFeedbackType
		}
	}
	['macroloop']: {
		type: 'boolean'
		options: {
			loop: boolean
		}
	}
}

export function createMacroFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemMacroFeedbacks> {
	if (!model.macros) {
		return {
			['macro']: undefined,
			['macroloop']: undefined,
		}
	}
	return {
		['macro']: {
			type: 'boolean',
			name: 'Macro: State',
			options: convertOptionsFields({
				macroIndex: AtemMacroPicker(model, state.state, 'macroIndex'),
				state: {
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: MacroFeedbackType.IsWaiting,
					choices: [
						{ id: MacroFeedbackType.IsRunning, label: 'Is Running' },
						{ id: MacroFeedbackType.IsWaiting, label: 'Is Waiting' },
						{ id: MacroFeedbackType.IsRecording, label: 'Is Recording' },
						{ id: MacroFeedbackType.IsUsed, label: 'Is Used' },
					],
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			defaultStyle: {
				color: 0xffffff,
				bgcolor: 0xeeee00,
			},
			callback: ({ options }): boolean => {
				let macroIndex = options.macroIndex
				if (!isNaN(macroIndex)) {
					macroIndex -= 1
					const { macroPlayer, macroRecorder } = state.state.macro
					const type = options.state

					switch (type) {
						case MacroFeedbackType.IsUsed: {
							const macro = state.state.macro.macroProperties[macroIndex]
							return !!macro?.isUsed
						}
						case MacroFeedbackType.IsRecording:
							return macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex
						case MacroFeedbackType.IsRunning:
							return macroPlayer.isRunning && macroPlayer.macroIndex === macroIndex
						case MacroFeedbackType.IsWaiting:
							return macroPlayer.isWaiting && macroPlayer.macroIndex === macroIndex
						default:
							assertUnreachable(type)
					}
				}
				return false
			},
		},
		['macroloop']: {
			type: 'boolean',
			name: 'Macro: Looping',
			options: convertOptionsFields({
				loop: {
					type: 'checkbox',
					label: 'Looping',
					id: 'loop',
					default: true,
				},
			}),
			defaultStyle: {
				color: 0xffffff,
				bgcolor: 0xeeee00,
			},
			callback: ({ options }): boolean => {
				return options.loop === !!state.state.macro.macroPlayer.loop
			},
		},
	}
}
