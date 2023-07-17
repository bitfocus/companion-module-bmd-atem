import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './index.js'
import { combineRgb, type CompanionInputFieldDropdown } from '@companion-module/base'
import { GetMacroChoices } from '../choices.js'
import { assertUnreachable } from '../util.js'
import type { StateWrapper } from '../state.js'

export enum MacroFeedbackType {
	IsRunning = 'isRunning',
	IsWaiting = 'isWaiting',
	IsRecording = 'isRecording',
	IsUsed = 'isUsed',
}

export interface AtemMacroFeedbacks {
	[FeedbackId.Macro]: {
		macroIndex: number
		state: MacroFeedbackType
	}
	[FeedbackId.MacroLoop]: {
		loop: boolean
	}
}

export function createMacroFeedbacks(model: ModelSpec, state: StateWrapper): MyFeedbackDefinitions<AtemMacroFeedbacks> {
	if (!model.macros) {
		return {
			[FeedbackId.Macro]: undefined,
			[FeedbackId.MacroLoop]: undefined,
		}
	}
	return {
		[FeedbackId.Macro]: {
			type: 'boolean',
			name: 'Macro: State',
			description: 'If the specified macro is running or waiting, change style of the bank',
			options: {
				macroIndex: {
					type: 'dropdown',
					label: 'Macro Number (1-100)',
					id: 'macroIndex',
					default: 1,
					choices: GetMacroChoices(model, state.state),
				} satisfies CompanionInputFieldDropdown,
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
				} satisfies CompanionInputFieldDropdown,
			},
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(238, 238, 0),
			},
			callback: ({ options }): boolean => {
				let macroIndex = options.getPlainNumber('macroIndex')
				if (!isNaN(macroIndex)) {
					macroIndex -= 1
					const { macroPlayer, macroRecorder } = state.state.macro
					const type = options.getPlainString('state')

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
		[FeedbackId.MacroLoop]: {
			type: 'boolean',
			name: 'Macro: Looping',
			description: 'If the specified macro is looping, change style of the bank',
			options: {
				loop: {
					type: 'checkbox',
					label: 'Looping',
					id: 'loop',
					default: true,
				},
			},
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(238, 238, 0),
			},
			callback: ({ options }): boolean => {
				return options.getPlainBoolean('loop') === !!state.state.macro.macroPlayer.loop
			},
		},
	}
}
