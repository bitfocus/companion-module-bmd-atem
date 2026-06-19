import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { CommandBatching } from '../batching.js'

// CommandBatching is a debounce-plus-in-flight-coalescing state machine. These
// tests drive it through its observable transitions (what gets sent, and when)
// rather than asserting its internal counters, so they catch real regressions in
// the batching behaviour rather than restating the implementation.

interface Deferred<T> {
	promise: Promise<T>
	resolve: (value: T) => void
}
function deferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void
	const promise = new Promise<T>((res) => {
		resolve = res
	})
	return { promise, resolve }
}

beforeEach(() => {
	vi.useFakeTimers()
})
afterEach(() => {
	vi.useRealTimers()
})

describe('CommandBatching', () => {
	test('sends a single queued change once, only after the debounce delay', async () => {
		const sent: number[] = []
		const batch = new CommandBatching<number>(
			async (v) => {
				sent.push(v)
			},
			{ delayStep: 100, maxBatch: 10 },
		)

		batch.queueChange(0, (v) => v + 1)

		// Nothing is sent until the debounce window elapses.
		await vi.advanceTimersByTimeAsync(99)
		expect(sent).toEqual([])

		await vi.advanceTimersByTimeAsync(1)
		expect(sent).toEqual([1])
	})

	test('coalesces a burst within the debounce window into one send', async () => {
		const sent: number[] = []
		const batch = new CommandBatching<number>(
			async (v) => {
				sent.push(v)
			},
			{ delayStep: 100, maxBatch: 10 },
		)

		// Each change resets the debounce timer, so a steady stream keeps deferring.
		batch.queueChange(0, (v) => v + 1)
		await vi.advanceTimersByTimeAsync(50)
		batch.queueChange(0, (v) => v + 1)
		await vi.advanceTimersByTimeAsync(50)
		expect(sent).toEqual([]) // timer was reset by the second change

		batch.queueChange(0, (v) => v + 1)
		await vi.advanceTimersByTimeAsync(100)

		// One send, carrying all three folded modifications.
		expect(sent).toEqual([3])
	})

	test('does not lose changes queued while a send is in flight', async () => {
		const sent: number[] = []
		const inflight: Deferred<void>[] = []
		const batch = new CommandBatching<number>(
			async (v) => {
				sent.push(v)
				const d = deferred<void>()
				inflight.push(d)
				return d.promise
			},
			{ delayStep: 100, maxBatch: 10 },
		)

		batch.queueChange(0, (v) => v + 1)
		await vi.advanceTimersByTimeAsync(100)
		expect(sent).toEqual([1]) // first send is now in flight (unresolved)

		// More changes arrive before the first send completes.
		batch.queueChange(0, (v) => v + 1)
		batch.queueChange(0, (v) => v + 1)
		expect(sent).toEqual([1]) // still only the first send

		// Complete the in-flight send; the queued changes must now flush.
		inflight[0].resolve()
		await vi.advanceTimersByTimeAsync(100)
		expect(sent).toHaveLength(2)
	})

	test('flushes immediately on completion when the in-flight batch hit maxBatch', async () => {
		const sent: number[] = []
		const inflight: Deferred<void>[] = []
		const batch = new CommandBatching<number>(
			async (v) => {
				sent.push(v)
				const d = deferred<void>()
				inflight.push(d)
				return d.promise
			},
			{ delayStep: 100, maxBatch: 2 },
		)

		batch.queueChange(0, (v) => v + 1)
		await vi.advanceTimersByTimeAsync(100)
		expect(sent).toHaveLength(1) // in flight

		// Queue up to maxBatch while in flight.
		batch.queueChange(0, (v) => v + 1)
		batch.queueChange(0, (v) => v + 1)

		inflight[0].resolve()
		// The next batch is sent right away (no debounce wait) because maxBatch was reached.
		await vi.advanceTimersByTimeAsync(1)
		expect(sent).toHaveLength(2)
	})
})
