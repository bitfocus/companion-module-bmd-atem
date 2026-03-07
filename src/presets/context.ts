import type { CompanionPresetSection, CompanionPresetDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import type { AtemSchema } from '../schema.js'

export interface PresetsBuilderContext {
	readonly model: ModelSpec

	readonly sections: CompanionPresetSection<AtemSchema>[]
	readonly definitions: CompanionPresetDefinitions<AtemSchema>
}
