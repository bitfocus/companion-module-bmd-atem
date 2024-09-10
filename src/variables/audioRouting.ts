import type { CompanionVariableValues } from '@companion-module/base'
import type { AtemState } from 'atem-connection'
import { formatAudioRoutingAsString } from '../util.js'

export function updateFairlightAudioRoutingSourceVariables(
	state: AtemState,
	sourceId: number,
	values: CompanionVariableValues,
): void {
	const stringId = formatAudioRoutingAsString(sourceId)
	const sourceState = state.fairlight?.audioRouting?.sources?.[sourceId]

	values[`audio_routing_source_${stringId}_name`] = sourceState?.name
}

export function updateFairlightAudioRoutingOutputVariables(
	state: AtemState,
	outputId: number,
	values: CompanionVariableValues,
): void {
	const stringId = formatAudioRoutingAsString(outputId)
	const outputState = state.fairlight?.audioRouting?.outputs?.[outputId]

	values[`audio_routing_destinations_${stringId}_name`] = outputState?.name

	const sourceState = outputState && state.fairlight?.audioRouting?.sources?.[outputState?.sourceId]

	values[`audio_routing_destinations_${stringId}_source`] = outputState?.sourceId
	values[`audio_routing_destinations_${stringId}_source_name`] = sourceState?.name
}
