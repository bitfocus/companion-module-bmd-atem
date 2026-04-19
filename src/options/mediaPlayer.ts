import type { CompanionInputFieldDropdown } from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import { iterateTimes } from '../util.js'

export function AtemMediaPlayerPicker(model: ModelSpec): CompanionInputFieldDropdown<'mediaplayer'> {
	return {
		type: 'dropdown',
		id: 'mediaplayer',
		label: 'Media Player',
		default: 1,
		choices: iterateTimes(model.media.players, (i) => {
			return {
				id: i + 1,
				label: `Media Player ${i + 1}`,
			}
		}),
	}
}
