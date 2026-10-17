import type { CompanionPresetGroup } from '@companion-module/base'
import { type AtemState } from 'atem-connection'
import { InternalPortType } from 'atem-connection/dist/enums/index.js'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'
import { CCU_PARAMS } from '../actions/cameraControl/protocol.js'

/*
 * Camera control (CCU) presets: camera select buttons, then the controls of a usual RCP acting on
 * the selected camera (camera 0 in the CCU actions). Adjustments come as - / + buttons and as a
 * knob (rotate left / right) for Stream Deck + style encoders.
 */

type Opts = Record<string, unknown>

/** a CCU action's options: the selected camera, every field (0 when offsetting, else its default) */
function ccu(id: string, values: Opts = {}, offset = false): { actionId: string; options: Opts } {
	const p = CCU_PARAMS.find((x) => x.id === id)
	if (!p) throw new Error(`No CCU parameter ${id}`)
	const options: Opts = { cameraId: 0 }
	if (p.offset) options.mode = offset ? 'offset' : 'set'
	for (const f of p.fields) options[f.id] = offset && (!f.kind || f.kind === 'number') ? 0 : f.default
	return { actionId: id, options: { ...options, ...values } }
}

interface Button {
	id: string
	name: string
	text: string
	bg: number
	down?: Array<{ actionId: string; options: Opts }>
	up?: Array<{ actionId: string; options: Opts }>
	left?: Array<{ actionId: string; options: Opts }>
	right?: Array<{ actionId: string; options: Opts }>
}

export function createCcuPresets(context: PresetsBuilderContext, state: AtemState, enabled: boolean): void {
	if (!enabled) return
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'ccu',
		name: 'Camera Control (CCU)',
		description: 'Pick a camera with a camera button; the other buttons act on the selected camera',
		definitions: groups,
	})
	const add = (group: string, groupName: string, buttons: Button[]) => {
		for (const b of buttons) {
			context.definitions[b.id] = {
				name: b.name,
				type: 'simple',
				style: { text: b.text, size: '14', color: 0xffffff, bgcolor: b.bg },
				feedbacks: [],
				steps: [
					{
						down: b.down ?? [],
						up: b.up ?? [],
						...(b.left ? { rotate_left: b.left } : {}),
						...(b.right ? { rotate_right: b.right } : {}),
					},
				],
			} as any
		}
		groups.push({ id: group, name: groupName, type: 'simple', presets: buttons.map((b) => b.id) })
	}
	/** - / + buttons and a knob for one value */
	const adjust = (
		id: string,
		name: string,
		param: string,
		field: string,
		step: number,
		knobStep: number,
		bg: number,
	) => [
		{ id: `${id}_down`, name: `${name} -`, text: `${name}\n-`, bg, down: [ccu(param, { [field]: -step }, true)] },
		{ id: `${id}_up`, name: `${name} +`, text: `${name}\n+`, bg, down: [ccu(param, { [field]: step }, true)] },
		{
			id: `${id}_knob`,
			name: `${name} (knob)`,
			text: `${name}\n◀ ▶`,
			bg,
			left: [ccu(param, { [field]: -knobStep }, true)],
			right: [ccu(param, { [field]: knobStep }, true)],
		},
	]

	// camera select
	let cameras = Object.values(state.inputs).filter((i) => i?.internalPortType === InternalPortType.External).length
	cameras = Math.min(20, Math.max(cameras, 8))
	context.definitions['ccu_select'] = {
		name: 'Select camera',
		type: 'simple',
		style: { text: 'CAM\n$(local:cam)', size: '18', color: 0xffffff, bgcolor: 0x000000 },
		feedbacks: [
			{
				feedbackId: 'ccuSelectedCamera',
				options: { cameraId: { isExpression: true, value: '$(local:cam)' } },
				style: { bgcolor: 0xffff00, color: 0x000000 },
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'ccuSelectCamera',
						options: { mode: 'set', cameraId: { isExpression: true, value: '$(local:cam)' }, count: cameras },
					},
				],
				up: [],
			},
		],
		localVariables: [{ variableType: 'simple', variableName: 'cam', startupValue: 1 }],
	} as any
	groups.push({
		id: 'ccu_cameras',
		name: 'Select camera',
		type: 'template',
		presetId: 'ccu_select',
		templateVariableName: 'cam',
		templateValues: Array.from({ length: cameras }, (_, i) => ({ name: `Camera ${i + 1}`, value: i + 1 })),
	})
	const sel = (mode: string) => ({ actionId: 'ccuSelectCamera', options: { mode, cameraId: 1, count: cameras } })
	add('ccu_cameras_step', 'Next / previous camera', [
		{ id: 'ccu_cam_prev', name: 'Previous camera', text: 'CAM\n◀', bg: 0x000000, down: [sel('previous')] },
		{ id: 'ccu_cam_next', name: 'Next camera', text: 'CAM\n▶', bg: 0x000000, down: [sel('next')] },
		{
			id: 'ccu_cam_knob',
			name: 'Camera (knob)',
			text: 'CAM\n◀ ▶',
			bg: 0x000000,
			left: [sel('previous')],
			right: [sel('next')],
		},
	])

	// lens
	const lens = 0x1f4e79
	add('ccu_lens', 'Lens', [
		...adjust('ccu_focus', 'Focus', 'ccuLensFocus', 'value', 0.02, 0.005, lens),
		{ id: 'ccu_af', name: 'Auto focus', text: 'Auto\nfocus', bg: lens, down: [ccu('ccuLensAutoFocus')] },
		...adjust('ccu_iris', 'Iris', 'ccuLensApertureNormalised', 'value', 0.05, 0.01, lens),
		{ id: 'ccu_ai', name: 'Auto iris', text: 'Auto\niris', bg: lens, down: [ccu('ccuLensAutoAperture')] },
		{
			id: 'ccu_zoom_wide',
			name: 'Zoom wide (hold)',
			text: 'Zoom\nwide',
			bg: lens,
			down: [ccu('ccuLensZoomSpeed', { value: -0.6 })],
			up: [ccu('ccuLensZoomSpeed', { value: 0 })],
		},
		{
			id: 'ccu_zoom_tele',
			name: 'Zoom tele (hold)',
			text: 'Zoom\ntele',
			bg: lens,
			down: [ccu('ccuLensZoomSpeed', { value: 0.6 })],
			up: [ccu('ccuLensZoomSpeed', { value: 0 })],
		},
		...adjust('ccu_zoompos', 'Zoom', 'ccuLensZoomNormalised', 'value', 0.05, 0.01, lens),
		{
			id: 'ccu_ois_on',
			name: 'Stabilisation on',
			text: 'OIS\non',
			bg: lens,
			down: [ccu('ccuLensOis', { value: true })],
		},
		{
			id: 'ccu_ois_off',
			name: 'Stabilisation off',
			text: 'OIS\noff',
			bg: lens,
			down: [ccu('ccuLensOis', { value: false })],
		},
	])

	// exposure and white balance
	const exp = 0x5b3a00
	add('ccu_exposure', 'Exposure and white balance', [
		...adjust('ccu_gain', 'Gain dB', 'ccuVideoGain', 'value', 2, 1, exp),
		...adjust('ccu_iso', 'ISO', 'ccuVideoIso', 'value', 100, 50, exp),
		...adjust('ccu_shutter', 'Shutter°', 'ccuVideoShutterAngle', 'value', 1500, 500, exp),
		...[9000, 17280, 18000, 27000, 36000].map((a) => ({
			id: `ccu_shutter_${a}`,
			name: `Shutter ${a / 100}°`,
			text: `Shutter\n${a / 100}°`,
			bg: exp,
			down: [ccu('ccuVideoShutterAngle', { value: a })],
		})),
		...adjust('ccu_nd', 'ND', 'ccuVideoNdFilter', 'stop', 1, 1, exp),
		...adjust('ccu_wb', 'WB K', 'ccuVideoWhiteBalance', 'temp', 100, 50, exp),
		...adjust('ccu_tint', 'Tint', 'ccuVideoWhiteBalance', 'tint', 2, 1, exp),
		...[3200, 4500, 5600, 6500].map((k) => ({
			id: `ccu_wb_${k}`,
			name: `White balance ${k} K`,
			text: `WB\n${k}K`,
			bg: exp,
			down: [ccu('ccuVideoWhiteBalance', { temp: k, tint: 0 })],
		})),
		{ id: 'ccu_awb', name: 'Auto white balance', text: 'Auto\nWB', bg: exp, down: [ccu('ccuVideoAutoWhiteBalance')] },
	])

	// colour correction
	const channels: Array<[string, string, number]> = [
		['red', 'R', 0x7a1010],
		['green', 'G', 0x106010],
		['blue', 'B', 0x10307a],
		['luma', 'Y', 0x404040],
	]
	for (const [param, name, step] of [
		['ccuColorLift', 'Lift', 0.01],
		['ccuColorGamma', 'Gamma', 0.02],
		['ccuColorGain', 'Gain', 0.05],
		['ccuColorOffset', 'Offset', 0.05],
	] as Array<[string, string, number]>) {
		add(
			`ccu_${name.toLowerCase()}`,
			`Colour: ${name}`,
			channels.flatMap(([field, ch, bg]) =>
				adjust(`ccu_${name.toLowerCase()}_${field}`, `${name} ${ch}`, param, field, step, step / 2, bg),
			),
		)
	}
	const col = 0x3d2a5c
	add('ccu_colour', 'Colour: contrast, saturation, hue', [
		...adjust('ccu_contrast', 'Contrast', 'ccuColorContrast', 'adjust', 0.05, 0.02, col),
		...adjust('ccu_pivot', 'Pivot', 'ccuColorContrast', 'pivot', 0.05, 0.02, col),
		...adjust('ccu_sat', 'Saturation', 'ccuColorHueSaturation', 'sat', 0.05, 0.02, col),
		...adjust('ccu_hue', 'Hue', 'ccuColorHueSaturation', 'hue', 0.02, 0.01, col),
		...adjust('ccu_lumamix', 'Luma mix', 'ccuColorLumaMix', 'value', 0.05, 0.02, col),
		{ id: 'ccu_colour_reset', name: 'Colour reset', text: 'Colour\nreset', bg: 0x600000, down: [ccu('ccuColorReset')] },
	])

	// camera audio
	const aud = 0x1a4a4a
	add('ccu_audio', 'Audio', [
		...adjust('ccu_mic', 'Mic', 'ccuAudioMicLevel', 'value', 0.05, 0.02, aud),
		...adjust('ccu_in1', 'In 1', 'ccuAudioInputLevels', 'ch1', 0.05, 0.02, aud),
		...adjust('ccu_in2', 'In 2', 'ccuAudioInputLevels', 'ch2', 0.05, 0.02, aud),
		...adjust('ccu_phones', 'Phones', 'ccuAudioHeadphoneLevel', 'value', 0.05, 0.02, aud),
		...adjust('ccu_phonesmix', 'Phones mix', 'ccuAudioHeadphoneMix', 'value', 0.05, 0.02, aud),
		...adjust('ccu_speaker', 'Speaker', 'ccuAudioSpeakerLevel', 'value', 0.05, 0.02, aud),
		...['Internal mic', 'Line', 'Low mic', 'High mic'].map((label, value) => ({
			id: `ccu_audio_input_${value}`,
			name: `Audio input: ${label}`,
			text: `Input\n${label}`,
			bg: aud,
			down: [ccu('ccuAudioInputType', { value })],
		})),
		{
			id: 'ccu_phantom_on',
			name: 'Phantom power on',
			text: '48V\non',
			bg: 0x603000,
			down: [ccu('ccuAudioPhantomPower', { value: true })],
		},
		{
			id: 'ccu_phantom_off',
			name: 'Phantom power off',
			text: '48V\noff',
			bg: aud,
			down: [ccu('ccuAudioPhantomPower', { value: false })],
		},
	])

	// display, tally
	const disp = 0x2f4f4f
	add('ccu_display', 'Display and tally', [
		{
			id: 'ccu_bars_on',
			name: 'Colour bars on',
			text: 'Bars\non',
			bg: disp,
			down: [ccu('ccuDisplayColorBars', { value: 30 })],
		},
		{
			id: 'ccu_bars_off',
			name: 'Colour bars off',
			text: 'Bars\noff',
			bg: disp,
			down: [ccu('ccuDisplayColorBars', { value: 0 })],
		},
		{
			id: 'ccu_tools_off',
			name: 'Tools off',
			text: 'Tools\noff',
			bg: disp,
			down: [ccu('ccuDisplayTools', { value: [] })],
		},
		{ id: 'ccu_zebra', name: 'Zebra', text: 'Zebra', bg: disp, down: [ccu('ccuDisplayTools', { value: [1] })] },
		{
			id: 'ccu_peaking',
			name: 'Focus assist',
			text: 'Focus\nassist',
			bg: disp,
			down: [ccu('ccuDisplayTools', { value: [2] })],
		},
		{
			id: 'ccu_falsecolour',
			name: 'False colour',
			text: 'False\ncolour',
			bg: disp,
			down: [ccu('ccuDisplayTools', { value: [4] })],
		},
		{
			id: 'ccu_pgm_return_on',
			name: 'Program return on',
			text: 'PGM\nreturn',
			bg: disp,
			down: [ccu('ccuDisplayProgramReturn', { value: 30 })],
		},
		{
			id: 'ccu_pgm_return_off',
			name: 'Program return off',
			text: 'PGM\nret off',
			bg: disp,
			down: [ccu('ccuDisplayProgramReturn', { value: 0 })],
		},
		...[0, 0.5, 1].map((v) => ({
			id: `ccu_tally_${v * 100}`,
			name: `Tally brightness ${v * 100}%`,
			text: `Tally\n${v * 100}%`,
			bg: disp,
			down: [ccu('ccuTallyBrightness', { value: v })],
		})),
	])

	// media
	const media = 0x600000
	add('ccu_media', 'Recording', [
		{ id: 'ccu_rec', name: 'Record', text: 'REC', bg: media, down: [ccu('ccuMediaTransport', { mode: 2, speed: 0 })] },
		{
			id: 'ccu_stop',
			name: 'Stop',
			text: 'STOP',
			bg: 0x303030,
			down: [ccu('ccuMediaTransport', { mode: 0, speed: 0 })],
		},
		{ id: 'ccu_still', name: 'Still capture', text: 'Still', bg: 0x303030, down: [ccu('ccuMediaStillCapture')] },
		{
			id: 'ccu_goodtake',
			name: 'Good take',
			text: 'Good\ntake',
			bg: 0x106010,
			down: [ccu('ccuMetaGoodTake', { value: true })],
		},
	])

	// PTZ
	const ptz = 0x204020
	const move = (id: string, name: string, text: string, pan: number, tilt: number): Button => ({
		id,
		name,
		text,
		bg: ptz,
		down: [ccu('ccuPtzVelocity', { pan, tilt })],
		up: [ccu('ccuPtzVelocity', { pan: 0, tilt: 0 })],
	})
	add('ccu_ptz', 'PTZ', [
		move('ccu_ptz_left', 'Pan left (hold)', 'Pan\n◀', -0.5, 0),
		move('ccu_ptz_right', 'Pan right (hold)', 'Pan\n▶', 0.5, 0),
		move('ccu_ptz_up', 'Tilt up (hold)', 'Tilt\n▲', 0, 0.5),
		move('ccu_ptz_down', 'Tilt down (hold)', 'Tilt\n▼', 0, -0.5),
		...Array.from({ length: 6 }, (_, i) => ({
			id: `ccu_ptz_recall_${i + 1}`,
			name: `Recall preset ${i + 1}`,
			text: `PTZ\n${i + 1}`,
			bg: ptz,
			down: [ccu('ccuPtzPreset', { action: 2, slot: i })],
		})),
		...Array.from({ length: 6 }, (_, i) => ({
			id: `ccu_ptz_store_${i + 1}`,
			name: `Store preset ${i + 1}`,
			text: `Store\n${i + 1}`,
			bg: 0x403000,
			down: [ccu('ccuPtzPreset', { action: 1, slot: i })],
		})),
	])
}
