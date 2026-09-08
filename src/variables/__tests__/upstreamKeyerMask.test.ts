import { describe, expect, test } from 'vitest'
import { AtemStateUtil } from 'atem-connection'
import type { InstanceBaseExt } from '../../util.js'
import { updateUSKVariable } from '../lib.js'
import type { VariablesSchema } from '../schema.js'

const INSTANCE = { config: {} } as unknown as InstanceBaseExt

describe('USK mask variables (#491)', () => {
	test('keeps the Luma/Chroma/Pattern mask separate from the DVE mask', () => {
		const state = AtemStateUtil.Create()
		state.video.mixEffects[0] = {
			upstreamKeyers: [
				{
					fillSource: 0,
					onAir: false,
					maskSettings: {
						maskEnabled: true,
						maskTop: 9000,
						maskBottom: -9000,
						maskLeft: -16000,
						maskRight: 16000,
					},
					dveSettings: {
						maskEnabled: false,
						maskTop: 1000,
						maskBottom: -1000,
						maskLeft: -2000,
						maskRight: 2000,
					},
				} as never,
			],
		} as never

		const values: Partial<VariablesSchema> = {}
		updateUSKVariable(INSTANCE, state, 0, 0, values)

		expect(values['usk_1_1_nonDVEmaskEnabled']).toBe(true)
		expect(values['usk_1_1_nonDVEmaskTop']).toBe(9)
		expect(values['usk_1_1_nonDVEmaskBottom']).toBe(-9)
		expect(values['usk_1_1_nonDVEmaskLeft']).toBe(-16)
		expect(values['usk_1_1_nonDVEmaskRight']).toBe(16)
		expect(values['usk_1_1_maskEnabled']).toBe(false)
	})
})
