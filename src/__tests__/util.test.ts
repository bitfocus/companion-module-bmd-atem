import { describe, expect, test } from 'vitest'
import { AtemStateUtil, listVisibleInputs } from 'atem-connection'
import {
	calculateTallyForInputId,
	clamp,
	compact,
	iterateTimes,
	sanitizeFilename,
	stringifyValue,
	stringifyValueAlways,
} from '../util.js'

describe('sanitizeFilename', () => {
	test('passes through a clean filename unchanged', () => {
		expect(sanitizeFilename('my-recording')).toBe('my-recording')
		expect(sanitizeFilename('show_2026-04-19')).toBe('show_2026-04-19')
		expect(sanitizeFilename('Recording 01')).toBe('Recording 01')
	})

	test('replaces colon with underscore', () => {
		expect(sanitizeFilename('show:title')).toBe('show_title')
		expect(sanitizeFilename('12:00:00')).toBe('12_00_00')
	})

	test('replaces all reserved characters', () => {
		expect(sanitizeFilename('a\\b')).toBe('a_b')
		expect(sanitizeFilename('a/b')).toBe('a_b')
		expect(sanitizeFilename('a|b')).toBe('a_b')
		expect(sanitizeFilename('a*b')).toBe('a_b')
		expect(sanitizeFilename('a?b')).toBe('a_b')
		expect(sanitizeFilename('a"b')).toBe('a_b')
		expect(sanitizeFilename('a<b')).toBe('a_b')
		expect(sanitizeFilename('a>b')).toBe('a_b')
	})

	test('replaces control characters', () => {
		expect(sanitizeFilename('a\x00b')).toBe('a_b')
		expect(sanitizeFilename('a\x1fb')).toBe('a_b')
		expect(sanitizeFilename('a\tb')).toBe('a_b') // tab (0x09)
	})

	test('handles multiple invalid characters in a row', () => {
		expect(sanitizeFilename('a<>b')).toBe('a__b')
		expect(sanitizeFilename(':::film:::')).toBe('___film___')
	})

	test('handles empty string', () => {
		expect(sanitizeFilename('')).toBe('')
	})
})

describe('clamp', () => {
	test('returns the value unchanged when within range', () => {
		expect(clamp(0, 10, 5)).toBe(5)
		expect(clamp(-5, 5, 0)).toBe(0)
	})

	test('result is never outside [min, max]', () => {
		// Anchor: the defining property of clamp, not a re-derived formula.
		for (const val of [-100, -1, 0, 3, 9.5, 11, 1000]) {
			const result = clamp(0, 10, val)
			expect(result).toBeGreaterThanOrEqual(0)
			expect(result).toBeLessThanOrEqual(10)
		}
	})

	test('returns the boundary when the value is outside', () => {
		expect(clamp(0, 10, -1)).toBe(0)
		expect(clamp(0, 10, 99)).toBe(10)
	})
})

describe('compact', () => {
	test('removes undefined entries and preserves order', () => {
		expect(compact([1, undefined, 2, undefined, 3])).toEqual([1, 2, 3])
	})

	test('keeps falsy-but-defined values (0, null, false, empty string)', () => {
		// Anchor: only `undefined` is dropped, nothing else.
		expect(compact([0, null, false, '', undefined])).toEqual([0, null, false, ''])
	})

	test('handles an empty array', () => {
		expect(compact([])).toEqual([])
	})
})

describe('iterateTimes', () => {
	test('calls the callback once per index, in order', () => {
		expect(iterateTimes(3, (i) => i)).toEqual([0, 1, 2])
	})

	test('returns an empty array for a count of zero', () => {
		expect(iterateTimes(0, (i) => i)).toEqual([])
	})

	test('output length always equals the count', () => {
		for (const count of [0, 1, 5, 20]) {
			expect(iterateTimes(count, () => 'x')).toHaveLength(count)
		}
	})
})

describe('stringifyValue', () => {
	test('passes undefined and null straight through (not stringified)', () => {
		expect(stringifyValue(undefined)).toBe(undefined)
		expect(stringifyValue(null)).toBe(null)
	})

	test('returns strings unchanged', () => {
		expect(stringifyValue('hello')).toBe('hello')
		expect(stringifyValue('')).toBe('')
	})

	test('renders numbers and booleans as their toString', () => {
		expect(stringifyValue(42)).toBe('42')
		expect(stringifyValue(0)).toBe('0')
		expect(stringifyValue(true)).toBe('true')
		expect(stringifyValue(false)).toBe('false')
	})

	test('JSON-encodes objects and arrays', () => {
		expect(stringifyValue({ a: 1 })).toBe('{"a":1}')
		expect(stringifyValue([1, 2])).toBe('[1,2]')
	})

	test('stringifyValueAlways coerces null/undefined to an empty string', () => {
		expect(stringifyValueAlways(undefined)).toBe('')
		expect(stringifyValueAlways(null)).toBe('')
		expect(stringifyValueAlways(7)).toBe('7')
	})
})

describe('calculateTallyForInputId', () => {
	test('returns [] for input ids outside the nested-ME range', () => {
		// The nested-ME tally ids live in (10000, 11000); anything else is not a nested ME.
		const state = AtemStateUtil.Create()
		expect(calculateTallyForInputId(state, 1)).toEqual([])
		expect(calculateTallyForInputId(state, 9999)).toEqual([])
		expect(calculateTallyForInputId(state, 11001)).toEqual([])
	})

	test('returns [] when the referenced mix-effect does not exist', () => {
		const state = AtemStateUtil.Create() // no mix effects populated
		expect(calculateTallyForInputId(state, 10010)).toEqual([])
	})

	test('agrees with atem-connection listVisibleInputs for the decoded ME (program)', () => {
		// Anchor: this function wraps listVisibleInputs; assert consistency with the
		// library rather than re-deriving the id-decode formula here.
		const state = AtemStateUtil.Create()
		const me0 = AtemStateUtil.getMixEffect(state, 0)
		me0.programInput = 3
		me0.previewInput = 4

		// 10010 decodes to ME index 0, program
		expect(calculateTallyForInputId(state, 10010)).toEqual(listVisibleInputs('program', state, 0))
	})

	test('agrees with listVisibleInputs for the decoded ME (preview)', () => {
		const state = AtemStateUtil.Create()
		const me0 = AtemStateUtil.getMixEffect(state, 0)
		me0.programInput = 3
		me0.previewInput = 4

		// 10011 decodes to ME index 0, preview
		expect(calculateTallyForInputId(state, 10011)).toEqual(listVisibleInputs('preview', state, 0))
	})

	test('decodes the second mix-effect from the +10 id offset', () => {
		const state = AtemStateUtil.Create()
		AtemStateUtil.getMixEffect(state, 0)
		const me1 = AtemStateUtil.getMixEffect(state, 1)
		me1.programInput = 7
		me1.previewInput = 8

		// 10020 decodes to ME index 1, program
		expect(calculateTallyForInputId(state, 10020)).toEqual(listVisibleInputs('program', state, 1))
	})
})
