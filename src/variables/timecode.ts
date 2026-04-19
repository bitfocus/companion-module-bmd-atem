import type { InstanceBaseExt } from '../util.js'
import type { AtemState } from 'atem-connection'
import { formatDurationSeconds } from './util.js'
import type { VariablesSchema } from './schema.js'

export function updateTimecodeVariables(
	instance: InstanceBaseExt,
	_state: AtemState,
	values: Partial<VariablesSchema>,
): void {
	values['timecode'] = formatDurationSeconds(instance.timecodeSeconds).hms
	// values['timecode_ms'] = formatDurationSeconds(instance.timecodeSeconds).hms
	values['display_clock'] = formatDurationSeconds(instance.displayClockSeconds).hms
}
