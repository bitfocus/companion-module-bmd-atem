import { Enums, type AtemState, listVisibleInputs } from 'atem-connection'
import { type InputValue, InstanceBase } from '@companion-module/base'

export const MEDIA_PLAYER_SOURCE_CLIP_OFFSET = 1000

export function assertUnreachable(_never: never): void {
	// throw new Error('Unreachable')
}

export function pad(str: string, prefix: string, len: number): string {
	while (str.length < len) {
		str = prefix + str
	}
	return str
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

export function calculateTransitionSelection(
	keyCount: number,
	options: { [key: string]: InputValue | undefined },
): Enums.TransitionSelection[] {
	const selection: Enums.TransitionSelection[] = []
	if (options.background) {
		selection.push(Enums.TransitionSelection.Background)
	}

	for (let i = 0; i < keyCount; i++) {
		if (options[`key${i}`]) {
			selection.push(1 << (i + 1))
		}
	}

	return selection
}

export enum NumberComparitor {
	Equal = 'eq',
	NotEqual = 'ne',
	LessThan = 'lt',
	LessThanEqual = 'lte',
	GreaterThan = 'gt',
	GreaterThanEqual = 'gte',
}

export function compareNumber(target: number, comparitor: NumberComparitor, currentValue: number): boolean {
	const targetValue = Number(target)
	if (isNaN(targetValue)) {
		return false
	}

	switch (comparitor) {
		case NumberComparitor.GreaterThan:
			return currentValue > targetValue
		case NumberComparitor.GreaterThanEqual:
			return currentValue >= targetValue
		case NumberComparitor.LessThan:
			return currentValue < targetValue
		case NumberComparitor.LessThanEqual:
			return currentValue <= targetValue
		case NumberComparitor.NotEqual:
			return currentValue != targetValue
		default:
			return currentValue === targetValue
	}
}

export interface IpAndPort {
	ip: string
	port: number | undefined
}

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig

	parseIpAndPort(): IpAndPort | null
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
