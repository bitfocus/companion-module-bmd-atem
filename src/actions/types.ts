import type { CompanionActionContext, SomeCompanionActionInputField } from '@companion-module/base'
import type { ConditionalKeys } from 'type-fest'

// type InputFieldNumber = CompanionInputFieldColor | CompanionInputFieldNumber
// type InputFieldString = CompanionInputFieldTextInput

// type PrimitiveToActionInputField<T> = T extends boolean
// 	? CompanionInputFieldCheckbox
// 	: T extends number | string
// 	? CompanionInputFieldDropdown | (T extends string ? InputFieldString : T extends number ? InputFieldNumber : never)
// 	: never

export type MyActionOptionsObject<TOptions> = {
	[K in keyof TOptions]: undefined extends TOptions[K]
		? SomeCompanionActionInputField | undefined
		: SomeCompanionActionInputField
	// [K in keyof TOptions]: PrimitiveToActionInputField<TOptions[K]>
	// [k: string]: CompanionInputFieldStaticText
}

export interface MyOptionsHelper<TOptions> {
	getJson(): TOptions
	getRaw<Key extends keyof TOptions>(fieldName: Key): TOptions[Key] | undefined
	getPlainString<Key extends ConditionalKeys<TOptions, string>>(fieldName: Key): TOptions[Key]
	getPlainNumber<Key extends ConditionalKeys<TOptions, number>>(fieldName: Key): TOptions[Key]
	getPlainBoolean<Key extends ConditionalKeys<TOptions, boolean>>(fieldName: Key): boolean

	getParsedString<Key extends ConditionalKeys<TOptions, string | undefined>>(fieldName: Key): Promise<string>
	getParsedNumber<Key extends ConditionalKeys<TOptions, string | undefined>>(fieldName: Key): Promise<number>
}
/**
 * Basic information about an instance of an action
 */
export interface MyActionInfo2<TOptions> {
	/** The unique id for this action */
	readonly id: string
	/** The unique id for the location of this action */
	readonly controlId: string
	/** The id of the action definition */
	readonly actionId: string
	/** The user selected options for the action */
	readonly options: MyOptionsHelper<TOptions>
}
/**
 * Extended information for execution of an action
 */
export interface MyActionEvent2<TOptions> extends MyActionInfo2<TOptions> {
	/** Identifier of the surface which triggered this action */
	readonly surfaceId: string | undefined
}

export interface MyActionDefinition<TOptions> {
	/** Name to show in the actions list */
	name: string
	/** Additional description of the action */
	description?: string
	/** The input fields for the action */
	options: MyActionOptionsObject<TOptions>

	/** Called to execute the action */
	callback: (action: MyActionEvent2<TOptions>, context: CompanionActionContext) => Promise<void> | void
	/**
	 * Called to report the existence of an action
	 * Useful to ensure necessary data is loaded
	 */
	subscribe?: (action: MyActionInfo2<TOptions>, context: CompanionActionContext) => Promise<void> | void
	/**
	 * Called to report an action has been edited/removed
	 * Useful to cleanup subscriptions setup in subscribe
	 */
	unsubscribe?: (action: MyActionInfo2<TOptions>, context: CompanionActionContext) => Promise<void> | void
	/**
	 * The user requested to 'learn' the values for this action.
	 */
	learn?: (
		action: MyActionEvent2<TOptions>,
		context: CompanionActionContext
	) => TOptions | undefined | Promise<TOptions | undefined>
}

export type MyActionDefinitions<TTypes> = {
	[Key in keyof TTypes]: MyActionDefinition<TTypes[Key]> | undefined
}
