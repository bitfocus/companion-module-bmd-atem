import { describe, expect, test } from 'vitest'
import { Enums } from 'atem-connection'
import {
	upstreamKeyerTypeStringToEnum,
	upstreamKeyerTypeEnumToString,
	flyKeyKeyFrameStringToEnum,
	flyKeyKeyFrameEnumToString,
} from '../upstreamKeyer.js'

describe('upstream keyer type string<->enum', () => {
	const ALL_TYPES = [
		Enums.MixEffectKeyType.Luma,
		Enums.MixEffectKeyType.Chroma,
		Enums.MixEffectKeyType.Pattern,
		Enums.MixEffectKeyType.DVE,
	]

	test('round-trips every enum value through its string form', () => {
		// Inverse property: enum -> string -> enum must be identity for all values.
		for (const type of ALL_TYPES) {
			const str = upstreamKeyerTypeEnumToString(type)
			expect(str).toBeDefined()
			expect(upstreamKeyerTypeStringToEnum(str)).toBe(type)
		}
	})

	test('matches the canonical lowercase keywords', () => {
		expect(upstreamKeyerTypeStringToEnum('luma')).toBe(Enums.MixEffectKeyType.Luma)
		expect(upstreamKeyerTypeStringToEnum('chroma')).toBe(Enums.MixEffectKeyType.Chroma)
		expect(upstreamKeyerTypeStringToEnum('pattern')).toBe(Enums.MixEffectKeyType.Pattern)
		expect(upstreamKeyerTypeStringToEnum('dve')).toBe(Enums.MixEffectKeyType.DVE)
	})

	test('is fuzzy: matches by first letter, case-insensitive, trimmed', () => {
		expect(upstreamKeyerTypeStringToEnum('L')).toBe(Enums.MixEffectKeyType.Luma)
		expect(upstreamKeyerTypeStringToEnum('  Chroma  ')).toBe(Enums.MixEffectKeyType.Chroma)
		expect(upstreamKeyerTypeStringToEnum('DVE')).toBe(Enums.MixEffectKeyType.DVE)
	})

	test('returns null for empty, unknown, or non-string-resolvable input', () => {
		expect(upstreamKeyerTypeStringToEnum('')).toBeNull()
		expect(upstreamKeyerTypeStringToEnum('   ')).toBeNull()
		expect(upstreamKeyerTypeStringToEnum('xyz')).toBeNull()
		expect(upstreamKeyerTypeStringToEnum(undefined)).toBeNull()
		expect(upstreamKeyerTypeStringToEnum(123)).toBeNull()
	})
})

describe('fly key keyframe string<->enum', () => {
	test('round-trips A and B through their string form', () => {
		for (const frame of [Enums.FlyKeyKeyFrame.A, Enums.FlyKeyKeyFrame.B]) {
			const str = flyKeyKeyFrameEnumToString(frame)
			expect(str).toBeDefined()
			expect(flyKeyKeyFrameStringToEnum(str)).toBe(frame)
		}
	})

	test('round-trips Full only when includeFull is set', () => {
		const str = flyKeyKeyFrameEnumToString(Enums.FlyKeyKeyFrame.Full)
		expect(str).toBe('full')
		expect(flyKeyKeyFrameStringToEnum(str, true)).toBe(Enums.FlyKeyKeyFrame.Full)
		// Without includeFull, 'full' is not a permitted choice.
		expect(flyKeyKeyFrameStringToEnum(str, false)).toBeNull()
	})

	test('is fuzzy and rejects unknown input', () => {
		expect(flyKeyKeyFrameStringToEnum('A')).toBe(Enums.FlyKeyKeyFrame.A)
		expect(flyKeyKeyFrameStringToEnum('  b ')).toBe(Enums.FlyKeyKeyFrame.B)
		expect(flyKeyKeyFrameStringToEnum('')).toBeNull()
		expect(flyKeyKeyFrameStringToEnum('z')).toBeNull()
		expect(flyKeyKeyFrameStringToEnum(undefined)).toBeNull()
	})
})
