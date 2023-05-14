import {
	CompanionPropertyType,
	type CompanionPropertyDefinitions,
} from '@companion-module/base/dist/module-api/properties.js'
import type { AtemInstance } from '../index.js'
import { PropertyId } from './id.js'
import type { DropdownChoice, DropdownChoiceId } from '@companion-module/base'
import { SourcesToLongChoices, type SourceInfo } from '../choices.js'
import { parseSourceId } from './util.js'

export function createMeProgramPropertyDefinitions(
	this: AtemInstance,
	mixEffectIds: DropdownChoice[],
	mixEffectSources: SourceInfo[]
): CompanionPropertyDefinitions {
	return {
		[PropertyId.MEProgram]: {
			name: 'ME Program',
			description: '',

			type: CompanionPropertyType.Dropdown,

			instanceIds: mixEffectIds,

			choices: SourcesToLongChoices(mixEffectSources),

			getValues: async () => {
				console.log('TODO get program value')
				const values: Record<DropdownChoiceId, DropdownChoiceId> = {}

				for (const me of this.atemState.video.mixEffects) {
					if (me) {
						const source = mixEffectSources.find((src) => src.id === me.programInput)
						values[me.index + 1] = source?.longId ?? `Unknown${me.programInput}`
					}
				}

				return values
			},
			setValue: async (instanceId, value) => {
				console.log('TODO set program value', instanceId, value)

				if (!instanceId || typeof instanceId !== 'number' || instanceId <= 0) throw new Error('Invalid mixEffect id')

				const parsedValue = parseSourceId(value, mixEffectSources)
				if (typeof parsedValue !== 'number') throw new Error('Invalid target value')

				await this.atem?.changeProgramInput(parsedValue, instanceId - 1)
			},
		},
		[PropertyId.MEProgramRaw]: {
			name: 'ME Program RAW',
			description: '',

			type: CompanionPropertyType.Number,

			min: 0,
			max: 100000, // TODO - a better value?
			step: 1,

			getValues: async () => {
				console.log('TODO get program value')
				const values: Record<DropdownChoiceId, number> = {}

				for (const me of this.atemState.video.mixEffects) {
					if (me) {
						values[me.index + 1] = me.programInput
					}
				}

				return values
			},
			setValue: async (instanceId, value) => {
				console.log('TODO set program value', instanceId, value)

				if (!instanceId || typeof instanceId !== 'number' || instanceId <= 0) throw new Error('Invalid mixEffect id')

				const parsedValue = parseSourceId(value, mixEffectSources)
				if (typeof parsedValue !== 'number') throw new Error('Invalid target value')

				await this.atem?.changeProgramInput(parsedValue, instanceId - 1)
			},
		},
		[PropertyId.MEProgramInputLongName]: {
			name: 'ME Program Input Long Name',
			description: '',

			type: CompanionPropertyType.String,

			instanceIds: mixEffectIds,

			getValues: async () => {
				console.log('TODO get program value')
				const values: Record<DropdownChoiceId, string> = {}

				for (const me of this.atemState.video.mixEffects) {
					if (me) {
						const source = mixEffectSources.find((src) => src.id === me.programInput)
						values[me.index + 1] = source?.longName ?? `Unknown (${me.programInput})`
					}
				}

				return values
			},
		},
		[PropertyId.MEProgramInputShortName]: {
			name: 'ME Program Input Short Name',
			description: '',

			type: CompanionPropertyType.String,

			instanceIds: mixEffectIds,

			getValues: async () => {
				console.log('TODO get program value')
				const values: Record<DropdownChoiceId, string> = {}

				for (const me of this.atemState.video.mixEffects) {
					if (me) {
						const source = mixEffectSources.find((src) => src.id === me.programInput)
						values[me.index + 1] = source?.shortName ?? `Unknown (${me.programInput})`
					}
				}

				return values
			},
		},
	}
}
