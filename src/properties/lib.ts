import type { CompanionPropertyDefinitions } from '@companion-module/base/dist/module-api/properties.js'
import type { AtemInstance } from '../index.js'
import { createMiscPropertyDefinitions } from './misc.js'
import { createMeProgramPropertyDefinitions } from './me_program.js'
import { GetSourcesListForType } from '../choices.js'
import type { DropdownChoice } from '@companion-module/base'
import { createMePreviewPropertyDefinitions } from './me_preview.js'

export function createAllPropertyDefinitions(this: AtemInstance): CompanionPropertyDefinitions {
	const mixEffectIds: DropdownChoice[] = []
	for (let i = 1; i <= this.model.MEs; i++) {
		mixEffectIds.push({
			id: i,
			label: `ME ${i}`,
		})
	}

	const mixEffectSources = GetSourcesListForType(this.model, this.atemState, 'me')

	return {
		...createMiscPropertyDefinitions.bind(this)(),
		...createMeProgramPropertyDefinitions.bind(this)(mixEffectIds, mixEffectSources),
		...createMePreviewPropertyDefinitions.bind(this)(mixEffectIds, mixEffectSources),
	}
}
