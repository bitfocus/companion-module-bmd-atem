/*
 * The Blackmagic camera control protocol (as the ATEM forwards it to cameras over SDI / its
 * camera control port), one entry per parameter. Each entry becomes a "Camera Control (CCU)"
 * action; values are sent in the protocol's own units, in the order of the fields.
 */

export type CcuType = 'void' | 'bool' | 'i8' | 'i16' | 'i32' | 'i64' | 'fixed' | 'string'

export interface CcuChoice {
	id: number
	label: string
}

export interface CcuField {
	id: string
	label: string
	/** number (default), a dropdown (choices), bit flags OR'd together (flags), a checkbox (bool), text (text) */
	kind?: 'number' | 'dropdown' | 'flags' | 'bool' | 'text'
	min?: number
	max?: number
	default: number | string | boolean | number[]
	choices?: CcuChoice[]
	description?: string
}

export interface CcuParam {
	/** action id */
	id: string
	group: string
	name: string
	category: number
	parameter: number
	type: CcuType
	fields: CcuField[]
	/** can be sent as an offset to the current value */
	offset?: boolean
	/** values computed from the options instead of the fields as they are */
	encode?: (o: Record<string, any>) => Array<number | bigint>
	description?: string
}

const ch = (...labels: string[]): CcuChoice[] => labels.map((label, id) => ({ id, label }))
const unit = (id: string, label: string, def = 0.5, min = 0, max = 1): CcuField => ({
	id,
	label,
	min,
	max,
	default: def,
})
const rgby = (min: number, max: number, def: number): CcuField[] => [
	unit('red', 'Red', def, min, max),
	unit('green', 'Green', def, min, max),
	unit('blue', 'Blue', def, min, max),
	unit('luma', 'Luma', def, min, max),
]
const text = (id: string, label: string, def = ''): CcuField => ({ id, label, kind: 'text', default: def })

const FRAME_GUIDES = ch('Off', '2.4:1', '2.39:1', '2.35:1', '1.85:1', '16:9', '14:9', '4:3', '2:1', '4:5', '1:1')
const MEDIA = ch('CFast', 'SD', 'SSD / USB')

/** BCD, eg 12:34:56:00 -> 0x12345600 */
const bcd = (digits: string): number => parseInt(digits, 16)
/** latitude / longitude as the protocol's BCD: sign nibble, 3 integer digits, 12 decimals */
function bcdDegrees(deg: number): bigint {
	const sign = deg < 0 ? '1' : '0'
	const [i, f = ''] = Math.abs(deg).toFixed(12).split('.')
	return BigInt('0x' + sign + i.padStart(3, '0').slice(-3) + f.padEnd(12, '0').slice(0, 12))
}

export const CCU_PARAMS: CcuParam[] = [
	// 0 Lens
	{
		id: 'ccuLensFocus',
		group: 'Lens',
		name: 'Focus',
		category: 0,
		parameter: 0,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Focus (0 near, 1 far)')],
	},
	{
		id: 'ccuLensAutoFocus',
		group: 'Lens',
		name: 'Instantaneous auto focus',
		category: 0,
		parameter: 1,
		type: 'void',
		fields: [],
	},
	{
		id: 'ccuLensApertureFStop',
		group: 'Lens',
		name: 'Aperture (f-stop)',
		category: 0,
		parameter: 2,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Aperture value (f-number = sqrt(2^value))', 4, -1, 16)],
	},
	{
		id: 'ccuLensApertureNormalised',
		group: 'Lens',
		name: 'Aperture (normalised)',
		category: 0,
		parameter: 3,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Aperture (0 smallest, 1 largest)')],
	},
	{
		id: 'ccuLensApertureOrdinal',
		group: 'Lens',
		name: 'Aperture (ordinal)',
		category: 0,
		parameter: 4,
		type: 'i16',
		offset: true,
		fields: [unit('value', 'Step (0 = widest)', 0, 0, 100)],
	},
	{
		id: 'ccuLensAutoAperture',
		group: 'Lens',
		name: 'Instantaneous auto aperture',
		category: 0,
		parameter: 5,
		type: 'void',
		fields: [],
	},
	{
		id: 'ccuLensOis',
		group: 'Lens',
		name: 'Optical image stabilisation',
		category: 0,
		parameter: 6,
		type: 'bool',
		fields: [{ id: 'value', label: 'Enabled', kind: 'bool', default: true }],
	},
	{
		id: 'ccuLensZoomMm',
		group: 'Lens',
		name: 'Zoom (focal length, mm)',
		category: 0,
		parameter: 7,
		type: 'i16',
		offset: true,
		fields: [unit('value', 'Focal length (mm)', 35, 0, 2000)],
	},
	{
		id: 'ccuLensZoomNormalised',
		group: 'Lens',
		name: 'Zoom (normalised)',
		category: 0,
		parameter: 8,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Zoom (0 wide, 1 tele)')],
	},
	{
		id: 'ccuLensZoomSpeed',
		group: 'Lens',
		name: 'Continuous zoom speed',
		category: 0,
		parameter: 9,
		type: 'fixed',
		fields: [unit('value', 'Speed (-1 wider, 0 stop, 1 tighter)', 0, -1, 1)],
	},

	// 1 Video
	{
		id: 'ccuVideoMode',
		group: 'Video',
		name: 'Video mode',
		category: 1,
		parameter: 0,
		type: 'i8',
		fields: [
			{
				id: 'rate',
				label: 'Frame rate',
				kind: 'dropdown',
				default: 25,
				choices: [23, 24, 25, 29, 30, 47, 48, 50, 59, 60].map((r) => ({ id: r, label: `${r}` })),
			},
			{ id: 'mrate', label: 'M-rate (x1000/1001)', kind: 'dropdown', default: 0, choices: ch('Regular', 'M-rate') },
			{
				id: 'dim',
				label: 'Dimensions',
				kind: 'dropdown',
				default: 3,
				choices: ch(
					'NTSC',
					'PAL',
					'720',
					'1080',
					'2K DCI',
					'2K 16:9',
					'UHD',
					'3K anamorphic',
					'4K DCI',
					'4K 16:9',
					'4.6K 2.4:1',
					'4.6K',
				),
			},
			{ id: 'interlaced', label: 'Scan', kind: 'dropdown', default: 0, choices: ch('Progressive', 'Interlaced') },
			{ id: 'colorspace', label: 'Colour space', kind: 'dropdown', default: 0, choices: ch('YUV') },
		],
	},
	{
		id: 'ccuVideoGainLegacy',
		group: 'Video',
		name: 'Sensor gain (camera 4.9 and older)',
		category: 1,
		parameter: 1,
		type: 'i8',
		fields: [
			{
				id: 'value',
				label: 'Gain',
				kind: 'dropdown',
				default: 8,
				choices: [1, 2, 4, 8, 16].map((g) => ({ id: g, label: `ISO ${g * 100}` })),
			},
		],
	},
	{
		id: 'ccuVideoWhiteBalance',
		group: 'Video',
		name: 'White balance',
		category: 1,
		parameter: 2,
		type: 'i16',
		offset: true,
		fields: [unit('temp', 'Colour temperature (K)', 5600, 2500, 10000), unit('tint', 'Tint', 0, -50, 50)],
	},
	{
		id: 'ccuVideoAutoWhiteBalance',
		group: 'Video',
		name: 'Set auto white balance',
		category: 1,
		parameter: 3,
		type: 'void',
		fields: [],
	},
	{
		id: 'ccuVideoRestoreAutoWhiteBalance',
		group: 'Video',
		name: 'Restore auto white balance',
		category: 1,
		parameter: 4,
		type: 'void',
		fields: [],
	},
	{
		id: 'ccuVideoExposureUs',
		group: 'Video',
		name: 'Exposure (us)',
		category: 1,
		parameter: 5,
		type: 'i32',
		offset: true,
		fields: [unit('value', 'Exposure (microseconds)', 20000, 1, 42000)],
	},
	{
		id: 'ccuVideoExposureOrdinal',
		group: 'Video',
		name: 'Exposure (ordinal)',
		category: 1,
		parameter: 6,
		type: 'i16',
		offset: true,
		fields: [unit('value', 'Step (0 = shortest)', 0, 0, 1000)],
	},
	{
		id: 'ccuVideoDynamicRange',
		group: 'Video',
		name: 'Dynamic range',
		category: 1,
		parameter: 7,
		type: 'i8',
		fields: [
			{ id: 'value', label: 'Mode', kind: 'dropdown', default: 1, choices: ch('Film', 'Video', 'Extended video') },
		],
	},
	{
		id: 'ccuVideoSharpening',
		group: 'Video',
		name: 'Sharpening',
		category: 1,
		parameter: 8,
		type: 'i8',
		fields: [
			{ id: 'value', label: 'Level', kind: 'dropdown', default: 0, choices: ch('Off', 'Low', 'Medium', 'High') },
		],
	},
	{
		id: 'ccuVideoRecordingFormat',
		group: 'Video',
		name: 'Recording format',
		category: 1,
		parameter: 9,
		type: 'i16',
		fields: [
			unit('fileRate', 'File frame rate', 25, 1, 240),
			unit('sensorRate', 'Sensor frame rate', 25, 1, 240),
			unit('width', 'Frame width', 3840, 1, 12288),
			unit('height', 'Frame height', 2160, 1, 6480),
			{
				id: 'flags',
				label: 'Flags',
				kind: 'flags',
				default: [],
				choices: [
					{ id: 1, label: 'File M-rate' },
					{ id: 2, label: 'Sensor M-rate' },
					{ id: 4, label: 'Sensor off speed' },
					{ id: 8, label: 'Interlaced' },
					{ id: 16, label: 'Windowed mode' },
				],
			},
		],
	},
	{
		id: 'ccuVideoAutoExposureMode',
		group: 'Video',
		name: 'Auto exposure mode',
		category: 1,
		parameter: 10,
		type: 'i8',
		fields: [
			{
				id: 'value',
				label: 'Mode',
				kind: 'dropdown',
				default: 0,
				choices: ch('Manual trigger', 'Iris', 'Shutter', 'Iris + shutter', 'Shutter + iris'),
			},
		],
	},
	{
		id: 'ccuVideoShutterAngle',
		group: 'Video',
		name: 'Shutter angle',
		category: 1,
		parameter: 11,
		type: 'i32',
		offset: true,
		fields: [unit('value', 'Angle (hundredths of a degree, 18000 = 180°)', 18000, 100, 36000)],
	},
	{
		id: 'ccuVideoShutterSpeed',
		group: 'Video',
		name: 'Shutter speed',
		category: 1,
		parameter: 12,
		type: 'i32',
		offset: true,
		fields: [unit('value', 'Speed (1/x s)', 50, 24, 2000)],
	},
	{
		id: 'ccuVideoGain',
		group: 'Video',
		name: 'Gain (dB)',
		category: 1,
		parameter: 13,
		type: 'i8',
		offset: true,
		fields: [unit('value', 'Gain (dB)', 0, -128, 127)],
	},
	{
		id: 'ccuVideoIso',
		group: 'Video',
		name: 'ISO',
		category: 1,
		parameter: 14,
		type: 'i32',
		offset: true,
		fields: [unit('value', 'ISO', 800, 0, 2147483647)],
	},
	{
		id: 'ccuVideoDisplayLut',
		group: 'Video',
		name: 'Display LUT',
		category: 1,
		parameter: 15,
		type: 'i8',
		fields: [
			{
				id: 'lut',
				label: 'LUT',
				kind: 'dropdown',
				default: 0,
				choices: ch('None', 'Custom', 'Film to video', 'Film to extended video'),
			},
			{ id: 'enabled', label: 'Enabled', kind: 'bool', default: true },
		],
	},
	{
		id: 'ccuVideoNdFilter',
		group: 'Video',
		name: 'ND filter',
		category: 1,
		parameter: 16,
		type: 'fixed',
		offset: true,
		fields: [
			unit('stop', 'Stop', 0, 0, 15),
			{ id: 'display', label: 'Display as', kind: 'dropdown', default: 0, choices: ch('Stop', 'Number', 'Fraction') },
		],
	},

	// 2 Audio
	{
		id: 'ccuAudioMicLevel',
		group: 'Audio',
		name: 'Mic level',
		category: 2,
		parameter: 0,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Level (0 - 1)')],
	},
	{
		id: 'ccuAudioHeadphoneLevel',
		group: 'Audio',
		name: 'Headphone level',
		category: 2,
		parameter: 1,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Level (0 - 1)')],
	},
	{
		id: 'ccuAudioHeadphoneMix',
		group: 'Audio',
		name: 'Headphone program mix',
		category: 2,
		parameter: 2,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Mix (0 - 1)')],
	},
	{
		id: 'ccuAudioSpeakerLevel',
		group: 'Audio',
		name: 'Speaker level',
		category: 2,
		parameter: 3,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Level (0 - 1)')],
	},
	{
		id: 'ccuAudioInputType',
		group: 'Audio',
		name: 'Input type',
		category: 2,
		parameter: 4,
		type: 'i8',
		fields: [
			{
				id: 'value',
				label: 'Input',
				kind: 'dropdown',
				default: 0,
				choices: ch('Internal mic', 'Line', 'Low mic', 'High mic'),
			},
		],
	},
	{
		id: 'ccuAudioInputLevels',
		group: 'Audio',
		name: 'Input levels',
		category: 2,
		parameter: 5,
		type: 'fixed',
		offset: true,
		fields: [unit('ch1', 'Channel 1 (0 - 1)'), unit('ch2', 'Channel 2 (0 - 1)')],
	},
	{
		id: 'ccuAudioPhantomPower',
		group: 'Audio',
		name: 'Phantom power',
		category: 2,
		parameter: 6,
		type: 'bool',
		fields: [{ id: 'value', label: 'Enabled', kind: 'bool', default: false }],
	},

	// 3 Output
	{
		id: 'ccuOutputOverlayEnable',
		group: 'Output',
		name: 'Overlays enable',
		category: 3,
		parameter: 0,
		type: 'i16',
		fields: [
			{
				id: 'value',
				label: 'Show',
				kind: 'flags',
				default: [1],
				choices: [
					{ id: 1, label: 'Status' },
					{ id: 2, label: 'Frame guides' },
				],
			},
		],
	},
	{
		id: 'ccuOutputFrameGuidesStyle',
		group: 'Output',
		name: 'Frame guides style (camera 3.x)',
		category: 3,
		parameter: 1,
		type: 'i8',
		fields: [
			{
				id: 'value',
				label: 'Style',
				kind: 'dropdown',
				default: 0,
				choices: ch('HDTV', '4:3', '2.4:1', '2.39:1', '2.35:1', '1.85:1', 'Thirds'),
			},
		],
	},
	{
		id: 'ccuOutputFrameGuidesOpacity',
		group: 'Output',
		name: 'Frame guides opacity (camera 3.x)',
		category: 3,
		parameter: 2,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Opacity (0.1 - 1)', 1, 0.1, 1)],
	},
	{
		id: 'ccuOutputOverlays',
		group: 'Output',
		name: 'Overlays',
		category: 3,
		parameter: 3,
		type: 'i8',
		fields: [
			{ id: 'guides', label: 'Frame guides', kind: 'dropdown', default: 0, choices: FRAME_GUIDES },
			unit('opacity', 'Frame guide opacity (%)', 100, 0, 100),
			unit('safe', 'Safe area (%, 0 off)', 0, 0, 100),
			{
				id: 'grid',
				label: 'Grid',
				kind: 'flags',
				default: [],
				choices: [
					{ id: 1, label: 'Thirds' },
					{ id: 2, label: 'Cross hairs' },
					{ id: 4, label: 'Centre dot' },
					{ id: 8, label: 'Horizon' },
				],
			},
		],
	},

	// 4 Display
	{
		id: 'ccuDisplayBrightness',
		group: 'Display',
		name: 'Brightness',
		category: 4,
		parameter: 0,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Brightness (0 - 1)')],
	},
	{
		id: 'ccuDisplayTools',
		group: 'Display',
		name: 'Exposure and focus tools',
		category: 4,
		parameter: 1,
		type: 'i16',
		fields: [
			{
				id: 'value',
				label: 'Show',
				kind: 'flags',
				default: [],
				choices: [
					{ id: 1, label: 'Zebra' },
					{ id: 2, label: 'Focus assist' },
					{ id: 4, label: 'False colour' },
				],
			},
		],
	},
	{
		id: 'ccuDisplayZebraLevel',
		group: 'Display',
		name: 'Zebra level',
		category: 4,
		parameter: 2,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Level (0 - 1)', 0.95)],
	},
	{
		id: 'ccuDisplayPeakingLevel',
		group: 'Display',
		name: 'Peaking level',
		category: 4,
		parameter: 3,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Level (0 - 1)')],
	},
	{
		id: 'ccuDisplayColorBars',
		group: 'Display',
		name: 'Colour bars',
		category: 4,
		parameter: 4,
		type: 'i8',
		fields: [unit('value', 'Show for (s, 0 off)', 30, 0, 30)],
	},
	{
		id: 'ccuDisplayFocusAssist',
		group: 'Display',
		name: 'Focus assist',
		category: 4,
		parameter: 5,
		type: 'i8',
		fields: [
			{ id: 'method', label: 'Method', kind: 'dropdown', default: 0, choices: ch('Peak', 'Coloured lines') },
			{
				id: 'colour',
				label: 'Line colour',
				kind: 'dropdown',
				default: 0,
				choices: ch('Red', 'Green', 'Blue', 'White', 'Black'),
			},
		],
	},
	{
		id: 'ccuDisplayProgramReturn',
		group: 'Display',
		name: 'Program return feed',
		category: 4,
		parameter: 6,
		type: 'i8',
		fields: [unit('value', 'Show for (s, 0 off)', 30, 0, 30)],
	},
	{
		id: 'ccuDisplayTimecodeSource',
		group: 'Display',
		name: 'Timecode source',
		category: 4,
		parameter: 7,
		type: 'i8',
		fields: [{ id: 'value', label: 'Source', kind: 'dropdown', default: 1, choices: ch('Clip', 'Timecode') }],
	},

	// 5 Tally
	{
		id: 'ccuTallyBrightness',
		group: 'Tally',
		name: 'Tally brightness',
		category: 5,
		parameter: 0,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Brightness (0 - 1)', 1)],
	},
	{
		id: 'ccuTallyFrontBrightness',
		group: 'Tally',
		name: 'Front tally brightness',
		category: 5,
		parameter: 1,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Brightness (0 - 1)', 1)],
	},
	{
		id: 'ccuTallyRearBrightness',
		group: 'Tally',
		name: 'Rear tally brightness',
		category: 5,
		parameter: 2,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Brightness (0 - 1)', 1)],
	},

	// 6 Reference
	{
		id: 'ccuReferenceSource',
		group: 'Reference',
		name: 'Reference source',
		category: 6,
		parameter: 0,
		type: 'i8',
		fields: [
			{ id: 'value', label: 'Source', kind: 'dropdown', default: 0, choices: ch('Internal', 'Program', 'External') },
		],
	},
	{
		id: 'ccuReferenceOffset',
		group: 'Reference',
		name: 'Reference offset',
		category: 6,
		parameter: 1,
		type: 'i32',
		offset: true,
		fields: [unit('value', 'Offset (pixels)', 0, -100000, 100000)],
	},

	// 7 Configuration
	{
		id: 'ccuConfigClock',
		group: 'Configuration',
		name: 'Real time clock',
		category: 7,
		parameter: 0,
		type: 'i32',
		description: 'Sets the camera clock to this computer’s local time, or to the time and date given',
		fields: [
			{ id: 'now', label: 'Use this computer’s clock', kind: 'bool', default: true },
			text('time', 'Time (HH:MM:SS)', '12:00:00'),
			text('date', 'Date (YYYY-MM-DD)', '2026-01-01'),
		],
		encode: (o: Record<string, any>): Array<number | bigint> => {
			let time =
				String(o.time ?? '')
					.replace(/\D/g, '')
					.padEnd(6, '0')
					.slice(0, 6) + '00'
			let date = String(o.date ?? '')
				.replace(/\D/g, '')
				.padEnd(8, '0')
				.slice(0, 8)
			if (o.now) {
				const d = new Date()
				const p = (n: number) => String(n).padStart(2, '0')
				time = p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + '00'
				date = String(d.getFullYear()) + p(d.getMonth() + 1) + p(d.getDate())
			}
			return [bcd(time), bcd(date)]
		},
	},
	{
		id: 'ccuConfigLanguage',
		group: 'Configuration',
		name: 'System language',
		category: 7,
		parameter: 1,
		type: 'string',
		fields: [text('value', 'Language (ISO 639-1, eg en)', 'en')],
	},
	{
		id: 'ccuConfigTimezone',
		group: 'Configuration',
		name: 'Timezone',
		category: 7,
		parameter: 2,
		type: 'i32',
		fields: [unit('value', 'Offset from UTC (minutes)', 0, -720, 840)],
	},
	{
		id: 'ccuConfigLocation',
		group: 'Configuration',
		name: 'Location',
		category: 7,
		parameter: 3,
		type: 'i64',
		fields: [unit('lat', 'Latitude (degrees)', 0, -90, 90), unit('long', 'Longitude (degrees)', 0, -180, 180)],
		encode: (o: Record<string, any>): Array<number | bigint> => [
			bcdDegrees(Number(o.lat) || 0),
			bcdDegrees(Number(o.long) || 0),
		],
	},

	// 8 Colour correction
	{
		id: 'ccuColorLift',
		group: 'Colour correction',
		name: 'Lift',
		category: 8,
		parameter: 0,
		type: 'fixed',
		offset: true,
		fields: rgby(-2, 2, 0),
	},
	{
		id: 'ccuColorGamma',
		group: 'Colour correction',
		name: 'Gamma',
		category: 8,
		parameter: 1,
		type: 'fixed',
		offset: true,
		fields: rgby(-4, 4, 0),
	},
	{
		id: 'ccuColorGain',
		group: 'Colour correction',
		name: 'Gain',
		category: 8,
		parameter: 2,
		type: 'fixed',
		offset: true,
		fields: rgby(0, 15.99, 1),
	},
	{
		id: 'ccuColorOffset',
		group: 'Colour correction',
		name: 'Offset',
		category: 8,
		parameter: 3,
		type: 'fixed',
		offset: true,
		fields: rgby(-8, 8, 0),
	},
	{
		id: 'ccuColorContrast',
		group: 'Colour correction',
		name: 'Contrast',
		category: 8,
		parameter: 4,
		type: 'fixed',
		offset: true,
		fields: [unit('pivot', 'Pivot (0 - 1)', 0.5), unit('adjust', 'Contrast (0 - 2)', 1, 0, 2)],
	},
	{
		id: 'ccuColorLumaMix',
		group: 'Colour correction',
		name: 'Luma mix',
		category: 8,
		parameter: 5,
		type: 'fixed',
		offset: true,
		fields: [unit('value', 'Luma mix (0 - 1)', 1)],
	},
	{
		id: 'ccuColorHueSaturation',
		group: 'Colour correction',
		name: 'Hue and saturation',
		category: 8,
		parameter: 6,
		type: 'fixed',
		offset: true,
		fields: [unit('hue', 'Hue (-1 - 1)', 0, -1, 1), unit('sat', 'Saturation (0 - 2)', 1, 0, 2)],
	},
	{
		id: 'ccuColorReset',
		group: 'Colour correction',
		name: 'Reset to defaults',
		category: 8,
		parameter: 7,
		type: 'void',
		fields: [],
	},

	// 10 Media
	{
		id: 'ccuMediaCodec',
		group: 'Media',
		name: 'Codec',
		category: 10,
		parameter: 0,
		type: 'i8',
		fields: [
			{
				id: 'codec',
				label: 'Codec',
				kind: 'dropdown',
				default: 3,
				choices: ch('CinemaDNG RAW', 'DNxHD', 'ProRes', 'Blackmagic RAW'),
			},
			{
				id: 'variant',
				label: 'Variant',
				min: 0,
				max: 20,
				default: 0,
				description:
					'ProRes: 0 HQ, 1 422, 2 LT, 3 Proxy, 4 444, 5 444 XQ. Blackmagic RAW: 0 Q0, 1 Q5, 2 3:1, 3 5:1, 4 8:1, 5 12:1, 6 Q1, 7 Q3. CinemaDNG: 0 uncompressed, 1 3:1, 2 4:1',
			},
		],
	},
	{
		id: 'ccuMediaTransport',
		group: 'Media',
		name: 'Transport mode',
		category: 10,
		parameter: 1,
		type: 'i8',
		fields: [
			{ id: 'mode', label: 'Mode', kind: 'dropdown', default: 2, choices: ch('Preview', 'Play', 'Record') },
			unit('speed', 'Speed (frames per frame, negative = reverse)', 0, -128, 127),
			{
				id: 'flags',
				label: 'Flags',
				kind: 'flags',
				default: [],
				choices: [
					{ id: 1, label: 'Loop' },
					{ id: 2, label: 'Play all' },
					{ id: 32, label: 'Disk 1 active' },
					{ id: 64, label: 'Disk 2 active' },
					{ id: 128, label: 'Time-lapse recording' },
				],
			},
			{ id: 'slot1', label: 'Slot 1 medium', kind: 'dropdown', default: 0, choices: MEDIA },
			{ id: 'slot2', label: 'Slot 2 medium', kind: 'dropdown', default: 0, choices: MEDIA },
		],
	},
	{
		id: 'ccuMediaPlayback',
		group: 'Media',
		name: 'Playback control',
		category: 10,
		parameter: 2,
		type: 'i8',
		fields: [
			{ id: 'dir', label: 'Go to', kind: 'dropdown', default: 1, choices: ch('Previous clip', 'Next clip') },
			unit('steps', 'Clips', 1, 1, 127),
		],
	},
	{
		id: 'ccuMediaStillCapture',
		group: 'Media',
		name: 'Still capture',
		category: 10,
		parameter: 3,
		type: 'void',
		fields: [],
	},

	// 11 PTZ
	{
		id: 'ccuPtzVelocity',
		group: 'PTZ control',
		name: 'Pan / tilt velocity',
		category: 11,
		parameter: 0,
		type: 'fixed',
		fields: [unit('pan', 'Pan (-1 left, 1 right)', 0, -1, 1), unit('tilt', 'Tilt (-1 down, 1 up)', 0, -1, 1)],
	},
	{
		id: 'ccuPtzPreset',
		group: 'PTZ control',
		name: 'Memory preset',
		category: 11,
		parameter: 1,
		type: 'i8',
		fields: [
			{ id: 'action', label: 'Action', kind: 'dropdown', default: 2, choices: ch('Reset', 'Store', 'Recall') },
			unit('slot', 'Preset', 0, 0, 5),
		],
	},

	// 12 Metadata
	{
		id: 'ccuMetaReel',
		group: 'Metadata',
		name: 'Reel',
		category: 12,
		parameter: 0,
		type: 'i16',
		offset: true,
		fields: [unit('value', 'Reel', 1, 0, 999)],
	},
	{
		id: 'ccuMetaScene',
		group: 'Metadata',
		name: 'Scene',
		category: 12,
		parameter: 2,
		type: 'string',
		fields: [text('value', 'Scene', '1')],
	},
	{
		id: 'ccuMetaTake',
		group: 'Metadata',
		name: 'Take',
		category: 12,
		parameter: 3,
		type: 'i8',
		fields: [
			unit('take', 'Take', 1, 0, 99),
			{
				id: 'tag',
				label: 'Tag',
				kind: 'dropdown',
				default: -1,
				choices: [
					{ id: -1, label: 'None' },
					{ id: 0, label: 'PU' },
					{ id: 1, label: 'VFX' },
					{ id: 2, label: 'SER' },
				],
			},
		],
	},
	{
		id: 'ccuMetaGoodTake',
		group: 'Metadata',
		name: 'Good take',
		category: 12,
		parameter: 4,
		type: 'bool',
		fields: [{ id: 'value', label: 'Good take', kind: 'bool', default: true }],
	},
	{
		id: 'ccuMetaCameraId',
		group: 'Metadata',
		name: 'Camera ID',
		category: 12,
		parameter: 5,
		type: 'string',
		fields: [text('value', 'Camera ID', 'A')],
	},
	{
		id: 'ccuMetaOperator',
		group: 'Metadata',
		name: 'Camera operator',
		category: 12,
		parameter: 6,
		type: 'string',
		fields: [text('value', 'Operator')],
	},
	{
		id: 'ccuMetaDirector',
		group: 'Metadata',
		name: 'Director',
		category: 12,
		parameter: 7,
		type: 'string',
		fields: [text('value', 'Director')],
	},
	{
		id: 'ccuMetaProject',
		group: 'Metadata',
		name: 'Project name',
		category: 12,
		parameter: 8,
		type: 'string',
		fields: [text('value', 'Project name')],
	},
	{
		id: 'ccuMetaLensType',
		group: 'Metadata',
		name: 'Lens type',
		category: 12,
		parameter: 9,
		type: 'string',
		fields: [text('value', 'Lens type')],
	},
	{
		id: 'ccuMetaIris',
		group: 'Metadata',
		name: 'Iris',
		category: 12,
		parameter: 10,
		type: 'string',
		fields: [text('value', 'Iris')],
	},
	{
		id: 'ccuMetaFocalLength',
		group: 'Metadata',
		name: 'Focal length',
		category: 12,
		parameter: 11,
		type: 'string',
		fields: [text('value', 'Focal length')],
	},
	{
		id: 'ccuMetaDistance',
		group: 'Metadata',
		name: 'Distance',
		category: 12,
		parameter: 12,
		type: 'string',
		fields: [text('value', 'Distance')],
	},
	{
		id: 'ccuMetaFilter',
		group: 'Metadata',
		name: 'Filter',
		category: 12,
		parameter: 13,
		type: 'string',
		fields: [text('value', 'Filter')],
	},
	{
		id: 'ccuMetaSlateTarget',
		group: 'Metadata',
		name: 'Slate target',
		category: 12,
		parameter: 15,
		type: 'string',
		fields: [text('value', 'Slate target')],
	},
]
