import { AtemMediaPlayerPicker, AtemMediaPlayerSourcePicker } from '../input.js'
import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './FeedbackId.js'
import type { StateWrapper } from '../state.js'

export interface AtemMediaPoolFeedbacks {
	[FeedbackId.MediaPoolPreview]: {
		mediaplayer: number
		// TODO - clip vs still?
		source: number
	}
}

export function createMediaPoolFeedbacks(
	model: ModelSpec,
	state: StateWrapper
): MyFeedbackDefinitions<AtemMediaPoolFeedbacks> {
	if (!model.media.players) {
		return {
			[FeedbackId.MediaPoolPreview]: undefined,
		}
	}
	return {
		[FeedbackId.MediaPoolPreview]: {
			type: 'advanced',
			name: 'Media pool: Preview image',
			description: 'Preview of the specified media pool slot',
			options: {
				mediaplayer: AtemMediaPlayerPicker(model),
				source: AtemMediaPlayerSourcePicker(model, state.state),
			},
			callback: ({ id, options }) => {
				console.log('check feedback', id, options.getJson())
				// TODO
				return {
					text: 'Loading...',
					size: 'auto',
					bgcolor: 0,
					fgcolor: 0xffffff,
				}
			},
			subscribe: ({ id, options }) => {
				state.mediaPoolCache.subscribe(options.getPlainNumber('source'), id, {
					// TODO - options
					crop: 'none',
					position: 'center',
				})
			},
			unsubscribe: ({ id, options }) => {
				state.mediaPoolCache.unsubscribe(options.getPlainNumber('source'), id)
			},
		},
	}
}
