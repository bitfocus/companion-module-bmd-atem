import { describe, expect, test } from 'vitest'
import { AtemStateUtil, Enums } from 'atem-connection'
import { InitVariables, updateChangedVariables, type UpdateVariablesProps } from '../lib.js'
import { ALL_MODELS } from '../../models/index.js'
import { makeTestState } from '../../__tests__/helpers.js'
import type { InstanceBaseExt } from '../../util.js'

const MODEL = { ...ALL_MODELS.find((model) => model.USKs && model.DVEs)!, MEs: 2, USKs: 2 }

function fixture() {
	const state = makeTestState()
	const definitions: Record<string, { name: string }> = {}
	const values: Record<string, unknown> = {}
	const instance = {
		config: {},
		parseIpAndPort: () => undefined,
		setVariableDefinitions: (next: typeof definitions) => Object.assign(definitions, next),
		setVariableValues: (next: typeof values) => Object.assign(values, next),
	} as unknown as InstanceBaseExt
	return { state, definitions, values, instance }
}

function changesFor(me: number, key: number): UpdateVariablesProps {
	return {
		meProgram: new Set(),
		mePreview: new Set(),
		transitionPosition: new Set(),
		transitionRate: new Set(),
		auxes: new Set(),
		dsk: new Set(),
		usk: new Set([[me, key]]),
		macros: new Set(),
		ssrc: new Set(),
		mediaPlayer: new Set(),
		streaming: false,
		recording: false,
		classicAudio: new Set(),
		fairlightAudio: new Set(),
		fairlightAudioMaster: false,
		fairlightAudioMonitor: false,
		fairlightRoutingSources: new Set(),
		fairlightRoutingOutputs: new Set(),
		mvWindow: new Set(),
	}
}

describe('USK mask variables (#491)', () => {
	test('labels the existing DVE variables explicitly without renaming their IDs', () => {
		const f = fixture()
		InitVariables(f.instance, MODEL, f.state)
		expect(f.definitions.usk_2_2_maskEnabled?.name).toBe('DVE Mask Enabled for M/E 2 Key 2')
		for (const side of ['Top', 'Bottom', 'Left', 'Right']) {
			expect(f.definitions[`usk_2_2_mask${side}`]?.name).toContain('DVE Mask')
		}
		expect(f.definitions.usk_2_2_bordLum?.name).toBe('Border Luminance of M/E 2 Key 2')
	})

	test('defines non-DVE mask variables even on a model without DVEs', () => {
		const f = fixture()
		InitVariables(f.instance, { ...MODEL, DVEs: 0 }, f.state)
		expect(f.definitions.usk_2_2_nonDVEmaskEnabled?.name).toBe('Luma-Chroma-Pattern Mask Enabled for M/E 2 Key 2')
		for (const suffix of ['Enabled', 'Top', 'Bottom', 'Left', 'Right']) {
			expect(f.definitions[`usk_2_2_nonDVEmask${suffix}`]).toBeDefined()
		}
		expect(f.definitions.usk_2_2_maskEnabled).toBeUndefined()
	})

	test.each([Enums.MixEffectKeyType.Luma, Enums.MixEffectKeyType.Chroma, Enums.MixEffectKeyType.Pattern])(
		'initializes common mask values independently from DVE settings for key type %s',
		(keyType) => {
			const f = fixture()
			const me = AtemStateUtil.getMixEffect(f.state.state, 1)
			me.upstreamKeyers[1] = {
				mixEffectKeyType: keyType,
				maskSettings: { maskEnabled: true, maskTop: 1250, maskBottom: -2500, maskLeft: -3500, maskRight: 4500 },
				dveSettings: {
					maskEnabled: false,
					maskTop: 8000,
					maskBottom: -8000,
					maskLeft: -12000,
					maskRight: 12000,
					borderLuma: 750,
				},
			} as any
			InitVariables(f.instance, MODEL, f.state)
			expect(f.values).toMatchObject({
				usk_2_2_nonDVEmaskEnabled: true,
				usk_2_2_nonDVEmaskTop: 1.25,
				usk_2_2_nonDVEmaskBottom: -2.5,
				usk_2_2_nonDVEmaskLeft: -3.5,
				usk_2_2_nonDVEmaskRight: 4.5,
				usk_2_2_maskEnabled: false,
				usk_2_2_maskTop: 8,
				usk_2_2_maskBottom: -8,
				usk_2_2_maskLeft: -12,
				usk_2_2_maskRight: 12,
				usk_2_2_bordLum: 75,
			})
		},
	)

	test('refreshes common mask values through the normal change handler, including false and zero', () => {
		const f = fixture()
		const me = AtemStateUtil.getMixEffect(f.state.state, 0)
		me.upstreamKeyers[0] = {
			maskSettings: { maskEnabled: true, maskTop: 1000, maskBottom: -1000, maskLeft: -2000, maskRight: 2000 },
		} as any
		InitVariables(f.instance, MODEL, f.state)
		me.upstreamKeyers[0]!.maskSettings = { maskEnabled: false, maskTop: 0, maskBottom: 0, maskLeft: 0, maskRight: 0 }
		updateChangedVariables(f.instance, f.state.state, changesFor(0, 0))
		expect(f.values).toMatchObject({
			usk_1_1_nonDVEmaskEnabled: false,
			usk_1_1_nonDVEmaskTop: 0,
			usk_1_1_nonDVEmaskBottom: 0,
			usk_1_1_nonDVEmaskLeft: 0,
			usk_1_1_nonDVEmaskRight: 0,
		})
	})

	test('clears previously observed common mask values when key state is no longer available', () => {
		const f = fixture()
		const me = AtemStateUtil.getMixEffect(f.state.state, 0)
		me.upstreamKeyers[0] = {
			maskSettings: { maskEnabled: true, maskTop: 1000, maskBottom: -1000, maskLeft: -2000, maskRight: 2000 },
		} as any
		InitVariables(f.instance, MODEL, f.state)
		expect(f.values.usk_1_1_nonDVEmaskEnabled).toBe(true)
		me.upstreamKeyers.splice(0)
		updateChangedVariables(f.instance, f.state.state, changesFor(0, 0))
		for (const suffix of ['Enabled', 'Top', 'Bottom', 'Left', 'Right']) {
			expect(f.values[`usk_1_1_nonDVEmask${suffix}`]).toBeUndefined()
		}
	})
})
