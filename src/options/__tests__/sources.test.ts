import { describe, expect, test } from 'vitest'
import { parseSourceId, parseSourceIdRequired } from '../sources.js'

describe('parseSourceId', () => {
	test('accepts plain non-negative integers', () => {
		expect(parseSourceId(0)).toBe(0)
		expect(parseSourceId(1)).toBe(1)
		expect(parseSourceId(4010)).toBe(4010)
	})

	test('accepts real switcher source ids that are not in every choices list', () => {
		// The whole point of the change: valid-but-unlisted ids (mask/clean/ME/direct sources).
		expect(parseSourceId(4010)).toBe(4010)
		expect(parseSourceId(7001)).toBe(7001)
		expect(parseSourceId(9001)).toBe(9001)
		expect(parseSourceId(10010)).toBe(10010)
		expect(parseSourceId(11000)).toBe(11000)
	})

	test('parses numeric strings (e.g. expression results) and trims whitespace', () => {
		expect(parseSourceId('4010')).toBe(4010)
		expect(parseSourceId(' 4010 ')).toBe(4010)
		expect(parseSourceId('0')).toBe(0)
	})

	test('rejects empty or whitespace-only values', () => {
		expect(parseSourceId('')).toBeNull()
		expect(parseSourceId('   ')).toBeNull()
	})

	test('rejects null and undefined', () => {
		expect(parseSourceId(undefined)).toBeNull()
		expect(parseSourceId(null)).toBeNull()
	})

	test('rejects non-numeric and non-integer values', () => {
		expect(parseSourceId('abc')).toBeNull()
		expect(parseSourceId('12abc')).toBeNull()
		expect(parseSourceId(1.5)).toBeNull()
		expect(parseSourceId('1.5')).toBeNull()
		expect(parseSourceId(Infinity)).toBeNull()
		expect(parseSourceId(NaN)).toBeNull()
	})

	test('rejects values outside the safe [0, 32767) bounds', () => {
		expect(parseSourceId(-1)).toBeNull()
		expect(parseSourceId(32767)).toBeNull()
		expect(parseSourceId(40000)).toBeNull()
		expect(parseSourceId(32766)).toBe(32766)
	})
})

describe('parseSourceIdRequired', () => {
	test('returns the parsed id for valid values', () => {
		expect(parseSourceIdRequired(4010)).toBe(4010)
		expect(parseSourceIdRequired('4010')).toBe(4010)
		expect(parseSourceIdRequired(0)).toBe(0)
	})

	test('throws a descriptive error naming the offending value', () => {
		expect(() => parseSourceIdRequired('abc')).toThrow(/abc/)
		expect(() => parseSourceIdRequired(-1)).toThrow(/-1/)
		expect(() => parseSourceIdRequired('')).toThrow()
		expect(() => parseSourceIdRequired(undefined)).toThrow()
	})
})
