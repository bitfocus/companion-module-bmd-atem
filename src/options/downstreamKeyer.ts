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
	return {
		type: 'dropdown',
		label: 'DSK',
		id: id,
		default: 1,
		choices: iterateTimes(model.DSKs, (i) => ({
			id: i + 1,
			label: `${i + 1}`,
		})),
	}
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
