import { describe, expect, test } from 'vitest'

import { AudioChannelPair } from 'atem-connection/dist/enums'
import { combineInputId } from '../models/util/audioRouting'
import { formatAudioRoutingAsString, parseAudioRoutingString, parseAudioRoutingStringSingle } from '../util'

test('formatAudioRoutingAsString', () => {
	const sourceId = combineInputId(1234, AudioChannelPair.Channel5_6)
	expect(formatAudioRoutingAsString(sourceId)).toEqual('1234-5_6')

	const sourceId2 = combineInputId(9999, AudioChannelPair.Channel11_12)
	expect(formatAudioRoutingAsString(sourceId2)).toEqual('9999-11_12')

	const sourceId3 = combineInputId(0, AudioChannelPair.Channel5_6)
	expect(formatAudioRoutingAsString(sourceId3)).toEqual('0-5_6')
})

describe('parseAudioRoutingString', () => {
	test('single', () => {
		const parse1 = parseAudioRoutingString('9991-1_2')
		expect(parse1).toEqual([combineInputId(9991, AudioChannelPair.Channel1_2)])

		const parse2 = parseAudioRoutingString('123')
		expect(parse2).toEqual([combineInputId(123, AudioChannelPair.Channel1_2)])
	})

	test('multiple', () => {
		const parse1 = parseAudioRoutingString('9991-1_2,123 456, ,777-5_6')
		expect(parse1).toEqual([
			combineInputId(9991, AudioChannelPair.Channel1_2),
			combineInputId(123, AudioChannelPair.Channel1_2),
			combineInputId(456, AudioChannelPair.Channel1_2),
			combineInputId(777, AudioChannelPair.Channel5_6),
		])
	})
})

test('parseAudioRoutingStringSingle', () => {
	const parse1 = parseAudioRoutingStringSingle('9991-1_2')
	expect(parse1).toEqual(combineInputId(9991, AudioChannelPair.Channel1_2))

	const parse2 = parseAudioRoutingStringSingle('9291-7_8')
	expect(parse2).toEqual(combineInputId(9291, AudioChannelPair.Channel7_8))

	const parse3 = parseAudioRoutingStringSingle('9291:7_8')
	expect(parse3).toEqual(null)

	const parse4 = parseAudioRoutingStringSingle('91')
	expect(parse4).toEqual(combineInputId(91, AudioChannelPair.Channel1_2))

	const parse5 = parseAudioRoutingStringSingle('9291-8_9')
	expect(parse5).toEqual(null)

	const parse6 = parseAudioRoutingStringSingle('2001-9_10')
	expect(parse6).toEqual(combineInputId(2001, AudioChannelPair.Channel9_10))

	const parse7 = parseAudioRoutingStringSingle('2001-15_16')
	expect(parse7).toEqual(combineInputId(2001, AudioChannelPair.Channel15_16))
})
