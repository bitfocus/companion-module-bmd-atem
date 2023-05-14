import type { CompanionPropertyDefinitions } from '@companion-module/base/dist/module-api/properties'
import type { AtemInstance } from '..'
import { createMiscPropertyDefinitions } from './misc'
import { createMeProgramPropertyDefinitions } from './me_program'
import { GetSourcesListForType } from '../choices'
import type { DropdownChoice } from '@companion-module/base'
import { createMePreviewPropertyDefinitions } from './me_preview'

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
