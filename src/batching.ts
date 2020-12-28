export class AtemCommandBatching {
	public readonly meTransitionSelection = new Map<number, CommandBatching<number>>()
}

export class CommandBatching<T> {
	private readonly executeFunction: (value: T) => Promise<unknown>
	private readonly maxBatch: number
	private readonly delayStep: number

	private inflight: {
		completion: Promise<void> | undefined // For when it is executing
		timer: NodeJS.Timeout | undefined // For when it is delayed
		batched: number // number of updates batched here
		nextValue: T | undefined
	}

	constructor(executeFunction: (value: T) => Promise<unknown>, options: { delayStep: number; maxBatch: number }) {
		this.executeFunction = executeFunction
		this.maxBatch = options.maxBatch
		this.delayStep = options.delayStep

		this.inflight = {
			completion: undefined,
			timer: undefined,
			batched: 0,
			nextValue: undefined,
		}
	}

	queueChange(currentValue: T, modifier: (oldValue: T) => T): void {
		// Update the nextValue, and mark the change
		this.inflight.batched++
		if (!this.inflight.completion && this.inflight.batched <= this.maxBatch) {
			this.updateBatchDelayedTimer()
		}
		this.inflight.nextValue = modifier(this.inflight.nextValue ?? currentValue)
	}

	private updateBatchDelayedTimer(): void {
		if (this.inflight.timer) {
			clearTimeout(this.inflight.timer)
		}
		this.inflight.timer = setTimeout(() => {
			this.inflight.timer = undefined

			if (!this.inflight.completion && this.inflight.nextValue !== undefined && this.inflight.batched > 0) {
				// reset batch counting
				this.inflight.timer = undefined
				this.inflight.batched = 0
				// send it off
				this.inflight.completion = this.executeFunction(this.inflight.nextValue).then(() => this.inflightCompleted())
			}
		}, this.delayStep)
	}

	private inflightCompleted(): void {
		this.inflight.completion = undefined
		if (this.inflight.timer) {
			clearTimeout(this.inflight.timer)
			this.inflight.timer = undefined
		}

		// The command send has completed, so check if another batch is ready
		if (this.inflight.batched === 0 || this.inflight.nextValue === undefined) {
			this.inflight.batched = 0
			this.inflight.nextValue = undefined
		} else if (this.inflight.batched >= this.maxBatch) {
			// send it off
			this.inflight.batched = 0
			this.inflight.completion = this.executeFunction(this.inflight.nextValue).then(() => this.inflightCompleted())
		} else {
			// Batch can wait a bit longer, so lets do that
			this.updateBatchDelayedTimer()
		}
	}
}
