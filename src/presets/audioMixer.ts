import type { CompanionPresetGroup } from '@companion-module/base'
import type { AtemState } from 'atem-connection'
import { AtemAudioInputPicker, GetAudioInputsList } from '../options/audio.js'
import type { PresetsBuilderContext } from './context.js'
import { audioLevelVariable } from './audioLevels.js'
import { ButtonGraphicsDecorationType, ButtonGraphicsShowStatusIcons } from '@companion-module/base'
import type { AtemSchema } from '../schema.js'

/*
 * Audio mixer presets: per input (a template over the audio inputs, the input in $(local:input))
 * on / off / AFV, fader, input gain, pan, solo, and the EQ, compressor and limiter switches; then
 * the master, the monitor and talkback. Faders and gains come as - / + buttons and knobs.
 * Fairlight switchers get the Fairlight set, the older ones the classic mixer's.
 */

const NOFADE = { fadeDuration: 0, fadeAlgorithm: 'linear', fadeCurve: 'ease-in' }
const input = { isExpression: true, value: '$(local:input)' }
const stereo = '-65280'
const NAME = '$(atem:audio_input_$(local:input)_short)'

type Action = { actionId: string; options: Record<string, unknown> }
interface Button {
	id: string
	name: string
	text: string
	bg?: number
	down?: Action[]
	left?: Action[]
	right?: Action[]
	feedbacks?: Array<{ feedbackId: string; options: Record<string, unknown>; style: Record<string, unknown> }>
	/** the input's level meters down the left and right edges */
	meters?: boolean
}

/** a vertical meter bar along one edge of the button (the look of the audio_meter_stereo composite) */
function meterBar(id: string, x: number, level: string): any {
	return {
		type: 'gauge',
		id,
		x,
		y: 4,
		width: 9,
		height: 92,
		orientation: 'vertical',
		min: -60,
		max: 0,
		value: { isExpression: true, value: level },
		multiColour: true,
		trackStyle: 'dimmed',
		roundedEnds: false,
		stops: [
			{ value: -60, color: 0x00c800, gradient: false },
			{ value: -20, color: 0xe6c800, gradient: false },
			{ value: -10, color: 0xdc0000, gradient: false },
		],
	}
}

export function createAudioMixerPresets(context: PresetsBuilderContext, state: AtemState): void {
	const fairlight = !!context.model.fairlightAudio
	if (!fairlight && !context.model.classicAudio) return
	const picker = AtemAudioInputPicker(context.model, state)
	if (!picker) return

	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'audio_mixer',
		name: 'Audio Mixer',
		description: 'Per input buttons come for every audio input; the input is in the button\'s local variable "input"',
		definitions: groups,
	})
	const inputs = GetAudioInputsList(context.model, state).map((c) => ({ name: c.shortName, value: c.id }))

	const define = (b: Button, perInput: boolean) => {
		if (b.meters) {
			context.definitions[b.id] = {
				name: b.name,
				type: 'layered',
				canvas: { decoration: ButtonGraphicsDecorationType.None, showStatusIcons: ButtonGraphicsShowStatusIcons.None },
				elements: [
					{ type: 'box', id: 'bg', x: 0, y: 0, width: 100, height: 100, color: b.bg ?? 0x202020 },
					meterBar('meterLeft', 2, '$(local:levelLeft)'),
					meterBar('meterRight', 89, '$(local:levelRight)'),
					{
						type: 'text',
						id: 'label',
						x: 13,
						y: 0,
						width: 74,
						height: 100,
						text: b.text,
						halign: 'center',
						valign: 'center',
						fontsizeAllowShrink: true,
						color: 0xffffff,
						outlineColor: 0x000000,
					},
				],
				feedbacks: (b.feedbacks ?? []).map((f) => ({
					feedbackId: f.feedbackId,
					options: f.options,
					styleOverrides: [
						...(f.style.bgcolor !== undefined
							? [{ elementId: 'bg', elementProperty: 'color', override: f.style.bgcolor }]
							: []),
						...(f.style.color !== undefined
							? [{ elementId: 'label', elementProperty: 'color', override: f.style.color }]
							: []),
					],
				})),
				steps: [{ down: b.down ?? [], up: [] }],
				localVariables: [
					audioLevelVariable(context, 'levelLeft', '$(local:input)', 'Left'),
					audioLevelVariable(context, 'levelRight', '$(local:input)', 'Right'),
					{ variableType: 'simple', variableName: 'input', startupValue: 1 },
				],
			} as any
			return
		}
		context.definitions[b.id] = {
			name: b.name,
			type: 'simple',
			style: { text: b.text, size: '14', color: 0xffffff, bgcolor: b.bg ?? 0x202020 },
			feedbacks: b.feedbacks ?? [],
			steps: [
				{
					down: b.down ?? [],
					up: [],
					...(b.left ? { rotate_left: b.left } : {}),
					...(b.right ? { rotate_right: b.right } : {}),
				},
			],
			...(perInput ? { localVariables: [{ variableType: 'simple', variableName: 'input', startupValue: 1 }] } : {}),
		} as any
	}
	/** a group of buttons, one of each per audio input */
	const perInput = (group: string, name: string, buttons: Button[]) => {
		for (const b of buttons) {
			define(b, true)
			groups.push({
				id: `${group}_${b.id}`,
				name: `${name}: ${b.name}`,
				type: 'template',
				presetId: b.id,
				templateVariableName: 'input',
				templateValues: inputs,
			})
		}
	}
	const simple = (group: string, name: string, buttons: Button[]) => {
		for (const b of buttons) define(b, false)
		groups.push({ id: group, name, type: 'simple', presets: buttons.map((b) => b.id) })
	}
	/** - / + buttons and a knob */
	const adjust = (
		id: string,
		name: string,
		text: string,
		act: (d: number) => Action,
		step: number,
		knob: number,
		bg: number,
	) => [
		{ id: `${id}_down`, name: `${name} -`, text: `${text}\n-`, bg, down: [act(-step)] },
		{ id: `${id}_up`, name: `${name} +`, text: `${text}\n+`, bg, down: [act(step)] },
		{ id: `${id}_knob`, name: `${name} (knob)`, text: `${text}\n◀ ▶`, bg, left: [act(-knob)], right: [act(knob)] },
	]

	if (fairlight) {
		const fl = (actionId: string, options: Record<string, unknown>): Action => ({
			actionId,
			options: { input, source: stereo, ...options },
		})
		const mixFeedback = (option: string, bgcolor: number) => ({
			feedbackId: 'fairlightAudioMixOption',
			options: { input, source: stereo, option },
			style: { bgcolor, color: 0x000000 },
		})
		const dyn = (actionId: string): Action => ({
			actionId,
			options: { input: '$(local:input)', source: stereo, properties: ['enabled'], enabled: 'toggle' },
		})
		perInput('audio_fl', 'Input', [
			{
				id: 'audio_fl_onoff',
				name: 'On / off',
				text: NAME,
				meters: true,
				down: [fl('fairlightAudioMixOption', { option: 'toggle' })],
				feedbacks: [mixFeedback('on', 0x00c800), mixFeedback('afv', 0xe6c800)],
			},
			{
				id: 'audio_fl_afv',
				name: 'Audio follow video',
				text: `${NAME}\nAFV`,
				down: [fl('fairlightAudioMixOption', { option: 'afv' })],
				feedbacks: [mixFeedback('afv', 0xe6c800)],
			},
			{
				id: 'audio_fl_off',
				name: 'Off',
				text: `${NAME}\nOFF`,
				down: [fl('fairlightAudioMixOption', { option: 'off' })],
				feedbacks: [mixFeedback('off', 0xdc0000)],
			},
			...adjust(
				'audio_fl_fader',
				'Fader',
				`${NAME}\nfader`,
				(d) => fl('fairlightAudioFaderGainDelta', { delta: d, ...NOFADE }),
				3,
				1,
				0x202040,
			),
			{
				id: 'audio_fl_fader_0',
				name: 'Fader to 0 dB',
				text: `${NAME}\n0 dB`,
				down: [fl('fairlightAudioFaderGain', { gain: 0, ...NOFADE, fadeDuration: 500 })],
			},
			{
				id: 'audio_fl_fader_out',
				name: 'Fade out',
				text: `${NAME}\nfade out`,
				down: [fl('fairlightAudioFaderGain', { gain: -100, ...NOFADE, fadeDuration: 1000 })],
			},
			...adjust(
				'audio_fl_gain',
				'Input gain',
				`${NAME}\ngain`,
				(d) => fl('fairlightAudioInputGainDelta', { delta: d, ...NOFADE }),
				3,
				1,
				0x402020,
			),
			...adjust(
				'audio_fl_pan',
				'Pan',
				`${NAME}\npan`,
				(d) => fl('fairlightAudioInputPanDelta', { delta: d, ...NOFADE }),
				10,
				5,
				0x204020,
			),
			{
				id: 'audio_fl_solo',
				name: 'Solo',
				text: `${NAME}\nSOLO`,
				down: [fl('fairlightAudioMonitorSolo', { solo: 'toggle' })],
				feedbacks: [
					{
						feedbackId: 'fairlightAudioMonitorSolo',
						options: { nothing: false, input, source: stereo },
						style: { bgcolor: 0xe6c800, color: 0x000000 },
					},
				],
			},
			{ id: 'audio_fl_eq', name: 'EQ on / off', text: `${NAME}\nEQ`, down: [dyn('fairlightAudioEqualizer')] },
			{
				id: 'audio_fl_comp',
				name: 'Compressor on / off',
				text: `${NAME}\nCOMP`,
				down: [dyn('fairlightAudioCompressor')],
			},
			{ id: 'audio_fl_lim', name: 'Limiter on / off', text: `${NAME}\nLIM`, down: [dyn('fairlightAudioLimiter')] },
		])
		const master = (actionId: string, options: Record<string, unknown>): Action => ({ actionId, options })
		simple('audio_fl_master', 'Master, monitor and talkback', [
			...adjust(
				'audio_fl_mst',
				'Master',
				'Master',
				(d) => master('fairlightAudioMasterGainDelta', { delta: d, ...NOFADE }),
				3,
				1,
				0x402040,
			),
			{
				id: 'audio_fl_mst_0',
				name: 'Master to 0 dB',
				text: 'Master\n0 dB',
				down: [master('fairlightAudioMasterGain', { gain: 0, ...NOFADE })],
			},
			{
				id: 'audio_fl_mst_eq',
				name: 'Master EQ on / off',
				text: 'Master\nEQ',
				down: [
					master('fairlightAudioEqualizer', {
						input: 'master',
						source: stereo,
						properties: ['enabled'],
						enabled: 'toggle',
					}),
				],
			},
			{
				id: 'audio_fl_mst_comp',
				name: 'Master compressor on / off',
				text: 'Master\nCOMP',
				down: [
					master('fairlightAudioCompressor', {
						input: 'master',
						source: stereo,
						properties: ['enabled'],
						enabled: 'toggle',
					}),
				],
			},
			{
				id: 'audio_fl_mst_lim',
				name: 'Master limiter on / off',
				text: 'Master\nLIM',
				down: [
					master('fairlightAudioLimiter', {
						input: 'master',
						source: stereo,
						properties: ['enabled'],
						enabled: 'toggle',
					}),
				],
			},
			...adjust(
				'audio_fl_mon',
				'Monitor',
				'Monitor',
				(d) => master('fairlightAudioMonitorGainDelta', { delta: d, ...NOFADE }),
				3,
				1,
				0x204040,
			),
			{
				id: 'audio_fl_mon_mute',
				name: 'Monitor mute',
				text: 'Monitor\nmute',
				down: [master('fairlightAudioMonitorMasterMuted', { state: 'toggle' })],
				feedbacks: [
					{
						feedbackId: 'fairlightAudioMonitorMasterMuted',
						options: {},
						style: { bgcolor: 0xdc0000, color: 0xffffff },
					},
				],
			},
			{
				id: 'audio_fl_tb_mute',
				name: 'Talkback mute',
				text: 'Talkback\nmute',
				down: [master('fairlightAudioMonitorTalkbackMuted', { state: 'toggle' })],
				feedbacks: [
					{
						feedbackId: 'fairlightAudioMonitorTalkbackMuted',
						options: {},
						style: { bgcolor: 0xdc0000, color: 0xffffff },
					},
				],
			},
			{
				id: 'audio_fl_peaks',
				name: 'Reset peaks',
				text: 'Reset\npeaks',
				down: [master('fairlightAudioResetPeaks', { reset: 'all' })],
			},
		])
	} else {
		const ca = (actionId: string, options: Record<string, unknown>): Action => ({
			actionId,
			options: { input, ...options },
		})
		const mixFeedback = (option: number, bgcolor: number) => ({
			feedbackId: 'classicAudioMixOption',
			options: { input, option },
			style: { bgcolor, color: 0x000000 },
		})
		perInput('audio_ca', 'Input', [
			{
				id: 'audio_ca_onoff',
				name: 'On / off',
				text: NAME,
				meters: true,
				down: [ca('classicAudioMixOption', { option: 'toggle' })],
				feedbacks: [mixFeedback(1, 0x00c800), mixFeedback(2, 0xe6c800)],
			},
			{
				id: 'audio_ca_afv',
				name: 'Audio follow video',
				text: `${NAME}\nAFV`,
				down: [ca('classicAudioMixOption', { option: 2 })],
				feedbacks: [mixFeedback(2, 0xe6c800)],
			},
			...adjust(
				'audio_ca_gain',
				'Gain',
				`${NAME}\ngain`,
				(d) => ca('classicAudioGainDelta', { delta: d, ...NOFADE }),
				3,
				1,
				0x202040,
			),
			{
				id: 'audio_ca_gain_0',
				name: 'Gain to 0 dB',
				text: `${NAME}\n0 dB`,
				down: [ca('classicAudioGain', { gain: 0, ...NOFADE, fadeDuration: 500 })],
			},
		])
		const master = (actionId: string, options: Record<string, unknown>): Action => ({ actionId, options })
		simple('audio_ca_master', 'Master', [
			...adjust(
				'audio_ca_mst',
				'Master',
				'Master',
				(d) => master('classicAudioMasterGainDelta', { delta: d, ...NOFADE }),
				3,
				1,
				0x402040,
			),
			{
				id: 'audio_ca_mst_0',
				name: 'Master to 0 dB',
				text: 'Master\n0 dB',
				down: [master('classicAudioMasterGain', { gain: 0, ...NOFADE })],
			},
			...adjust(
				'audio_ca_pan',
				'Master pan',
				'Master\npan',
				(d) => master('classicAudioMasterPanDelta', { delta: d, ...NOFADE }),
				10,
				5,
				0x204020,
			),
			{
				id: 'audio_ca_peaks',
				name: 'Reset peaks',
				text: 'Reset\npeaks',
				down: [master('classicAudioResetPeaks', { reset: 'all' })],
			},
		])
	}
}
