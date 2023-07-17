import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import { getMediaPlayer } from 'atem-connection/dist/state/util.js'
import { AtemMediaPlayerPicker, AtemMediaPlayerSourcePicker } from '../input.js'
import { MEDIA_PLAYER_SOURCE_CLIP_OFFSET } from '../util.js'
import type { StateWrapper } from '../state.js'

export interface AtemMediaPlayerActions {
	[ActionId.MediaPlayerSource]: {
		mediaplayer: number
		source: number
	}
	[ActionId.MediaPlayerCycle]: {
		mediaplayer: number
		direction: 'next' | 'previous'
	}
	[ActionId.MediaCaptureStill]: Record<string, never>
}

export function createMediaPlayerActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemMediaPlayerActions> {
	if (!model.media.players) {
		return {
			[ActionId.MediaPlayerSource]: undefined,
			[ActionId.MediaPlayerCycle]: undefined,
			[ActionId.MediaCaptureStill]: undefined,
		}
	}
	return {
		[ActionId.MediaPlayerSource]: {
			name: 'Media player: Set source',
			options: {
				mediaplayer: AtemMediaPlayerPicker(model),
				source: AtemMediaPlayerSourcePicker(model, state.state),
			},
			callback: async ({ options }) => {
				const source = options.getPlainNumber('source')
				if (source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
					await atem?.setMediaPlayerSource(
						{
							sourceType: Enums.MediaSourceType.Clip,
							clipIndex: source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
						},
						options.getPlainNumber('mediaplayer'),
					)
				} else {
					await atem?.setMediaPlayerSource(
						{
							sourceType: Enums.MediaSourceType.Still,
							stillIndex: source,
						},
						options.getPlainNumber('mediaplayer'),
					)
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
		[ActionId.MediaPlayerCycle]: {
			name: 'Media player: Cycle source',
			options: {
				mediaplayer: AtemMediaPlayerPicker(model),
				direction: {
					type: 'dropdown',
					id: 'direction',
					label: 'Direction',
					default: 'next',
					choices: [
						{
							id: 'next',
							label: 'Next',
						},
						{
							id: 'previous',
							label: 'Previous',
						},
					],
				},
				// AtemMediaPlayerSourcePicker(model, state)
			},
			callback: async ({ options }) => {
				const playerId = options.getPlainNumber('mediaplayer')
				const direction = options.getPlainString('direction')
				const offset = direction === 'next' ? 1 : -1

				const player = getMediaPlayer(state.state, playerId)
				if (player?.sourceType == Enums.MediaSourceType.Still) {
					const maxIndex = state.state.media.stillPool.length
					let nextIndex = player.stillIndex + offset
					if (nextIndex >= maxIndex) nextIndex = 0
					if (nextIndex < 0) nextIndex = maxIndex - 1

					await atem?.setMediaPlayerSource(
						{
							sourceType: Enums.MediaSourceType.Still,
							stillIndex: nextIndex,
						},
						playerId,
					)
				}
			},
		},
		[ActionId.MediaCaptureStill]: {
			name: 'Media player: Capture still',
			options: {},
			callback: async () => {
				await atem?.captureMediaPoolStill()
			},
		},
	}
}
