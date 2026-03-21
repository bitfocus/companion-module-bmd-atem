import type { DropdownChoice, JsonValue, CompanionInputFieldDropdown } from '@companion-module/base'
import { AtemState, Enums } from 'atem-connection'
import { iterateTimes, stringifyValueAlways } from '../util.js'
import { GetSourcesListForType } from '../choices.js'
import type { ModelSpec } from '../models/types.js'
import { SourcesToChoices } from './util.js'

export function AtemMultiviewerPicker(model: ModelSpec): CompanionInputFieldDropdown<'multiViewerId'> {
	return {
		type: 'dropdown',
		id: 'multiViewerId',
		label: 'MV',
		default: 1,
		choices: iterateTimes(model.MVs, (i) => ({
			id: i + 1,
			label: `MV ${i + 1}`,
		})),
	}
}

export function AtemMultiviewSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'source'> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'mv')),
	}
}
export function AtemMultiviewWindowPicker(model: ModelSpec): CompanionInputFieldDropdown<'windowIndex'> {
	const choices = model.multiviewerFullGrid
		? iterateTimes(16, (i) => ({
				id: i + 1,
				label: `Window ${i + 1}`,
			}))
		: iterateTimes(8, (i) => ({
				id: i + 3,
				label: `Window ${i + 3}`,
			}))

	return {
		type: 'dropdown',
		id: 'windowIndex',
		label: 'Window #',
		default: model.multiviewerFullGrid ? 1 : 3,
		choices,
	}
}

export type MultiviewerQuadrantState = 'single' | 'quad' | 'ignore' | 'toggle'

function GetMultiviewerQuadrantStateChoices(includeToggle: boolean): DropdownChoice<MultiviewerQuadrantState>[] {
	const choices: DropdownChoice<MultiviewerQuadrantState>[] = [{ id: 'ignore', label: 'Unchanged' }]
	if (includeToggle) choices.push({ id: 'toggle', label: 'Toggle' })
	choices.push({ id: 'single', label: 'Single' }, { id: 'quad', label: 'Quad' })
	return choices
}

export function AtemMultiviewerQuadrantStatePicker(
	includeToggle: boolean,
): Omit<CompanionInputFieldDropdown<string, MultiviewerQuadrantState>, 'id' | 'label'> {
	return {
		type: 'dropdown',
		choices: GetMultiviewerQuadrantStateChoices(includeToggle),
		default: 'ignore',
		expressionDescription: `Should return a string: ignore, single, quad${includeToggle ? ', toggle' : ''}`,
		allowInvalidValues: true,
	}
}

export function multiviewerQuadrantStateStringToState(
	ref: JsonValue | undefined,
	includeToggle: boolean,
): MultiviewerQuadrantState | null {
	const refStr = stringifyValueAlways(ref).toLowerCase().trim()
	if (!refStr) return null

	if (refStr.startsWith('i') || refStr.startsWith('u')) {
		return 'ignore'
	} else if (refStr.startsWith('s')) {
		return 'single'
	} else if (refStr.startsWith('q')) {
		return 'quad'
	} else if (includeToggle && refStr.startsWith('t')) {
		return 'toggle'
	} else {
		return null
	}
}

export function multiviewerQuadrantStateFromLayout(
	layout: Enums.MultiViewerLayout,
	bit: Enums.MultiViewerLayout,
): 'single' | 'quad' {
	return layout & bit ? 'quad' : 'single'
}
