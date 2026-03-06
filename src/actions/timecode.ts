import { type Atem, Enums } from 'atem-connection'
import { convertOptionsFields } from '../common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { ActionId } from './ActionId.js'
import type { StateWrapper } from '../state.js'
import type { InstanceBaseExt } from '../util.js'
import { formatDurationSeconds } from '../variables/util.js'

export type AtemTimecodeActions = {
	[ActionId.Timecode]: {
		options: {
			time: string
		}
	}
	[ActionId.TimecodeMode]: {
		options: {
			mode: Enums.TimeMode
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
						{ id: Enums.TimeMode.FreeRun, label: 'Free run' },
						{ id: Enums.TimeMode.TimeOfDay, label: 'Time of Day' },
					],
					default: Enums.TimeMode.FreeRun,
				},
			}),
			callback: async ({ options }) => {
				const mode = options.mode

				await atem?.setTimeMode(mode)
			},
			learn: () => {
				return {
					mode: state.state.settings.timeMode ?? Enums.TimeMode.FreeRun,
				}
			},
		},
	}
}
