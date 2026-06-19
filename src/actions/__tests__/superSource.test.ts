import { beforeEach, describe, expect, test } from 'vitest'
import { AtemStateUtil } from 'atem-connection'
import type { SuperSource } from 'atem-connection/dist/state/video/index.js'
import { createSuperSourceActions } from '../superSource.js'
import { AtemTransitions } from '../../transitions.js'
import { ALL_MODELS } from '../../models/index.js'
import type { ModelSpec } from '../../models/types.js'
import { makeMockAtem, makeTestState } from '../../__tests__/helpers.js'

// Tier 2: learn<->callback INVERSE tests for SuperSource — the area the recent
// off-by-one fixes (#450/#453) touched. As with mediaPlayer, these feed learn()'s
// output back through callback() and assert the original box state is reproduced,
// so the box index, ssrc index and unit-scaling must agree on both sides. They
// do not re-state any `- 1` or `* 1000` constant.

const MODEL: ModelSpec = ALL_MODELS.find((m) => m.SSrc >= 1)!

type AnyDef = { callback: (info: any, ctx?: any) => unknown; learn?: (info: any, ctx?: any) => any }

function makeBox(overrides: Partial<SuperSource.SuperSourceBox>): SuperSource.SuperSourceBox {
	return {
		enabled: false,
		source: 0,
		x: 0,
		y: 0,
		size: 0,
		cropped: false,
		cropTop: 0,
		cropBottom: 0,
		cropLeft: 0,
		cropRight: 0,
		...overrides,
	}
}

describe('SuperSource learn<->callback inverse', () => {
	let mock: ReturnType<typeof makeMockAtem>
	let state: ReturnType<typeof makeTestState>
	let transitions: AtemTransitions

	beforeEach(() => {
		mock = makeMockAtem()
		state = makeTestState()
		transitions = new AtemTransitions({ fadeFps: 10 })
	})

	test('setSsrcBoxSource round-trips the source and the box index', async () => {
		const ssrc = AtemStateUtil.getSuperSource(state.state, 0)
		ssrc.boxes[1] = makeBox({ source: 7 })

		const actions = createSuperSourceActions(mock.atem, MODEL, transitions, state)
		const def = actions.setSsrcBoxSource as unknown as AnyDef

		// box 2 (1-based) in the UI
		const learned = def.learn!({ options: { ssrcId: 1, boxIndex: 2, source: 0 } })
		await def.callback({ options: { ssrcId: 1, boxIndex: 2, ...learned } })

		const call = mock.onlyCall('setSuperSourceBoxSettings')
		const [props, boxIndex] = call.args as [{ source: number }, number]
		expect(props.source).toBe(7)
		expect(boxIndex).toBe(1) // UI box 2 -> protocol box index 1, consistently both ways
	})

	test('setSsrcBoxEnable round-trips the enabled flag', async () => {
		const ssrc = AtemStateUtil.getSuperSource(state.state, 0)
		ssrc.boxes[0] = makeBox({ enabled: true })

		const actions = createSuperSourceActions(mock.atem, MODEL, transitions, state)
		const def = actions.setSsrcBoxEnable as unknown as AnyDef

		const learned = def.learn!({ options: { ssrcId: 1, boxIndex: 1, onair: 'toggle' } })
		await def.callback({ options: { ssrcId: 1, boxIndex: 1, ...learned } })

		const call = mock.onlyCall('setSuperSourceBoxSettings')
		const [props] = call.args as [{ enabled: boolean }, number]
		expect(props.enabled).toBe(true)
	})

	test('setSsrcBoxProperties round-trips all box properties through learn and callback', async () => {
		// Protocol-unit values chosen so the /1000 and /100 scalings round-trip exactly.
		const original = makeBox({
			enabled: true,
			source: 3,
			x: 200,
			y: -100,
			size: 500,
			cropped: true,
			cropTop: 1000,
			cropBottom: 2000,
			cropLeft: 3000,
			cropRight: 4000,
		})
		const ssrc = AtemStateUtil.getSuperSource(state.state, 0)
		ssrc.boxes[0] = original

		const actions = createSuperSourceActions(mock.atem, MODEL, transitions, state)
		const def = actions.setSsrcBoxProperties as unknown as AnyDef

		const learned = def.learn!({ options: { ssrcId: 1, boxIndex: 1 } })

		// learn does not return the `properties` selector, so apply every property back.
		const properties = [
			'onair',
			'source',
			'size',
			'x',
			'y',
			'cropEnable',
			'cropTop',
			'cropBottom',
			'cropLeft',
			'cropRight',
		]
		await def.callback({ options: { ssrcId: 1, boxIndex: 1, properties, ...learned } })

		const call = mock.onlyCall('setSuperSourceBoxSettings')
		const [props, boxIndex, ssrcId] = call.args as [Partial<SuperSource.SuperSourceBox>, number, number]
		expect(boxIndex).toBe(0)
		expect(ssrcId).toBe(0)
		// The reconstructed properties must match the state we started from.
		expect(props).toEqual(original)
	})
})
