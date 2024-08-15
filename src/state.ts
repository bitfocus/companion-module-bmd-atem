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
import type { InputValue } from '@companion-module/base'
import type { AtemCameraControlStateBuilder } from '@atem-connection/camera-control'
import type { ReadonlyDeep } from 'type-fest'
import { MEDIA_PLAYER_SOURCE_CLIP_OFFSET } from './util.js'

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
	meIndex: InputValue | undefined,
): TransitionProperties | undefined {
	const me = getMixEffect(state, meIndex)
	return me ? me.transitionProperties : undefined
}
export function getUSK(
	state: AtemState,
	meIndex: InputValue | undefined,
	keyIndex: InputValue | undefined,
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
	ssrcId?: InputValue,
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
	windowIndex: InputValue | undefined,
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

interface MediaPoolPreviewOptions {
	position: 'top' | 'center' | 'bottom'
	crop: 'none' | 'left' | 'center' | 'right'
	// TODO - more properties?
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

	//
}

export type FetchStillFrameFunction = (isClip: boolean, slot: number) => Promise<Buffer>

export class MediaPoolPreviewCache {
	readonly #cache = new Map<string, MediaPoolPreviewCacheEntry>()
	readonly #subscriptions = new Map<number, Map<string, MediaPoolPreviewOptions>>()

	readonly #fetchStillFrame: FetchStillFrameFunction
	#latestState: ReadonlyDeep<MediaState.MediaState>

	constructor(initialState: AtemState, fetchStillFrame: FetchStillFrameFunction) {
		this.#latestState = initialState.media
		this.#fetchStillFrame = fetchStillFrame
	}

	public subscribe(source: number, feedbackId: string, options: MediaPoolPreviewOptions): void {
		let entries = this.#subscriptions.get(source)
		if (!entries) {
			entries = new Map()
			this.#subscriptions.set(source, entries)
		}
		entries.set(feedbackId, options)

		this.ensureLoaded(source)
	}

	public unsubscribe(source: number, feedbackId: string): void {
		// TODO - can this drop the source parameter?
		const entries = this.#subscriptions.get(source)
		if (entries) {
			entries.delete(feedbackId)
		}
	}

	public checkUpdatedState(state: AtemState): void {
		this.#latestState = state.media

		// Ensure current subscriptions have up to date images
		for (const [source, subs] of this.#subscriptions.entries()) {
			if (subs.size > 0) this.ensureLoaded(source)
		}

		// TODO - reimplement this!
		// // Purge any stale entries
		// for (const [source, cacheEntry] of this.cache) {
		// 	// If it has subs, it is needed
		// 	const subCount = this.subscriptions.get(source)?.size ?? 0
		// 	if (subCount > 0) continue

		// 	// Purge the cache, if the entry is stale
		// 	if (this.isCacheEntryStale(cacheEntry)) {
		// 		this.cache.delete(source)
		// 	}
		// }
	}

	public ensureLoaded(source: number): void {
		// TODO check if the source is needed

		// TODO: should this 'blank' any existing feedbacks while loading?

		const isClip = source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET
		const slot = isClip ? source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET : source

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
		}
		this.#cache.set(this.#getCacheEntryId(isClip, slot), cacheEntry)

		// TODO - actually load the image

		this.#fetchStillFrame(isClip, slot)
			.then((image) => {
				console.log('got image', image.length)
				// TODO
			})
			.catch((e) => {
				console.log('failed image', e)
				// TODO
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
}
