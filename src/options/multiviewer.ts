import {
	type DropdownChoice,
	type JsonValue,
	type CompanionInputFieldDropdown,
	type CompanionInputFieldColor,
	splitRgb,
} from '@companion-module/base'
import { type AtemState, Enums, type SettingsState } from 'atem-connection'
import { iterateTimes, stringifyValueAlways } from '../util.js'
import { GetSourcesListForType } from '../options/sources.js'
import type { ModelSpec } from '../models/types.js'
import { SourcesToChoices } from './util.js'

export function AtemMultiviewerPicker(model: ModelSpec): CompanionInputFieldDropdown<'multiViewerId'> {
	const choices = iterateTimes(model.MVs, (i) => ({
		id: i + 1,
		label: `MV ${i + 1}`,
	}))
	return {
		type: 'dropdown',
		id: 'multiViewerId',
		label: 'MV',
		default: 1,
		choices,
		isVisibleExpression: choices.length > 1 ? undefined : 'false', // Hide if only 1 choice
		allowInvalidValues: choices.length > 1 ? undefined : true, // Allow any value when hidden
	}
}

/**
 * Resolve the 0-based multiviewer index from a picker value. When the model has only a single
 * multiviewer the picker is hidden, so any value is ignored and treated as the first one.
 */
export function resolveMultiviewerIndex(model: ModelSpec, multiViewerId: number): number {
	return model.MVs > 1 ? multiViewerId - 1 : 0
}

export function AtemMultiviewSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'source'> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'mv')),
		expressionDescription: 'Should return a source number, eg 1, 3010, 4010',
		allowInvalidValues: true,
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

export function AtemMultiviewerBorderColorPicker(): CompanionInputFieldColor<'color'> {
	return {
		type: 'colorpicker',
		id: 'color',
		label: 'Border colour',
		default: 0xffffff,
		enableAlpha: true,
		returnType: 'string',
	}
}

/** Convert a Companion colour option value into the atem border colour state (components 0-1000) */
export function multiviewerBorderColorFromOption(
	value: JsonValue | undefined,
): SettingsState.MultiViewerBorderColorState {
	const rgb = splitRgb(typeof value === 'number' || typeof value === 'string' ? value : 0)
	return {
		red: Math.round((rgb.r / 255) * 1000),
		green: Math.round((rgb.g / 255) * 1000),
		blue: Math.round((rgb.b / 255) * 1000),
		alpha: Math.round((rgb.a ?? 1) * 1000),
	}
}

/** Convert the atem border colour state (components 0-1000) into a Companion colour option value */
export function multiviewerBorderColorToOption(color: SettingsState.MultiViewerBorderColorState): string {
	const red = Math.round((color.red / 1000) * 255)
	const green = Math.round((color.green / 1000) * 255)
	const blue = Math.round((color.blue / 1000) * 255)
	const alpha = color.alpha / 1000
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`
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
