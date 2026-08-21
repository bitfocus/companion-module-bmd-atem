import type { Atem } from 'atem-connection'
import type { CompanionActionDefinitions, JsonValue } from '@companion-module/base'
import { convertOptionsFields } from '../options/util.js'
import { parseSourceId, parseSourceIdRequired } from '../options/sources.js'
import {
	AtemExternalPortTypePicker,
	AtemSwitchableInputPicker,
	externalPortTypeLabel,
	externalPortTypeToId,
	GetSwitchableInputs,
	parseExternalPortType,
} from '../options/inputPorts.js'
import type { ModelSpec } from '../models/index.js'
import type { StateWrapper } from '../state.js'
import { stringifyValueAlways } from '../util.js'

export type AtemInputPortActions = {
	['inputPortType']: {
		options: {
			input: JsonValue
			portType: JsonValue
		}
	}
}

export function createInputPortActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemInputPortActions> {
	// Only inputs with more than one physical connector can be switched
	const switchableInputs = GetSwitchableInputs(model, state.state)
	const inputPicker = AtemSwitchableInputPicker(switchableInputs)
	const portTypePicker = AtemExternalPortTypePicker(switchableInputs)

	return {
		['inputPortType']: inputPicker.choices.length
			? {
					name: 'Input: Set connector',
					options: convertOptionsFields({
						input: inputPicker,
						portType: portTypePicker,
					}),
					callback: async ({ options }) => {
						const inputId = parseSourceIdRequired(options.input)

						const portType = parseExternalPortType(options.portType)
						if (portType === null) throw new Error(`Unknown connector "${stringifyValueAlways(options.portType)}"`)

						const input = switchableInputs.find((i) => i.id === inputId)
						if (!input?.externalPorts.includes(portType)) {
							throw new Error(
								`Input ${inputId} has no ${externalPortTypeLabel(portType)} connector, only: ${(
									input?.externalPorts ?? []
								)
									.map(externalPortTypeLabel)
									.join(', ')}`,
							)
						}

						await atem?.setInputSettings({ externalPortType: portType }, inputId)
					},
					learn: ({ options }) => {
						const inputId = parseSourceId(options.input)
						if (inputId === null) return undefined

						const input = state.state.inputs[inputId]
						if (!input) return undefined

						return {
							portType: externalPortTypeToId(input.externalPortType),
						}
					},
				}
			: undefined,
	}
}
