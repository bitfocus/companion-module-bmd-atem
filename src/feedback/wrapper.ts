import type {
	CompanionAdvancedFeedbackDefinition,
	CompanionBooleanFeedbackDefinition,
	CompanionFeedbackContext,
	CompanionFeedbackDefinition,
	CompanionFeedbackDefinitionBase,
	CompanionFeedbackInfo,
	CompanionOptionValues,
	SomeCompanionFeedbackInputField,
} from '@companion-module/base'
import { assertNever, type Complete } from '@companion-module/base/dist/util.js'
import { MyOptionsHelperImpl, type MyOptionsObject } from '../common.js'
import type {
	MyAdvancedFeedbackEvent,
	MyBooleanFeedbackEvent,
	MyFeedbackDefinition,
	MyFeedbackDefinitionBase,
	MyFeedbackInfo,
} from './types.js'

function rewrapFeedbackInfo<TOptions>(
	feedback: CompanionFeedbackInfo,
	context: CompanionFeedbackContext,
	fields: MyOptionsObject<TOptions, any>
): MyFeedbackInfo<TOptions> {
	return {
		type: feedback.type,
		id: feedback.id,
		controlId: feedback.controlId,
		feedbackId: feedback.feedbackId,

		options: new MyOptionsHelperImpl<TOptions>(feedback.options, context, fields),
	} satisfies Complete<MyFeedbackInfo<TOptions>>
}

function convertMyFeedbackBaseToCompanionFeedback<TOptions>(
	feedbackDef: MyFeedbackDefinitionBase<TOptions>
): Complete<Omit<CompanionFeedbackDefinitionBase, 'type'>> {
	const { subscribe, unsubscribe, learn } = feedbackDef

	return {
		name: feedbackDef.name,
		description: feedbackDef.description,
		options: Object.entries(feedbackDef.options)
			.filter((o) => !!o[1])
			.map(([id, option]) => ({
				...(option as SomeCompanionFeedbackInputField),
				id,
			})),
		// callback: async (action, context) => {
		// 	return feedbackDef.callback(
		// 		{
		// 			...rewrapActionInfo(action, context, feedbackDef.options),

		// 			surfaceId: action.surfaceId,
		// 		} satisfies Complete<MyFeedbackEvent<TOptions>>,
		// 		context
		// 	)
		// },
		subscribe: subscribe
			? async (action, context) => {
					return subscribe(rewrapFeedbackInfo(action, context, feedbackDef.options), context)
			  }
			: undefined,
		unsubscribe: unsubscribe
			? async (action, context) => {
					return unsubscribe(rewrapFeedbackInfo(action, context, feedbackDef.options), context)
			  }
			: undefined,
		learn: learn
			? async (action, context) => {
					return learn(rewrapFeedbackInfo(action, context, feedbackDef.options), context) as
						| CompanionOptionValues
						| undefined
						| Promise<CompanionOptionValues | undefined>
			  }
			: undefined,
		learnTimeout: undefined,
	}
}

type Test<TTypes> = {
	[Key in keyof TTypes]: TTypes[Key] extends MyFeedbackDefinition<TTypes[Key]> ? CompanionFeedbackDefinition : never
}

export function convertMyFeedbackDefinitions<TTypes extends Record<string, MyFeedbackDefinition<any> | undefined>>(
	feedbackDefs: TTypes
): Test<TTypes> {
	const res: Test<TTypes> = {} as any

	for (const [id, def] of Object.entries(feedbackDefs)) {
		let newDef: CompanionFeedbackDefinition | undefined
		switch (def?.type) {
			case undefined:
				newDef = undefined
				break
			case 'boolean':
				newDef = {
					...convertMyFeedbackBaseToCompanionFeedback(def),
					type: 'boolean',
					defaultStyle: def.defaultStyle,
					showInvert: def.showInvert,
					callback: async (feedback, context) => {
						return def.callback(
							{
								...rewrapFeedbackInfo(feedback, context, def.options),
							} satisfies Complete<MyBooleanFeedbackEvent<any>>,
							context
						)
					},
				} satisfies Complete<CompanionBooleanFeedbackDefinition>
				break
			case 'advanced':
				newDef = {
					...convertMyFeedbackBaseToCompanionFeedback(def),
					type: 'advanced',
					callback: async (feedback, context) => {
						return def.callback(
							{
								...rewrapFeedbackInfo(feedback, context, def.options),
								image: feedback.image,
							} satisfies Complete<MyAdvancedFeedbackEvent<any>>,
							context
						)
					},
				} satisfies Complete<CompanionAdvancedFeedbackDefinition>
				break
			default:
				assertNever(def)
				break
		}

		;(res as any)[id] = newDef //def ? convertMyFeedbackToCompanionFeedback(def) : undefined
	}

	return res
}
