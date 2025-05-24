import type { MyOptionsHelper } from './common.js'
import { fadeFpsDefault, type AtemConfig } from './config.js'
import type { algorithm, curve } from './easings.js'
import * as Easing from './easings.js'
import type { FadeDurationFieldsType } from './input.js'

export interface TransitionInfo {
	sendFcn: (value: number[]) => Promise<void>
	steps: number[][]
}

export class AtemTransitions {
	private readonly transitions: Map<string, TransitionInfo>
	private readonly fps: number

	private tickInterval: NodeJS.Timeout | undefined

	constructor(instanceConfig: AtemConfig) {
		this.transitions = new Map()
		this.fps = instanceConfig.fadeFps ?? fadeFpsDefault
	}

	public stopAll(): void {
		this.transitions.clear()

		if (this.tickInterval) {
			clearInterval(this.tickInterval)
			delete this.tickInterval
		}
	}

	private runTick(): void {
		const completedPaths: string[] = []
		for (const [path, info] of this.transitions.entries()) {
			const newValue = info.steps.shift()
			if (newValue !== undefined) {
				info.sendFcn(newValue).catch((_e) => {
					// TODO
					// this.instance.log('debug', 'Action execution error: ' + e)
				})
			}
			if (info.steps.length === 0) {
				completedPaths.push(path)
			}
		}

		// Remove any completed transitions
		for (const path of completedPaths) {
			this.transitions.delete(path)
		}

		// If nothing is left, stop the timer
		if (this.transitions.size === 0) {
			this.stopAll()
		}
	}

	public async runForFadeOptions(
		id: string,
		sendFcn: (value: number) => Promise<void>,
		from: number | undefined,
		to: number,
		options: MyOptionsHelper<FadeDurationFieldsType>,
	): Promise<void> {
		const duration = options.getPlainNumber('fadeDuration')

		const algorithm = options.getPlainString('fadeAlgorithm')
		const curve = options.getPlainString('fadeCurve')

		return this.run(id, async ([value]) => sendFcn(value), [from], [to], duration, algorithm, curve)
	}

	public async runForProperties<T extends object>(
		id: string,
		sendFcn: (properties: T) => Promise<void>,
		options: MyOptionsHelper<{
			transitionRate: number | undefined
			transitionEasing: algorithm | undefined
			transitionCurve: curve | undefined
		}>,
		animatedKeys: string[],
		newProps: T,
		oldProps: T | undefined,
	): Promise<void> {
		const transitionRate = options.getRaw('transitionRate')

		if (transitionRate && oldProps) {
			// filter out the keys that we can animate
			const keys = Object.keys(newProps).filter((key) => animatedKeys.includes(key)) as (keyof T)[]

			// gather the from and to values from the objects
			const from = keys.map((key) => oldProps[key])
			const to = keys.map((key) => newProps[key])

			const isOnlyNumbers = (array: any[]): array is number[] => !array.find((value) => typeof value !== 'number')

			if (from.length === to.length && isOnlyNumbers(from) && isOnlyNumbers(to)) {
				// we can safely tween between these values
				return this.run(
					id,
					async (values) => {
						// reconstruct the properties with the tweened values
						return sendFcn({ ...newProps, ...Object.fromEntries(values.map((val, i) => [keys[i], val])) })
					},
					from,
					to,
					transitionRate,
					options.getRaw('transitionEasing'),
					options.getRaw('transitionCurve'),
				)
			}
		}

		return sendFcn(newProps)
	}

	public async run(
		id: string,
		sendFcn: TransitionInfo['sendFcn'],
		from: (number | undefined)[],
		to: number[],
		duration: number,
		algorithm?: Easing.algorithm,
		curve?: Easing.curve,
	): Promise<void> {
		const interval = 1000 / this.fps
		const stepCount = Math.ceil(duration / interval)

		// TODO - what if not sending db
		if (stepCount <= 1 || from.reduce((a, b) => (a === undefined ? a : b)) === undefined) {
			this.transitions.delete(id)
			await sendFcn(to)
		} else {
			const diff = to.map((to, i) => to - (from[i] ?? 0))
			const steps: number[][] = []
			const easing = Easing.getEasing(algorithm, curve)
			for (let i = 1; i <= stepCount; i++) {
				const fraction = easing(i / stepCount)
				steps.push(from.map((from, i) => (from === undefined ? to[i] : from + diff[i] * fraction)))
			}

			this.transitions.set(id, {
				steps,
				sendFcn,
			})

			if (!this.tickInterval) {
				// Start the tick if not already running
				this.tickInterval = setInterval(() => this.runTick(), 1000 / this.fps)
			}
		}
	}
}
