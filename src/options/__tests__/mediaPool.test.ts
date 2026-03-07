import { describe, expect, test } from 'vitest'
import type { ModelSpec } from '../../models/types.js'
import { parseMediaPoolSource } from '../mediaPool.js'

const mockModel = {
	media: { stills: 20, clips: 2 },
} as ModelSpec

describe('parseMediaPoolSource', () => {
	describe('stills', () => {
		test('full prefix "still"', () => {
			expect(parseMediaPoolSource(mockModel, 'still1', false)).toEqual({ isClip: false, slot: 0, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, 'still20', false)).toEqual({ isClip: false, slot: 19, frameIndex: 0 })
		})

		test('short prefix "s"', () => {
			expect(parseMediaPoolSource(mockModel, 's5', false)).toEqual({ isClip: false, slot: 4, frameIndex: 0 })
		})

		test('short prefix "st"', () => {
			expect(parseMediaPoolSource(mockModel, 'st10', false)).toEqual({ isClip: false, slot: 9, frameIndex: 0 })
		})

		test('out of range returns null', () => {
			expect(parseMediaPoolSource(mockModel, 'still0', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, 'still21', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, 's0', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, 'st99', false)).toBeNull()
		})

		test('prefix overrides isClip parameter', () => {
			expect(parseMediaPoolSource(mockModel, 'still1', true)).toEqual({ isClip: false, slot: 0, frameIndex: 0 })
		})
	})

	describe('clips', () => {
		test('full prefix "clip"', () => {
			expect(parseMediaPoolSource(mockModel, 'clip1', false)).toEqual({ isClip: true, slot: 0, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, 'clip2', false)).toEqual({ isClip: true, slot: 1, frameIndex: 0 })
		})

		test('short prefix "c"', () => {
			expect(parseMediaPoolSource(mockModel, 'c1', false)).toEqual({ isClip: true, slot: 0, frameIndex: 0 })
		})

		test('short prefix "cl"', () => {
			expect(parseMediaPoolSource(mockModel, 'cl2', true)).toEqual({ isClip: true, slot: 1, frameIndex: 0 })
		})

		test('out of range returns null', () => {
			expect(parseMediaPoolSource(mockModel, 'clip0', true)).toBeNull()
			expect(parseMediaPoolSource(mockModel, 'clip3', true)).toBeNull()
			expect(parseMediaPoolSource(mockModel, 'c0', true)).toBeNull()
			expect(parseMediaPoolSource(mockModel, 'cl100', true)).toBeNull()
		})

		test('prefix overrides isClip parameter', () => {
			expect(parseMediaPoolSource(mockModel, 'clip1', false)).toEqual({ isClip: true, slot: 0, frameIndex: 0 })
		})
	})

	describe('case insensitivity', () => {
		test('uppercase input', () => {
			expect(parseMediaPoolSource(mockModel, 'STILL1', false)).toEqual({ isClip: false, slot: 0, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, 'CLIP1', false)).toEqual({ isClip: true, slot: 0, frameIndex: 0 })
		})

		test('mixed case input', () => {
			expect(parseMediaPoolSource(mockModel, 'StiLl5', false)).toEqual({ isClip: false, slot: 4, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, 'cLiP2', false)).toEqual({ isClip: true, slot: 1, frameIndex: 0 })
		})
	})

	describe('whitespace and special characters', () => {
		test('leading/trailing whitespace is trimmed', () => {
			expect(parseMediaPoolSource(mockModel, '  still1  ', false)).toEqual({ isClip: false, slot: 0, frameIndex: 0 })
		})

		test('special characters are stripped', () => {
			expect(parseMediaPoolSource(mockModel, 'still-1', false)).toEqual({ isClip: false, slot: 0, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, 'clip_2', false)).toEqual({ isClip: true, slot: 1, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, 'still 3', false)).toEqual({ isClip: false, slot: 2, frameIndex: 0 })
		})
	})

	describe('non-string inputs', () => {
		test('undefined returns null', () => {
			expect(parseMediaPoolSource(mockModel, undefined, false)).toBeNull()
		})

		test('number input resolves using isClip', () => {
			expect(parseMediaPoolSource(mockModel, 5, false)).toEqual({ isClip: false, slot: 4, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, 1, true)).toEqual({ isClip: true, slot: 0, frameIndex: 0 })
		})

		test('boolean input returns null', () => {
			expect(parseMediaPoolSource(mockModel, true, false)).toBeNull()
		})

		test('null returns null', () => {
			expect(parseMediaPoolSource(mockModel, null, false)).toBeNull()
		})
	})

	describe('bare number uses isClip parameter', () => {
		test('bare number with isClip=false resolves to still', () => {
			expect(parseMediaPoolSource(mockModel, '1', false)).toEqual({ isClip: false, slot: 0, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, '20', false)).toEqual({ isClip: false, slot: 19, frameIndex: 0 })
		})

		test('bare number with isClip=true resolves to clip', () => {
			expect(parseMediaPoolSource(mockModel, '1', true)).toEqual({ isClip: true, slot: 0, frameIndex: 0 })
			expect(parseMediaPoolSource(mockModel, '2', true)).toEqual({ isClip: true, slot: 1, frameIndex: 0 })
		})

		test('bare number out of range returns null', () => {
			expect(parseMediaPoolSource(mockModel, '0', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, '21', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, '3', true)).toBeNull()
		})
	})

	describe('invalid formats', () => {
		test('unknown prefix returns null', () => {
			expect(parseMediaPoolSource(mockModel, 'frame1', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, 'audio2', false)).toBeNull()
		})

		test('no number returns null', () => {
			expect(parseMediaPoolSource(mockModel, 'still', false)).toBeNull()
			expect(parseMediaPoolSource(mockModel, 'clip', false)).toBeNull()
		})

		test('empty string returns null', () => {
			expect(parseMediaPoolSource(mockModel, '', false)).toBeNull()
		})
	})

	describe('model with no clips', () => {
		const noClipsModel = { media: { stills: 5, clips: 0 } } as ModelSpec

		test('clips always out of range', () => {
			expect(parseMediaPoolSource(noClipsModel, 'clip1', true)).toBeNull()
		})

		test('stills still work', () => {
			expect(parseMediaPoolSource(noClipsModel, 'still1', false)).toEqual({ isClip: false, slot: 0, frameIndex: 0 })
		})

		test('bare number with isClip=true on no-clips model returns null', () => {
			expect(parseMediaPoolSource(noClipsModel, '1', true)).toBeNull()
		})
	})
})
