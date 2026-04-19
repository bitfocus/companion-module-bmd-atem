import type {
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	DropdownChoice,
} from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import { Enums } from 'atem-connection'

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
