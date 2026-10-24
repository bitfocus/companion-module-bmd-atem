import { describe, expect, test } from 'vitest'
import { AtemStateUtil } from 'atem-connection'
import type { DownstreamKeyer } from 'atem-connection/dist/state/video/downstreamKeyers.js'
import { updateDSKVariable } from '../lib.js'
import type { VariablesSchema } from '../schema.js'
import type { InstanceBaseExt } from '../../util.js'

// A cut and an auto both flip onAir, so the transition state is needed to tell them apart.

const INSTANCE = { config: {} } as unknown as InstanceBaseExt

function makeDSK(transition: {
	onAir: boolean
	inTransition: boolean
	isAuto: boolean
	remainingFrames: number
}): DownstreamKeyer {
	return {
		...transition,
		sources: { fillSource: 1, cutSource: 0 },
	}
}

function valuesFor(dsk: DownstreamKeyer | undefined): Partial<VariablesSchema> {
	const state = AtemStateUtil.Create()
	if (dsk) state.video.downstreamKeyers[0] = dsk
	const values: Partial<VariablesSchema> = {}
	updateDSKVariable(INSTANCE, state, 0, values)
	return values
}

describe('DSK transition variables', () => {
	test('reports an auto transition in progress', () => {
		const values = valuesFor(makeDSK({ onAir: true, inTransition: true, isAuto: true, remainingFrames: 12 }))

		expect(values['dsk_1_inTransition']).toBe(true)
		expect(values['dsk_1_isAuto']).toBe(true)
		expect(values['dsk_1_remainingFrames']).toBe(12)
	})

	test('a cut is on air without a transition', () => {
		const values = valuesFor(makeDSK({ onAir: true, inTransition: false, isAuto: false, remainingFrames: 0 }))

		expect(values['dsk_1_onAir']).toBe(true)
		expect(values['dsk_1_inTransition']).toBe(false)
		expect(values['dsk_1_isAuto']).toBe(false)
		expect(values['dsk_1_remainingFrames']).toBe(0)
	})

	test('a stale auto flag or frame count is not reported once the transition has finished', () => {
		const values = valuesFor(makeDSK({ onAir: true, inTransition: false, isAuto: true, remainingFrames: 3 }))

		expect(values['dsk_1_isAuto']).toBe(false)
		expect(values['dsk_1_remainingFrames']).toBe(0)
	})

	test('defaults to idle before the switcher reports the keyer', () => {
		const values = valuesFor(undefined)

		expect(values['dsk_1_inTransition']).toBe(false)
		expect(values['dsk_1_isAuto']).toBe(false)
		expect(values['dsk_1_remainingFrames']).toBe(0)
	})
})
