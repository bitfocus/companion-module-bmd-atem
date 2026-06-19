import { beforeEach, describe, expect, test } from 'vitest'
import { Enums } from 'atem-connection'
import { createMediaPlayerActions } from '../mediaPlayer.js'
import { ALL_MODELS } from '../../models/index.js'
import type { ModelSpec } from '../../models/types.js'
import { makeMockAtem, makeTestState } from '../../__tests__/helpers.js'

// Tier 2: learn<->callback INVERSE tests.
//
// These do NOT assert "the callback subtracts 1" (that would just mirror the
// implementation). Instead they assert that for a constructed state, feeding
// learn()'s output back into callback() reproduces that same state's protocol
// call. The anchor is the hand-built state expressed in protocol terms, so the
// loop only closes if learn and callback agree on every index/source mapping.
//
// Limits (by design): a *compensating* error present in both learn and callback
// would still round-trip, and actions with no learn counterpart get no coverage.

const MODEL: ModelSpec = ALL_MODELS.find((m) => m.media.players > 0 && m.media.clips >= 3 && m.media.stills >= 5)!

interface PlayerOverrides {
	sourceType: Enums.MediaSourceType
	stillIndex: number
	clipIndex: number
}
function setPlayer(state: ReturnType<typeof makeTestState>, index: number, overrides: PlayerOverrides): void {
	state.state.media.players[index] = {
		playing: false,
		loop: false,
		atBeginning: true,
		clipFrame: 0,
		...overrides,
	}
}

// Convenience to invoke the Companion action callbacks without the full context type.
type AnyDef = { callback: (info: any, ctx?: any) => unknown; learn?: (info: any, ctx?: any) => any }

describe('mediaPlayerSource learn<->callback inverse', () => {
	let mock: ReturnType<typeof makeMockAtem>
	let state: ReturnType<typeof makeTestState>

	beforeEach(() => {
		mock = makeMockAtem()
		state = makeTestState()
	})

	test('a still loaded in the state round-trips back to the same still + player index', async () => {
		setPlayer(state, 0, { sourceType: Enums.MediaSourceType.Still, stillIndex: 4, clipIndex: 0 })

		const actions = createMediaPlayerActions(mock.atem, MODEL, state)
		const def = actions.mediaPlayerSource as unknown as AnyDef

		// learn what is currently in the state for media player 1 (1-based)...
		const learned = def.learn!({ options: { mediaplayer: 1, source: '', defaultClip: false } })
		// ...then apply it back through the callback.
		await def.callback({ options: { mediaplayer: 1, ...learned } })

		const call = mock.onlyCall('setMediaPlayerSource')
		const [props, playerIndex] = call.args as [{ sourceType: number; stillIndex: number }, number]
		expect(playerIndex).toBe(0) // media player 1 maps to protocol index 0, consistently both ways
		expect(props.sourceType).toBe(Enums.MediaSourceType.Still)
		expect(props.stillIndex).toBe(4)
	})

	test('the player index is consistent for a non-first player', async () => {
		setPlayer(state, 1, { sourceType: Enums.MediaSourceType.Still, stillIndex: 2, clipIndex: 0 })

		const actions = createMediaPlayerActions(mock.atem, MODEL, state)
		const def = actions.mediaPlayerSource as unknown as AnyDef

		const learned = def.learn!({ options: { mediaplayer: 2, source: '', defaultClip: false } })
		await def.callback({ options: { mediaplayer: 2, ...learned } })

		const call = mock.onlyCall('setMediaPlayerSource')
		const [props, playerIndex] = call.args as [{ stillIndex: number }, number]
		expect(playerIndex).toBe(1)
		expect(props.stillIndex).toBe(2)
	})

	test('a clip loaded in the state round-trips back to the same clip', async () => {
		setPlayer(state, 0, { sourceType: Enums.MediaSourceType.Clip, stillIndex: 0, clipIndex: 2 })

		const actions = createMediaPlayerActions(mock.atem, MODEL, state)
		const def = actions.mediaPlayerSource as unknown as AnyDef

		const learned = def.learn!({ options: { mediaplayer: 1, source: '', defaultClip: false } })
		await def.callback({ options: { mediaplayer: 1, ...learned } })

		const call = mock.onlyCall('setMediaPlayerSource')
		const [props] = call.args as [{ sourceType: number; clipIndex: number }, number]
		expect(props.sourceType).toBe(Enums.MediaSourceType.Clip)
		expect(props.clipIndex).toBe(2)
	})
})
