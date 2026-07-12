import type {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	CompanionInputFieldNumber,
} from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import { iterateTimes } from '../util.js'
import { WithDropdownPropertiesPicker } from './util.js'

export function AtemDSKPicker<TId extends string>(model: ModelSpec, id: TId): CompanionInputFieldDropdown<TId> {
	const choices = iterateTimes(model.DSKs, (i) => ({
		id: i + 1,
		label: `${i + 1}`,
	}))
	return {
		type: 'dropdown',
		label: 'DSK',
		id: id,
		default: 1,
		choices,
		isVisibleExpression: choices.length > 1 ? undefined : 'false', // Hide if only 1 choice
		allowInvalidValues: choices.length > 1 ? undefined : true, // Allow any value when hidden
	}
}

/**
 * Resolve the 0-based downstream keyer index from a picker value. When the model has only a single
 * DSK the picker is hidden, so any value is ignored and treated as the first (and only) key.
 */
export function resolveDownstreamKeyerIndex(model: ModelSpec, key: number): number {
	return model.DSKs > 1 ? key - 1 : 0
}

export function AtemDSKPreMultipliedKeyPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	preMultiply: CompanionInputFieldCheckbox<'preMultiply'>
	clip: CompanionInputFieldNumber<'clip'>
	gain: CompanionInputFieldNumber<'gain'>
	invert: CompanionInputFieldCheckbox<'invert'>
} {
	return WithDropdownPropertiesPicker({
		preMultiply: {
			type: 'checkbox',
			label: 'Enabled',
			id: 'preMultiply',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'preMultiply')`,
		},
		clip: {
			type: 'number',
			label: 'Clip',
			id: 'clip',
			range: true,
			default: 50,
			min: 0,
			step: 0.1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'clip')`,
			asInteger: false,
			clampValues: true,
		},
		gain: {
			type: 'number',
			label: 'Gain',
			id: 'gain',
			range: true,
			default: 70,
			min: 0,
			step: 0.1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'gain')`,
			asInteger: false,
			clampValues: true,
		},
		invert: {
			type: 'checkbox',
			label: 'Invert key',
			id: 'invert',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'invert')`,
		},
	})
}
