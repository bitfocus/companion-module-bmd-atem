import { InputValue } from '../../../instance_skel_types'
import InstanceSkel = require('../../../instance_skel')
import { AtemConfig } from './config'

export const MEDIA_PLAYER_SOURCE_CLIP_OFFSET = 1000

export function assertUnreachable(_never: never): void {
	// throw new Error('Unreachable')
}

export function literal<T>(val: T): T {
	return val
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
	options: { [key: string]: InputValue | undefined }
): number {
	let selection = 0
	if (options.background) {
		selection |= 1 << 0
	}

	for (let i = 0; i < keyCount; i++) {
		if (options[`key${i}`]) {
			selection |= 1 << (i + 1)
		}
	}

	return selection
}

export function executePromise(instance: InstanceSkel<AtemConfig>, prom: Promise<unknown> | undefined): void {
	try {
		prom?.catch((e) => {
			instance.debug('Action execution error: ' + e)
		})
	} catch (e) {
		instance.debug('Action failed: ' + e)
	}
}

export enum NumberComparitor {
	Equal = 'eq',
	NotEqual = 'ne',
	LessThan = 'lt',
	LessThanEqual = 'lte',
	GreaterThan = 'gt',
	GreaterThanEqual = 'gte',
}

export function compareNumber(
	target: InputValue | undefined,
	comparitor: InputValue | undefined,
	currentValue: number
): boolean {
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
