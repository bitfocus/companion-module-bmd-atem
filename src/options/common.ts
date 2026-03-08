import type { CompanionInputFieldCheckbox, CompanionInputFieldNumber } from '@companion-module/base'

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
