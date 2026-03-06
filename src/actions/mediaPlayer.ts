import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import { getMediaPlayer } from 'atem-connection/dist/state/util.js'
import { AtemMediaPlayerPicker, AtemMediaPlayerSourcePicker } from '../input.js'
import { MEDIA_PLAYER_SOURCE_CLIP_OFFSET } from '../util.js'
import type { StateWrapper } from '../state.js'

export type AtemMediaPlayerActions = {
	[ActionId.MediaPlayerSource]: {
		options: {
			mediaplayer: number
			source: number
		}
	}
	[ActionId.MediaPlayerSourceVariables]: {
		options: {
			mediaplayer: string
			isClip?: boolean
			slot: string
		}
	}
	[ActionId.MediaPlayerCycle]: {
		options: {
			mediaplayer: number
			direction: 'next' | 'previous'
		}
	}
	[ActionId.MediaCaptureStill]: { options: Record<string, never> }
	[ActionId.MediaDeleteStill]: {
		options: {
			slot: string
		}
	}
}

export function createMediaPlayerActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemMediaPlayerActions> {
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
			options: convertOptionsFields({
				mediaplayer: AtemMediaPlayerPicker(model),
				source: AtemMediaPlayerSourcePicker(model, state.state),
			}),
			callback: async ({ options }) => {
				const source = options.source
				if (source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
					await atem?.setMediaPlayerSource(
						{
							sourceType: Enums.MediaSourceType.Clip,
							clipIndex: source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
						},
						options.mediaplayer,
					)
				} else {
					await atem?.setMediaPlayerSource(
						{
							sourceType: Enums.MediaSourceType.Still,
							stillIndex: source,
						},
						options.mediaplayer,
					)
				}
			},
			learn: ({ options }) => {
				const player = state.state.media.players[options.mediaplayer]

				if (player) {
					return {
						source: player.sourceType ? player.stillIndex : player.clipIndex + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.MediaPlayerSourceVariables]: {
			name: 'Media player: Set source from variables',
			options: convertOptionsFields({
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
					label: 'Slot number or item name',
					default: '1',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				const { mediaplayer, slot } = options

				if (model.media.clips > 0 && options.isClip) {
					let index = Number(slot) - 1
					if (isNaN(index)) index = state.state.media.clipPool.findIndex((clip) => clip?.name == slot)
					if (index == -1) {
						console.warn(`Media player: Clip "${slot}" not found`)
						return
					}

					await atem?.setMediaPlayerSource(
						{
							sourceType: Enums.MediaSourceType.Clip,
							clipIndex: index,
						},
						mediaplayer - 1,
					)
				} else {
					let index = Number(slot) - 1
					if (isNaN(index)) index = state.state.media.stillPool.findIndex((clip) => clip?.fileName == slot)
					if (index == -1) {
						console.warn(`Media player: Still "${slot}" not found`)
						return
					}

					await atem?.setMediaPlayerSource(
						{
							sourceType: Enums.MediaSourceType.Still,
							stillIndex: index,
						},
						mediaplayer - 1,
					)
				}
			},
			learn: async ({ options }) => {
				const mediaplayer = await options.mediaplayer
				const player = state.state.media.players[mediaplayer - 1]

				if (player) {
					const isClip = player.sourceType === Enums.MediaSourceType.Clip
					return {
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
			options: convertOptionsFields({
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
			}),
			callback: async ({ options }) => {
				const playerId = options.mediaplayer
				const direction = options.direction
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
			options: convertOptionsFields({}),
			callback: async () => {
				await atem?.captureMediaPoolStill()
			},
		},
		[ActionId.MediaDeleteStill]: {
			name: 'Media player: Delete still',
			options: convertOptionsFields({
				slot: {
					id: 'slot',
					type: 'textinput',
					label: 'Slot',
					default: '1',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				const slot = await options.slot

				await atem?.clearMediaPoolStill(slot - 1)
			},
		},
	}
}
