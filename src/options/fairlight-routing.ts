import type {
	CompanionInputFieldMultiDropdown,
	CompanionInputFieldDropdown,
	DropdownChoice,
} from '@companion-module/base'
import { Enums, type AtemState } from 'atem-connection'
import type { ModelSpec } from '../models/types.js'
import { combineInputId } from '../models/util/audioRouting.js'

export function formatAudioRoutingAsString(id: number): string {
	const inputId = Math.floor(id >> 16)
	const pair: Enums.AudioChannelPair = id & 0xff

	const pairName = AudioRoutingChannelsNames[pair]?.replace('/', '_')

	return `${inputId}-${pairName}`
}
export function parseAudioRoutingString(ids: string): number[] {
	return ids
		.split(/[,| ]/)
		.map((id) => parseAudioRoutingStringSingle(id))
		.filter((id): id is number => id !== null)
}

const ROUTING_STRING_REGEX = /(\d+)-([\d]+_[\d]+)/i
export function parseAudioRoutingStringSingle(id: string): number | null {
	id = id.trim()
	if (!id) return null

	const match = ROUTING_STRING_REGEX.exec(id)
	if (match) {
		const inputId = Number(match[1])

		const pairValueStr = match[2]?.replace('_', '/')
		const pairValueOption = Object.entries(AudioRoutingChannelsNames).find(([, value]) => value === pairValueStr)
		if (!pairValueOption) return null
		const pairValue = Number(pairValueOption[0])

		if (isNaN(inputId) || isNaN(pairValue)) return null

		return combineInputId(inputId, pairValue)
	}

	const inputId = Number(id)
	if (isNaN(inputId)) return null

	return combineInputId(inputId, Enums.AudioChannelPair.Channel1_2)
}

export function AtemFairlightAudioRoutingSourcePicker(
	model: ModelSpec,
	state: AtemState,
): CompanionInputFieldDropdown<'source'> {
	const sources = FairlightAudioRoutingSources(model, state)

	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: sources[0].id,
		choices: sources,
	}
}

export const AudioRoutingChannelsNames: { [key in Enums.AudioChannelPair]: string } = {
	[Enums.AudioChannelPair.Channel1_2]: `1/2`,
	[Enums.AudioChannelPair.Channel3_4]: `3/4`,
	[Enums.AudioChannelPair.Channel5_6]: `5/6`,
	[Enums.AudioChannelPair.Channel7_8]: `7/8`,
	[Enums.AudioChannelPair.Channel9_10]: `9/10`,
	[Enums.AudioChannelPair.Channel11_12]: `11/12`,
	[Enums.AudioChannelPair.Channel13_14]: `13/14`,
	[Enums.AudioChannelPair.Channel15_16]: `15/16`,
} as const

export function FairlightAudioRoutingSources(model: ModelSpec, state: AtemState): DropdownChoice[] {
	const sources: DropdownChoice[] = []

	const stateSources = state.fairlight?.audioRouting?.sources ?? {}
	for (const source of model.fairlightAudio?.audioRouting?.sources ?? []) {
		for (const pair of source.channelPairs) {
			const combinedId = combineInputId(source.inputId, pair)

			sources.push({
				id: combinedId,
				label: compileAudioName(source.sourceName, stateSources[combinedId]?.name, pair, source.channelPairs),
			})
		}
	}

	return sources
}

export function FairlightAudioRoutingDestinations(model: ModelSpec, state: AtemState): DropdownChoice[] {
	const sources: DropdownChoice[] = []

	const stateOutputs = state.fairlight?.audioRouting?.outputs ?? {}
	for (const output of model.fairlightAudio?.audioRouting?.outputs ?? []) {
		for (const pair of output.channelPairs) {
			const combinedId = combineInputId(output.outputId, pair)

			sources.push({
				id: combinedId,
				label: compileAudioName(output.outputName, stateOutputs[combinedId]?.name, pair, output.channelPairs),
			})
		}
	}

	return sources
}

function compileAudioName(
	defaultName: string,
	currentName: string | undefined,
	pair: Enums.AudioChannelPair,
	allPairs: Enums.AudioChannelPair[],
) {
	let name = currentName ?? defaultName

	if (allPairs.length !== 1 || pair !== Enums.AudioChannelPair.Channel1_2) {
		const pairName = AudioRoutingChannelsNames[pair]
		name = `${name} ${pairName}`
	}

	if (currentName && defaultName) {
		name = `${currentName} (${defaultName})`
	}

	return name
}

export function AtemFairlightAudioRoutingDestinationsPicker(
	model: ModelSpec,
	state: AtemState,
): CompanionInputFieldMultiDropdown<'destinations'> {
	const sources = FairlightAudioRoutingDestinations(model, state)

	return {
		type: 'multidropdown',
		id: 'destinations',
		label: 'Destinations',
		default: [sources[0].id],
		choices: sources,
		sortSelection: true,
	}
}

export function AtemFairlightAudioRoutingDestinationPicker(
	model: ModelSpec,
	state: AtemState,
): CompanionInputFieldDropdown<'destination'> {
	const sources = FairlightAudioRoutingDestinations(model, state)

	return {
		type: 'dropdown',
		id: 'destination',
		label: 'Destination',
		default: sources[0].id,
		choices: sources,
	}
}
