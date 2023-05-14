import {
	CompanionPropertyType,
	type CompanionPropertyDefinitions,
} from '@companion-module/base/dist/module-api/properties.js'
import type { AtemInstance } from '../index.js'
import { PropertyId } from './id.js'
import type { DropdownChoice, DropdownChoiceId } from '@companion-module/base'
import { SourcesToLongChoices, type SourceInfo } from '../choices.js'
import { parseSourceId } from './util.js'

export function createMePreviewPropertyDefinitions(
	this: AtemInstance,
	mixEffectIds: DropdownChoice[],
	mixEffectSources: SourceInfo[]
): CompanionPropertyDefinitions {
	return {
		[PropertyId.MEPreview]: {
			name: 'ME Preview',
			description: '',

			type: CompanionPropertyType.Dropdown,

			instanceIds: mixEffectIds,

			choices: SourcesToLongChoices(mixEffectSources),

			getValues: async () => {
				const values: Record<DropdownChoiceId, DropdownChoiceId> = {}

				for (const me of this.atemState.video.mixEffects) {
					if (me) {
						const source = mixEffectSources.find((src) => src.id === me.previewInput)
						values[me.index + 1] = source?.longId ?? `Unknown${me.previewInput}`
					}
				}

				return values
			},
			setValue: async (instanceId, value) => {
				if (!instanceId || typeof instanceId !== 'number' || instanceId <= 0) throw new Error('Invalid mixEffect id')

				const parsedValue = parseSourceId(value, mixEffectSources)
				if (typeof parsedValue !== 'number') throw new Error('Invalid target value')

				await this.atem?.changePreviewInput(parsedValue, instanceId - 1)
			},
		},
		[PropertyId.MEPreviewRaw]: {
			name: 'ME Preview RAW',
			description: '',

			type: CompanionPropertyType.Number,

			min: 0,
			max: 100000, // TODO - a better value?
			step: 1,

			getValues: async () => {
				const values: Record<DropdownChoiceId, number> = {}

				for (const me of this.atemState.video.mixEffects) {
					if (me) {
						values[me.index + 1] = me.previewInput
					}
				}

				return values
			},
			setValue: async (instanceId, value) => {
				if (!instanceId || typeof instanceId !== 'number' || instanceId <= 0) throw new Error('Invalid mixEffect id')

				const parsedValue = parseSourceId(value, mixEffectSources)
				if (typeof parsedValue !== 'number') throw new Error('Invalid target value')

				await this.atem?.changePreviewInput(parsedValue, instanceId - 1)
			},
		},
		[PropertyId.MEPreviewInputLongName]: {
			name: 'ME Preview Input Long Name',
			description: '',

			type: CompanionPropertyType.String,

			instanceIds: mixEffectIds,

			getValues: async () => {
				const values: Record<DropdownChoiceId, string> = {}

				for (const me of this.atemState.video.mixEffects) {
					if (me) {
						const source = mixEffectSources.find((src) => src.id === me.previewInput)
						values[me.index + 1] = source?.longName ?? `Unknown (${me.previewInput})`
					}
				}

				return values
			},
		},
		[PropertyId.MEPreviewInputShortName]: {
			name: 'ME Preview Input Short Name',
			description: '',

			type: CompanionPropertyType.String,

			instanceIds: mixEffectIds,

			getValues: async () => {
				const values: Record<DropdownChoiceId, string> = {}

				for (const me of this.atemState.video.mixEffects) {
					if (me) {
						const source = mixEffectSources.find((src) => src.id === me.previewInput)
						values[me.index + 1] = source?.shortName ?? `Unknown (${me.previewInput})`
					}
				}

				return values
			},
		},
	}
}
