import type {
	CompanionAdvancedFeedbackResult,
	CompanionFeedbackButtonStyleResult,
	CompanionFeedbackContext,
	SomeCompanionFeedbackInputField,
} from '@companion-module/base'
import type { MyOptionsHelper, MyOptionsObject } from '../common.js'

/**
 * Basic information about an instance of an Feedback
 */
export interface MyFeedbackInfo<TOptions> {
	/** The type of the feedback */
	readonly type: 'boolean' | 'advanced'
	/** The unique id for this feedback */
	readonly id: string
	/** The unique id for the location of this feedback */
	readonly controlId: string
	/** The id of the feedback definition */
	readonly feedbackId: string
	/** The user selected options for the feedback */
	readonly options: MyOptionsHelper<TOptions>
}
/**
 * Extended information for execution of an Feedback
 */
export type MyBooleanFeedbackEvent<TOptions> = MyFeedbackInfo<TOptions>

/**
 * Extended information for execution of an advanced feedback
 */
export interface MyAdvancedFeedbackEvent<TOptions> extends MyFeedbackInfo<TOptions> {
	/** If control supports an imageBuffer, the dimensions the buffer should be */
	readonly image?: {
		readonly width: number
		readonly height: number
	}
}

export interface MyFeedbackDefinitionBase<TOptions> {
	/** Name to show in the Feedbacks list */
	name: string
	/** Additional description of the Feedback */
	description?: string
	/** The input fields for the Feedback */
	options: MyOptionsObject<TOptions, SomeCompanionFeedbackInputField>

	/**
	 * Called to report the existence of an Feedback
	 * Useful to ensure necessary data is loaded
	 */
	subscribe?: (Feedback: MyFeedbackInfo<TOptions>, context: CompanionFeedbackContext) => Promise<void> | void
	/**
	 * Called to report an Feedback has been edited/removed
	 * Useful to cleanup subscriptions setup in subscribe
	 */
	unsubscribe?: (Feedback: MyFeedbackInfo<TOptions>, context: CompanionFeedbackContext) => Promise<void> | void
	/**
	 * The user requested to 'learn' the values for this Feedback.
	 */
	learn?: (
		Feedback: MyFeedbackInfo<TOptions>,
		context: CompanionFeedbackContext
	) => TOptions | undefined | Promise<TOptions | undefined>
}

export interface MyBooleanFeedbackDefinition<TOptions> extends MyFeedbackDefinitionBase<TOptions> {
	type: 'boolean'

	/** The default style properties for this feedback */
	defaultStyle: Partial<CompanionFeedbackButtonStyleResult>

	/**
	 * If `undefined` or true, Companion will add an 'Inverted' checkbox for your feedback, and handle the logic for you.
	 * By setting this to false, you can disable this for your feedback. You should do this if it does not make sense for your feedback.
	 */
	showInvert?: boolean

	/** Called to execute the Feedback */
	callback: (
		Feedback: MyBooleanFeedbackEvent<TOptions>,
		context: CompanionFeedbackContext
	) => Promise<boolean> | boolean
}
export interface MyAdvancedFeedbackDefinition<TOptions> extends MyFeedbackDefinitionBase<TOptions> {
	type: 'advanced'

	/** Called to execute the Feedback */
	callback: (
		Feedback: MyAdvancedFeedbackEvent<TOptions>,
		context: CompanionFeedbackContext
	) => Promise<CompanionAdvancedFeedbackResult> | CompanionAdvancedFeedbackResult
}

export declare type MyFeedbackDefinition<TOption> =
	| MyBooleanFeedbackDefinition<TOption>
	| MyAdvancedFeedbackDefinition<TOption>

export type MyFeedbackDefinitions<TTypes> = {
	[Key in keyof TTypes]: MyFeedbackDefinition<TTypes[Key]> | undefined
}
