import type {
	AtemState,
	Commands,
	SettingsState,
	VideoState,
	MediaState,
	Fairlight,
	ClassicAudio,
} from 'atem-connection'
import type { SuperSource, TransitionProperties } from 'atem-connection/dist/state/video/index.js'
import { assertNever, type CompanionImageBufferPosition, type InputValue } from '@companion-module/base'
import type { AtemCameraControlStateBuilder } from '@atem-connection/camera-control'
import type { ReadonlyDeep } from 'type-fest'
import { MEDIA_PLAYER_SOURCE_CLIP_OFFSET } from './util.js'
import { ImageTransformer, PixelFormat, type ComputedImage, ResizeMode } from '@julusian/image-rs'

export type TallyBySource = Commands.TallyBySourceCommand['properties']

export interface StateWrapper {
	state: AtemState
	tally: TallyBySource
	tallyCache: TallyCache

	readonly atemCameraState: AtemCameraControlStateBuilder

	// readonly mediaPoolSubscriptions: MediaPoolPreviewSubscriptions
	readonly mediaPoolCache: MediaPoolPreviewCache
}

export type TallyCache = Map<
	number, // InputId of the mix/output
	{
		lastVisibleInputs: number[]
		referencedFeedbackIds: Set<string>
	}
>

export function getMixEffect(state: AtemState, meIndex: InputValue | undefined): VideoState.MixEffect | undefined {
	return state.video.mixEffects[Number(meIndex)]
}
export function getTransitionProperties(
	state: AtemState,
	meIndex: InputValue | undefined
): TransitionProperties | undefined {
	const me = getMixEffect(state, meIndex)
	return me ? me.transitionProperties : undefined
}
export function getUSK(
	state: AtemState,
	meIndex: InputValue | undefined,
	keyIndex: InputValue | undefined
): VideoState.USK.UpstreamKeyer | undefined {
	const me = getMixEffect(state, meIndex)
	return me ? me.upstreamKeyers[Number(keyIndex)] : undefined
}
export function getDSK(state: AtemState, keyIndex: InputValue | undefined): VideoState.DSK.DownstreamKeyer | undefined {
	return state.video.downstreamKeyers[Number(keyIndex)]
}
export function getSuperSourceBox(
	state: AtemState,
	boxIndex: InputValue | undefined,
	ssrcId?: InputValue | undefined
): SuperSource.SuperSourceBox | undefined {
	const ssrc = state.video.superSources[Number(ssrcId ?? 0)]
	return ssrc ? ssrc.boxes[Number(boxIndex)] : undefined
}
export function getMultiviewer(state: AtemState, index: InputValue | undefined): SettingsState.MultiViewer | undefined {
	return state.settings.multiViewers[Number(index)]
}
export function getMultiviewerWindow(
	state: AtemState,
	mvIndex: InputValue | undefined,
	windowIndex: InputValue | undefined
): SettingsState.MultiViewerWindowState | undefined {
	const mv = getMultiviewer(state, mvIndex)
	return mv ? mv.windows[Number(windowIndex)] : undefined
}
export function getMediaPlayer(state: AtemState, index: number): MediaState.MediaPlayerState | undefined {
	return state.media.players[index]
}

export function getFairlightAudioInput(state: AtemState, index: number): Fairlight.FairlightAudioInput | undefined {
	return state.fairlight?.inputs[index]
}

export function getClassicAudioInput(state: AtemState, index: number): ClassicAudio.ClassicAudioChannel | undefined {
	return state.audio?.channels[index]
}

export function getFairlightAudioMasterChannel(state: AtemState): Fairlight.FairlightAudioMasterChannel | undefined {
	return state.fairlight?.master
}

export function getFairlightAudioMonitorChannel(state: AtemState): Fairlight.FairlightAudioMonitorChannel | undefined {
	return state.fairlight?.monitor
}

export interface MediaPoolPreviewOptions {
	position: 'top' | 'center' | 'bottom'
	crop: 'none' | 'left' | 'center' | 'right'
	// TODO - more properties?

	buttonWidth: number
	buttonHeight: number
}

function getPreviewOptionsKey(options: MediaPoolPreviewOptions): string {
	let str = `${options.buttonWidth}-${options.buttonHeight}-${options.crop}`
	if (options.crop !== 'none') str += `-${options.position}`
	return str
}
// export class MediaPoolPreviewSubscriptions {
// 	private readonly data: Map<number, Map<string, MediaPoolPreviewOptions>>

// 	constructor() {
// 		this.data = new Map()
// 	}

// 	// public getFeedbacks(path: string): FeedbackId[] {
// 	// 	const entries = this.data.get(path)
// 	// 	if (entries) {
// 	// 		return Array.from(new Set(entries.values()))
// 	// 	} else {
// 	// 		return []
// 	// 	}
// 	// }
// 	public subscribe(source: number, feedbackId: string, options: MediaPoolPreviewOptions): void {
// 		let entries = this.data.get(source)
// 		if (!entries) {
// 			entries = new Map()
// 			this.data.set(source, entries)
// 		}
// 		entries.set(feedbackId, options)
// 	}

// 	public unsubscribe(source: number, feedbackId: string): void {
// 		// TODO - can this drop the source parameter?
// 		const entries = this.data.get(source)
// 		if (entries) {
// 			entries.delete(feedbackId)
// 		}
// 	}
// }

interface MediaPoolPreviewCacheEntry {
	readonly isClip: boolean
	readonly slot: number

	readonly loadedHash: string
	readonly loadedFilename: string

	isLoading: boolean
	isStale: boolean

	rawImage: ComputedImage | undefined
	scaledImages: Map<string, Promise<ComputedImage>>
}

export interface PreviewImageResult {
	imageBuffer: Uint8Array
	imageBufferPosition: CompanionImageBufferPosition
}

export type FetchStillFrameFunction = (isClip: boolean, slot: number) => Promise<ComputedImage>

interface SubscriptionsEntry {
	readonly isClip: boolean
	readonly slot: number

	subs: Set<string>
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
		invalidateFeedbacks: (feedbacks: string[]) => void
	) {
		this.#latestState = initialState.media
		this.#fetchStillFrame = fetchStillFrame
		this.#invalidateFeedbacks = invalidateFeedbacks
	}

	public subscribe(source: number, feedbackId: string): void {
		const [slot, isClip] = this.#parseSource(source)
		const cacheEntryId = this.#getCacheEntryId(isClip, slot)

		let entries = this.#subscriptions.get(cacheEntryId)
		if (!entries) {
			entries = {
				isClip,
				slot,
				subs: new Set(),
			}
			this.#subscriptions.set(cacheEntryId, entries)
		}
		entries.subs.add(feedbackId)

		this.ensureLoaded2(isClip, slot)
	}

	public unsubscribe(source: number, feedbackId: string): void {
		const [slot, isClip] = this.#parseSource(source)
		const cacheEntryId = this.#getCacheEntryId(isClip, slot)

		// TODO - can this drop the source parameter?
		const entries = this.#subscriptions.get(cacheEntryId)
		if (entries) {
			entries.subs.delete(feedbackId)
		}
	}

	public checkUpdatedState(state: AtemState): void {
		this.#latestState = state.media

		// Ensure current subscriptions have up to date images
		for (const subs of this.#subscriptions.values()) {
			if (subs.subs.size > 0) this.ensureLoaded2(subs.isClip, subs.slot)
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

	// public ensureLoaded(source: number): void {
	// 	const [slot, isClip] = this.#parseSource(source)
	// 	this.ensureLoaded2(isClip, slot)
	// }

	public ensureLoaded2(isClip: boolean, slot: number): void {
		// TODO check if the source is needed

		// TODO: should this 'blank' any existing feedbacks while loading?

		const cacheEntryId = this.#getCacheEntryId(isClip, slot)
		const cacheEntry = this.#cache.get(cacheEntryId)

		const frameState = this.#getFrameAtemState(isClip, slot)
		if ((!cacheEntry || this.#isCacheEntryStale(cacheEntry)) && frameState) {
			this.#performLoadForCacheEntry(isClip, slot, cacheEntry, frameState)
		} else if (cacheEntry && this.#isCacheEntryStale(cacheEntry)) {
			// Purge the cache, as the data is stale
			this.#cache.delete(cacheEntryId)

			// TODO - invalidate any feedbacks using this
		}
	}

	public async getPreviewImage(source: number, options: MediaPoolPreviewOptions): Promise<PreviewImageResult | null> {
		const [slot, isClip] = this.#parseSource(source)
		const cacheEntryId = this.#getCacheEntryId(isClip, slot)

		const cacheEntry = this.#cache.get(cacheEntryId)
		if (!cacheEntry || cacheEntry.isLoading || !cacheEntry.rawImage) return null

		// Join an existing, or start a new scale operation
		const previewKey = getPreviewOptionsKey(options)
		let existingScaleOp = cacheEntry.scaledImages.get(previewKey)
		if (!existingScaleOp) {
			let transformChain = ImageTransformer.fromBuffer(
				cacheEntry.rawImage.buffer,
				cacheEntry.rawImage.width,
				cacheEntry.rawImage.height,
				PixelFormat.Rgba
			)

			const cropWidth = (cacheEntry.rawImage.height / options.buttonHeight) * options.buttonWidth
			console.log('crop', cropWidth, cacheEntry.rawImage.width, cacheEntry.rawImage.height)
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
						cacheEntry.rawImage.height
					)
					break

				default:
					assertNever(options.crop)
					break
			}

			existingScaleOp = transformChain
				.scale(options.buttonWidth, options.buttonHeight, ResizeMode.Fit)
				.toBuffer(PixelFormat.Rgba)
				.then((buffer) => {
					for (let i = 0; i < buffer.buffer.length; i += 4) {
						const r = buffer.buffer.readUint8(i)
						const g = buffer.buffer.readUint8(i + 1)
						const b = buffer.buffer.readUint8(i + 2)
						const a = buffer.buffer.readUint8(i + 3)
						buffer.buffer.writeUint8(a, i)
						buffer.buffer.writeUint8(r, i + 1)
						buffer.buffer.writeUint8(g, i + 2)
						buffer.buffer.writeUint8(b, i + 3)
					}

					return buffer
				})

			cacheEntry.scaledImages.set(previewKey, existingScaleOp)
		}

		// Wait for the scale operation to complete
		const scaledImage = await existingScaleOp

		let drawY = Math.floor((options.buttonHeight - scaledImage.height) / 2)
		if (options.crop !== 'none') {
			switch (options.position) {
				case 'top':
					drawY = 0
					break
				case 'bottom':
					drawY = options.buttonHeight - scaledImage.height
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
			imageBufferPosition: {
				x: 0,
				y: drawY,
				width: scaledImage.width,
				height: scaledImage.height,
			},
		}
	}

	#performLoadForCacheEntry(
		isClip: boolean,
		slot: number,
		cacheEntry: MediaPoolPreviewCacheEntry | undefined,
		frameState: MediaState.StillFrame
	): void {
		if (cacheEntry && cacheEntry.isLoading) return // Image is already being loaded, need to wait for that to complete

		// Update the cache
		cacheEntry = {
			isClip,
			slot,

			loadedHash: frameState.hash,
			loadedFilename: frameState.fileName,

			isLoading: true,
			isStale: false,

			rawImage: undefined,
			scaledImages: new Map(),
		}
		const cacheEntryId = this.#getCacheEntryId(isClip, slot)
		this.#cache.set(cacheEntryId, cacheEntry)

		// load the image
		this.#fetchStillFrame(isClip, slot)
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
			.then(() => {
				// Inform all feedbacks, to update
				const allSubsForImage = this.#subscriptions.get(cacheEntryId)
				if (allSubsForImage && allSubsForImage.subs.size > 0) {
					this.#invalidateFeedbacks(Array.from(allSubsForImage.subs.keys()))
				}
			})
	}

	#getFrameAtemState(isClip: boolean, slot: number): MediaState.StillFrame | undefined {
		if (isClip) {
			return this.#latestState.clipPool[slot]?.frames?.[0]
		} else {
			return this.#latestState.stillPool[slot]
		}
	}

	#isCacheEntryStale(entry: MediaPoolPreviewCacheEntry): boolean {
		if (entry.isStale) return true

		const frame = this.#getFrameAtemState(entry.isClip, entry.slot)
		return !frame || frame.fileName !== entry.loadedFilename || frame.hash !== entry.loadedHash
	}
	#getCacheEntryId(isClip: boolean, slot: number): string {
		if (isClip) {
			return `clip-${slot}` // TODO - frame
		} else {
			return `still-${slot}`
		}
	}
	#parseSource(source: number): [number, boolean] {
		const isClip = source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET
		const slot = isClip ? source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET : source

		return [slot, isClip]
	}
}
