import { type Atem, Enums } from 'atem-connection'
import { convertOptionsFields } from '../common.js'
import { assertNever, CompanionInputFieldDropdown, type CompanionActionDefinitions } from '@companion-module/base'
import { ActionId } from './ActionId.js'
import type { StateWrapper } from '../state.js'
import type { InstanceBaseExt } from '../util.js'
import { formatDurationSeconds } from '../variables/util.js'

type TimecodeMode = 'freerun' | 'timeofday'

export type AtemTimecodeActions = {
	[ActionId.Timecode]: {
		options: {
			time: string
		}
	}
	[ActionId.TimecodeMode]: {
		options: {
			mode: TimecodeMode
		}
	}
}

export function createTimecodeActions(
	instance: InstanceBaseExt,
	atem: Atem | undefined,
	state: StateWrapper,
): CompanionActionDefinitions<AtemTimecodeActions> {
	if (!instance.config.pollTimecode) {
		return {
			[ActionId.Timecode]: undefined,
			[ActionId.TimecodeMode]: undefined,
		}
	}
	return {
		[ActionId.Timecode]: {
			name: 'Timecode: Set time',
			options: convertOptionsFields({
				time: {
					id: 'time',
					type: 'textinput',
					label: 'Timecode',
					default: '00:00:00',
					tooltip: 'HH:MM:SS',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				const [hour, minute, seconds, frames] = options.time.split(/:|;/).map((v) => parseInt(v, 10))

				if (isNaN(hour) || isNaN(minute) || isNaN(seconds)) throw new Error('Invalid timecode')

				await atem?.setTime(hour, minute, seconds, isNaN(frames) ? 0 : frames)
			},
			learn: () => {
				const timecode = formatDurationSeconds(instance.timecodeSeconds).hms

				return {
					time: timecode,
				}
			},
		},
		[ActionId.TimecodeMode]: {
			name: 'Timecode: Set mode',
			options: convertOptionsFields({
				mode: {
					id: 'mode',
					type: 'dropdown',
					label: 'Mode',
					choices: [
						{ id: 'freerun', label: 'Free run' },
						{ id: 'timeofday', label: 'Time of Day' },
					],
					default: 'freerun',
					expressionDescription: "Set to 'freerun' or 'timeofday'",
					allowInvalidValues: true,
				} satisfies CompanionInputFieldDropdown<'mode', TimecodeMode>,
			}),
			callback: async ({ options }) => {
				let newMode: Enums.TimeMode | undefined

				const rawMode = String(options.mode).toLowerCase()
				if (rawMode.includes('free') || rawMode.includes('run')) {
					newMode = Enums.TimeMode.FreeRun
				} else if (rawMode.includes('time') || rawMode.includes('day')) {
					newMode = Enums.TimeMode.TimeOfDay
				} else {
					throw new Error("Invalid mode, must be 'freerun' or 'timeofday'")
				}

				await atem?.setTimeMode(newMode)
			},
			learn: () => {
				const rawMode = state.state.settings.timeMode
				if (rawMode === undefined) return undefined

				let newMode: TimecodeMode | undefined
				switch (rawMode) {
					case Enums.TimeMode.FreeRun:
						newMode = 'freerun'
						break
					case Enums.TimeMode.TimeOfDay:
						newMode = 'timeofday'
						break
					default:
						assertNever(rawMode)
						return undefined
				}

				return {
					mode: newMode,
				}
			},
		},
	}
}
