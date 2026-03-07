import type { CompanionInputFieldCheckbox, CompanionInputFieldDropdown, JsonValue } from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import type { AtemState } from 'atem-connection'
import { iterateTimes, stringifyValueAlways } from '../util.js'

export interface SourceDefinition {
	isClip: boolean
	slot: number
	frameIndex: number // Only used for clips
}

export type MediaPoolSourceOptions = {
	source: JsonValue
	defaultClip: boolean
}

export function AtemMediaPlayerSourcePickers(
	model: ModelSpec,
	state: AtemState,
	includeClips = true,
): {
	source: CompanionInputFieldDropdown<'source'>
	defaultClip: CompanionInputFieldCheckbox<'defaultClip'>
} {
	return {
		source: {
			type: 'dropdown',
			id: 'source',
			label: 'Source',
			default: 0,
			choices: [
				...(includeClips
					? iterateTimes(model.media.clips, (i) => {
							const clip = state.media.clipPool[i]
							return {
								id: `clip${i + 1}`,
								label: clip?.name ? `Clip #${i + 1}: ${clip.name}` : `Clip #${i + 1}`,
							}
						})
					: []),
				...iterateTimes(model.media.stills, (i) => {
					const still = state.media.stillPool[i]
					return {
						id: `still${i + 1}`,
						label: still?.fileName ? `Still #${i + 1}: ${still.fileName}` : `Still #${i + 1}`,
					}
				}),
			],
			allowInvalidValues: true,
		},
		defaultClip: {
			type: 'checkbox',
			id: 'defaultClip',
			label: 'Default to clip',
			default: false,
			description: 'How to interpret the Source field if it is unclear on whether it refers to a slot of clip',
			disableAutoExpression: true,
			isVisibleExpression: model.media.clips > 0 ? undefined : 'false', // Hide if there are no clips, as it won't do anything
		},
	}
}

export function parseMediaPoolSource(
	model: ModelSpec,
	ref: JsonValue | undefined,
	defaultAsClip: boolean,
): SourceDefinition | null {
	ref = stringifyValueAlways(ref).toLowerCase().trim()

	// sanitise to <ascii><number>
	ref = ref.replace(/[^a-z0-9]/g, '')

	const match = ref.match(/^([a-z]*)([0-9]+)$/)
	if (!match) return null // Unknown format

	let refType = match[1]
	if (!refType) refType = defaultAsClip ? 'clip' : 'still' // Default to clip or still based on the parameter

	const refNumber = parseInt(match[2], 10)
	if (isNaN(refNumber)) return null

	switch (refType) {
		case 'still':
		case 's':
		case 'st':
			if (refNumber < 1 || refNumber > model.media.stills) return null

			return {
				isClip: false,
				slot: refNumber - 1,
				frameIndex: 0,
			}
		case 'clip':
		case 'c':
		case 'cl':
			if (refNumber < 1 || refNumber > model.media.clips) return null

			return {
				isClip: true,
				slot: refNumber - 1,
				frameIndex: 0,
			}
		default:
			return null
	}
}
