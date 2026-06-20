import { beforeEach, describe, expect, test } from 'vitest'
import { AtemStateUtil } from 'atem-connection'
import { createUpstreamKeyerLumaChromaActions } from '../upstreamKeyerLumaChroma.js'
import { ALL_MODELS } from '../../../models/index.js'
import type { ModelSpec } from '../../../models/types.js'
import { makeMockAtem, makeTestState } from '../../../__tests__/helpers.js'

// Coverage for the luma + advanced chroma USK actions added to finish #132. Clip/gain and every
// advanced-chroma field are stored by the ATEM in tenths, so the action scales by 10 on send and
// 1/10 on learn. These assert the round-trip, including a signed field (brightness).

const MODEL: ModelSpec = ALL_MODELS.find((m) => m.USKs > 0)!

type AnyDef = { callback: (info: any) => unknown; learn?: (info: any) => any }

describe('USK luma + advanced chroma (#132)', () => {
	let mock: ReturnType<typeof makeMockAtem>
	let state: ReturnType<typeof makeTestState>

	beforeEach(() => {
		mock = makeMockAtem()
		state = makeTestState()
	})

	function actions() {
		return createUpstreamKeyerLumaChromaActions(mock.atem, MODEL, state)
	}

	test('luma: sends clip/gain in tenths and passes booleans through', async () => {
		const def = actions().uskLumaProperties as unknown as AnyDef
		await def.callback({
			options: {
				mixeffect: 1,
				key: 1,
				properties: ['preMultiplied', 'clip', 'gain', 'invert'],
				preMultiplied: false,
				clip: 50,
				gain: 70,
				invert: true,
			},
		})

		const call = mock.onlyCall('setUpstreamKeyerLumaSettings')
		const [props, me, keyer] = call.args as [Record<string, unknown>, number, number]
		expect(props).toEqual({ preMultiplied: false, clip: 500, gain: 700, invert: true })
		expect(me).toBe(0)
		expect(keyer).toBe(0)
	})

	test('luma: learn reads back display values', () => {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.upstreamKeyers[0] = { lumaSettings: { preMultiplied: true, clip: 500, gain: 700, invert: false } } as any

		const def = actions().uskLumaProperties as unknown as AnyDef
		const learned = def.learn!({ options: { mixeffect: 1, key: 1 } })
		expect(learned).toEqual({ preMultiplied: true, clip: 50, gain: 70, invert: false })
	})

	test('luma: only the selected properties are sent', async () => {
		const def = actions().uskLumaProperties as unknown as AnyDef
		await def.callback({
			options: { mixeffect: 1, key: 1, properties: ['clip'], preMultiplied: false, clip: 25, gain: 70, invert: true },
		})

		const [props] = mock.onlyCall('setUpstreamKeyerLumaSettings').args as [Record<string, unknown>]
		expect(props).toEqual({ clip: 250 })
	})

	test('advanced chroma: sends selected fields in tenths, including a signed value', async () => {
		const def = actions().uskAdvancedChromaProperties as unknown as AnyDef
		await def.callback({
			options: {
				mixeffect: 1,
				key: 1,
				properties: ['foregroundLevel', 'brightness'],
				foregroundLevel: 80,
				brightness: -50,
			},
		})

		const [props] = mock.onlyCall('setUpstreamKeyerAdvancedChromaProperties').args as [Record<string, unknown>]
		expect(props).toEqual({ foregroundLevel: 800, brightness: -500 })
	})

	test('advanced chroma: learn reads back display values', () => {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.upstreamKeyers[0] = {
			advancedChromaSettings: {
				properties: {
					foregroundLevel: 800,
					backgroundLevel: 0,
					keyEdge: 0,
					spillSuppression: 0,
					flareSuppression: 0,
					brightness: -500,
					contrast: 0,
					saturation: 1000,
					red: 0,
					green: 0,
					blue: 0,
				},
			},
		} as any

		const def = actions().uskAdvancedChromaProperties as unknown as AnyDef
		const learned = def.learn!({ options: { mixeffect: 1, key: 1 } })
		expect(learned.foregroundLevel).toBe(80)
		expect(learned.brightness).toBe(-50)
		expect(learned.saturation).toBe(100)
	})
})
