import { describe, expect, test } from 'vitest'
import { sanitizeFilename } from '../util.js'

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
