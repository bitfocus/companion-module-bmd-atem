import { describe, expect, test } from 'vitest'
import { Enums } from 'atem-connection'

import { resolvePatternStyle } from '../mixeffect/upstreamKeyerPattern.js'

describe('upstream keyer pattern style expressions (#475)', () => {
	test.each([
		[Enums.Pattern.LeftToRightBar, Enums.Pattern.LeftToRightBar],
		['circle-iris', Enums.Pattern.CircleIris],
		['Circle Iris', Enums.Pattern.CircleIris],
		['toprightdiag', Enums.Pattern.TopRightDiagonal],
		[String(Enums.Pattern.TopRightDiagonal), Enums.Pattern.TopRightDiagonal], // legacy stored value
	])('accepts dropdown and expression values %s', (input, expected) => {
		expect(resolvePatternStyle(input)).toBe(expected)
	})

	test.each([undefined, null, '', 'top', 'not-a-pattern', -1, 18, 1.5])(
		'rejects invalid expression value %s',
		(input) => {
			expect(resolvePatternStyle(input)).toBeNull()
		},
	)
})
