import { describe, expect, test } from 'vitest'
import type { ModelSpec } from '../../models/types.js'
import { resolveMixEffectIndex } from '../mixEffect.js'
import { resolveUpstreamKeyerIndex } from '../upstreamKeyer.js'
import { resolveDownstreamKeyerIndex } from '../downstreamKeyer.js'
import { resolveMultiviewerIndex } from '../multiviewer.js'
import { resolveMediaPlayerIndex } from '../mediaPlayer.js'

// These resolvers back the "hide the dropdown when there is only one option" behaviour (#260):
// when the model exposes a single resource the picker is hidden, so whatever value is stored must
// be ignored and treated as the first (0-based) item. With more than one, it's the usual `value - 1`.

const model = (overrides: Partial<ModelSpec>): ModelSpec => overrides as ModelSpec

describe('single-option index resolvers', () => {
	test('M/E', () => {
		expect(resolveMixEffectIndex(model({ MEs: 1 }), 1)).toBe(0)
		expect(resolveMixEffectIndex(model({ MEs: 1 }), 4)).toBe(0) // stale value ignored
		expect(resolveMixEffectIndex(model({ MEs: 4 }), 1)).toBe(0)
		expect(resolveMixEffectIndex(model({ MEs: 4 }), 3)).toBe(2)
	})

	test('upstream keyer', () => {
		expect(resolveUpstreamKeyerIndex(model({ USKs: 1 }), 2)).toBe(0)
		expect(resolveUpstreamKeyerIndex(model({ USKs: 4 }), 2)).toBe(1)
	})

	test('downstream keyer', () => {
		expect(resolveDownstreamKeyerIndex(model({ DSKs: 1 }), 2)).toBe(0)
		expect(resolveDownstreamKeyerIndex(model({ DSKs: 2 }), 2)).toBe(1)
	})

	test('multiviewer', () => {
		expect(resolveMultiviewerIndex(model({ MVs: 1 }), 2)).toBe(0)
		expect(resolveMultiviewerIndex(model({ MVs: 2 }), 2)).toBe(1)
	})

	test('media player', () => {
		expect(resolveMediaPlayerIndex(model({ media: { players: 1 } } as ModelSpec), 2)).toBe(0)
		expect(resolveMediaPlayerIndex(model({ media: { players: 2 } } as ModelSpec), 2)).toBe(1)
	})
})
