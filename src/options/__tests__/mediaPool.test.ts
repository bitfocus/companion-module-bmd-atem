import { describe, expect, test } from 'vitest'
import type { ModelSpec } from '../../models/types.js'
import type { AtemState } from 'atem-connection'
import { parseMediaPoolSource } from '../mediaPool.js'

const mockModel = {
	media: { stills: 20, clips: 2 },
} as ModelSpec

const unusedSlot = { isUsed: false }
const mockState = {
	media: {
		stillPool: [unusedSlot, unusedSlot, { isUsed: true, fileName: 'my still' }],
		clipPool: [unusedSlot, { isUsed: true, name: 'my clip' }],
	},
} as AtemState

describe('parseMediaPoolSource', () => {
	describe('stills', () => {
		test('full prefix "still"', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'still1', false)).toEqual({
				isClip: false,
				slot: 0,
				frameIndex: 0,
			})
			expect(parseMediaPoolSource(mockModel, mockState, 'still20', false)).toEqual({
				isClip: false,
				slot: 19,
				frameIndex: 0,
			})
		})

		test('short prefix "s"', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 's5', false)).toEqual({ isClip: false, slot: 4, frameIndex: 0 })
		})

		test('short prefix "st"', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'st10', false)).toEqual({
				isClip: false,
				slot: 9,
				frameIndex: 0,
			})
		})

		test('user provided string', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'my still', false)).toEqual({
				isClip: false,
				slot: 2,
				frameIndex: 0,
			})
		})

		test('out of range returns null', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'still0', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, 'still21', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, 's0', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, 'st99', false)).toBeNull()
		})

		test('prefix overrides isClip parameter', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'still1', true)).toEqual({
				isClip: false,
				slot: 0,
				frameIndex: 0,
			})
		})
	})

	describe('clips', () => {
		test('full prefix "clip"', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'clip1', false)).toEqual({
				isClip: true,
				slot: 0,
				frameIndex: 0,
			})
			expect(parseMediaPoolSource(mockModel, mockState, 'clip2', false)).toEqual({
				isClip: true,
				slot: 1,
				frameIndex: 0,
			})
		})

		test('short prefix "c"', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'c1', false)).toEqual({ isClip: true, slot: 0, frameIndex: 0 })
		})

		test('short prefix "cl"', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'cl2', true)).toEqual({ isClip: true, slot: 1, frameIndex: 0 })
		})

		test('user provided string', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'my clip', true)).toEqual({
				isClip: true,
				slot: 1,
				frameIndex: 0,
			})
		})

		test('out of range returns null', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'clip0', true)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, 'clip3', true)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, 'c0', true)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, 'cl100', true)).toBeNull()
		})

		test('prefix overrides isClip parameter', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'clip1', false)).toEqual({
				isClip: true,
				slot: 0,
				frameIndex: 0,
			})
		})
	})

	describe('case insensitivity', () => {
		test('uppercase input', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'STILL1', false)).toEqual({
				isClip: false,
				slot: 0,
				frameIndex: 0,
			})
			expect(parseMediaPoolSource(mockModel, mockState, 'CLIP1', false)).toEqual({
				isClip: true,
				slot: 0,
				frameIndex: 0,
			})
		})

		test('mixed case input', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'StiLl5', false)).toEqual({
				isClip: false,
				slot: 4,
				frameIndex: 0,
			})
			expect(parseMediaPoolSource(mockModel, mockState, 'cLiP2', false)).toEqual({
				isClip: true,
				slot: 1,
				frameIndex: 0,
			})
		})
	})

	describe('whitespace and special characters', () => {
		test('leading/trailing whitespace is trimmed', () => {
			expect(parseMediaPoolSource(mockModel, mockState, '  still1  ', false)).toEqual({
				isClip: false,
				slot: 0,
				frameIndex: 0,
			})
		})

		test('special characters are stripped', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'still-1', false)).toEqual({
				isClip: false,
				slot: 0,
				frameIndex: 0,
			})
			expect(parseMediaPoolSource(mockModel, mockState, 'clip_2', false)).toEqual({
				isClip: true,
				slot: 1,
				frameIndex: 0,
			})
			expect(parseMediaPoolSource(mockModel, mockState, 'still 3', false)).toEqual({
				isClip: false,
				slot: 2,
				frameIndex: 0,
			})
		})
	})

	describe('non-string inputs', () => {
		test('undefined returns null', () => {
			expect(parseMediaPoolSource(mockModel, mockState, undefined, false)).toBeNull()
		})

		test('number input resolves using isClip', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 5, false)).toEqual({ isClip: false, slot: 4, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, mockState, 1, true)).toEqual({ isClip: true, slot: 0, frameIndex: 0 })
		})

		test('boolean input returns null', () => {
			expect(parseMediaPoolSource(mockModel, mockState, true, false)).toBeNull()
		})

		test('null returns null', () => {
			expect(parseMediaPoolSource(mockModel, mockState, null, false)).toBeNull()
		})
	})

	describe('bare number uses isClip parameter', () => {
		test('bare number with isClip=false resolves to still', () => {
			expect(parseMediaPoolSource(mockModel, mockState, '1', false)).toEqual({ isClip: false, slot: 0, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, mockState, '20', false)).toEqual({
				isClip: false,
				slot: 19,
				frameIndex: 0,
			})
		})

		test('bare number with isClip=true resolves to clip', () => {
			expect(parseMediaPoolSource(mockModel, mockState, '1', true)).toEqual({ isClip: true, slot: 0, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, mockState, '2', true)).toEqual({ isClip: true, slot: 1, frameIndex: 0 })
		})

		test('bare number out of range returns null', () => {
			expect(parseMediaPoolSource(mockModel, mockState, '0', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, '21', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, '3', true)).toBeNull()
		})
	})

	describe('invalid formats', () => {
		test('unknown prefix returns null', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'frame1', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, 'audio2', false)).toBeNull()
		})

		test('no number returns null', () => {
			expect(parseMediaPoolSource(mockModel, mockState, 'still', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, mockState, 'clip', false)).toBeNull()
		})

		test('empty string returns null', () => {
			expect(parseMediaPoolSource(mockModel, mockState, '', false)).toBeNull()
		})
	})

	describe('model with no clips', () => {
		const noClipsModel = { media: { stills: 5, clips: 0 } } as ModelSpec
		const mockState = {
			media: {
				stillPool: [unusedSlot, unusedSlot, { fileName: 'my still' }],
				clipPool: [],
			},
		} as unknown as AtemState

		test('clips always out of range', () => {
			expect(parseMediaPoolSource(noClipsModel, mockState, 'clip1', true)).toBeNull()
		})

		test('stills still work', () => {
			expect(parseMediaPoolSource(noClipsModel, mockState, 'still1', false)).toEqual({
				isClip: false,
				slot: 0,
				frameIndex: 0,
			})
		})

		test('bare number with isClip=true on no-clips model returns null', () => {
			expect(parseMediaPoolSource(noClipsModel, mockState, '1', true)).toBeNull()
		})
	})
})
