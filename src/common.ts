import type { CompanionInputFieldBase, CompanionOptionValues } from '@companion-module/base'

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
