import type { CompanionInputFieldDropdown } from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import { iterateTimes } from '../util.js'

export function AtemMediaPlayerPicker(model: ModelSpec): CompanionInputFieldDropdown<'mediaplayer'> {
	const choices = iterateTimes(model.media.players, (i) => {
		return {
			id: i + 1,
			label: `Media Player ${i + 1}`,
		}
	})
	return {
		type: 'dropdown',
		id: 'mediaplayer',
		label: 'Media Player',
		default: 1,
		choices,
		isVisibleExpression: choices.length > 1 ? undefined : 'false', // Hide if only 1 choice
		allowInvalidValues: choices.length > 1 ? undefined : true, // Allow any value when hidden
	}
}

/**
 * Resolve the 0-based media player index from a picker value. When the model has only a single
 * media player the picker is hidden, so any value is ignored and treated as the first one.
 */
export function resolveMediaPlayerIndex(model: ModelSpec, mediaplayer: number): number {
	return model.media.players > 1 ? mediaplayer - 1 : 0
}
