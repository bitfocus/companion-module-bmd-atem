import { beforeEach, describe, expect, test } from 'vitest'
import { createFairlightAudioActions } from '../fairlightAudio.js'
import { AtemTransitions } from '../../transitions.js'
import { ALL_MODELS } from '../../models/index.js'
import type { ModelSpec } from '../../models/types.js'
import { makeMockAtem, makeTestState } from '../../__tests__/helpers.js'

// #356: whether an input is stereo or split into mono channels is configured on the switcher, and
// decides which source ids it has. Addressing a source the input does not have used to be silently
// dropped by the switcher, which looked like the action doing nothing at all.

const MODEL: ModelSpec = ALL_MODELS.find((m) => m.fairlightAudio)!

const STEREO = '-65280'
const MONO_CH1 = '-256'
const MONO_CH2 = '-255'

type AnyDef = { callback: (info: any, ctx?: any) => unknown }

describe('Fairlight source validation (#356)', () => {
	let mock: ReturnType<typeof makeMockAtem>
	let state: ReturnType<typeof makeTestState>
	let transitions: AtemTransitions

	beforeEach(() => {
		mock = makeMockAtem()
		state = makeTestState()
		transitions = new AtemTransitions({ fadeFps: 10 })
	})

	function setInputSources(inputId: number, sources: string[]) {
		state.state.fairlight = {
			inputs: {
				[inputId]: { sources: Object.fromEntries(sources.map((s) => [s, { properties: {} }])) },
			},
		} as any
	}

	function mixOption(): AnyDef {
		return createFairlightAudioActions(mock.atem, MODEL, transitions, state)
			.fairlightAudioMixOption as unknown as AnyDef
	}

	test('sends to a source the input actually has', async () => {
		setInputSources(1301, [MONO_CH1, MONO_CH2])

		await mixOption().callback({ options: { input: 1301, source: MONO_CH1, option: 'on' } })

		const call = mock.onlyCall('setFairlightAudioMixerSourceProps')
		expect(call.args[0]).toBe(1301)
		expect(call.args[1]).toBe(MONO_CH1)
	})

	test('rejects a source the input does not have, naming both in readable terms', async () => {
		// A mic split into mono, while the picker defaults to stereo
		setInputSources(1301, [MONO_CH1, MONO_CH2])

		await expect(mixOption().callback({ options: { input: 1301, source: STEREO, option: 'on' } })).rejects.toThrow(
			/Audio input 1301 has no Stereo source, only: Mono \(Ch1\), Mono \(Ch2\)/,
		)

		expect(mock.calls).toHaveLength(0)
	})

	test('the same action still works for a stereo input, as it did before', async () => {
		setInputSources(1302, [STEREO])

		await mixOption().callback({ options: { input: 1302, source: STEREO, option: 'on' } })
		expect(mock.onlyCall('setFairlightAudioMixerSourceProps').args[1]).toBe(STEREO)
	})

	test('stays quiet when nothing is known about the input', async () => {
		// Not connected, or the input has not been reported yet
		await mixOption().callback({ options: { input: 1301, source: STEREO, option: 'on' } })
		expect(mock.calls).toHaveLength(1)
	})

	test('guards the monitor solo action too', async () => {
		setInputSources(1301, [MONO_CH1])

		const def = createFairlightAudioActions(mock.atem, MODEL, transitions, state)
			.fairlightAudioMonitorSolo as unknown as AnyDef

		await expect(def.callback({ options: { input: 1301, source: STEREO, solo: 'true' } })).rejects.toThrow(
			/has no Stereo source/,
		)
		expect(mock.calls).toHaveLength(0)
	})
})
