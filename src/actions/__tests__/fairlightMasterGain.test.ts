import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createFairlightAudioActions } from '../fairlightAudio.js'
import { createFairlightAudioFeedbacks } from '../../feedback/fairlightAudio.js'
import { ALL_MODELS } from '../../models/index.js'
import { NumberComparitor } from '../../options/audio.js'
import { AtemTransitions } from '../../transitions.js'
import { makeMockAtem, makeTestState } from '../../__tests__/helpers.js'

const MODEL = ALL_MODELS.find((model) => model.fairlightAudio)!
const NO_FADE = { fadeDuration: 0, fadeAlgorithm: 'linear', fadeCurve: 'in' }

type TestDefinition = {
	options: Array<{ id: string; min?: number; max?: number; clampValues?: boolean }>
	callback: (info: any) => unknown
	learn: () => unknown
}

describe('Fairlight master gain range (#486)', () => {
	let mock: ReturnType<typeof makeMockAtem>
	let state: ReturnType<typeof makeTestState>
	let transitions: AtemTransitions

	beforeEach(() => {
		mock = makeMockAtem()
		state = makeTestState()
		transitions = new AtemTransitions({ fadeFps: 10 })
	})

	afterEach(() => {
		transitions.stopAll()
		vi.useRealTimers()
	})

	function setMasterGain(gain: number) {
		state.state.fairlight = { master: { properties: { faderGain: gain * 100 } }, inputs: {} } as any
	}

	function actions() {
		return createFairlightAudioActions(mock.atem, MODEL, transitions, state) as unknown as Record<
			string,
			TestDefinition
		>
	}

	function feedback() {
		return createFairlightAudioFeedbacks(MODEL, state).fairlightAudioMasterGain as unknown as TestDefinition
	}

	test('Set and feedback expose the same -100 to +10 dB range', () => {
		for (const model of ALL_MODELS.filter((model) => model.fairlightAudio)) {
			const set = createFairlightAudioActions(mock.atem, model, transitions, state).fairlightAudioMasterGain!
			const fb = createFairlightAudioFeedbacks(model, state).fairlightAudioMasterGain!
			for (const definition of [set, fb]) {
				if (!definition) throw new Error(`Missing Fairlight master gain definition for ${model.label}`)
				expect(definition.options.find((option) => option.id === 'gain')).toMatchObject({
					min: -100,
					max: 10,
					clampValues: true,
				})
			}
		}
	})

	test('Set +10 sends 1000 in protocol units', async () => {
		setMasterGain(6)
		await actions().fairlightAudioMasterGain.callback({ options: { gain: 10, ...NO_FADE } })
		expect(mock.onlyCall('setFairlightAudioMixerMasterProps').args).toEqual([{ faderGain: 1000 }])
	})

	test.each([
		[6, 4, 10],
		[9.5, 0.5, 10],
		[10, 4, 10],
		[9, 4, 10],
		[-99, -4, -100],
		[0, -1.5, -1.5],
	])('Adjust %s dB by %s dB ends at %s dB', async (current, delta, expected) => {
		setMasterGain(current)
		await actions().fairlightAudioMasterGainDelta.callback({ options: { delta, ...NO_FADE } })
		expect(mock.onlyCall('setFairlightAudioMixerMasterProps').args).toEqual([{ faderGain: expected * 100 }])
	})

	test('Adjust without a known master gain sends nothing', async () => {
		await actions().fairlightAudioMasterGainDelta.callback({ options: { delta: 4, ...NO_FADE } })
		expect(mock.calls).toEqual([])
	})

	test('learn and feedback retain +10 dB', async () => {
		setMasterGain(10)
		expect(actions().fairlightAudioMasterGain.learn()).toEqual({ gain: 10 })
		expect(feedback().learn()).toEqual({ gain: 10 })
		expect(await feedback().callback({ options: { gain: 10, comparitor: NumberComparitor.Equal } })).toBe(true)
		expect(await feedback().callback({ options: { gain: 6, comparitor: NumberComparitor.Equal } })).toBe(false)
	})

	test.each(['set', 'adjust'])('%s fades from +6 to +10 without overshooting', async (operation) => {
		vi.useFakeTimers()
		setMasterGain(6)
		const definition =
			operation === 'set' ? actions().fairlightAudioMasterGain : actions().fairlightAudioMasterGainDelta
		await definition.callback({ options: { gain: 10, delta: 8, ...NO_FADE, fadeDuration: 500 } })
		await vi.advanceTimersByTimeAsync(1000)
		const values = mock.calls
			.filter((call) => call.method === 'setFairlightAudioMixerMasterProps')
			.map((call) => (call.args[0] as { faderGain: number }).faderGain)
		expect(values.length).toBeGreaterThan(1)
		for (const value of values) {
			expect(Number.isFinite(value)).toBe(true)
			expect(value).toBeGreaterThanOrEqual(600)
			expect(value).toBeLessThanOrEqual(1000)
		}
		expect(values.at(-1)).toBe(1000)
	})
})
