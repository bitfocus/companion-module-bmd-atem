import type { Atem } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import { JsonValue, type CompanionActionDefinitions } from '@companion-module/base'
import { ActionId } from './ActionId.js'
import type { StateWrapper } from '../state.js'
import type { InstanceBaseExt } from '../util.js'
import { formatDurationSeconds } from '../variables/util.js'
import {
	AtemTimecodeModePicker,
	TimecodeMode,
	timecodeModeToEnum,
	upstreamKeyerTypeEnumToString,
} from '../options/timecode.js'

export type AtemTimecodeActions = {
	[ActionId.Timecode]: {
		options: {
			time: string
		}
	}
	[ActionId.TimecodeMode]: {
		options: {
			mode: TimecodeMode | JsonValue | undefined
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
				mode: AtemTimecodeModePicker(),
			}),
			callback: async ({ options }) => {
				const parsedMode = timecodeModeToEnum(options.mode)
				if (parsedMode === null) throw new Error("Invalid mode, must be 'freerun' or 'timeofday'")

				await atem?.setTimeMode(parsedMode)
			},
			learn: () => {
				const rawMode = state.state.settings.timeMode
				if (rawMode === undefined) return undefined

				const newMode = upstreamKeyerTypeEnumToString(rawMode)
				if (newMode === undefined) return undefined

				return {
					mode: newMode,
				}
			},
		},
	}
}
