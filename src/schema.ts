import type {
	CompanionActionSchema,
	CompanionOptionValues,
	CompanionFeedbackSchema,
	CompanionVariableValues,
} from '@companion-module/base'
import type { AtemConfig } from './config.js'

export interface AtemSchema {
	config: AtemConfig
	secrets: undefined
	actions: Record<string, CompanionActionSchema<CompanionOptionValues>>
	feedbacks: Record<string, CompanionFeedbackSchema<CompanionOptionValues>>
	variables: CompanionVariableValues
}
