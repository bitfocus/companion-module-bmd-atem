import { type Atem } from 'atem-connection'
import type {
	CompanionActionDefinitions,
	CompanionInputFieldNumber,
	CompanionInputFieldTextInput,
} from '@companion-module/base'
import { convertOptionsFields } from '../options/util.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle, resolveTrueFalseToggle } from '../options/common.js'
import type { StateWrapper } from '../state.js'

/*
 * Fairlight EQ, compressor and limiter, for an input's source or the master.
 * The input and source are text fields (expressions allowed), so one button can serve every
 * channel: the input id, or "master" for the master bus; the source as the switcher names it
 * (eg -65280 for a stereo pair, -256 / -255 for its left / right).
 * Each action changes only the properties picked in "Properties".
 */

const EQ_SHAPES = [
	{ id: 1, label: 'Low shelf' },
	{ id: 2, label: 'Low pass' },
	{ id: 4, label: 'Bell' },
	{ id: 8, label: 'Notch' },
	{ id: 16, label: 'High pass' },
	{ id: 32, label: 'High shelf' },
]

type Target = { input: string; source: string }

export type AtemFairlightDynamicsActions = {
	['fairlightAudioEqualizer']: {
		options: Target & { enabled: TrueFalseToggle; properties: string[]; gain: number; makeUp: number }
	}
	['fairlightAudioEqualizerBand']: {
		options: Target & {
			band: number
			properties: string[]
			enabled: TrueFalseToggle
			shape: number
			frequency: number
			gain: number
			qFactor: number
		}
	}
	['fairlightAudioCompressor']: {
		options: Target & {
			properties: string[]
			enabled: TrueFalseToggle
			threshold: number
			ratio: number
			attack: number
			hold: number
			release: number
		}
	}
	['fairlightAudioLimiter']: {
		options: Target & {
			properties: string[]
			enabled: TrueFalseToggle
			threshold: number
			attack: number
			hold: number
			release: number
		}
	}
	['fairlightAudioLevelsVariable']: {
		options: { enabled: TrueFalseToggle }
	}
}

function targetFields(): {
	input: CompanionInputFieldTextInput<'input'>
	source: CompanionInputFieldTextInput<'source'>
} {
	return {
		input: {
			type: 'textinput',
			id: 'input',
			label: 'Input id, or "master"',
			default: '1',
			useVariables: true,
		},
		source: {
			type: 'textinput',
			id: 'source',
			label: 'Source (eg -65280 stereo, -256 left, -255 right; ignored for the master)',
			default: '-65280',
			useVariables: true,
		},
	}
}

function num<T extends string>(
	id: T,
	label: string,
	def: number,
	min: number,
	max: number,
	step = 0.1,
): CompanionInputFieldNumber<T> {
	return { type: 'number', id, label, default: def, min, max, step, asInteger: false, clampValues: true }
}

function props(choices: Array<{ id: string; label: string }>) {
	return {
		type: 'multidropdown' as const,
		id: 'properties' as const,
		label: 'Properties',
		minSelection: 1,
		default: choices.map((c) => c.id),
		choices,
		sortSelection: true,
		disableAutoExpression: true,
	}
}

function parseTarget(options: Target): { master: boolean; input: number; source: string } | undefined {
	const input = `${options.input}`.trim().toLowerCase()
	if (input === 'master') return { master: true, input: 0, source: '' }
	const id = Number(input)
	if (!Number.isFinite(id)) return undefined
	return { master: false, input: id, source: `${options.source}`.trim() }
}

/** The audio levels subscription that keeps audio_levels_json updated */
export const LEVELS_VARIABLE_SUBSCRIPTION = 'variable:audio_levels_json'

export function createFairlightDynamicsActions(
	atem: Atem | undefined,
	state: StateWrapper,
): CompanionActionDefinitions<AtemFairlightDynamicsActions> {
	const levelsVariableEnabled = () => state.audioLevels.isSubscribed(LEVELS_VARIABLE_SUBSCRIPTION)
	const setLevelsVariable = (on: boolean) => {
		if (on) state.audioLevels.subscribe(LEVELS_VARIABLE_SUBSCRIPTION)
		else state.audioLevels.unsubscribe(LEVELS_VARIABLE_SUBSCRIPTION)
	}
	const fl = () => state.state.fairlight
	const sourceState = (t: { input: number; source: string }) => fl()?.inputs?.[t.input]?.sources?.[t.source]

	return {
		['fairlightAudioEqualizer']: {
			name: 'Fairlight Audio: Equalizer',
			options: convertOptionsFields({
				...targetFields(),
				properties: props([
					{ id: 'enabled', label: 'Enabled' },
					{ id: 'gain', label: 'EQ gain' },
					{ id: 'makeUp', label: 'Make-up gain' },
				]),
				enabled: {
					type: 'dropdown',
					id: 'enabled',
					label: 'Enabled',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
				gain: num('gain', 'EQ gain (dB)', 0, -20, 20),
				makeUp: num('makeUp', 'Make-up gain (dB)', 0, 0, 20),
			}),
			callback: async ({ options }) => {
				const t = parseTarget(options)
				if (!t) return
				const p = options.properties
				const cur = t.master ? fl()?.master?.equalizer?.enabled : sourceState(t)?.equalizer?.enabled
				const out: { equalizerEnabled?: boolean; equalizerGain?: number; makeUpGain?: number } = {}
				if (p.includes('enabled')) out.equalizerEnabled = resolveTrueFalseToggle(options.enabled, cur)
				if (p.includes('gain')) out.equalizerGain = Math.round(options.gain * 100)
				if (p.includes('makeUp')) out.makeUpGain = Math.round(options.makeUp * 100)
				if (t.master) await atem?.setFairlightAudioMixerMasterProps(out)
				else await atem?.setFairlightAudioMixerSourceProps(t.input, t.source, out)
			},
		},
		['fairlightAudioEqualizerBand']: {
			name: 'Fairlight Audio: Equalizer band',
			options: convertOptionsFields({
				...targetFields(),
				band: num('band', 'Band (1-6)', 1, 1, 6, 1),
				properties: props([
					{ id: 'enabled', label: 'Enabled' },
					{ id: 'shape', label: 'Shape' },
					{ id: 'frequency', label: 'Frequency' },
					{ id: 'gain', label: 'Gain' },
					{ id: 'qFactor', label: 'Q' },
				]),
				enabled: {
					type: 'dropdown',
					id: 'enabled',
					label: 'Enabled',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
				shape: { type: 'dropdown', id: 'shape', label: 'Shape', default: 4, choices: EQ_SHAPES },
				frequency: num('frequency', 'Frequency (Hz)', 1000, 20, 20000, 1),
				gain: num('gain', 'Gain (dB)', 0, -20, 20),
				qFactor: num('qFactor', 'Q', 0.7, 0.3, 10.3, 0.01),
			}),
			callback: async ({ options }) => {
				const t = parseTarget(options)
				if (!t) return
				const band = Math.max(0, Math.round(options.band) - 1)
				const p = options.properties
				const bands = t.master ? fl()?.master?.equalizer?.bands : sourceState(t)?.equalizer?.bands
				const out: { bandEnabled?: boolean; shape?: number; frequency?: number; gain?: number; qFactor?: number } = {}
				if (p.includes('enabled')) out.bandEnabled = resolveTrueFalseToggle(options.enabled, bands?.[band]?.bandEnabled)
				if (p.includes('shape')) out.shape = Number(options.shape)
				if (p.includes('frequency')) out.frequency = Math.round(options.frequency)
				if (p.includes('gain')) out.gain = Math.round(options.gain * 100)
				if (p.includes('qFactor')) out.qFactor = Math.round(options.qFactor * 100)
				if (t.master) await atem?.setFairlightAudioMixerMasterEqualizerBandProps(band, out)
				else await atem?.setFairlightAudioMixerSourceEqualizerBandProps(t.input, t.source, band, out)
			},
		},
		['fairlightAudioCompressor']: {
			name: 'Fairlight Audio: Compressor',
			options: convertOptionsFields({
				...targetFields(),
				properties: props([
					{ id: 'enabled', label: 'Enabled' },
					{ id: 'threshold', label: 'Threshold' },
					{ id: 'ratio', label: 'Ratio' },
					{ id: 'attack', label: 'Attack' },
					{ id: 'hold', label: 'Hold' },
					{ id: 'release', label: 'Release' },
				]),
				enabled: {
					type: 'dropdown',
					id: 'enabled',
					label: 'Enabled',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
				threshold: num('threshold', 'Threshold (dB)', -20, -50, 0),
				ratio: num('ratio', 'Ratio (x:1)', 3, 1.2, 20),
				attack: num('attack', 'Attack (ms)', 1.4, 0.7, 100),
				hold: num('hold', 'Hold (ms)', 0, 0, 4000),
				release: num('release', 'Release (ms)', 93, 50, 4000),
			}),
			callback: async ({ options }) => {
				const t = parseTarget(options)
				if (!t) return
				const p = options.properties
				const cur = t.master ? fl()?.master?.dynamics?.compressor : sourceState(t)?.dynamics?.compressor
				const out: {
					compressorEnabled?: boolean
					threshold?: number
					ratio?: number
					attack?: number
					hold?: number
					release?: number
				} = {}
				if (p.includes('enabled'))
					out.compressorEnabled = resolveTrueFalseToggle(options.enabled, cur?.compressorEnabled)
				if (p.includes('threshold')) out.threshold = Math.round(options.threshold * 100)
				if (p.includes('ratio')) out.ratio = Math.round(options.ratio * 100)
				if (p.includes('attack')) out.attack = Math.round(options.attack * 100)
				if (p.includes('hold')) out.hold = Math.round(options.hold * 100)
				if (p.includes('release')) out.release = Math.round(options.release * 100)
				if (t.master) await atem?.setFairlightAudioMixerMasterCompressorProps(out)
				else await atem?.setFairlightAudioMixerSourceCompressorProps(t.input, t.source, out)
			},
		},
		['fairlightAudioLimiter']: {
			name: 'Fairlight Audio: Limiter',
			options: convertOptionsFields({
				...targetFields(),
				properties: props([
					{ id: 'enabled', label: 'Enabled' },
					{ id: 'threshold', label: 'Threshold' },
					{ id: 'attack', label: 'Attack' },
					{ id: 'hold', label: 'Hold' },
					{ id: 'release', label: 'Release' },
				]),
				enabled: {
					type: 'dropdown',
					id: 'enabled',
					label: 'Enabled',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
				threshold: num('threshold', 'Threshold (dB)', -3, -30, 0),
				attack: num('attack', 'Attack (ms)', 0.7, 0.7, 30),
				hold: num('hold', 'Hold (ms)', 0, 0, 4000),
				release: num('release', 'Release (ms)', 93, 50, 4000),
			}),
			callback: async ({ options }) => {
				const t = parseTarget(options)
				if (!t) return
				const p = options.properties
				const cur = t.master ? fl()?.master?.dynamics?.limiter : sourceState(t)?.dynamics?.limiter
				const out: { limiterEnabled?: boolean; threshold?: number; attack?: number; hold?: number; release?: number } =
					{}
				if (p.includes('enabled')) out.limiterEnabled = resolveTrueFalseToggle(options.enabled, cur?.limiterEnabled)
				if (p.includes('threshold')) out.threshold = Math.round(options.threshold * 100)
				if (p.includes('attack')) out.attack = Math.round(options.attack * 100)
				if (p.includes('hold')) out.hold = Math.round(options.hold * 100)
				if (p.includes('release')) out.release = Math.round(options.release * 100)
				if (t.master) await atem?.setFairlightAudioMixerMasterLimiterProps(out)
				else await atem?.setFairlightAudioMixerSourceLimiterProps(t.input, t.source, out)
			},
		},
		['fairlightAudioLevelsVariable']: {
			name: 'Fairlight Audio: Publish levels in the audio_levels_json variable',
			description: 'The switcher sends levels many times a second; enable only while a meter is shown',
			options: convertOptionsFields({
				enabled: { type: 'dropdown', id: 'enabled', label: 'Enabled', default: 'true', choices: CHOICES_ON_OFF_TOGGLE },
			}),
			callback: async ({ options }) => {
				setLevelsVariable(resolveTrueFalseToggle(options.enabled, levelsVariableEnabled()))
			},
		},
	}
}
