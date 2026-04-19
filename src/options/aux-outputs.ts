import type { CompanionInputFieldDropdown } from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import { GetSourcesListForType } from '../options/sources.js'
import { SourcesToChoices } from './util.js'
import type { AtemState } from 'atem-connection'

export function AtemAuxPicker(model: ModelSpec): CompanionInputFieldDropdown<'aux'> {
	return {
		type: 'dropdown',
		id: 'aux',
		label: 'Aux/Output',
		default: 1,
		choices: model.outputs.map((output) => ({
			id: output.id + 1,
			label: output.name,
		})),
	}
}

export function AtemAuxSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'input'> {
	return {
		type: 'dropdown',
		label: 'Input',
		id: 'input',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'aux')),
	}
}
