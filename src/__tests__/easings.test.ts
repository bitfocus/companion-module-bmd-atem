import { describe, expect, test } from 'vitest'
import { getEasing, type algorithm, type curve } from '../easings.js'

// These tests assert *properties* an easing curve must satisfy, not the specific
// polynomial each implementation uses. The properties are an independent oracle:
// an off-by-a-sign or swapped-curve bug breaks them, but they don't re-state the
// formula, so they can't pass just by mirroring a buggy implementation.

const ALL_ALGORITHMS: algorithm[] = [
	'linear',
	'quadratic',
	'cubic',
	'quartic',
	'quintic',
	'sinusoidal',
	'exponential',
	'circular',
	'elastic',
	'back',
	'bounce',
]

const ALL_CURVES: curve[] = ['ease-in', 'ease-out', 'ease-in-out']

// Curves that overshoot (elastic, back) or oscillate (bounce) are intentionally
// non-monotonic, so the monotonicity property only applies to the rest.
const MONOTONIC_ALGORITHMS: algorithm[] = [
	'linear',
	'quadratic',
	'cubic',
	'quartic',
	'quintic',
	'sinusoidal',
	'exponential',
	'circular',
]

describe('getEasing', () => {
	test('falls back to linear (identity) for linear or missing inputs', () => {
		expect(getEasing()(0.37)).toBeCloseTo(0.37)
		expect(getEasing('linear', 'ease-in')(0.37)).toBeCloseTo(0.37)
		// An algorithm with no curve cannot be resolved, so it degrades to linear.
		expect(getEasing('quadratic', undefined)(0.37)).toBeCloseTo(0.37)
	})

	for (const algorithm of ALL_ALGORITHMS) {
		for (const curve of ALL_CURVES) {
			describe(`${algorithm} / ${curve}`, () => {
				const easing = getEasing(algorithm, curve)

				test('starts at 0 and ends at 1', () => {
					// The fundamental contract of an easing function over [0, 1].
					expect(easing(0)).toBeCloseTo(0)
					expect(easing(1)).toBeCloseTo(1)
				})

				if (curve === 'ease-in-out') {
					test('passes through 0.5 at the midpoint', () => {
						expect(easing(0.5)).toBeCloseTo(0.5)
					})
				}

				if (MONOTONIC_ALGORITHMS.includes(algorithm)) {
					test('is monotonically non-decreasing', () => {
						let prev = easing(0)
						for (let i = 1; i <= 20; i++) {
							const next = easing(i / 20)
							expect(next).toBeGreaterThanOrEqual(prev - 1e-9)
							prev = next
						}
					})
				}
			})
		}
	}
})
