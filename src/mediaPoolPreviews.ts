import type { AtemState, MediaState } from 'atem-connection'
import { assertNever, type CompanionAdvancedFeedbackResult } from '@companion-module/base'
import type { ReadonlyDeep } from 'type-fest'
import { ImageTransformer, PixelFormat, type ComputedImage, ResizeMode } from '@julusian/image-rs'

export interface MediaPoolPreviewOptions {
	position: 'top' | 'center' | 'bottom'
	crop: 'none' | 'left' | 'center' | 'right'
	buttonWidth: number
	buttonHeight: number
}
function getPreviewOptionsKey(options: MediaPoolPreviewOptions): string {
	let str = `${options.buttonWidth}-${options.buttonHeight}-${options.crop}`
	if (options.crop !== 'none') str += `-${options.position}`
	return str
}

interface MediaPoolPreviewCacheEntry {
	readonly source: SourceDefinition

	readonly loadedHash: string
	readonly loadedFilename: string

	isLoading: boolean
	isStale: boolean

	rawImage: ComputedImage | undefined
	scaledImages: Map<string, Promise<ComputedImage>>
}

export type PreviewImageResult = Pick<
	CompanionAdvancedFeedbackResult,
	'imageBuffer' | 'imageBufferEncoding' | 'imageBufferPosition'
>

export type FetchStillFrameFunction = (source: SourceDefinition) => Promise<ComputedImage>
interface SubscriptionsEntry {
	readonly source: SourceDefinition

	subs: Set<string>
}

export interface SourceDefinition {
	isClip: boolean
	slot: number
	frameIndex: number // Only used for clips
}

export class MediaPoolPreviewCache {
	readonly #cache = new Map<string, MediaPoolPreviewCacheEntry>()
	readonly #subscriptions = new Map<string, SubscriptionsEntry>()

	readonly #fetchStillFrame: FetchStillFrameFunction
	readonly #invalidateFeedbacks: (feedbacks: string[]) => void
	#latestState: ReadonlyDeep<MediaState.MediaState>

	constructor(
		initialState: AtemState,
		fetchStillFrame: FetchStillFrameFunction,
		invalidateFeedbacks: (feedbacks: string[]) => void,
	) {
		this.#latestState = initialState.media
		this.#fetchStillFrame = fetchStillFrame
		this.#invalidateFeedbacks = invalidateFeedbacks
	}

	public subscribe(source: SourceDefinition, feedbackId: string): void {
		const cacheEntryId = this.#getCacheEntryId(source)

		let entries = this.#subscriptions.get(cacheEntryId)
		if (!entries) {
			entries = {
				source,
				subs: new Set(),
			}
			this.#subscriptions.set(cacheEntryId, entries)
		}
		entries.subs.add(feedbackId)

		this.ensureLoaded(source)
	}

	public unsubscribe(feedbackId: string): void {
		for (const sub of this.#subscriptions.values()) {
			// Remove the feedback from the subscription
			sub.subs.delete(feedbackId)
		}

		// Future - should this do any cleanup?
	}

	public checkUpdatedState(state: AtemState): void {
		this.#latestState = state.media

		// Ensure current subscriptions have up to date images
		for (const subs of this.#subscriptions.values()) {
			if (subs.subs.size > 0) this.ensureLoaded(subs.source, true)
		}

		// Purge any stale entries
		for (const [cacheEntryId, cacheEntry] of this.#cache) {
			// If it has subs, it is needed
			const subCount = this.#subscriptions.get(cacheEntryId)?.subs?.size ?? 0
			if (subCount > 0) continue

			// Purge the cache, if the entry is stale
			if (this.#isCacheEntryStale(cacheEntry)) {
				this.#cache.delete(cacheEntryId)
			}
		}
	}

	public isSlotOccupied(source: SourceDefinition): boolean {
		const frame = this.#getFrameAtemState(source)
		console.log('frame', frame)
		return !!frame?.isUsed
	}

	/**
	 * Ensure the source is loaded, and if not, load it.
	 * This should only be called if it has already been checked that there are subscribers
	 */
	public ensureLoaded(source: SourceDefinition, shouldInvalidateFeedbacksWhenPurging = false): void {
		// Future: should this 'blank' any existing feedbacks while loading?
		const cacheEntryId = this.#getCacheEntryId(source)
		const cacheEntry = this.#cache.get(cacheEntryId)

		const frameState = this.#getFrameAtemState(source)
		if ((!cacheEntry || this.#isCacheEntryStale(cacheEntry)) && frameState?.isUsed) {
			this.#performLoadForCacheEntry(source, cacheEntry, frameState)
		} else if (cacheEntry && this.#isCacheEntryStale(cacheEntry)) {
			// Purge the cache, as the data is stale
			this.#cache.delete(cacheEntryId)

			if (shouldInvalidateFeedbacksWhenPurging) {
				const subs = this.#subscriptions.get(cacheEntryId)
				if (subs && subs.subs.size > 0) {
					// Invalidate the feedbacks that were using this
					this.#invalidateFeedbacks(Array.from(subs.subs))
				}
			}
		}
	}

	public async getPreviewImage(
		source: SourceDefinition,
		options: MediaPoolPreviewOptions,
	): Promise<PreviewImageResult | null> {
		const cacheEntryId = this.#getCacheEntryId(source)

		const cacheEntry = this.#cache.get(cacheEntryId)
		if (!cacheEntry || cacheEntry.isLoading || !cacheEntry.rawImage) return null

		// Oversample the image, to match the oversampling of Companion
		const oversampling = 4

		// Join an existing, or start a new scale operation
		const previewKey = getPreviewOptionsKey(options)
		let existingScaleOp = cacheEntry.scaledImages.get(previewKey)
		if (!existingScaleOp) {
			let transformChain = ImageTransformer.fromBuffer(
				cacheEntry.rawImage.buffer,
				cacheEntry.rawImage.width,
				cacheEntry.rawImage.height,
				PixelFormat.Rgba,
			)

			const cropWidth = (cacheEntry.rawImage.height / options.buttonHeight) * options.buttonWidth
			switch (options.crop) {
				case 'none':
					// Do nothing
					break
				case 'center':
					transformChain = transformChain.cropCenter(cropWidth, cacheEntry.rawImage.height)
					break
				case 'left':
					transformChain = transformChain.crop(0, 0, cropWidth, cacheEntry.rawImage.height)
					break
				case 'right':
					transformChain = transformChain.crop(
						cacheEntry.rawImage.width - cropWidth,
						0,
						cropWidth,
						cacheEntry.rawImage.height,
					)
					break

				default:
					assertNever(options.crop)
					break
			}

			existingScaleOp = transformChain
				.scale(options.buttonWidth * oversampling, options.buttonHeight * oversampling, ResizeMode.Fit)
				.toBuffer(PixelFormat.Rgba)

			cacheEntry.scaledImages.set(previewKey, existingScaleOp)
		}

		// Wait for the scale operation to complete
		const scaledImage = await existingScaleOp

		// const drawWidth = scaledImage.width /// oversampling
		const drawHeight = scaledImage.height / oversampling

		let drawY = Math.floor((options.buttonHeight - drawHeight) / 2)
		if (options.crop === 'none') {
			switch (options.position) {
				case 'top':
					drawY = 0
					break
				case 'bottom':
					drawY = options.buttonHeight - drawHeight
					break
				case 'center':
					// Default behaviour
					break
				default:
					assertNever(options.position)
					break
			}
		}

		// Return the scaled image
		return {
			imageBuffer: scaledImage.buffer,
			imageBufferEncoding: {
				pixelFormat: 'RGBA',
			},
			imageBufferPosition: {
				x: 0,
				y: drawY,
				width: scaledImage.width,
				height: scaledImage.height,
				drawScale: 1 / oversampling,
			},
		}
	}

	#performLoadForCacheEntry(
		source: SourceDefinition,
		cacheEntry: MediaPoolPreviewCacheEntry | undefined,
		frameState: MediaState.StillFrame,
	): void {
		if (cacheEntry && cacheEntry.isLoading) return // Image is already being loaded, need to wait for that to complete

		// Update the cache
		cacheEntry = {
			source,

			loadedHash: frameState.hash,
			loadedFilename: frameState.fileName,

			isLoading: true,
			isStale: false,

			rawImage: undefined,
			scaledImages: new Map(),
		}
		const cacheEntryId = this.#getCacheEntryId(source)
		this.#cache.set(cacheEntryId, cacheEntry)

		// load the image
		this.#fetchStillFrame(source)
			.then(async (image) => {
				console.log('got image', image.buffer.length)

				const currentCacheEntry = this.#cache.get(cacheEntryId)
				if (!currentCacheEntry || currentCacheEntry !== cacheEntry) {
					// Entry has been invalidated
					return
				}

				// Image is loaded!
				currentCacheEntry.rawImage = image
				currentCacheEntry.isLoading = false
			})
			.catch((e) => {
				const currentCacheEntry = this.#cache.get(cacheEntryId)
				if (!currentCacheEntry || currentCacheEntry !== cacheEntry) {
					// Entry has been invalidated
					return
				}

				// Remove the attempt // TODO - should this?
				this.#cache.delete(cacheEntryId)

				console.log('failed image', e)
				// TODO this should do a better failure, and should perform some kind of retry
			})
			.finally(() => {
				// Inform all feedbacks, to update
				const allSubsForImage = this.#subscriptions.get(cacheEntryId)
				if (allSubsForImage && allSubsForImage.subs.size > 0) {
					this.#invalidateFeedbacks(Array.from(allSubsForImage.subs.keys()))
				}
			})
	}

	#getFrameAtemState(source: SourceDefinition): MediaState.StillFrame | undefined {
		if (source.isClip) {
			const clip = this.#latestState.clipPool[source.slot]
			if (!clip || clip.frameCount < 1 || source.frameIndex < 0 || source.frameIndex >= clip.frameCount)
				return undefined

			const frame = clip.frames?.[source.frameIndex]
			if (frame) return frame

			// In case the clip frames are missing in the state, return a fake frame
			return {
				fileName: `${clip.name}-${source.frameIndex}`,
				hash: `fake-${source.frameIndex}`,
				isUsed: true,
			}
		} else {
			return this.#latestState.stillPool[source.slot]
		}
	}

	#isCacheEntryStale(entry: MediaPoolPreviewCacheEntry): boolean {
		if (entry.isStale) return true

		const frame = this.#getFrameAtemState(entry.source)
		return !frame || frame.fileName !== entry.loadedFilename || frame.hash !== entry.loadedHash
	}
	#getCacheEntryId(source: SourceDefinition): string {
		if (source.isClip) {
			return `clip-${source.slot}-${source.frameIndex}`
		} else {
			return `still-${source.slot}`
		}
	}
}
