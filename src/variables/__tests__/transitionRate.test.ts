import { describe, expect, test } from 'vitest'
import { AtemStateUtil, Enums } from 'atem-connection'
import { updateMETransitionRateVariables } from '../lib.js'
import type { VariablesSchema } from '../schema.js'

// Unit tests for the transition-rate variable computation added for #390.
// The function is pure (no instance needed), so we feed it a hand-built state
// and assert the per-style values plus the "active style" value.

function makeState(nextStyle: Enums.TransitionStyle) {
	const state = AtemStateUtil.Create()
	const me = AtemStateUtil.getMixEffect(state, 0)
	me.transitionSettings.mix = { rate: 10 }
	me.transitionSettings.dip = { rate: 20 } as any
	me.transitionSettings.wipe = { rate: 30 } as any
	me.transitionSettings.DVE = { rate: 40 } as any
	me.transitionProperties.nextStyle = nextStyle
	return state
}

describe('updateMETransitionRateVariables', () => {
	test('exposes each per-style rate', () => {
		const values: Partial<VariablesSchema> = {}
		updateMETransitionRateVariables(makeState(Enums.TransitionStyle.MIX), 0, values)

		expect(values[`transition_1_rate_mix`]).toBe(10)
		expect(values[`transition_1_rate_dip`]).toBe(20)
		expect(values[`transition_1_rate_wipe`]).toBe(30)
		expect(values[`transition_1_rate_dve`]).toBe(40)
	})

	test.each([
		[Enums.TransitionStyle.MIX, 10],
		[Enums.TransitionStyle.DIP, 20],
		[Enums.TransitionStyle.WIPE, 30],
		[Enums.TransitionStyle.DVE, 40],
	])('active rate tracks the selected style %s', (style, expected) => {
		const values: Partial<VariablesSchema> = {}
		updateMETransitionRateVariables(makeState(style), 0, values)
		expect(values[`transition_1_rate`]).toBe(expected)
	})

	test('active rate is undefined when sting is selected', () => {
		const values: Partial<VariablesSchema> = {}
		updateMETransitionRateVariables(makeState(Enums.TransitionStyle.STING), 0, values)
		expect(values[`transition_1_rate`]).toBeUndefined()
	})

	test('missing per-style settings resolve to undefined', () => {
		const state = AtemStateUtil.Create()
		AtemStateUtil.getMixEffect(state, 0) // no transitionSettings populated

		const values: Partial<VariablesSchema> = {}
		updateMETransitionRateVariables(state, 0, values)

		expect(values[`transition_1_rate_mix`]).toBeUndefined()
		expect(values[`transition_1_rate`]).toBeUndefined()
	})
})
