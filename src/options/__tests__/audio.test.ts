import { describe, expect, test } from 'vitest'
import type { AtemState } from 'atem-connection'
import { ModelSpecMiniExtremeISOG2 } from '../../models/miniextremeisog2.js'
import { ModelSpecTVSHD8 } from '../../models/tvshd8.js'
import { GetAudioInputsList } from '../audio.js'

const state = { inputs: {} } as AtemState

describe('GetAudioInputsList', () => {
	test('numbers both XLR inputs when a model has more than one', () => {
		const inputs = GetAudioInputsList(ModelSpecMiniExtremeISOG2, state)

		expect(inputs.filter(({ id }) => id === 1001 || id === 1002)).toEqual([
			{ id: 1001, longName: 'XLR 1' },
			{ id: 1002, longName: 'XLR 2' },
		])
	})

	test('keeps the unnumbered label for models with one XLR input', () => {
		const inputs = GetAudioInputsList(ModelSpecTVSHD8, state)

		expect(inputs.find(({ id }) => id === 1001)).toEqual({ id: 1001, longName: 'XLR' })
	})
})
