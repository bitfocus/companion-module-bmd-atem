import { combineRgb, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from './types.js'
import type { ActionTypes } from '../actions/index.js'
import type { FeedbackTypes } from '../feedback/index.js'
import type { ModelSpec } from '../models/types.js'
import { MEDIA_PLAYER_SOURCE_CLIP_OFFSET } from '../util.js'

export function createMediaPlayerPresets(
	model: ModelSpec,
	pstSize: CompanionButtonStyleProps['size']
): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	const result: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] = []

	for (let player = 0; player < model.media.players; player++) {
		const category: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
			name: `Mediaplayer ${player + 1}`,
			presets: {},
		}

		for (let clip = 0; clip < model.media.clips; clip++) {
			category.presets[`mediaplayer_clip_${player}_${clip}`] = {
				name: `Set Mediaplayer ${player + 1} source to clip ${clip + 1}`,
				type: 'button',
				style: {
					text: `MP ${player + 1} Clip ${clip + 1}`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.MediaPlayerSource,
						options: {
							mediaplayer: player,
							source: clip + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
						},
						style: {
							bgcolor: combineRgb(255, 255, 0),
							color: combineRgb(0, 0, 0),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: ActionId.MediaPlayerSource,
								options: {
									mediaplayer: player,
									source: clip + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
								},
							},
						],
						up: [],
					},
				],
			}
		}

		for (let still = 0; still < model.media.stills; still++) {
			category.presets[`mediaplayer_still_${player}_${still}`] = {
				name: `Set Mediaplayer ${player + 1} source to still ${still + 1}`,
				type: 'button',
				style: {
					text: `MP ${player + 1} Still ${still + 1}`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.MediaPlayerSource,
						options: {
							mediaplayer: player,
							source: still,
						},
						style: {
							bgcolor: combineRgb(255, 255, 0),
							color: combineRgb(0, 0, 0),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: ActionId.MediaPlayerSource,
								options: {
									mediaplayer: player,
									source: still,
								},
							},
						],
						up: [],
					},
				],
			}
		}

		result.push(category)
	}

	return result
}
