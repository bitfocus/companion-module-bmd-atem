import type { CompanionVariableValues } from '@companion-module/base'
import type { AtemConfig } from '../config.js'
import type { InstanceBaseExt } from '../util.js'
import type { AtemState } from 'atem-connection'
import { formatDurationSeconds } from './util.js'

export function updateTimecodeVariables(
	instance: InstanceBaseExt<AtemConfig>,
	_state: AtemState,
	values: CompanionVariableValues
): void {
	values['timecode'] = formatDurationSeconds(instance.timecodeSeconds).hms
	// values['timecode_ms'] = formatDurationSeconds(instance.timecodeSeconds).hms
}
