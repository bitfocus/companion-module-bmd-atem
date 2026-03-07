import { Enums } from 'atem-connection'
import { convertOptionsFields } from '../options/common.js'
import { AtemMediaPlayerPicker } from '../input.js'
import type { ModelSpec } from '../models/index.js'
import { FeedbackId } from './FeedbackId.js'
import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import type { StateWrapper } from '../state.js'
import { AtemMediaPlayerSourcePickers, MediaPoolSourceOptions, parseMediaPoolSource } from '../options/mediaPool.js'

export type AtemMediaPlayerFeedbacks = {
	[FeedbackId.MediaPlayerSource]: {
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
			[FeedbackId.MediaPlayerSource]: undefined,
		}
	}
	return {
		[FeedbackId.MediaPlayerSource]: {
			type: 'boolean',
			name: 'Media player: Source',
			description: 'If the specified media player has the specified source, change style of the bank',
			options: convertOptionsFields({
				mediaplayer: AtemMediaPlayerPicker(model),

				...AtemMediaPlayerSourcePickers(model, state.state),
			}),
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
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
