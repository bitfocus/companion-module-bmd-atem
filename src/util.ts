import { type AtemState, listVisibleInputs } from 'atem-connection'
import type { InstanceBase, JsonValue } from '@companion-module/base'
import type { AtemSchema } from './schema.js'
import type { AtemConfig } from './config.js'

export const CLASSIC_AUDIO_MIN_GAIN = -60 // The minimum value to consider as valid for classic audio gain

export function assertUnreachable(_never: never): void {
	// throw new Error('Unreachable')
}

export function compact<T>(arr: Array<T | undefined>): T[] {
	return arr.filter((v) => v !== undefined) as T[]
}

export function iterateTimes<T>(count: number, cb: (i: number) => T): T[] {
	const res: T[] = []
	for (let i = 0; i < count; i++) {
		res.push(cb(i))
	}
	return res
}

export function clamp(min: number, max: number, val: number): number {
	return Math.min(Math.max(val, min), max)
}

export function stringifyValue(value: JsonValue | undefined): string | null | undefined {
	if (value === undefined || value === null) {
		return value
	} else if (typeof value === 'string') {
		return value
	} else if (typeof value === 'number' || typeof value === 'boolean') {
		return value.toString()
	} else {
		return JSON.stringify(value)
	}
}
export function stringifyValueAlways(value: JsonValue | undefined): string {
	return stringifyValue(value) ?? ''
}

export interface IpAndPort {
	ip: string
	port: number | undefined
}

export interface InstanceBaseExt extends InstanceBase<AtemSchema> {
	config: AtemConfig
	timecodeSeconds: number
	displayClockSeconds: number

	parseIpAndPort(): IpAndPort | null
}

/**
 * Sanitize a filename by replacing characters that are invalid on common filesystems
 * (exFAT, NTFS, HFS+) with underscores. This covers the ATEM's recording storage.
 *
 * Invalid characters: \ / : * ? " < > |  and control characters (0x00–0x1F)
 */
export function sanitizeFilename(filename: string): string {
	// Replace control characters and filesystem-reserved characters with _
	// eslint-disable-next-line no-control-regex
	return filename.replace(/[\u0000-\u001f\\/:|*?"<>]/g, '_')
}

export function calculateTallyForInputId(state: AtemState, inputId: number): number[] {
	if (inputId < 10000 || inputId > 11000) return []
	// Future: This is copied from atem-connection, and should be exposed as a helper function
	const nestedMeId = (inputId - (inputId % 10) - 10000) / 10 - 1
	const nestedMeMode = (inputId - 10000) % 10 === 0 ? 'program' : 'preview'

	// Ensure the ME exists in the state
	if (!state.video.mixEffects[nestedMeId]) return []

	return listVisibleInputs(nestedMeMode, state, nestedMeId)
}
