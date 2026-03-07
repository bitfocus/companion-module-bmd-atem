import type {
	CompanionInputFieldBase,
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	CompanionInputFieldNumber,
	CompanionInputFieldTextInput,
	CompanionOptionValues,
} from '@companion-module/base'

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

export function DropdownPropertiesPicker(
	allProps: Record<
		string,
		| CompanionInputFieldTextInput
		| CompanionInputFieldCheckbox
		| CompanionInputFieldDropdown
		| CompanionInputFieldNumber
		| CompanionInputFieldMultiDropdown
	>,
): CompanionInputFieldMultiDropdown<'properties'> {
	return {
		type: 'multidropdown',
		id: 'properties',
		label: 'Properties',
		minSelection: 1,
		default: Object.values(allProps).map((p) => p.id),
		choices: Object.values(allProps).map((p) => ({ id: p.id, label: p.label })),
		disableAutoExpression: true, // Disable expression, so that other fields can reference this
	}
}
