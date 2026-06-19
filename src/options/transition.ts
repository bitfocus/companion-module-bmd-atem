import type {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	CompanionInputFieldNumber,
	DropdownChoice,
	JsonValue,
} from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import { Enums, type AtemState } from 'atem-connection'
import { GetSourcesListForType } from './sources.js'
import { SourcesToChoices, WithDropdownPropertiesPicker } from './util.js'

export enum NextTransBackgroundChoices {
	NoChange = 'no-change',
	Include = 'include',
	Omit = 'omit',
	Toggle = 'toggle',
}

export const CHOICES_NEXTTRANS_BACKGROUND: DropdownChoice<NextTransBackgroundChoices>[] = [
	{ id: NextTransBackgroundChoices.NoChange, label: 'No change' },
	{ id: NextTransBackgroundChoices.Include, label: 'Include' },
	{ id: NextTransBackgroundChoices.Omit, label: 'Omit' },
	{ id: NextTransBackgroundChoices.Toggle, label: 'Toggle' },
]

export enum NextTransKeyChoices {
	NoChange = 'no-change',
	On = 'on',
	Off = 'off',
	Toggle = 'toggle',
	Include = 'include',
	Omit = 'omit',
}

export const CHOICES_NEXTTRANS_KEY: DropdownChoice<NextTransKeyChoices>[] = [
	{ id: NextTransKeyChoices.NoChange, label: 'No change' },
	{ id: NextTransKeyChoices.On, label: 'On' },
	{ id: NextTransKeyChoices.Off, label: 'Off' },
	{ id: NextTransKeyChoices.Toggle, label: 'Toggle' },
	{ id: NextTransKeyChoices.Include, label: 'Include' },
	{ id: NextTransKeyChoices.Omit, label: 'Omit' },
]

export function AtemTransitionSelectComponentsPickers(model: ModelSpec): {
	background: CompanionInputFieldDropdown<'background', NextTransBackgroundChoices>
	[id: `key${string}`]: CompanionInputFieldDropdown<`key${string}`, NextTransKeyChoices>
} {
	const pickers: ReturnType<typeof AtemTransitionSelectComponentsPickers> = {
		background: {
			type: 'dropdown',
			id: 'background',
			label: 'Background',
			choices: CHOICES_NEXTTRANS_BACKGROUND,
			default: NextTransBackgroundChoices.NoChange,
			disableAutoExpression: true, // Needs translating first
		},
	}

	for (let i = 0; i < model.USKs; i++) {
		pickers[`key${i}`] = {
			label: `Key ${i + 1}`,
			type: 'dropdown',
			id: `key${i}`,
			choices: CHOICES_NEXTTRANS_KEY,
			default: NextTransKeyChoices.NoChange,
			disableAutoExpression: true, // Needs translating first
		}
	}

	return pickers
}
export type TransitionSelectionComponent = 'background' | `key${number}`
export function AtemTransitionSelectionPicker(
	model: ModelSpec,
): CompanionInputFieldMultiDropdown<'selection', TransitionSelectionComponent> {
	const choices: DropdownChoice<TransitionSelectionComponent>[] = [{ id: 'background', label: 'Background' }]

	for (let i = 0; i < model.USKs; i++) {
		choices.push({
			id: `key${i}`,
			label: `Key ${i + 1}`,
		})
	}

	return {
		type: 'multidropdown',
		id: 'selection',
		label: 'Selection',
		default: ['background'],
		minSelection: 1,
		sortSelection: true,
		choices,
	}
}
export function AtemTransitionSelectionComponentPicker(model: ModelSpec): CompanionInputFieldDropdown<'component'> {
	const options: DropdownChoice[] = [
		{
			id: 0,
			label: 'Background',
		},
	]

	for (let i = 0; i < model.USKs; i++) {
		options.push({
			id: i + 1,
			label: `Key ${i + 1}`,
		})
	}

	return {
		label: 'Component',
		type: 'dropdown',
		id: 'component',
		choices: options,
		default: 0,
	}
}

export function calculateTransitionSelection(
	keyCount: number,
	rawSelection: TransitionSelectionComponent[] | undefined,
): Enums.TransitionSelection[] {
	if (!rawSelection || !Array.isArray(rawSelection)) return []

	const selection: Enums.TransitionSelection[] = []
	if (rawSelection.includes('background')) {
		selection.push(Enums.TransitionSelection.Background)
	}

	for (let i = 0; i < keyCount; i++) {
		if (rawSelection.includes(`key${i}`)) {
			selection.push(1 << (i + 1))
		}
	}

	return selection
}

export type WipePatternString =
	| 'left-to-right-bar'
	| 'top-to-bottom-bar'
	| 'horizontal-barn-door'
	| 'vertical-barn-door'
	| 'corners-in-four-box'
	| 'rectangle-iris'
	| 'diamond-iris'
	| 'circle-iris'
	| 'top-left-box'
	| 'top-right-box'
	| 'bottom-right-box'
	| 'bottom-left-box'
	| 'top-centre-box'
	| 'right-centre-box'
	| 'bottom-centre-box'
	| 'left-centre-box'
	| 'top-left-diagonal'
	| 'top-right-diagonal'

const WIPE_PATTERNS: Array<{ id: WipePatternString; label: string; pattern: Enums.Pattern }> = [
	{ id: 'left-to-right-bar', label: 'Left To Right Bar', pattern: Enums.Pattern.LeftToRightBar },
	{ id: 'top-to-bottom-bar', label: 'Top To Bottom Bar', pattern: Enums.Pattern.TopToBottomBar },
	{ id: 'horizontal-barn-door', label: 'Horizontal Barn Door', pattern: Enums.Pattern.HorizontalBarnDoor },
	{ id: 'vertical-barn-door', label: 'Vertical Barn Door', pattern: Enums.Pattern.VerticalBarnDoor },
	{ id: 'corners-in-four-box', label: 'Corners In Four Box', pattern: Enums.Pattern.CornersInFourBox },
	{ id: 'rectangle-iris', label: 'Rectangle Iris', pattern: Enums.Pattern.RectangleIris },
	{ id: 'diamond-iris', label: 'Diamond Iris', pattern: Enums.Pattern.DiamondIris },
	{ id: 'circle-iris', label: 'Circle Iris', pattern: Enums.Pattern.CircleIris },
	{ id: 'top-left-box', label: 'Top Left Box', pattern: Enums.Pattern.TopLeftBox },
	{ id: 'top-right-box', label: 'Top Right Box', pattern: Enums.Pattern.TopRightBox },
	{ id: 'bottom-right-box', label: 'Bottom Right Box', pattern: Enums.Pattern.BottomRightBox },
	{ id: 'bottom-left-box', label: 'Bottom Left Box', pattern: Enums.Pattern.BottomLeftBox },
	{ id: 'top-centre-box', label: 'Top Centre Box', pattern: Enums.Pattern.TopCentreBox },
	{ id: 'right-centre-box', label: 'Right Centre Box', pattern: Enums.Pattern.RightCentreBox },
	{ id: 'bottom-centre-box', label: 'Bottom Centre Box', pattern: Enums.Pattern.BottomCentreBox },
	{ id: 'left-centre-box', label: 'Left Centre Box', pattern: Enums.Pattern.LeftCentreBox },
	{ id: 'top-left-diagonal', label: 'Top Left Diagonal', pattern: Enums.Pattern.TopLeftDiagonal },
	{ id: 'top-right-diagonal', label: 'Top Right Diagonal', pattern: Enums.Pattern.TopRightDiagonal },
]

export function GetWipePatternChoices(): DropdownChoice<WipePatternString>[] {
	return WIPE_PATTERNS.map(({ id, label }) => ({ id, label }))
}

export function wipePatternStringToEnum(ref: WipePatternString | JsonValue | undefined): Enums.Pattern | null {
	// The field does not allow invalid values, so the value is always one of the ids below.
	return WIPE_PATTERNS.find((p) => p.id === ref)?.pattern ?? null
}

export function wipePatternEnumToString(pattern: Enums.Pattern): WipePatternString | undefined {
	return WIPE_PATTERNS.find((p) => p.pattern === pattern)?.id
}

export type WipeTransitionProperty =
	| 'pattern'
	| 'borderInput'
	| 'borderWidth'
	| 'borderSoftness'
	| 'symmetry'
	| 'xPosition'
	| 'yPosition'
	| 'reverseDirection'
	| 'flipFlop'

export function AtemTransitionWipePropertiesPickers(
	model: ModelSpec,
	state: AtemState,
): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	pattern: CompanionInputFieldDropdown<'pattern', WipePatternString>
	borderInput: CompanionInputFieldDropdown<'borderInput'>
	borderWidth: CompanionInputFieldNumber<'borderWidth'>
	borderSoftness: CompanionInputFieldNumber<'borderSoftness'>
	symmetry: CompanionInputFieldNumber<'symmetry'>
	xPosition: CompanionInputFieldNumber<'xPosition'>
	yPosition: CompanionInputFieldNumber<'yPosition'>
	reverseDirection: CompanionInputFieldCheckbox<'reverseDirection'>
	flipFlop: CompanionInputFieldCheckbox<'flipFlop'>
} {
	return WithDropdownPropertiesPicker({
		pattern: {
			type: 'dropdown',
			label: 'Pattern',
			id: 'pattern',
			default: 'left-to-right-bar',
			choices: GetWipePatternChoices(),
			expressionDescription: `Should return a string: ${GetWipePatternChoices()
				.map((c) => c.id)
				.join(', ')}`,
			isVisibleExpression: `arrayIncludes($(options:properties), 'pattern')`,
		},
		borderInput: {
			type: 'dropdown',
			label: 'Border Source',
			id: 'borderInput',
			default: 1,
			choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderInput')`,
		},
		borderWidth: {
			type: 'number',
			label: 'Border Width',
			id: 'borderWidth',
			default: 0,
			range: true,
			min: 0.0,
			step: 0.01,
			max: 100.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderWidth')`,
			asInteger: false,
			clampValues: true,
		},
		borderSoftness: {
			type: 'number',
			label: 'Border Softness',
			id: 'borderSoftness',
			default: 0,
			range: true,
			min: 0.0,
			step: 0.01,
			max: 100.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderSoftness')`,
			asInteger: false,
			clampValues: true,
		},
		symmetry: {
			type: 'number',
			label: 'Symmetry',
			id: 'symmetry',
			default: 50,
			range: true,
			min: 0.0,
			step: 0.01,
			max: 100.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'symmetry')`,
			asInteger: false,
			clampValues: true,
		},
		xPosition: {
			type: 'number',
			label: 'Position: X',
			id: 'xPosition',
			default: 0.5,
			range: true,
			min: 0.0,
			step: 0.01,
			max: 1.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'xPosition')`,
			asInteger: false,
			clampValues: true,
		},
		yPosition: {
			type: 'number',
			label: 'Position: Y',
			id: 'yPosition',
			default: 0.5,
			range: true,
			min: 0.0,
			step: 0.01,
			max: 1.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'yPosition')`,
			asInteger: false,
			clampValues: true,
		},
		reverseDirection: {
			type: 'checkbox',
			label: 'Reverse Direction',
			id: 'reverseDirection',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'reverseDirection')`,
		},
		flipFlop: {
			type: 'checkbox',
			label: 'Flip Flop',
			id: 'flipFlop',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'flipFlop')`,
		},
	})
}

export function AtemMatchMethod(): CompanionInputFieldDropdown<'matchmethod'> {
	return {
		id: 'matchmethod',
		label: 'Match method',
		type: 'dropdown',
		default: 'exact',
		choices: [
			{
				id: 'exact',
				label: 'Exact',
			},
			{
				id: 'contains',
				label: 'Contains',
			},
			{
				id: 'not-contain',
				label: 'Not Contain',
			},
		],
		disableAutoExpression: true, // Needs translating first
	}
}
