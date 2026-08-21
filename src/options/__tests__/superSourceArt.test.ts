import { describe, expect, test } from 'vitest'
import { AtemStateUtil, Enums } from 'atem-connection'
import { ALL_MODELS } from '../../models/index.js'
import { AtemSuperSourceArtPropertiesPickers, AtemSuperSourceArtSourcePicker } from '../superSource.js'
import type { DropdownChoice } from '@companion-module/base'

// #369: the art fill and key sources were built from the same list, but cutting the art also
// requires the source to be usable as a key source. The colour generators are not, so the switcher
// rejected them despite the dropdown offering them.

const STATE = AtemStateUtil.Create()
const MODELS_WITH_SSRC = ALL_MODELS.filter((m) => m.SSrc > 0)

const ids = (choices: DropdownChoice[]) => choices.map((c) => Number(c.id))

describe('SuperSource art key sources (#369)', () => {
	test('there are models to check', () => {
		expect(MODELS_WITH_SSRC.length).toBeGreaterThan(0)
	})

	test('every offered key source is usable as a key source', () => {
		for (const model of MODELS_WITH_SSRC) {
			const keyIds = ids(AtemSuperSourceArtPropertiesPickers(model, STATE, true).key.choices)

			for (const id of keyIds) {
				const input = model.inputs.find((i) => i.id === id)
				expect(input, `${model.label} offers unknown input ${id}`).toBeDefined()
				expect(
					input!.sourceAvailability & Enums.SourceAvailability.KeySource,
					`${model.label} offers ${id} as an art key source, but it is not a key source`,
				).not.toBe(0)
			}
		}
	})

	test('the colour generators are not offered as an art key source', () => {
		for (const model of MODELS_WITH_SSRC) {
			const keyIds = ids(AtemSuperSourceArtPropertiesPickers(model, STATE, true).key.choices)

			expect(keyIds, model.label).not.toContain(2001)
			expect(keyIds, model.label).not.toContain(2002)
		}
	})

	test('the fill sources are left alone, and still offer the colour generators', () => {
		for (const model of MODELS_WITH_SSRC) {
			const pickers = AtemSuperSourceArtPropertiesPickers(model, STATE, true)
			const fillIds = ids(pickers.fill.choices)

			// The colours are a valid art fill, just not a valid key
			expect(fillIds, model.label).toContain(2001)
			expect(fillIds, model.label).toContain(2002)

			// The standalone art (fill) picker must match the fill field exactly
			const standalone = ids(AtemSuperSourceArtSourcePicker(model, STATE, 'source', 'Fill Source').choices)
			expect(standalone, model.label).toEqual(fillIds)
		}
	})

	test('the key sources are otherwise the fill sources, less those which cannot key', () => {
		for (const model of MODELS_WITH_SSRC) {
			const pickers = AtemSuperSourceArtPropertiesPickers(model, STATE, true)
			const fillIds = ids(pickers.fill.choices)
			const keyIds = ids(pickers.key.choices)

			const expected = fillIds.filter((id) => {
				const input = model.inputs.find((i) => i.id === id)
				return !!(input && input.sourceAvailability & Enums.SourceAvailability.KeySource)
			})
			expect(keyIds, model.label).toEqual(expected)
		}
	})
})
