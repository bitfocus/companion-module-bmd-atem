import { convertOptionsFields } from '../common.js'
import { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { FeedbackId } from './FeedbackId.js'
import type { StateWrapper } from '../state.js'
import type { MediaPoolPreviewOptions, SourceDefinition } from '../mediaPoolPreviews.js'
import type { CompanionAdvancedFeedbackResult, CompanionInputFieldDropdown } from '@companion-module/base'
import { AtemMediaPlayerSourcePickers, MediaPoolSourceOptions, parseMediaPoolSource } from '../options/mediaPool.js'
import { isEqual } from 'lodash-es'

export type AtemMediaPoolFeedbacks = {
	[FeedbackId.MediaPoolPreview]: {
		type: 'advanced'
		options: MediaPoolSourceOptions & {
			position: 'top' | 'center' | 'bottom'
			crop: 'none' | 'left' | 'center' | 'right'
		}
	}
}

const cropAndPositionOptions = {
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
		disableAutoExpression: true,
	} satisfies CompanionInputFieldDropdown<'crop'>,
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
		isVisibleExpression: `$(options:crop) === 'none'`,
		disableAutoExpression: true,
	} satisfies CompanionInputFieldDropdown<'position'>,
}

export function createMediaPoolFeedbacks(
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemMediaPoolFeedbacks> {
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
			options: convertOptionsFields({
				...AtemMediaPlayerSourcePickers(model, state.state),

				...cropAndPositionOptions,
			}),
			callback: async ({ id, options, previousOptions, image }) => {
				const defaultClips = model.media.clips > 0 && options.defaultClip

				const source = parseMediaPoolSource(model, options.source, defaultClips)
				const previousSource = previousOptions
					? parseMediaPoolSource(model, previousOptions.source, defaultClips)
					: null

				if (!previousOptions || !isEqual(source, previousSource)) {
					state.mediaPoolCache.unsubscribe(id)

					if (source) state.mediaPoolCache.subscribe(source, id)
				}

				if (!image || !source) return {}

				const previewOptions: MediaPoolPreviewOptions = {
					crop: options.crop,
					position: options.position,

					buttonHeight: image.height,
					buttonWidth: image.width,
				}

				return executePreviewFeedback(state, previewOptions, source)
			},
			unsubscribe: ({ id }) => {
				state.mediaPoolCache.unsubscribe(id)
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
		return {}
	}

	return {
		text: 'Loading...',
		size: 'auto',
		bgcolor: 0,
		color: 0xffffff,
	}
}
