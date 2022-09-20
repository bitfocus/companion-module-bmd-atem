import { fadeFpsDefault, AtemConfig } from './config.js'
import { Easing } from './easings.js'

export interface TransitionInfo {
	sendFcn: (value: number) => Promise<void>
	steps: number[]
}

export class AtemTransitions {
	private readonly transitions: Map<string, TransitionInfo>
	private readonly fps: number

	private tickInterval: NodeJS.Timer | undefined

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

	public async run(
		id: string,
		sendFcn: TransitionInfo['sendFcn'],
		from: number | undefined,
		to: number,
		duration: number
	): Promise<void> {
		const interval = 1000 / this.fps
		const stepCount = Math.ceil(duration / interval)

		// TODO - what if not sending db
		if (stepCount <= 1 || typeof from !== 'number') {
			this.transitions.delete(id)
			await sendFcn(to)
		} else {
			const diff = to - from
			const steps: number[] = []
			const easing = Easing.Linear.None // TODO - dynamic
			for (let i = 1; i <= stepCount; i++) {
				const fraction = easing(i / stepCount)
				steps.push(from + diff * fraction)
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
