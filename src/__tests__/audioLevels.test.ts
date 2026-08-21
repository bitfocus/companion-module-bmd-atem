import { beforeEach, describe, expect, test, vi } from 'vitest'
import { AtemAudioLevels } from '../audioLevels.js'
import type { SomeAtemAudioLevels } from 'atem-connection/dist/state/levels.js'

// #277: the switcher meters audio far faster than companion should be asked to recheck feedbacks,
// and only sends levels at all while we ask it to.

function masterLevels(inputLeftLevel: number): SomeAtemAudioLevels {
	return { system: 'fairlight', type: 'master', levels: { inputLeftLevel } as any }
}
function sourceLevels(index: number, source: bigint, inputLeftLevel: number): SomeAtemAudioLevels {
	return { system: 'fairlight', type: 'source', index, source, levels: { inputLeftLevel } as any }
}

describe('AtemAudioLevels', () => {
	let checks: number
	let sendLevels: boolean[]
	let levels: AtemAudioLevels

	beforeEach(() => {
		checks = 0
		sendLevels = []
		levels = new AtemAudioLevels(
			() => checks++,
			(enabled) => sendLevels.push(enabled),
		)
	})

	test('only asks the switcher for levels while something wants them', () => {
		expect(levels.isEnabled).toBe(false)
		expect(sendLevels).toEqual([])

		levels.subscribe('a')
		expect(sendLevels).toEqual([true])

		// A second subscriber must not ask again
		levels.subscribe('b')
		levels.subscribe('a')
		expect(sendLevels).toEqual([true])

		levels.unsubscribe('a')
		expect(sendLevels).toEqual([true])

		levels.unsubscribe('b')
		expect(sendLevels).toEqual([true, false])
		expect(levels.isEnabled).toBe(false)
	})

	test('resume re-asks only when something is still subscribed', () => {
		levels.resume()
		expect(sendLevels).toEqual([])

		levels.subscribe('a')
		levels.resume()
		expect(sendLevels).toEqual([true, true])
	})

	test('reports levels in decibels, and null when unknown', () => {
		expect(levels.getMasterLevel('inputLeftLevel')).toBeNull()

		// Sent as hundredths of a decibel
		levels.handleLevels(masterLevels(-1234))
		expect(levels.getMasterLevel('inputLeftLevel')).toBeCloseTo(-12.34)

		expect(levels.getSourceLevel(1, '-65280', 'inputLeftLevel')).toBeNull()
		levels.handleLevels(sourceLevels(1, -65280n, -600))
		expect(levels.getSourceLevel(1, '-65280', 'inputLeftLevel')).toBeCloseTo(-6)
		// A different source is kept separate
		expect(levels.getSourceLevel(2, '-65280', 'inputLeftLevel')).toBeNull()
	})

	test('coalesces a burst of updates into a single feedback check', async () => {
		vi.useFakeTimers()
		try {
			for (let i = 0; i < 50; i++) levels.handleLevels(masterLevels(-i))
			expect(checks).toBe(0) // nothing synchronously

			await vi.advanceTimersByTimeAsync(100)
			expect(checks).toBe(1)

			// The most recent value survives the coalescing
			expect(levels.getMasterLevel('inputLeftLevel')).toBeCloseTo(-0.49)
		} finally {
			vi.useRealTimers()
		}
	})

	test('checks no more than 20 times a second under a continuous stream', async () => {
		vi.useFakeTimers()
		try {
			// One update every 5ms for a second, ie 200hz
			for (let i = 0; i < 200; i++) {
				levels.handleLevels(masterLevels(-i))
				await vi.advanceTimersByTimeAsync(5)
			}
			expect(checks).toBeLessThanOrEqual(20)
			expect(checks).toBeGreaterThan(0)
		} finally {
			vi.useRealTimers()
		}
	})

	test('drops cached levels once nothing is listening', () => {
		levels.subscribe('a')
		levels.handleLevels(masterLevels(-1234))
		expect(levels.getMasterLevel('inputLeftLevel')).not.toBeNull()

		levels.unsubscribe('a')
		expect(levels.getMasterLevel('inputLeftLevel')).toBeNull()
	})
})
