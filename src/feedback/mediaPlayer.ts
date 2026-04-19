import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import { AtemMediaPlayerPicker } from '../options/mediaPlayer.js'
import type { ModelSpec } from '../models/index.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { StateWrapper } from '../state.js'
import {
	AtemMediaPlayerSourcePickers,
	type MediaPoolSourceOptions,
	parseMediaPoolSource,
} from '../options/mediaPool.js'

export type AtemMediaPlayerFeedbacks = {
	['mediaPlayerSource']: {
		type: 'boolean'
		options: {
			mediaplayer: number
		} & MediaPoolSourceOptions
	}
}

export function createMediaPlayerFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemMediaPlayerFeedbacks> {
	if (!model.media.players) {
		return {
			['mediaPlayerSource']: undefined,
		}
	}
	return {
		['mediaPlayerSource']: {
			type: 'boolean',
			name: 'Media player: Source',
			options: convertOptionsFields({
				mediaplayer: AtemMediaPlayerPicker(model),

				...AtemMediaPlayerSourcePickers(model, state.state),
			}),
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xffff00,
			},
			callback: ({ options }): boolean => {
				const defaultClips = model.media.clips > 0 && options.defaultClip

				const source = parseMediaPoolSource(model, options.source, defaultClips)
				if (!source) return false

				const player = state.state.media.players[options.mediaplayer]
				if (
					player?.sourceType === Enums.MediaSourceType.Still &&
					!source.isClip &&
					player?.stillIndex === source.slot
				) {
					return true
				} else if (
					player?.sourceType === Enums.MediaSourceType.Clip &&
					source.isClip &&
					player?.clipIndex === source.slot
				) {
					return true
				} else {
					return false
				}
			},
			learn: ({ options }) => {
				const player = state.state.media.players[options.mediaplayer]

				if (player) {
					return {
						source: player.sourceType ? `still${player.stillIndex + 1}` : `clip${player.clipIndex + 1}`,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
