import type { CompanionInputFieldNumber, CompanionInputFieldDropdown, DropdownChoice } from '@companion-module/base'
import type { FadeDurationFieldsType } from '../transitions.js'
import type { MyOptionsObject } from './common.js'

const fadeAlgorithms: DropdownChoice<FadeDurationFieldsType['fadeAlgorithm']>[] = [
	{ id: 'linear', label: 'Linear' },
	{ id: 'quadratic', label: 'Quadratic' },
	{ id: 'cubic', label: 'Cubic' },
	{ id: 'quartic', label: 'Quartic' },
	{ id: 'quintic', label: 'Quintic' },
	{ id: 'sinusoidal', label: 'Sinusoidal' },
	{ id: 'exponential', label: 'Exponential' },
	{ id: 'circular', label: 'Circular' },
	{ id: 'elastic', label: 'Elastic' },
	{ id: 'back', label: 'Back' },
	{ id: 'bounce', label: 'Bounce' },
]
const fadeCurve: DropdownChoice<FadeDurationFieldsType['fadeCurve']>[] = [
	{ id: 'ease-in', label: 'Ease-in' },
	{ id: 'ease-out', label: 'Ease-out' },
	{ id: 'ease-in-out', label: 'Ease-in-out' },
]

export const FadeDurationFields = {
	fadeDuration: {
		type: 'number',
		label: 'Fade Duration (ms)',
		id: 'fadeDuration',
		default: 0,
		min: 0,
		step: 10,
		max: 60000,
		asInteger: true,
		clampValues: true,
	},
	fadeAlgorithm: {
		type: 'dropdown',
		label: 'Algorithm',
		id: 'fadeAlgorithm',
		default: 'linear',
		choices: fadeAlgorithms,
		disableAutoExpression: true,
	},
	fadeCurve: {
		type: 'dropdown',
		label: 'Fade curve',
		id: 'fadeCurve',
		default: 'ease-in',
		choices: fadeCurve,
		isVisibleExpression: `$(options:fadeAlgorithm) != null && $(options:fadeAlgorithm) != 'linear'`,
		disableAutoExpression: true,
	},
} as const satisfies MyOptionsObject<FadeDurationFieldsType, CompanionInputFieldNumber | CompanionInputFieldDropdown>

export function AtemTransitionAnimationOptions(): {
	transitionRate: CompanionInputFieldNumber<'transitionRate'>
	transitionEasing: CompanionInputFieldDropdown<'transitionEasing'>
	transitionCurve: CompanionInputFieldDropdown<'transitionCurve'>
} {
	return {
		transitionRate: {
			type: 'number',
			id: 'transitionRate',
			label: 'Transition Rate (ms)',
			default: 0,
			min: 0,
			max: 99999,
			step: 1,
			asInteger: true,
			clampValues: true,
		},
		transitionEasing: {
			type: 'dropdown',
			label: 'Transition Easing',
			id: 'transitionEasing',
			default: 'linear',
			choices: fadeAlgorithms,
			disableAutoExpression: true,
		},
		transitionCurve: {
			type: 'dropdown',
			label: 'Transition curve',
			id: 'transitionCurve',
			default: 'ease-in',
			choices: fadeCurve,
			isVisibleExpression: `$(options:transitionEasing) != null && $(options:transitionEasing) != 'linear'`,
			disableAutoExpression: true,
		},
	}
}
