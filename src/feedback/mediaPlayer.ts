import { Enums } from 'atem-connection'
import { AtemMediaPlayerPicker, AtemMediaPlayerSourcePicker } from '../input.js'
import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './FeedbackId.js'
import { combineRgb } from '@companion-module/base'
import { MEDIA_PLAYER_SOURCE_CLIP_OFFSET } from '../util.js'
import type { StateWrapper } from '../state.js'

export interface AtemMediaPlayerFeedbacks {
	[FeedbackId.MediaPlayerSource]: {
		mediaplayer: number
		source: number
	}
	[FeedbackId.MediaPlayerSourceVariables]: {
		mediaplayer: string
		isClip?: boolean
		slot: string
	}
}

export function createMediaPlayerFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): MyFeedbackDefinitions<AtemMediaPlayerFeedbacks> {
	if (!model.media.players) {
		return {
			[FeedbackId.MediaPlayerSource]: undefined,
			[FeedbackId.MediaPlayerSourceVariables]: undefined,
		}
	}
	return {
		[FeedbackId.MediaPlayerSource]: {
			type: 'boolean',
			name: 'Media player: Source',
			description: 'If the specified media player has the specified source, change style of the bank',
			options: {
				mediaplayer: AtemMediaPlayerPicker(model),
				source: AtemMediaPlayerSourcePicker(model, state.state),
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: ({ options }): boolean => {
				const player = state.state.media.players[options.getPlainNumber('mediaplayer')]
				if (
					player?.sourceType === Enums.MediaSourceType.Still &&
					player?.stillIndex === options.getPlainNumber('source')
				) {
					return true
				} else if (
					player?.sourceType === Enums.MediaSourceType.Clip &&
					player?.clipIndex === options.getPlainNumber('source') - MEDIA_PLAYER_SOURCE_CLIP_OFFSET
				) {
					return true
				} else {
					return false
				}
			},
			learn: ({ options }) => {
				const player = state.state.media.players[options.getPlainNumber('mediaplayer')]

				if (player) {
					return {
						...options.getJson(),
						source: player.sourceType ? player.stillIndex : player.clipIndex + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
					}
				} else {
					return undefined
				}
			},
		},
		[FeedbackId.MediaPlayerSourceVariables]: {
			type: 'boolean',
			name: 'Media player: Source from variables',
			description: 'If the specified media player has the specified source, change style of the bank',
			options: {
				mediaplayer: {
					id: 'mediaplayer',
					type: 'textinput',
					label: 'Media Player',
					default: '1',
					useVariables: true,
				},
				isClip:
					model.media.clips > 0
						? {
								type: 'checkbox',
								id: 'isClip',
								label: 'Is clip',
								default: false,
							}
						: undefined,
				slot: {
					id: 'slot',
					type: 'textinput',
					label: 'Slot',
					default: '1',
					useVariables: true,
				},
			},
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: async ({ options }): Promise<boolean> => {
				const [mediaplayer, slot] = await Promise.all([
					options.getParsedNumber('mediaplayer'),
					options.getParsedNumber('slot'),
				])

				const optionIsClip = options.getPlainBoolean('isClip')

				const player = state.state.media.players[mediaplayer - 1]
				if (!optionIsClip && player?.sourceType === Enums.MediaSourceType.Still && player?.stillIndex === slot - 1) {
					return true
				} else if (
					optionIsClip &&
					player?.sourceType === Enums.MediaSourceType.Clip &&
					player?.clipIndex === slot - 1
				) {
					return true
				} else {
					return false
				}
			},
			learn: async ({ options }) => {
				const mediaplayer = await options.getParsedNumber('mediaplayer')
				const player = state.state.media.players[mediaplayer - 1]

				if (player) {
					return {
						...options.getJson(),
						source: player.sourceType ? player.stillIndex : player.clipIndex + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
