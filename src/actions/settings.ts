import { type Atem, type InputState } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './index.js'
import type { MyActionDefinitions } from './types.js'
import { AtemAllSourcePicker } from '../input.js'
import type { StateWrapper } from '../state.js'

export interface AtemSettingsActions {
	[ActionId.SaveStartupState]: Record<string, never>
	[ActionId.ClearStartupState]: Record<string, never>
	[ActionId.InputName]: {
		source: number

		short_enable: boolean
		short_value: string

		long_enable: boolean
		long_value: string
	}
}

export function createSettingsActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemSettingsActions> {
	if (!model.media.players) {
		return {
			[ActionId.SaveStartupState]: undefined,
			[ActionId.ClearStartupState]: undefined,
			[ActionId.InputName]: undefined,
		}
	}
	return {
		[ActionId.SaveStartupState]: {
			name: 'Startup State: Save',
			options: {},
			callback: async () => {
				await atem?.saveStartupState()
			},
		},
		[ActionId.ClearStartupState]: {
			name: 'Startup State: Clear',
			options: {},
			callback: async () => {
				await atem?.clearStartupState()
			},
		},
		[ActionId.InputName]: {
			name: 'Input: Set name',
			options: {
				source: AtemAllSourcePicker(model, state.state),
				short_enable: {
					id: 'short_enable',
					label: 'Set short name',
					type: 'checkbox',
					default: true,
				},
				short_value: {
					id: 'short_value',
					label: 'Short name',
					type: 'textinput',
					default: '',
					tooltip: 'Max 4 characters. Supports variables',
					useVariables: true,
				},
				long_enable: {
					id: 'long_enable',
					label: 'Set long name',
					type: 'checkbox',
					default: true,
				},
				long_value: {
					id: 'long_value',
					label: 'Long name',
					type: 'textinput',
					default: '',
					tooltip: 'Max 24 characters. Supports variables',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const source = options.getPlainNumber('source')
				const setShort = options.getPlainBoolean('short_enable')
				const setLong = options.getPlainBoolean('long_enable')

				const newProps: Partial<Pick<InputState.InputChannel, 'longName' | 'shortName'>> = {}
				if (setShort) newProps.shortName = await options.getParsedString('short_value')
				if (setLong) newProps.longName = await options.getParsedString('long_value')

				await Promise.all([
					typeof newProps.longName === 'string' && !atem?.hasInternalMultiviewerLabelGeneration()
						? atem?.drawMultiviewerLabel(source, newProps.longName)
						: undefined,
					Object.keys(newProps).length ? atem?.setInputSettings(newProps, source) : undefined,
				])
			},
			learn: ({ options }) => {
				const source = options.getPlainNumber('source')
				const props = state.state.inputs[source]

				if (props) {
					return {
						...options.getJson(),
						long_value: props.longName,
						short_value: props.shortName,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
