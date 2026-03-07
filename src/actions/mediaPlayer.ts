import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../options/common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import { getMediaPlayer } from 'atem-connection/dist/state/util.js'
import { AtemMediaPlayerPicker } from '../input.js'
import type { StateWrapper } from '../state.js'
import { AtemMediaPlayerSourcePickers, MediaPoolSourceOptions, parseMediaPoolSource } from '../options/mediaPool.js'

export type AtemMediaPlayerActions = {
	[ActionId.MediaPlayerSource]: {
		options: {
			mediaplayer: number
		} & MediaPoolSourceOptions
	}
	[ActionId.MediaPlayerCycle]: {
		options: {
			mediaplayer: number
			direction: 'next' | 'previous'
		}
	}
	[ActionId.MediaCaptureStill]: {
		options: Record<string, never>
	}
	[ActionId.MediaDeleteStill]: {
		options: {
			slot: number
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
				...AtemMediaPlayerSourcePickers(model, state.state),
			}),
			callback: async ({ options }) => {
				const defaultClips = model.media.clips > 0 && options.defaultClip

				const source = parseMediaPoolSource(model, options.source, defaultClips)
				if (!source) return

				await atem?.setMediaPlayerSource(
					{
						sourceType: source.isClip ? Enums.MediaSourceType.Clip : Enums.MediaSourceType.Still,
						clipIndex: source.slot - 1,
					},
					options.mediaplayer - 1,
				)
			},
			learn: ({ options }) => {
				const player = state.state.media.players[options.mediaplayer - 1]

				if (player) {
					return {
						source: player.sourceType ? `still${player.stillIndex + 1}` : `clip${player.clipIndex + 1}`,
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
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				const playerId = options.mediaplayer - 1
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
					type: 'number',
					label: 'Slot',
					default: 1,
					min: 1,
					max: 99,
					asInteger: true,
					clampValues: false,
				},
			}),
			callback: async ({ options }) => {
				await atem?.clearMediaPoolStill(options.slot - 1)
			},
		},
	}
}
