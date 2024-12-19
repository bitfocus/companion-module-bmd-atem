import type {
	CompanionActionContext,
	CompanionInputFieldBase,
	CompanionOptionValues,
	DropdownChoiceId,
} from '@companion-module/base'
import type { CompanionCommonCallbackContext } from '@companion-module/base/dist/module-api/common.js'

import type { ConditionalKeys } from 'type-fest'

// type InputFieldNumber = CompanionInputFieldColor | CompanionInputFieldNumber
// type InputFieldString = CompanionInputFieldTextInput

// type PrimitiveToActionInputField<T> = T extends boolean
// 	? CompanionInputFieldCheckbox
// 	: T extends number | string
// 	? CompanionInputFieldDropdown | (T extends string ? InputFieldString : T extends number ? InputFieldNumber : never)
// 	: never

export type MyOptionsObject<TOptions, TFields extends CompanionInputFieldBase> = {
	[K in keyof TOptions]: undefined extends TOptions[K] ? TFields | undefined : TFields
}

export interface MyDropdownChoice<T extends DropdownChoiceId = DropdownChoiceId> {
	/** Value of the option */
	id: T
	/** Label to show to users */
	label: string
}

export interface MyOptionsHelper<TOptions> {
	getJson(): TOptions
	getRaw<Key extends keyof TOptions>(fieldName: Key): TOptions[Key] | undefined
	getPlainString<Key extends ConditionalKeys<TOptions, string>>(fieldName: Key): TOptions[Key]
	getPlainNumber<Key extends ConditionalKeys<TOptions, number>>(fieldName: Key): TOptions[Key]
	getPlainBoolean<Key extends ConditionalKeys<TOptions, boolean | undefined>>(fieldName: Key): boolean

	getParsedString<Key extends ConditionalKeys<TOptions, string | undefined>>(fieldName: Key): Promise<string>
	getParsedNumber<Key extends ConditionalKeys<TOptions, string | undefined>>(fieldName: Key): Promise<number>
	getParsedBoolean<Key extends ConditionalKeys<TOptions, string | undefined>>(fieldName: Key): Promise<boolean>
}

export class MyOptionsHelperImpl<TOptions> implements MyOptionsHelper<TOptions> {
	readonly #options: any
	readonly #context: CompanionCommonCallbackContext
	readonly #fields: MyOptionsObject<TOptions, any>

	constructor(options: CompanionOptionValues, context: CompanionActionContext, fields: MyOptionsObject<TOptions, any>) {
		this.#options = options
		this.#context = context
		this.#fields = fields
	}

	getJson(): TOptions {
		return { ...this.#options }
	}
	getRaw<Key extends keyof TOptions>(fieldName: Key): any {
		// TODO - should this populate defaults?
		return this.#options[fieldName]
	}

	getPlainString<Key extends ConditionalKeys<TOptions, string>>(fieldName: Key): TOptions[Key] {
		const fieldSpec = this.#fields[fieldName]
		const defaultValue = fieldSpec && 'default' in fieldSpec ? fieldSpec.default : undefined

		const rawValue = this.#options[fieldName]
		if (defaultValue !== undefined && rawValue === undefined) return String(defaultValue) as any

		return String(rawValue) as any
	}

	getPlainNumber<Key extends ConditionalKeys<TOptions, number>>(fieldName: Key): TOptions[Key] {
		const fieldSpec = this.#fields[fieldName]
		const defaultValue = fieldSpec && 'default' in fieldSpec ? fieldSpec.default : undefined

		const rawValue = this.#options[fieldName]
		if (defaultValue !== undefined && rawValue === undefined) return Number(defaultValue) as any

		const value = Number(rawValue)
		if (isNaN(value)) {
			throw new Error(`Invalid option '${String(fieldName)}'`)
		}
		return value as any
	}

	getPlainBoolean<Key extends ConditionalKeys<TOptions, boolean | undefined>>(fieldName: Key): boolean {
		const fieldSpec = this.#fields[fieldName]
		const defaultValue = fieldSpec && 'default' in fieldSpec ? fieldSpec.default : undefined

		const rawValue = this.#options[fieldName]
		if (defaultValue !== undefined && rawValue === undefined) return Boolean(defaultValue)

		return Boolean(rawValue)
	}

	async getParsedString<Key extends ConditionalKeys<TOptions, string | undefined>>(fieldName: Key): Promise<string> {
		const rawValue = this.#options[fieldName]

		return this.#context.parseVariablesInString(rawValue)
	}
	async getParsedNumber<Key extends ConditionalKeys<TOptions, string | undefined>>(fieldName: Key): Promise<number> {
		const str = await this.getParsedString(fieldName)

		return Number(str)
	}
	async getParsedBoolean<Key extends ConditionalKeys<TOptions, string | undefined>>(fieldName: Key): Promise<boolean> {
		const str = await this.getParsedString(fieldName)

		if (str.toLowerCase() == 'false' || Number(str) == 0) return false
		return true
	}
}
