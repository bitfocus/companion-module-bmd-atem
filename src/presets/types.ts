import type {
	CompanionButtonStyleProps,
	CompanionButtonPresetOptions,
	CompanionFeedbackButtonStyleResult,
	CompanionActionSetOptions,
} from '@companion-module/base'

export type MyPresetDefinitions<TActions, TFeedbacks> = MyPresetDefinitionCategory<TActions, TFeedbacks>[]
export type MyPresetDefinitionCategory<TActions, TFeedbacks> = {
	name: string
	presets: Record<string, MyButtonPresetDefinition<TActions, TFeedbacks>>
}

export interface MyButtonPresetDefinition<TActions, TFeedbacks> {
	/** The type of this preset */
	type: 'button'
	/** The category of this preset, for grouping */
	// category: string
	/** The name of this preset */
	name: string
	/** The base style of this preset, this will be copied to the button */
	style: CompanionButtonStyleProps
	/** Preview style for preset, will be used in GUI for preview */
	previewStyle?: CompanionButtonStyleProps
	/** Options for this preset */
	options?: CompanionButtonPresetOptions
	/** The feedbacks on the button */
	feedbacks: MyPresetFeedback<TFeedbacks>[]
	steps: MyButtonStepActions<TActions>[]
}

type MyPresetFeedbackInner<TTypes, Id extends keyof TTypes> = Id extends any
	? {
			/** The id of the feedback definition */
			feedbackId: Id
			/** The option values for the feedback */
			options: TTypes[Id]
			/**
			 * If a boolean feedback, the style effect of the feedback
			 */
			style?: CompanionFeedbackButtonStyleResult
			/**
			 * If a boolean feedback, invert the value of the feedback
			 */
			isInverted?: boolean
	  }
	: never

export type MyPresetFeedback<TFeedbacks> = MyPresetFeedbackInner<TFeedbacks, keyof TFeedbacks>

type MyPresetActionInner<TTypes, Id extends keyof TTypes> = Id extends any
	? {
			/** The id of the action definition */
			actionId: Id
			/** The option values for the action */
			options: TTypes[Id]
			/** The execution delay of the action */
			delay?: number
	  }
	: never

export type MyPresetAction<TActions> = MyPresetActionInner<TActions, keyof TActions>

export interface MyButtonStepActions<TActions> {
	/** The button down actions */
	down: MyPresetAction<TActions>[]
	/** The button up actions */
	up: MyPresetAction<TActions>[]
	rotate_left?: MyPresetAction<TActions>[]
	rotate_right?: MyPresetAction<TActions>[]
	[delay: number]: MyPresetActionsWithOptions<TActions> | MyPresetAction<TActions>[]
}

export interface MyPresetActionsWithOptions<TActions> {
	options?: CompanionActionSetOptions
	actions: MyPresetAction<TActions>[]
}
