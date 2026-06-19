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
