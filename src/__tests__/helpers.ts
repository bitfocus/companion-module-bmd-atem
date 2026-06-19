import { AtemStateUtil } from 'atem-connection'
import type { Atem } from 'atem-connection'
import type { StateWrapper } from '../state.js'

export interface MockAtemCall {
	method: string
	args: unknown[]
}

export interface MockAtem {
	atem: Atem
	calls: MockAtemCall[]
	/** The single call to `method`; fails the expectation if there isn't exactly one. */
	onlyCall: (method: string) => MockAtemCall
}

/**
 * A stand-in for the `atem-connection` `Atem` instance that records every method
 * call and its arguments instead of touching a socket. Used to observe what
 * protocol command an action's callback would send.
 */
export function makeMockAtem(): MockAtem {
	const calls: MockAtemCall[] = []

	const atem = new Proxy(
		{},
		{
			get(_target, prop) {
				if (typeof prop !== 'string') return undefined
				return async (...args: unknown[]) => {
					calls.push({ method: prop, args })
					return Promise.resolve()
				}
			},
		},
	) as unknown as Atem

	return {
		atem,
		calls,
		onlyCall: (method: string) => {
			const matching = calls.filter((c) => c.method === method)
			if (matching.length !== 1) {
				throw new Error(`Expected exactly one call to ${method}, got ${matching.length}`)
			}
			return matching[0]
		},
	}
}

/**
 * A minimal {@link StateWrapper} wrapping a freshly-created empty ATEM state.
 * Only `state` is populated; the other fields are not needed by the action/feedback
 * callbacks under test and are cast in.
 */
export function makeTestState(): StateWrapper {
	return {
		state: AtemStateUtil.Create(),
	} as unknown as StateWrapper
}
