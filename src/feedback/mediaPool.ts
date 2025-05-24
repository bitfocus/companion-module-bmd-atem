import { AtemMediaPlayerSourcePicker } from '../input.js'
import type { ModelSpec } from '../models/index.js'
import type { MyFeedbackDefinitions } from './types.js'
import { FeedbackId } from './FeedbackId.js'
import type { StateWrapper } from '../state.js'
import type { MediaPoolPreviewOptions, SourceDefinition } from '../mediaPoolPreviews.js'
import type { CompanionAdvancedFeedbackResult } from '@companion-module/base/dist/index.js'
import { MEDIA_PLAYER_SOURCE_CLIP_OFFSET } from '../util.js'

export interface AtemMediaPoolFeedbacks {
	[FeedbackId.MediaPoolPreview]: {
		// TODO - clip vs still?
		source: number

		position: 'top' | 'center' | 'bottom'
		crop: 'none' | 'left' | 'center' | 'right'
	}
}

export function createMediaPoolFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
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
				source: AtemMediaPlayerSourcePicker(model, state.state, false),

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
					isVisible: (options) => options['crop'] === 'none',
				},
			},
			callback: async ({ options, image }) => {
				const source = parseSource(options.getPlainNumber('source'))

				if (!image) return {}

				const previewOptions: MediaPoolPreviewOptions = {
					crop: options.getPlainString('crop'),
					position: options.getPlainString('position'),

					buttonHeight: image.height,
					buttonWidth: image.width,
				}

				return executePreviewFeedback(state, previewOptions, source)
			},
			subscribe: ({ id, options }) => {
				const source = parseSource(options.getPlainNumber('source'))
				state.mediaPoolCache.subscribe(source, id)
			},
			unsubscribe: ({ id, options }) => {
				const source = parseSource(options.getPlainNumber('source'))
				state.mediaPoolCache.unsubscribe(source, id)
			},
		},
	}
}

async function executePreviewFeedback(
	state: StateWrapper,
	previewOptions: MediaPoolPreviewOptions,
	source: SourceDefinition,
): Promise<CompanionAdvancedFeedbackResult> {
	const imageBuffer = await state.mediaPoolCache.getPreviewImage(source, previewOptions)
	if (imageBuffer) {
		return imageBuffer
	}

	// make sure the load was triggered
	state.mediaPoolCache.ensureLoaded(source)

	const isSlotOccupied = state.mediaPoolCache.isSlotOccupied(source)
	if (!isSlotOccupied) {
		return {
			text: 'Empty',
			size: 'auto',
			bgcolor: 0,
			color: 0xffffff,
		}
	}

	return {
		text: 'Loading...',
		size: 'auto',
		bgcolor: 0,
		color: 0xffffff,
	}
}

function parseSource(source: number): SourceDefinition {
	const isClip = source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET
	const slot = isClip ? source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET : source

	return { slot, isClip, frameIndex: 0 }
}
