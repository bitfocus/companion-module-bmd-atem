import { assertNever, type CompanionInputFieldDropdown, type JsonValue } from '@companion-module/base'
import { stringifyValueAlways } from '../util.js'
import { Enums } from 'atem-connection'

export type TimecodeMode = 'freerun' | 'timeofday'

export function AtemTimecodeModePicker(): CompanionInputFieldDropdown<'mode', TimecodeMode> {
	return {
		type: 'dropdown',
		id: 'mode',
		label: 'Mode',
		choices: [
			{ id: 'freerun', label: 'Free run' },
			{ id: 'timeofday', label: 'Time of Day' },
		],
		default: 'freerun',
		expressionDescription: 'Should return a string: freerun, timeofday',
		allowInvalidValues: true,
	}
}

export function timecodeModeToEnum(ref: JsonValue | undefined): Enums.TimeMode | null {
	const refStr = stringifyValueAlways(ref).toLowerCase().trim()
	if (!refStr) return null

	// sanitise to <ascii>
	ref = refStr.replace(/[^a-z]/g, '')

	if (ref.startsWith('f') || ref.includes('free') || ref.includes('run')) {
		return Enums.TimeMode.FreeRun
	} else if (ref.startsWith('t') || ref.includes('time') || ref.includes('day')) {
		return Enums.TimeMode.TimeOfDay
	} else {
		return null
	}
}

export function upstreamKeyerTypeEnumToString(type: Enums.TimeMode): TimecodeMode | undefined {
	switch (type) {
		case Enums.TimeMode.FreeRun:
			return 'freerun'
		case Enums.TimeMode.TimeOfDay:
			return 'timeofday'
		default:
			assertNever(type)
			return undefined
	}
}
