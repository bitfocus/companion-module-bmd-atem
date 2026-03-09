import { DropdownChoice, type JsonValue, type CompanionInputFieldDropdown } from '@companion-module/base'
import { Enums } from 'atem-connection'
import { stringifyValueAlways } from '../util.js'

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
