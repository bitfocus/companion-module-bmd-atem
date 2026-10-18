import type { SomeAtemAudioLevels, FairlightAudioLevels } from 'atem-connection/dist/state/levels.js'
import type { ClassicAudioLevelsProps, ClassicLevels } from './classicLevels.js'

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

	isSubscribed(feedbackId: string): boolean {
		return this.#subscriptions.has(feedbackId)
	}

	/**
	 * All cached levels as JSON (hundredths of a dB): {"master": [...], "input.source": [...]}, each
	 * [inputLeft, inputRight, compressorGR, limiterGR, outputLeft, outputRight] (inputs also
	 * [..., expanderGR] at the end)
	 */
	toJson(): string {
		const out: Record<string, number[]> = {}
		const m = this.#master
		if (m)
			out.master = [
				m.inputLeftLevel,
				m.inputRightLevel,
				m.compressorGainReduction,
				m.limiterGainReduction,
				m.leftLevel,
				m.rightLevel,
			]
		for (const [key, l] of this.#sources)
			out[key] = [
				l.inputLeftLevel,
				l.inputRightLevel,
				l.compressorGainReduction,
				l.limiterGainReduction,
				l.leftLevel,
				l.rightLevel,
				l.expanderGainReduction,
			]
		return JSON.stringify(out)
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
			this.clearCache()
		}
	}

	readonly #classic = new Map<number, ClassicLevels>()
	#classicMaster: ClassicLevels | undefined

	/** levels of the classic audio mixer (hundredths of a dB) */
	handleClassicLevels(levels: ClassicAudioLevelsProps): void {
		this.#classicMaster = levels.master
		for (const [id, l] of levels.sources) this.#classic.set(id, l)
		this.#scheduleCheck()
	}

	/** @returns a classic mixer level in decibels (0 left, 1 right, 2 peak left, 3 peak right), or null */
	getClassicLevel(input: number | 'master', meter: 0 | 1 | 2 | 3): number | null {
		const l = input === 'master' ? this.#classicMaster : this.#classic.get(input)
		return l ? l[meter] / LEVEL_SCALE : null
	}

	handleLevels(levels: SomeAtemAudioLevels): void {
		if (levels.type === 'master') {
			this.#master = levels.levels
		} else {
			this.#sources.set(sourceKey(levels.index, levels.source), levels.levels)
		}

		this.#scheduleCheck()
	}

	#scheduleCheck(): void {
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
		this.#classicMaster = undefined
		this.#classic.clear()
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
