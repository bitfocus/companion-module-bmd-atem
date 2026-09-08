import { describe, expect, test } from 'vitest'
import type { Atem } from 'atem-connection'

import { createSettingsActions } from '../settings.js'
import { ALL_MODELS } from '../../models/index.js'
import { makeTestState } from '../../__tests__/helpers.js'

const MODEL = ALL_MODELS.find((model) => model.media.players > 0)!
type ActionDefinition = { callback: (info: any) => Promise<void> }

function makeAtem(internalLabels: boolean) {
	const calls: string[] = []
	const atem = {
		hasInternalMultiviewerLabelGeneration: () => internalLabels,
		setInputSettings: async () => {
			calls.push('setInputSettings')
		},
		drawMultiviewerLabel: async () => {
			calls.push('drawMultiviewerLabel')
		},
	} as unknown as Atem
	return { atem, calls }
}

describe('input name and multiview label ordering (#449)', () => {
	test('uploads an external UMD label only after changing the input name', async () => {
		const mock = makeAtem(false)
		const actions = createSettingsActions(mock.atem, MODEL, makeTestState())
		const action = actions.inputName as unknown as ActionDefinition

		await action.callback({
			options: {
				source: 3,
				short_enable: true,
				short_value: 'CAM3',
				long_enable: true,
				long_value: 'Camera 3',
			},
		})

		expect(mock.calls).toEqual(['setInputSettings', 'drawMultiviewerLabel'])
	})

	test('does not upload a bitmap on models that render labels internally', async () => {
		const mock = makeAtem(true)
		const actions = createSettingsActions(mock.atem, MODEL, makeTestState())
		const action = actions.inputName as unknown as ActionDefinition

		await action.callback({
			options: {
				source: 3,
				short_enable: false,
				short_value: '',
				long_enable: true,
				long_value: 'Camera 3',
			},
		})

		expect(mock.calls).toEqual(['setInputSettings'])
	})
})
