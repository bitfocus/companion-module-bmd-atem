import type { CompanionInputFieldDropdown } from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import { iterateTimes } from '../util.js'
import { GetSourcesListForType } from '../choices.js'
import type { AtemState } from 'atem-connection'
import { SourcesToChoices } from './common.js'

export function AtemMEPicker(model: ModelSpec): CompanionInputFieldDropdown<'mixeffect'> {
	return {
		id: 'mixeffect',
		label: `M/E`,
		type: 'dropdown',
		default: 1,
		choices: iterateTimes(model.MEs, (i) => ({
			id: i + 1,
			label: `M/E ${i + 1}`,
		})),
	}
}

export function AtemMESourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'input'> {
	return {
		id: `input`,
		label: `Input`,
		type: 'dropdown',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
	}
}
