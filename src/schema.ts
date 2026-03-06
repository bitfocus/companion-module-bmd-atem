import type { AtemConfig } from './config.js'
import type { ActionTypes } from './actions/index.js'
import type { FeedbackTypes } from './feedback/index.js'
import type { VariablesSchema } from './variables/schema.js'

export interface AtemSchema {
	config: AtemConfig
	secrets: undefined
	actions: ActionTypes
	feedbacks: FeedbackTypes
	variables: VariablesSchema
}
