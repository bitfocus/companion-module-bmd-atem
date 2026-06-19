import { describe, expect, test } from 'vitest'
import { Enums } from 'atem-connection'
import { combineInputId } from '../audioRouting.js'
import { formatAudioRoutingAsString, parseAudioRoutingStringSingle } from '../../../options/fairlight-routing.js'

// combineInputId bit-packs (sourceId, channelPair) into a single number that is
// later unpacked by formatAudioRoutingAsString and re-parsed. The test asserts
// the pack/unpack round-trips for every channel pair, which catches a mismatch in
// the shift/mask without re-stating the `<< 16` constant in the assertion.

describe('combineInputId pack/unpack round-trip', () => {
	const ALL_PAIRS: Enums.AudioChannelPair[] = [
		Enums.AudioChannelPair.Channel1_2,
		Enums.AudioChannelPair.Channel3_4,
		Enums.AudioChannelPair.Channel5_6,
		Enums.AudioChannelPair.Channel7_8,
		Enums.AudioChannelPair.Channel9_10,
		Enums.AudioChannelPair.Channel11_12,
		Enums.AudioChannelPair.Channel13_14,
		Enums.AudioChannelPair.Channel15_16,
	]

	test('every (sourceId, pair) survives combine -> format -> parse', () => {
		for (const sourceId of [0, 1, 123, 1234, 9999]) {
			for (const pair of ALL_PAIRS) {
				const combined = combineInputId(sourceId, pair)
				const roundTripped = parseAudioRoutingStringSingle(formatAudioRoutingAsString(combined))
				expect(roundTripped).toBe(combined)
			}
		}
	})

	test('distinct (sourceId, pair) combinations never collide', () => {
		// Independent oracle for the packing: it must be injective.
		const seen = new Set<number>()
		for (const sourceId of [0, 1, 2, 1000, 9999]) {
			for (const pair of ALL_PAIRS) {
				const combined = combineInputId(sourceId, pair)
				expect(seen.has(combined)).toBe(false)
				seen.add(combined)
			}
		}
	})
})
