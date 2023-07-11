import type {
	CompanionActionContext,
	CompanionActionDefinition,
	CompanionActionInfo,
	CompanionOptionValues,
	SomeCompanionActionInputField,
} from '@companion-module/base'
import type { MyActionDefinition, MyActionEvent2, MyActionInfo2, MyActionOptionsObject, MyOptionsHelper } from './types'
import type { Complete } from '@companion-module/base/dist/util'
import type { ConditionalKeys } from 'type-fest'

class MyOptionsHelperImpl<TOptions> implements MyOptionsHelper<TOptions> {
	readonly #options: any
	readonly #context: CompanionActionContext
	readonly #fields: MyActionOptionsObject<TOptions>

	constructor(
		options: CompanionOptionValues,
		context: CompanionActionContext,
		fields: MyActionOptionsObject<TOptions>,
	) {
		this.#options = options
		this.#context = context
		this.#fields = fields
	}

	getJson(): TOptions {
		return { ...this.#options }
	}
	getRaw<Key extends keyof TOptions>(fieldName: Key) {
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

	getPlainBoolean<Key extends ConditionalKeys<TOptions, boolean>>(fieldName: Key): boolean {
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
}

function rewrapActionInfo<TOptions>(
	action: CompanionActionInfo,
	context: CompanionActionContext,
	fields: MyActionOptionsObject<TOptions>,
): MyActionInfo2<TOptions> {
	return {
		id: action.id,
		controlId: action.controlId,
		actionId: action.actionId,

		options: new MyOptionsHelperImpl<TOptions>(action.options, context, fields),
	} satisfies Complete<MyActionInfo2<TOptions>>
}

export function convertMyActionToCompanionAction<TOptions>(
	actionDef: MyActionDefinition<TOptions>,
): CompanionActionDefinition {
	const { subscribe, unsubscribe, learn } = actionDef

	return {
		name: actionDef.name,
		description: actionDef.description,
		options: Object.entries(actionDef.options).map(([id, option]) => ({
			...(option as SomeCompanionActionInputField),
			id,
		})),
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
