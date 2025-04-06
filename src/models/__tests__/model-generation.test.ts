import { expect, test } from 'vitest'
import { ALL_MODELS } from '../index.js'

for (const model of ALL_MODELS) {
	test(`Check ${model.label} (${model.id})`, () => {
		model.inputs.sort((a, b) => a.id - b.id)
		expect(model).toMatchSnapshot()
	})
}
