import { describe, expect, test } from 'vitest'
import { AtemStateUtil, Enums } from 'atem-connection'
import { ALL_MODELS } from '../../models/index.js'
import { GetSourcesListForType } from '../sources.js'
import type { ModelSpec } from '../../models/types.js'

// #347: the key mask sources were generated into the model, but skipped when building the source
// list, so they had no name and could not be picked despite being valid aux/multiviewer sources.
// The expected names here are the ones real switchers report for these ids.

const STATE = AtemStateUtil.Create()

const withMasks = (m: ModelSpec) => m.inputs.some((i) => i.portType === Enums.InternalPortType.Mask)

function sourcesById(model: ModelSpec) {
	return new Map(GetSourcesListForType(model, STATE).map((s) => [s.id, s]))
}

describe('Key mask sources (#347)', () => {
	test('there are models with masks to check', () => {
		expect(ALL_MODELS.filter(withMasks).length).toBeGreaterThan(0)
	})

	test('every mask input in a model appears in the source list', () => {
		for (const model of ALL_MODELS.filter(withMasks)) {
			const sources = sourcesById(model)

			for (const input of model.inputs) {
				if (input.portType !== Enums.InternalPortType.Mask) continue

				const source = sources.get(input.id)
				expect(source, `${model.label} is missing mask ${input.id}`).toBeDefined()
				expect(source!.shortName, `${model.label} mask ${input.id}`).toBeTruthy()
				expect(source!.longName, `${model.label} mask ${input.id}`).toBeTruthy()
			}
		}
	})

	test('names the 2 M/E Constellation HD masks as the switcher does', () => {
		const model = ALL_MODELS.find((m) => m.label === '2 M/E Constellation HD')!
		const sources = sourcesById(model)

		// The ids called out in the issue
		const expected: Record<number, [string, string]> = {
			4010: ['M1K1', 'ME 1 Key 1 Mask'],
			4020: ['M1K2', 'ME 1 Key 2 Mask'],
			4030: ['M1K3', 'ME 1 Key 3 Mask'],
			4040: ['M1K4', 'ME 1 Key 4 Mask'],
			4050: ['M2K1', 'ME 2 Key 1 Mask'],
			4060: ['M2K2', 'ME 2 Key 2 Mask'],
			4070: ['M2K3', 'ME 2 Key 3 Mask'],
			4080: ['M2K4', 'ME 2 Key 4 Mask'],
			5010: ['DK1M', 'DSK 1 Mask'],
			5020: ['DK2M', 'DSK 2 Mask'],
		}

		for (const [id, [short, long]] of Object.entries(expected)) {
			const source = sources.get(Number(id))
			expect(source, `missing ${id}`).toBeDefined()
			expect([source!.shortName, source!.longName], `mask ${id}`).toEqual([short, long])
		}
	})

	test('omits the me prefix on a single me switcher', () => {
		// The 1 M/E Production Studio 4K reports 'Key 1 Mask', not 'ME 1 Key 1 Mask'
		const model = ALL_MODELS.find((m) => m.label === '1 ME Production 4K')!
		const source = sourcesById(model).get(4010)

		expect(source).toBeDefined()
		expect([source!.shortName, source!.longName]).toEqual(['M1K1', 'Key 1 Mask'])
	})

	test('masks are offered for aux and multiviewer, but not as a me source', () => {
		const model = ALL_MODELS.find((m) => m.label === '2 M/E Constellation HD')!
		const idsFor = (subset: 'aux' | 'mv' | 'me') => GetSourcesListForType(model, STATE, subset).map((s) => s.id)

		expect(idsFor('aux')).toContain(4010)
		expect(idsFor('mv')).toContain(4010)
		expect(idsFor('me')).not.toContain(4010)
	})
})
