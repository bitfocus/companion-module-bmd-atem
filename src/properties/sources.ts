import {
	CompanionPropertyType,
	type CompanionPropertyDefinitions,
} from '@companion-module/base/dist/module-api/properties.js'
import type { AtemInstance } from '../index.js'
import { PropertyId } from './id.js'
import type { DropdownChoiceId } from '@companion-module/base'
import { SourcesToLongChoices, GetSourcesListForType } from '../choices.js'

export function createSourceNamePropertyDefinitions(this: AtemInstance): CompanionPropertyDefinitions {
	const allSources = GetSourcesListForType(this.model, this.atemState)

	return {
		[PropertyId.SourceLongName]: {
			name: 'Source Long Name',
			description: '',

			type: CompanionPropertyType.String,

			instanceIds: SourcesToLongChoices(allSources, true),

			getValues: async () => {
				const values: Record<DropdownChoiceId, string> = {}

				for (const src of allSources) {
					values[src.longId] = src.longName
				}

				return values
			},
		},
		[PropertyId.SourceShortName]: {
			name: 'Source Short Name',
			description: '',

			type: CompanionPropertyType.String,

			instanceIds: SourcesToLongChoices(allSources, true),

			getValues: async () => {
				const values: Record<DropdownChoiceId, string> = {}

				for (const src of allSources) {
					values[src.longId] = src.shortName
				}

				return values
			},
		},
	}
}
