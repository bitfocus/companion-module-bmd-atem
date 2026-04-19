import type {
	CompanionInputFieldBase,
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	CompanionInputFieldNumber,
	CompanionInputFieldTextInput,
	CompanionOptionValues,
	DropdownChoice,
} from '@companion-module/base'
import type { MiniSourceInfo } from '../choices.js'

export function SourcesToChoices(sources: MiniSourceInfo[]): DropdownChoice<number>[] {
	return sources.map((s) => ({
		id: s.id,
		label: s.longName,
	}))
}

export type MyOptionsObject<TOptions, TFields extends CompanionInputFieldBase> = {
	[K in keyof TOptions]: undefined extends TOptions[K] ? TFields | undefined : TFields
}

export function convertOptionsFields<TOptions extends CompanionOptionValues, TField extends CompanionInputFieldBase>(
	options: MyOptionsObject<TOptions, TField>,
): TField[] {
	return Object.entries(options)
		.filter((o) => !!o[1])
		.map(([id, option]) => ({
			...(option as TField),
			id,
		}))
}

export type WithProperties<T> = T & {
	properties: Array<keyof T>
}

export function WithDropdownPropertiesPicker<
	T extends Record<
		string,
		| CompanionInputFieldTextInput
		| CompanionInputFieldCheckbox
		| CompanionInputFieldDropdown
		| CompanionInputFieldNumber
		| CompanionInputFieldMultiDropdown
	>,
>(
	allProps: T,
): T & {
	properties: CompanionInputFieldMultiDropdown<'properties'>
} {
	return {
		properties: {
			type: 'multidropdown',
			id: 'properties',
			label: 'Properties',
			minSelection: 1,
			default: Object.values(allProps).map((p) => p.id),
			choices: Object.values(allProps).map((p) => ({ id: p.id, label: p.label })),
			sortSelection: true,
			disableAutoExpression: true, // Disable expression, so that other fields can reference this
		},
		...allProps,
	}
}
