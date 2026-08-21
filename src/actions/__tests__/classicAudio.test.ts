import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createClassicAudioActions } from '../classicAudio.js'
import { AtemTransitions } from '../../transitions.js'
import { ALL_MODELS } from '../../models/index.js'
import type { ModelSpec } from '../../models/types.js'
import { makeMockAtem, makeTestState } from '../../__tests__/helpers.js'

// #482: a muted classic audio channel reads back as -Infinity. Using that as the start of a fade
// made every step NaN, so the value which reached the switcher was whatever NaN serialised to
// rather than the requested gain.

const MODEL: ModelSpec = ALL_MODELS.find((m) => m.classicAudio)!

type AnyDef = { callback: (info: any, ctx?: any) => unknown }

const MUTED = -Infinity

describe('Classic audio gain fades from a muted channel (#482)', () => {
	let mock: ReturnType<typeof makeMockAtem>
	let state: ReturnType<typeof makeTestState>
	let transitions: AtemTransitions

	beforeEach(() => {
		mock = makeMockAtem()
		state = makeTestState()
		transitions = new AtemTransitions({ fadeFps: 10 })
	})

	function setMasterGain(gain: number) {
		state.state.audio = { master: { gain, balance: 0 }, channels: {} } as any
	}

	async function runMasterGain(target: number, fadeDuration: number): Promise<number[]> {
		const def = createClassicAudioActions(mock.atem, MODEL, transitions, state)
			.classicAudioMasterGain as unknown as AnyDef

		await def.callback({
			options: { gain: target, fadeDuration, fadeAlgorithm: 'linear', fadeCurve: 'in' },
		})
		for (let i = 0; i < 40; i++) await vi.advanceTimersByTimeAsync(100)

		return mock.calls
			.filter((c) => c.method === 'setClassicAudioMixerMasterProps')
			.map((c) => (c.args[0] as { gain: number }).gain)
	}

	test('holds the requested gain when already muted, with no fade', async () => {
		setMasterGain(MUTED)

		const def = createClassicAudioActions(mock.atem, MODEL, transitions, state)
			.classicAudioMasterGain as unknown as AnyDef
		await def.callback({ options: { gain: -60, fadeDuration: 0, fadeAlgorithm: 'linear', fadeCurve: 'in' } })

		expect(mock.onlyCall('setClassicAudioMixerMasterProps').args[0]).toEqual({ gain: -60 })
	})

	test('never sends a non-finite gain when fading from muted', async () => {
		vi.useFakeTimers()
		try {
			setMasterGain(MUTED)
			const sent = await runMasterGain(-60, 500)

			expect(sent.length).toBeGreaterThan(0)
			for (const gain of sent) expect(Number.isFinite(gain)).toBe(true)
			expect(sent.at(-1)).toBe(-60)
		} finally {
			vi.useRealTimers()
		}
	})

	test('fades up from muted across the usable range, ending on the target', async () => {
		vi.useFakeTimers()
		try {
			setMasterGain(MUTED)
			const sent = await runMasterGain(3, 500)

			for (const gain of sent) expect(Number.isFinite(gain)).toBe(true)
			// Starts from the bottom of the range rather than jumping straight to the target
			expect(sent[0]).toBeLessThan(0)
			expect(sent.at(-1)).toBe(3)
		} finally {
			vi.useRealTimers()
		}
	})

	test('still fades normally between two audible gains', async () => {
		vi.useFakeTimers()
		try {
			setMasterGain(-20)
			const sent = await runMasterGain(-60, 500)

			for (const gain of sent) expect(Number.isFinite(gain)).toBe(true)
			expect(sent.at(-1)).toBe(-60)
			// Monotonically decreasing towards the target
			for (let i = 1; i < sent.length; i++) expect(sent[i]).toBeLessThan(sent[i - 1])
		} finally {
			vi.useRealTimers()
		}
	})
})
