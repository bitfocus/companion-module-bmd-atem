import { describe, expect, test } from 'vitest'
import { resolveTrueFalseToggle } from '../common.js'

describe('resolveTrueFalseToggle', () => {
	test('resolves explicit on/off regardless of the current value', () => {
		// The current value is irrelevant unless toggling.
		expect(resolveTrueFalseToggle('true', false)).toBe(true)
		expect(resolveTrueFalseToggle('true', true)).toBe(true)
		expect(resolveTrueFalseToggle('false', true)).toBe(false)
		expect(resolveTrueFalseToggle('false', false)).toBe(false)
	})

	test('accepts raw booleans as well as the string forms', () => {
		expect(resolveTrueFalseToggle(true, false)).toBe(true)
		expect(resolveTrueFalseToggle(false, true)).toBe(false)
	})

	test('toggle inverts the current value', () => {
		expect(resolveTrueFalseToggle('toggle', true)).toBe(false)
		expect(resolveTrueFalseToggle('toggle', false)).toBe(true)
	})

	test('toggle treats an unknown current value as off (so it turns on)', () => {
		expect(resolveTrueFalseToggle('toggle', undefined)).toBe(true)
	})
})
