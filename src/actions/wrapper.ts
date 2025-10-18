import type {
	CompanionActionContext,
	CompanionActionDefinition,
	CompanionActionInfo,
	CompanionOptionValues,
	SomeCompanionActionInputField,
} from '@companion-module/base'
import type { MyActionDefinition, MyActionEvent2, MyActionInfo2 } from './types.js'
import type { Complete } from '@companion-module/base/dist/util.js'
import { MyOptionsHelperImpl, type MyOptionsObject } from '../common.js'

function rewrapActionInfo<TOptions>(
	action: CompanionActionInfo,
	context: CompanionActionContext,
	fields: MyOptionsObject<TOptions, any>,
): MyActionInfo2<TOptions> {
	return {
		id: action.id,
		controlId: action.controlId,
		actionId: action.actionId,

		options: new MyOptionsHelperImpl<TOptions>(action.options, context, fields),
	} satisfies Complete<MyActionInfo2<TOptions>>
}

function convertMyActionToCompanionAction<TOptions>(
	actionDef: MyActionDefinition<TOptions>,
): CompanionActionDefinition {
	const { subscribe, unsubscribe, learn } = actionDef

	return {
		name: actionDef.name,
		description: actionDef.description,
		options: Object.entries(actionDef.options)
			.filter((o) => !!o[1])
			.map(([id, option]) => ({
				...(option as SomeCompanionActionInputField),
				id,
			})),
		optionsToIgnoreForSubscribe: actionDef.optionsToIgnoreForSubscribe,
		skipUnsubscribeOnOptionsChange: actionDef.skipUnsubscribeOnOptionsChange,
		callback: async (action, context) => {
			return actionDef.callback(
				{
					...rewrapActionInfo(action, context, actionDef.options),

					surfaceId: action.surfaceId,
				} satisfies Complete<MyActionEvent2<TOptions>>,
				context,
			)
		},
		subscribe: subscribe
			? async (action, context) => {
					return subscribe(rewrapActionInfo(action, context, actionDef.options), context)
				}
			: undefined,
		unsubscribe: unsubscribe
			? async (action, context) => {
					return unsubscribe(rewrapActionInfo(action, context, actionDef.options), context)
				}
			: undefined,
		learn: learn
			? async (action, context) => {
					return learn(
						{
							...rewrapActionInfo(action, context, actionDef.options),

							surfaceId: action.surfaceId,
						} satisfies Complete<MyActionEvent2<TOptions>>,
						context,
					) as CompanionOptionValues | undefined | Promise<CompanionOptionValues | undefined>
				}
			: undefined,
		learnTimeout: undefined,
	} satisfies Complete<CompanionActionDefinition>
}

type Test<TTypes> = {
	[Key in keyof TTypes]: TTypes[Key] extends MyActionDefinition<TTypes[Key]> ? CompanionActionDefinition : never
}

export function convertMyActionDefinitions<TTypes extends Record<string, MyActionDefinition<any> | undefined>>(
	actionDefs: TTypes,
): Test<TTypes> {
	const res: Test<TTypes> = {} as any

	for (const [id, def] of Object.entries(actionDefs)) {
		;(res as any)[id] = def ? convertMyActionToCompanionAction(def) : undefined
	}

	return res
}
