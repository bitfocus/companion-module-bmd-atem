import { AtemMediaPlayerPicker, AtemMediaPlayerSourcePicker } from '../input.js'
import type { ModelSpec } from '../models/index.js'
import type { MyAdvancedFeedbackEvent, MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './FeedbackId.js'
import type { MediaPoolPreviewOptions, StateWrapper } from '../state.js'
import type { MyOptionsHelper } from '../common.js'

export interface AtemMediaPoolFeedbacks {
	[FeedbackId.MediaPoolPreview]: {
		mediaplayer: number
		// TODO - clip vs still?
		source: number

		position: 'top' | 'center' | 'bottom'
		crop: 'none' | 'left' | 'center' | 'right'
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

				crop: {
					id: 'crop',
					type: 'dropdown',
					label: 'Crop',
					default: 'none',
					choices: [
						{ id: 'none', label: 'None' },
						{ id: 'left', label: 'Left' },
						{ id: 'center', label: 'Center' },
						{ id: 'right', label: 'Right' },
					],
				},
				position: {
					id: 'position',
					type: 'dropdown',
					label: 'Position',
					default: 'center',
					choices: [
						{ id: 'top', label: 'Top' },
						{ id: 'center', label: 'Center' },
						{ id: 'bottom', label: 'Bottom' },
					],
					isVisible: (options) => options['crop'] !== 'none',
				},
			},
			callback: async ({ id, options, image }) => {
				console.log('check feedback', id, options.getJson())

				const previewOptions = parsePreviewOptions(options, image)
				if (!previewOptions) return {}

				const imageBuffer = await state.mediaPoolCache.getPreviewImage(options.getPlainNumber('source'), previewOptions)
				if (imageBuffer) {
					return imageBuffer
				}

				// TODO
				return {
					text: 'Loading...',
					size: 'auto',
					bgcolor: 0,
					fgcolor: 0xffffff,
				}
			},
			subscribe: ({ id, options }) => {
				// const previewOptions = parsePreviewOptions(options)
				// if (!previewOptions) return

				state.mediaPoolCache.subscribe(options.getPlainNumber('source'), id)
			},
			unsubscribe: ({ id, options }) => {
				state.mediaPoolCache.unsubscribe(options.getPlainNumber('source'), id)
			},
		},
	}
}

function parsePreviewOptions(
	options: MyOptionsHelper<AtemMediaPoolFeedbacks['mediaPoolPreview']>,
	imageProps: MyAdvancedFeedbackEvent<unknown>['image']
): MediaPoolPreviewOptions | null {
	if (!imageProps) return null

	return {
		crop: options.getPlainString('crop'),
		position: options.getPlainString('position'),

		buttonHeight: imageProps.height,
		buttonWidth: imageProps.width,
	}
}
