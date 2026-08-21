import { describe, expect, test } from 'vitest'
import { Enums } from 'atem-connection'
import type { InputChannel } from 'atem-connection/dist/state/input.js'
import { createInputPortActions } from '../inputPorts.js'
import { createInputPortFeedbacks } from '../../feedback/inputPorts.js'
import { ALL_MODELS } from '../../models/index.js'
import type { ModelSpec } from '../../models/types.js'
import { makeMockAtem, makeTestState } from '../../__tests__/helpers.js'

type AnyDef = { callback: (info: any, ctx?: any) => unknown; learn?: (info: any, ctx?: any) => any }

const BASE_MODEL = ALL_MODELS.find((m) => m.inputs.some((i) => i.portType === Enums.InternalPortType.External))!

/** A model whose input 1 has both SDI and HDMI connectors, as on the Production Studio 4K (#476). */
function makeModelWithSwitchableInput(): ModelSpec {
	return {
		...BASE_MODEL,
		inputs: BASE_MODEL.inputs.map((input) =>
			input.id === 1 ? { ...input, externalPorts: [Enums.ExternalPortType.SDI, Enums.ExternalPortType.HDMI] } : input,
		),
	}
}

function makeStateWithInput(externalPortType: Enums.ExternalPortType) {
	const state = makeTestState()
	state.state.inputs[1] = {
		inputId: 1,
		longName: 'Camera 1',
		shortName: 'Cam1',
		externalPortType,
	} as InputChannel
	return state
}

describe('Input connector switching (#476)', () => {
	test('is not offered when no input has multiple connectors', () => {
		const mock = makeMockAtem()
		const state = makeTestState()

		expect(createInputPortActions(mock.atem, BASE_MODEL, state).inputPortType).toBeUndefined()
		expect(createInputPortFeedbacks(BASE_MODEL, state).inputPortType).toBeUndefined()
	})

	test('is offered from the model spec alone, with no device connected', () => {
		const mock = makeMockAtem()
		// An empty state stands in for being offline - the entities must still be configurable
		const state = makeTestState()
		const model = makeModelWithSwitchableInput()

		const def = createInputPortActions(mock.atem, model, state).inputPortType
		expect(def).toBeDefined()
		expect(createInputPortFeedbacks(model, state).inputPortType).toBeDefined()

		// Only the switchable input, and only its own connectors
		const inputField = def!.options.find((o) => o.id === 'input') as { choices: Array<{ id: number }> }
		expect(inputField.choices.map((c) => c.id)).toEqual([1])

		// Connectors are offered by human-readable name, not the raw enum number
		const portField = def!.options.find((o) => o.id === 'portType') as { choices: Array<{ id: string }> }
		expect(portField.choices.map((c) => c.id)).toEqual(['sdi', 'hdmi'])
	})

	test('sends the chosen connector for the input', async () => {
		const mock = makeMockAtem()
		const state = makeStateWithInput(Enums.ExternalPortType.SDI)

		const def = createInputPortActions(mock.atem, makeModelWithSwitchableInput(), state)
			.inputPortType as unknown as AnyDef
		await def.callback({ options: { input: 1, portType: Enums.ExternalPortType.HDMI } })

		const call = mock.onlyCall('setInputSettings')
		expect(call.args).toEqual([{ externalPortType: Enums.ExternalPortType.HDMI }, 1])
	})

	test('rejects a connector the input does not have, naming what it does have', async () => {
		const mock = makeMockAtem()
		const state = makeStateWithInput(Enums.ExternalPortType.SDI)

		const def = createInputPortActions(mock.atem, makeModelWithSwitchableInput(), state)
			.inputPortType as unknown as AnyDef
		await expect(def.callback({ options: { input: 1, portType: Enums.ExternalPortType.Composite } })).rejects.toThrow(
			/SDI, HDMI/,
		)

		expect(mock.calls).toHaveLength(0)
	})

	test('learn reads the connector currently in use', () => {
		const mock = makeMockAtem()
		const state = makeStateWithInput(Enums.ExternalPortType.HDMI)

		const def = createInputPortActions(mock.atem, makeModelWithSwitchableInput(), state)
			.inputPortType as unknown as AnyDef
		expect(def.learn!({ options: { input: 1, portType: Enums.ExternalPortType.SDI } })).toEqual({
			portType: 'hdmi',
		})
	})

	test('feedback matches only the connector in use', () => {
		const state = makeStateWithInput(Enums.ExternalPortType.SDI)
		const def = createInputPortFeedbacks(makeModelWithSwitchableInput(), state).inputPortType as unknown as AnyDef

		expect(def.callback({ options: { input: 1, portType: Enums.ExternalPortType.SDI } })).toBe(true)
		expect(def.callback({ options: { input: 1, portType: Enums.ExternalPortType.HDMI } })).toBe(false)

		state.state.inputs[1]!.externalPortType = Enums.ExternalPortType.HDMI
		expect(def.callback({ options: { input: 1, portType: Enums.ExternalPortType.HDMI } })).toBe(true)
	})
})
