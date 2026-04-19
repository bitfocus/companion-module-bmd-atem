import type { CompanionInputFieldDropdown } from '@companion-module/base'
import type { AtemState } from 'atem-connection'
import type { ModelSpec } from '../models/types.js'
import { GetSourcesListForType } from '../options/sources.js'
import { SourcesToChoices } from './util.js'

export function AtemKeyFillSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'fill'> {
	return {
		type: 'dropdown',
		label: 'Fill Source',
		id: 'fill',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
	}
}
export function AtemKeyCutSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'cut'> {
	return {
		type: 'dropdown',
		label: 'Key Source',
		id: 'cut',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'key')),
	}
}
