import { beforeEach, describe, expect, test } from 'vitest'
import { AtemStateUtil } from 'atem-connection'
import { createTransitionActions } from '../transition.js'
import { AtemCommandBatching } from '../../../batching.js'
import { ALL_MODELS } from '../../../models/index.js'
import type { ModelSpec } from '../../../models/types.js'
import type { InstanceBaseExt } from '../../../util.js'
import { makeMockAtem, makeTestState } from '../../../__tests__/helpers.js'

// Tier 2: behaviour tests for the relative transition-rate action added for #390.
// They seed the current rate in state, run the callback, and assert the protocol
// command is sent with the delta applied and clamped to the hardware 1-250 range.

const MODEL: ModelSpec = ALL_MODELS.find((m) => m.MEs >= 1)!

type AnyDef = { callback: (info: any, ctx?: any) => unknown }

const fakeInstance = { log: () => {} } as unknown as InstanceBaseExt

describe('transitionRateDelta', () => {
	let mock: ReturnType<typeof makeMockAtem>
	let state: ReturnType<typeof makeTestState>
	let commandBatching: AtemCommandBatching

	beforeEach(() => {
		mock = makeMockAtem()
		state = makeTestState()
		commandBatching = new AtemCommandBatching()
	})

	function makeActions() {
		const actions = createTransitionActions(fakeInstance, mock.atem, MODEL, commandBatching, state)
		return actions.transitionRateDelta as unknown as AnyDef
	}

	test('applies a positive delta to the mix rate', async () => {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.transitionSettings.mix = { rate: 25 }

		const def = makeActions()
		await def.callback({ options: { mixeffect: 1, style: 'mix', delta: 10 } })

		const call = mock.onlyCall('setMixTransitionSettings')
		const [props, meIndex] = call.args as [{ rate: number }, number]
		expect(props.rate).toBe(35)
		expect(meIndex).toBe(0)
	})

	test('applies a negative delta to the mix rate', async () => {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.transitionSettings.mix = { rate: 25 }

		const def = makeActions()
		await def.callback({ options: { mixeffect: 1, style: 'mix', delta: -10 } })

		const call = mock.onlyCall('setMixTransitionSettings')
		const [props] = call.args as [{ rate: number }, number]
		expect(props.rate).toBe(15)
	})

	test('clamps to the hardware ceiling of 250', async () => {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.transitionSettings.mix = { rate: 245 }

		const def = makeActions()
		await def.callback({ options: { mixeffect: 1, style: 'mix', delta: 50 } })

		const call = mock.onlyCall('setMixTransitionSettings')
		const [props] = call.args as [{ rate: number }, number]
		expect(props.rate).toBe(250)
	})

	test('clamps to the hardware floor of 1', async () => {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.transitionSettings.mix = { rate: 5 }

		const def = makeActions()
		await def.callback({ options: { mixeffect: 1, style: 'mix', delta: -50 } })

		const call = mock.onlyCall('setMixTransitionSettings')
		const [props] = call.args as [{ rate: number }, number]
		expect(props.rate).toBe(1)
	})

	test('routes to the wipe setter for the wipe style', async () => {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.transitionSettings.wipe = { rate: 30 } as any

		const def = makeActions()
		await def.callback({ options: { mixeffect: 1, style: 'wipe', delta: 5 } })

		const call = mock.onlyCall('setWipeTransitionSettings')
		const [props] = call.args as [{ rate: number }, number]
		expect(props.rate).toBe(35)
	})

	test('does nothing when the selected style has no settings yet', async () => {
		AtemStateUtil.getMixEffect(state.state, 0) // create ME, but no transitionSettings.dip

		const def = makeActions()
		await def.callback({ options: { mixeffect: 1, style: 'dip', delta: 5 } })

		expect(mock.calls).toHaveLength(0)
	})

	test('does nothing for the sting style', async () => {
		const me = AtemStateUtil.getMixEffect(state.state, 0)
		me.transitionSettings.mix = { rate: 25 }

		const def = makeActions()
		await def.callback({ options: { mixeffect: 1, style: 'sting', delta: 5 } })

		expect(mock.calls).toHaveLength(0)
	})
})
