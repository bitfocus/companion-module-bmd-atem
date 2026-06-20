import { beforeEach, describe, expect, test } from 'vitest'
import { AtemStateUtil } from 'atem-connection'
import { createUpstreamKeyerDVEActions } from '../upstreamKeyerDVE.js'
import { AtemTransitions } from '../../../transitions.js'
import { ALL_MODELS } from '../../../models/index.js'
import type { ModelSpec } from '../../../models/types.js'
import { makeMockAtem, makeTestState } from '../../../__tests__/helpers.js'

// Regression for #326: DVE rotation is stored by the ATEM in tenths of a degree (like hue/sat/luma),
// so the action must scale by 10 on send and 1/10 on learn. Previously it was sent raw, so 180deg
// arrived as 18deg on the device.

const MODEL: ModelSpec = ALL_MODELS.find((m) => m.USKs > 0 && m.DVEs > 0)!

type AnyDef = { callback: (info: any) => unknown; learn?: (info: any) => any }

describe('uskDveProperties rotation scaling (#326)', () => {
	let mock: ReturnType<typeof makeMockAtem>
	let state: ReturnType<typeof makeTestState>
	let transitions: AtemTransitions

	beforeEach(() => {
		mock = makeMockAtem()
		state = makeTestState()
		transitions = new AtemTransitions({ fadeFps: 10 })
	})

	test('sends rotation in tenths of a degree', async () => {
		const actions = createUpstreamKeyerDVEActions(mock.atem, MODEL, transitions, state)
		const def = actions.uskDveProperties as unknown as AnyDef

		// No transitionRate -> the value is sent immediately rather than tweened.
		await def.callback({ options: { mixeffect: 1, key: 1, properties: ['rotation'], rotation: 180 } })

		const call = mock.onlyCall('setUpstreamKeyerDVESettings')
		const [props] = call.args as [{ rotation: number }, number, number]
		expect(props.rotation).toBe(1800)
	})

	test('learn reads rotation back in degrees', () => {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.upstreamKeyers[0] = { dveSettings: { rotation: 1800 } } as any

		const actions = createUpstreamKeyerDVEActions(mock.atem, MODEL, transitions, state)
		const def = actions.uskDveProperties as unknown as AnyDef

		const learned = def.learn!({ options: { mixeffect: 1, key: 1 } })
		expect(learned.rotation).toBe(180)
	})
})

describe('uskDvePropertiesDelta offset (#372)', () => {
	let mock: ReturnType<typeof makeMockAtem>
	let state: ReturnType<typeof makeTestState>
	let transitions: AtemTransitions

	beforeEach(() => {
		mock = makeMockAtem()
		state = makeTestState()
		transitions = new AtemTransitions({ fadeFps: 10 })
	})

	function seedDve(overrides: Record<string, number>) {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.upstreamKeyers[0] = {
			dveSettings: {
				positionX: 0,
				positionY: 0,
				sizeX: 1000,
				sizeY: 1000,
				rotation: 0,
				maskTop: 0,
				maskBottom: 0,
				maskLeft: 0,
				maskRight: 0,
				...overrides,
			},
		} as any
	}

	function delta() {
		const actions = createUpstreamKeyerDVEActions(mock.atem, MODEL, transitions, state)
		return actions.uskDvePropertiesDelta as unknown as AnyDef
	}

	test('adds the scaled delta to the current stored value', async () => {
		seedDve({ positionX: 250, sizeX: 1000 })
		await delta().callback({
			options: { mixeffect: 1, key: 1, properties: ['positionX', 'sizeX'], positionX: 0.5, sizeX: -0.2 },
		})

		const [props] = mock.onlyCall('setUpstreamKeyerDVESettings').args as [Record<string, number>]
		expect(props).toEqual({ positionX: 750, sizeX: 800 }) // 250 + 0.5*1000 ; 1000 + -0.2*1000
	})

	test('rotation delta is scaled by 10', async () => {
		seedDve({ rotation: 100 })
		await delta().callback({ options: { mixeffect: 1, key: 1, properties: ['rotation'], rotation: 5 } })

		const [props] = mock.onlyCall('setUpstreamKeyerDVESettings').args as [Record<string, number>]
		expect(props).toEqual({ rotation: 150 }) // 100 + 5*10
	})

	test('clamps the resulting value to the geometry limits', async () => {
		seedDve({ sizeX: 99000, maskLeft: 100 })
		await delta().callback({
			options: { mixeffect: 1, key: 1, properties: ['sizeX', 'maskLeft'], sizeX: 50, maskLeft: -10 },
		})

		const [props] = mock.onlyCall('setUpstreamKeyerDVESettings').args as [Record<string, number>]
		expect(props.sizeX).toBe(99990) // clamped to max (99000 + 50000 -> 99990)
		expect(props.maskLeft).toBe(0) // clamped to floor (100 + -10000 -> 0)
	})

	test('does nothing when the keyer has no DVE settings', async () => {
		AtemStateUtil.getMixEffect(state.state, 0) // create ME, no upstreamKeyers populated
		await delta().callback({ options: { mixeffect: 1, key: 1, properties: ['positionX'], positionX: 1 } })

		expect(mock.calls).toHaveLength(0)
	})
})
