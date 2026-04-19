import {
	assertNever,
	type CompanionInputFieldCheckbox,
	type CompanionInputFieldNumber,
	type DropdownChoice,
} from '@companion-module/base'

export type TrueFalseToggle = 'true' | 'false' | 'toggle'

export const CHOICES_ON_OFF_TOGGLE: DropdownChoice<TrueFalseToggle>[] = [
	{ id: 'true', label: 'On' },
	{ id: 'false', label: 'Off' },
	{ id: 'toggle', label: 'Toggle' },
]

export const CHOICES_KEYTRANS: DropdownChoice<TrueFalseToggle>[] = [
	{ id: 'true', label: 'On Air' },
	{ id: 'false', label: 'Off' },
	{ id: 'toggle', label: 'Toggle' },
]

export function resolveTrueFalseToggle(value: TrueFalseToggle | boolean, current: boolean | undefined): boolean {
	switch (value) {
		case 'false':
		case false:
			return false
		case 'true':
		case true:
			return true
		case 'toggle':
			return !current
		default:
			assertNever(value)
			return false
	}
}

export function AtemRatePicker(label: string): CompanionInputFieldNumber<'rate'> {
	return {
		type: 'number',
		id: 'rate',
		label,
		min: 1,
		max: 250,
		range: true,
		default: 25,
		asInteger: true,
		clampValues: true,
	}
}

export function MaskPropertiesPickers(
	xRange: number,
	yRange: number,
	fromZero: boolean,
): {
	maskEnabled: CompanionInputFieldCheckbox<'maskEnabled'>
	maskTop: CompanionInputFieldNumber<'maskTop'>
	maskBottom: CompanionInputFieldNumber<'maskBottom'>
	maskLeft: CompanionInputFieldNumber<'maskLeft'>
	maskRight: CompanionInputFieldNumber<'maskRight'>
} {
	return {
		maskEnabled: {
			type: 'checkbox',
			label: fromZero ? 'Mask: Enabled' : 'Enabled',
			id: 'maskEnabled',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskEnabled')`,
		},
		maskTop: {
			type: 'number',
			id: 'maskTop',
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskTop')`,
			asInteger: false,
			clampValues: true,
			...(fromZero
				? {
						label: 'Mask: Top',
						default: 0,
						min: 0,
						max: yRange,
					}
				: {
						label: 'Top',
						default: yRange,
						min: -yRange,
						max: yRange,
						description: `${yRange} is the top edge, -${yRange} is the bottom edge.`,
					}),
		},
		maskBottom: {
			type: 'number',
			id: 'maskBottom',
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskBottom')`,
			asInteger: false,
			clampValues: true,
			...(fromZero
				? {
						label: 'Mask: Bottom',
						default: 0,
						min: 0,
						max: yRange,
					}
				: {
						label: 'Bottom',
						default: -yRange,
						min: -yRange,
						max: yRange,
						description: `${yRange} is the top edge, -${yRange} is the bottom edge.`,
					}),
		},
		maskLeft: {
			type: 'number',
			id: 'maskLeft',
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskLeft')`,
			asInteger: false,
			clampValues: true,
			...(fromZero
				? {
						label: 'Mask: Left',
						default: 0,
						min: 0,
						max: xRange,
					}
				: {
						label: 'Left',
						default: -xRange,
						min: -xRange,
						max: xRange,
						description: `${xRange} is the right edge, -${xRange} is the left edge.`,
					}),
		},
		maskRight: {
			type: 'number',
			id: 'maskRight',
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskRight')`,
			asInteger: false,
			clampValues: true,
			...(fromZero
				? {
						label: 'Mask: Right',
						default: 0,
						min: 0,
						max: xRange,
					}
				: {
						label: 'Right',
						default: xRange,
						min: -xRange,
						max: xRange,
						description: `${xRange} is the right edge, -${xRange} is the left edge.`,
					}),
		},
	}
}
