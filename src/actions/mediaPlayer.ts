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
	[ActionId.MediaPlayerSourceVariables]: {
		mediaplayer: string
		isClip?: boolean
		slot: string
	}
	[ActionId.MediaPlayerCycle]: {
		mediaplayer: number
		direction: 'next' | 'previous'
	}
	[ActionId.MediaCaptureStill]: Record<string, never>
	[ActionId.MediaDeleteStill]: {
		slot: string
	}
}

export function createMediaPlayerActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemMediaPlayerActions> {
	if (!model.media.players) {
		return {
			[ActionId.MediaPlayerSource]: undefined,
			[ActionId.MediaPlayerSourceVariables]: undefined,
			[ActionId.MediaPlayerCycle]: undefined,
			[ActionId.MediaCaptureStill]: undefined,
			[ActionId.MediaDeleteStill]: undefined,
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
		[ActionId.MediaPlayerSourceVariables]: {
			name: 'Media player: Set source from variables',
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
			callback: async ({ options }) => {
				const [mediaplayer, slot] = await Promise.all([
					options.getParsedNumber('mediaplayer'),
					options.getParsedNumber('slot'),
				])

				if (model.media.clips > 0 && options.getPlainBoolean('isClip')) {
					await atem?.setMediaPlayerSource(
						{
							sourceType: Enums.MediaSourceType.Clip,
							clipIndex: slot - 1,
						},
						mediaplayer - 1,
					)
				} else {
					await atem?.setMediaPlayerSource(
						{
							sourceType: Enums.MediaSourceType.Still,
							stillIndex: slot - 1,
						},
						mediaplayer - 1,
					)
				}
			},
			learn: async ({ options }) => {
				const mediaplayer = await options.getParsedNumber('mediaplayer')
				const player = state.state.media.players[mediaplayer - 1]

				if (player) {
					const isClip = player.sourceType === Enums.MediaSourceType.Clip
					return {
						...options.getJson(),
						isClip,
						source: isClip ? player.clipIndex : player.stillIndex,
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
		[ActionId.MediaDeleteStill]: {
			name: 'Media player: Delete still',
			options: {
				slot: {
					id: 'slot',
					type: 'textinput',
					label: 'Slot',
					default: '1',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const slot = await options.getParsedNumber('slot')

				await atem?.clearMediaPoolStill(slot - 1)
			},
		},
	}
}
