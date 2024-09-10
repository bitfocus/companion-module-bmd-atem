import { Enums, type AtemState, listVisibleInputs } from 'atem-connection'
import { InstanceBase } from '@companion-module/base'
import { AudioRoutingChannelsNames } from './choices.js'
import { combineInputId } from './models/util/audioRouting.js'

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
	rawSelection: ('background' | string)[] | undefined,
): Enums.TransitionSelection[] {
	if (!rawSelection || !Array.isArray(rawSelection)) return []

	const selection: Enums.TransitionSelection[] = []
	if (rawSelection.includes('background')) {
		selection.push(Enums.TransitionSelection.Background)
	}

	for (let i = 0; i < keyCount; i++) {
		if (rawSelection.includes(`key${i}`)) {
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
	timecodeSeconds: number

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

export function formatAudioRoutingAsString(id: number): string {
	const inputId = Math.floor(id >> 16)
	const pair: Enums.AudioChannelPair = id & 0xff

	const pairName = AudioRoutingChannelsNames[pair]?.replace('/', '_')

	return `${inputId}-${pairName}`
}
export function parseAudioRoutingString(ids: string): number[] {
	return ids
		.split(/[,| ]/)
		.map((id) => parseAudioRoutingStringSingle(id))
		.filter((id): id is number => id !== null)
}

const ROUTING_STRING_REGEX = /(\d+)-([\d]+_[\d+])/i
export function parseAudioRoutingStringSingle(id: string): number | null {
	id = id.trim()
	if (!id) return null

	const match = ROUTING_STRING_REGEX.exec(id)
	if (match) {
		const inputId = Number(match[1])

		const pairValueStr = match[2]?.replace('_', '/')
		const pairValueOption = Object.entries(AudioRoutingChannelsNames).find(([, value]) => value === pairValueStr)
		if (!pairValueOption) return null
		const pairValue = Number(pairValueOption[0])

		if (isNaN(inputId) || isNaN(pairValue)) return null

		return combineInputId(inputId, pairValue)
	}

	const inputId = Number(id)
	if (isNaN(inputId)) return null

	return combineInputId(inputId, Enums.AudioChannelPair.Channel1_2)
}
