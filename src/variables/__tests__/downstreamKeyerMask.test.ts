import { describe, expect, test } from 'vitest'
import { AtemStateUtil } from 'atem-connection'
import type { DownstreamKeyer } from 'atem-connection/dist/state/video/downstreamKeyers.js'
import { updateDSKVariable } from '../lib.js'
import type { VariablesSchema } from '../schema.js'
import type { InstanceBaseExt } from '../../util.js'
import { createDownstreamKeyerActions } from '../../actions/downstreamKeyer.js'
import { ALL_MODELS } from '../../models/index.js'
import { makeMockAtem, makeTestState } from '../../__tests__/helpers.js'

// #394: the mask an action sets had no matching variable, so the switcher state could not be read
// back. The variables must agree with the action on units, or a read-modify-write would drift.

const INSTANCE = { config: {} } as unknown as InstanceBaseExt

function makeDSK(mask: {
	enabled: boolean
	top: number
	bottom: number
	left: number
	right: number
}): DownstreamKeyer {
	return {
		onAir: false,
		inTransition: false,
		isAuto: false,
		remainingFrames: 0,
		sources: { fillSource: 1, cutSource: 0 },
		properties: { tie: false, rate: 25, preMultiply: false, clip: 0, gain: 0, invert: false, mask },
	}
}

describe('DSK mask variables (#394)', () => {
	test('exposes the mask in the same units the action uses', () => {
		const state = AtemStateUtil.Create()
		state.video.downstreamKeyers[0] = makeDSK({
			enabled: true,
			top: 9000,
			bottom: -9000,
			left: -16000,
			right: 16000,
		})

		const values: Partial<VariablesSchema> = {}
		updateDSKVariable(INSTANCE, state, 0, values)

		expect(values['dsk_1_maskEnabled']).toBe(true)
		expect(values['dsk_1_maskTop']).toBe(9)
		expect(values['dsk_1_maskBottom']).toBe(-9)
		expect(values['dsk_1_maskLeft']).toBe(-16)
		expect(values['dsk_1_maskRight']).toBe(16)
	})

	test('is absent rather than wrong when the switcher has not reported a mask', () => {
		const state = AtemStateUtil.Create()

		const values: Partial<VariablesSchema> = {}
		updateDSKVariable(INSTANCE, state, 0, values)

		expect(values['dsk_1_maskTop']).toBeUndefined()
	})

	test('a value read from the variable sets the same mask back on the switcher', async () => {
		const model = ALL_MODELS.find((m) => m.DSKs > 0)!
		const mock = makeMockAtem()
		const state = makeTestState()
		state.state.video.downstreamKeyers[0] = makeDSK({
			enabled: true,
			top: 9000,
			bottom: -9000,
			left: -16000,
			right: 16000,
		})

		const values: Partial<VariablesSchema> = {}
		updateDSKVariable(INSTANCE, state.state, 0, values)

		const def = createDownstreamKeyerActions(mock.atem, model, state).dskMask as unknown as {
			callback: (info: any) => unknown
		}
		await def.callback({
			options: {
				key: 1,
				properties: ['maskEnabled', 'maskTop', 'maskBottom', 'maskLeft', 'maskRight'],
				maskEnabled: values['dsk_1_maskEnabled'],
				maskTop: values['dsk_1_maskTop'],
				maskBottom: values['dsk_1_maskBottom'],
				maskLeft: values['dsk_1_maskLeft'],
				maskRight: values['dsk_1_maskRight'],
			},
		})

		// Back to the raw values the switcher reported
		expect(mock.onlyCall('setDownstreamKeyMaskSettings').args[0]).toEqual({
			enabled: true,
			top: 9000,
			bottom: -9000,
			left: -16000,
			right: 16000,
		})
	})
})
