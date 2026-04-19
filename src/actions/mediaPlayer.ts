import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { getMediaPlayer } from 'atem-connection/dist/state/util.js'
import { AtemMediaPlayerPicker } from '../options/mediaPlayer.js'
import type { StateWrapper } from '../state.js'
import {
	AtemMediaPlayerSourcePickers,
	type MediaPoolSourceOptions,
	parseMediaPoolSource,
} from '../options/mediaPool.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle, resolveTrueFalseToggle } from '../options/common.js'

export type AtemMediaPlayerActions = {
	['mediaPlayerSource']: {
		options: {
			mediaplayer: number
		} & MediaPoolSourceOptions
	}
	['mediaPlayerCycle']: {
		options: {
			mediaplayer: number
			direction: 'next' | 'previous'
		}
	}
	['mediaCaptureStill']: {
		options: Record<string, never>
	}
	['mediaDeleteStill']: {
		options: {
			source: number
			defaultClip: boolean // unused
		}
	}
	['mediaPlayerLoop']: {
		options: {
			mediaplayer: number
			loop: TrueFalseToggle
		}
	}
	['mediaPlayerPlaying']: {
		options: {
			mediaplayer: number
			playing: TrueFalseToggle
		}
	}
	['mediaPlayerAtBeginning']: {
		options: {
			mediaplayer: number
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
			['mediaPlayerSource']: undefined,
			['mediaPlayerCycle']: undefined,
			['mediaCaptureStill']: undefined,
			['mediaDeleteStill']: undefined,
			['mediaPlayerLoop']: undefined,
			['mediaPlayerPlaying']: undefined,
			['mediaPlayerAtBeginning']: undefined,
		}
	}
	return {
		['mediaPlayerSource']: {
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
						clipIndex: source.slot,
						stillIndex: source.slot,
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
		['mediaPlayerCycle']: {
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
		['mediaCaptureStill']: {
			name: 'Media player: Capture still',
			options: convertOptionsFields({}),
			callback: async () => {
				await atem?.captureMediaPoolStill()
			},
		},
		['mediaDeleteStill']: {
			name: 'Media player: Delete still',
			options: convertOptionsFields({
				...AtemMediaPlayerSourcePickers(model, state.state, false),
			}),
			callback: async ({ options }) => {
				const source = parseMediaPoolSource(model, options.source, false)
				if (!source) return

				if (source.isClip) return // Unsupported by this action for now

				await atem?.clearMediaPoolStill(source.slot)
			},
		},
		['mediaPlayerLoop']: {
			name: 'Media player: Set loop',
			options: convertOptionsFields({
				mediaplayer: AtemMediaPlayerPicker(model),
				loop: {
					id: 'loop',
					type: 'dropdown',
					label: 'Loop',
					default: 'true',
					choices: CHOICES_ON_OFF_TOGGLE,
					disableAutoExpression: true,
				},
			}),
			callback: async ({ options }) => {
				const playerId = options.mediaplayer - 1
				const player = getMediaPlayer(state.state, playerId)
				const newVal = resolveTrueFalseToggle(options.loop, player?.loop)
				await atem?.setMediaPlayerSettings({ loop: newVal }, playerId)
			},
			learn: ({ options }) => {
				const player = getMediaPlayer(state.state, options.mediaplayer - 1)
				if (player) {
					return { loop: player.loop ? 'true' : 'false' }
				} else {
					return undefined
				}
			},
		},
		['mediaPlayerPlaying']: {
			name: 'Media player: Set playing',
			options: convertOptionsFields({
				mediaplayer: AtemMediaPlayerPicker(model),
				playing: {
					id: 'playing',
					type: 'dropdown',
					label: 'Playing',
					default: 'true',
					choices: [
						{ id: 'true', label: 'Play' },
						{ id: 'false', label: 'Stop' },
						{ id: 'toggle', label: 'Toggle' },
					],
					disableAutoExpression: true,
				},
			}),
			callback: async ({ options }) => {
				const playerId = options.mediaplayer - 1
				const player = getMediaPlayer(state.state, playerId)
				const newVal = resolveTrueFalseToggle(options.playing, player?.playing)
				await atem?.setMediaPlayerSettings({ playing: newVal }, playerId)
			},
			learn: ({ options }) => {
				const player = getMediaPlayer(state.state, options.mediaplayer - 1)
				if (player) {
					return { playing: player.playing ? 'true' : 'false' }
				} else {
					return undefined
				}
			},
		},
		['mediaPlayerAtBeginning']: {
			name: 'Media player: Jump to beginning',
			options: convertOptionsFields({
				mediaplayer: AtemMediaPlayerPicker(model),
			}),
			callback: async ({ options }) => {
				const playerId = options.mediaplayer - 1
				await atem?.setMediaPlayerSettings({ atBeginning: true }, playerId)
			},
		},
	}
}
