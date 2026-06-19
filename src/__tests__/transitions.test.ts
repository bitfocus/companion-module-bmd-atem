import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { AtemTransitions } from '../transitions.js'

// AtemTransitions tweens a value from `from` to `to` over a duration, emitting
// intermediate steps on a timer. The properties asserted here are the ones that
// actually matter for a fade — it lands exactly on the target, it emits the right
// number of steps, and it snaps straight to the target when there's nothing to
// tween — rather than re-deriving the per-step interpolation formula.

// fps 10 => one step every 100ms.
function makeTransitions(): AtemTransitions {
	return new AtemTransitions({ fadeFps: 10 })
}

beforeEach(() => {
	vi.useFakeTimers()
})
afterEach(() => {
	vi.useRealTimers()
})

describe('AtemTransitions.run', () => {
	test('snaps straight to the target when the duration is a single step', async () => {
		const transitions = makeTransitions()
		const calls: number[][] = []

		// duration 50ms < one 100ms step => stepCount <= 1 => no tweening.
		await transitions.run('id', async (v) => void calls.push(v), [0], [10], 50)

		expect(calls).toEqual([[10]])
	})

	test('snaps straight to the target when a from value is unknown', async () => {
		const transitions = makeTransitions()
		const calls: number[][] = []

		// from is undefined => cannot tween => jump to target immediately.
		await transitions.run('id', async (v) => void calls.push(v), [undefined], [10], 1000)

		expect(calls).toEqual([[10]])
	})

	test('emits one step per frame and lands exactly on the target', async () => {
		const transitions = makeTransitions()
		const calls: number[][] = []

		// 500ms / 100ms per frame => 5 steps.
		await transitions.run('id', async (v) => void calls.push(v), [0], [10], 500)

		await vi.advanceTimersByTimeAsync(600)

		expect(calls).toHaveLength(5)
		expect(calls[calls.length - 1]).toEqual([10]) // must finish on the target
		// Values progress strictly towards the target (linear easing by default).
		const flat = calls.map((c) => c[0])
		for (let i = 1; i < flat.length; i++) {
			expect(flat[i]).toBeGreaterThan(flat[i - 1])
		}
	})

	test('lands exactly on the target regardless of easing algorithm', async () => {
		const transitions = makeTransitions()
		const calls: number[][] = []

		// A non-linear easing must still terminate at the target (ties to easing f(1)=1).
		await transitions.run('id', async (v) => void calls.push(v), [0], [10], 500, 'cubic', 'ease-in')

		await vi.advanceTimersByTimeAsync(600)

		expect(calls[calls.length - 1][0]).toBeCloseTo(10)
	})

	test('tweens multiple properties together and ends on every target', async () => {
		const transitions = makeTransitions()
		const calls: number[][] = []

		await transitions.run('id', async (v) => void calls.push(v), [0, 100], [10, 50], 300)

		await vi.advanceTimersByTimeAsync(400)

		expect(calls[calls.length - 1]).toEqual([10, 50])
	})

	test('stopAll halts any further steps', async () => {
		const transitions = makeTransitions()
		const calls: number[][] = []

		await transitions.run('id', async (v) => void calls.push(v), [0], [10], 1000)
		await vi.advanceTimersByTimeAsync(150) // let a step or two through
		const countAfterStop = calls.length

		transitions.stopAll()
		await vi.advanceTimersByTimeAsync(2000)

		expect(calls).toHaveLength(countAfterStop)
	})
})
