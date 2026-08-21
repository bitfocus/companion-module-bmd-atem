import type { SomeAtemAudioLevels, FairlightAudioLevels } from 'atem-connection/dist/state/levels.js'

/**
 * The switcher sends levels many times a second. Feedbacks are only rechecked at this rate, to
 * avoid flooding companion with updates.
 */
const LEVELS_UPDATE_FPS = 20

/** The levels reported for the master, which has no expander */
export type FairlightMasterLevels = Omit<FairlightAudioLevels, 'expanderGainReduction'>

/** Levels are sent as hundredths of a decibel */
const LEVEL_SCALE = 100

function sourceKey(index: number | string, source: string | bigint): string {
	return `${index}.${source}`
}

/**
 * Caches the audio levels reported by the switcher, and tracks whether anything is interested in
 * them. The switcher only sends levels while asked to, so this drives that on and off as feedbacks
 * using them come and go.
 */
export class AtemAudioLevels {
	readonly #checkFeedbacks: () => void
	readonly #setSendLevels: (enabled: boolean) => void

	readonly #subscriptions = new Set<string>()
	readonly #sources = new Map<string, FairlightAudioLevels>()
	#master: FairlightMasterLevels | undefined

	#pendingCheck: NodeJS.Timeout | undefined

	constructor(checkFeedbacks: () => void, setSendLevels: (enabled: boolean) => void) {
		this.#checkFeedbacks = checkFeedbacks
		this.#setSendLevels = setSendLevels
	}

	get isEnabled(): boolean {
		return this.#subscriptions.size > 0
	}

	/** Ask the switcher to resume sending levels, after a reconnection */
	resume(): void {
		if (this.isEnabled) this.#setSendLevels(true)
	}

	subscribe(feedbackId: string): void {
		const wasEmpty = this.#subscriptions.size === 0
		this.#subscriptions.add(feedbackId)

		if (wasEmpty) this.#setSendLevels(true)
	}

	unsubscribe(feedbackId: string): void {
		if (!this.#subscriptions.delete(feedbackId)) return

		if (this.#subscriptions.size === 0) {
			this.#setSendLevels(false)
			this.#clearPendingCheck()
			this.#master = undefined
			this.#sources.clear()
		}
	}

	handleLevels(levels: SomeAtemAudioLevels): void {
		if (levels.type === 'master') {
			this.#master = levels.levels
		} else {
			this.#sources.set(sourceKey(levels.index, levels.source), levels.levels)
		}

		// Coalesce the updates which arrive between checks
		if (!this.#pendingCheck) {
			this.#pendingCheck = setTimeout(() => {
				this.#pendingCheck = undefined
				this.#checkFeedbacks()
			}, 1000 / LEVELS_UPDATE_FPS)
		}
	}

	/** @returns the level in decibels, or null when the switcher has not reported it */
	getMasterLevel(meter: keyof FairlightMasterLevels): number | null {
		const value = this.#master?.[meter]
		return value === undefined ? null : value / LEVEL_SCALE
	}

	/** @returns the level in decibels, or null when the switcher has not reported it */
	getSourceLevel(index: number | string, source: string | bigint, meter: keyof FairlightAudioLevels): number | null {
		const value = this.#sources.get(sourceKey(index, source))?.[meter]
		return value === undefined ? null : value / LEVEL_SCALE
	}

	/** Discard the cached levels, as they are no longer current */
	clearCache(): void {
		this.#master = undefined
		this.#sources.clear()
	}

	destroy(): void {
		this.#clearPendingCheck()
		this.#subscriptions.clear()
		this.clearCache()
	}

	#clearPendingCheck(): void {
		if (this.#pendingCheck) {
			clearTimeout(this.#pendingCheck)
			this.#pendingCheck = undefined
		}
	}
}
