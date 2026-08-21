import type { CompanionFeedbackDefinitions, JsonValue } from '@companion-module/base'
import { convertOptionsFields } from '../options/util.js'
import { parseSourceId } from '../options/sources.js'
import {
	AtemExternalPortTypePicker,
	AtemSwitchableInputPicker,
	externalPortTypeToId,
	GetSwitchableInputs,
	parseExternalPortType,
} from '../options/inputPorts.js'
import type { ModelSpec } from '../models/index.js'
import type { StateWrapper } from '../state.js'

export type AtemInputPortFeedbacks = {
	['inputPortType']: {
		type: 'boolean'
		options: {
			input: JsonValue
			portType: JsonValue
		}
	}
}

export function createInputPortFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemInputPortFeedbacks> {
	// Only inputs with more than one physical connector can be switched
	const switchableInputs = GetSwitchableInputs(model, state.state)
	const inputPicker = AtemSwitchableInputPicker(switchableInputs)
	const portTypePicker = AtemExternalPortTypePicker(switchableInputs)

	return {
		['inputPortType']: inputPicker.choices.length
			? {
					type: 'boolean',
					name: 'Input: Connector',
					options: convertOptionsFields({
						input: inputPicker,
						portType: portTypePicker,
					}),
					defaultStyle: {
						color: 0x000000,
						bgcolor: 0xffff00,
					},
					callback: ({ options }): boolean => {
						const inputId = parseSourceId(options.input)
						if (inputId === null) return false

						const portType = parseExternalPortType(options.portType)
						if (portType === null) return false

						return state.state.inputs[inputId]?.externalPortType === portType
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
