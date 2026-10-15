import {
	type CompanionCompositeElementSchema,
	type CompanionGraphicsCompositeElementDefinitions,
	type SomeButtonGraphicsElement,
} from '@companion-module/base'

export type AtemAudioMeterCompositeElements = {
	['audio_meter_stereo']: CompanionCompositeElementSchema<{
		levelLeft: number
		levelRight: number
	}>
}

/**
 * A vertical meter bar, laid out in the composite element's 0-100 coordinate space.
 *
 * Bars fill the composite box edge-to-edge so the element carries no padding of its own — whoever
 * places it owns the positioning and spacing. The dimmed track shows the meter extent when quiet,
 * and the zoned stops give a classic green/amber/red look rather than a gradient wash. The value is
 * read from the named composite option, so the placer decides where the dB value comes from.
 */
function meterBar(id: string, x: number, width: number, levelOption: string): SomeButtonGraphicsElement {
	return {
		type: 'gauge',
		id,
		x,
		y: 0,
		width,
		height: 100,
		orientation: 'vertical',
		min: -60,
		max: 0,
		value: { isExpression: true, value: `$(options:${levelOption})` },
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

/**
 * Composite elements for drawing audio meters.
 *
 * These are reusable building blocks: a user can drop one onto any button and wire its level
 * options to whatever they like, or combine several to build their own meter layouts. The audio
 * meter preset is built from the same element, so custom buttons match the ones we ship.
 */
export function createAudioMeterCompositeElements(): CompanionGraphicsCompositeElementDefinitions<AtemAudioMeterCompositeElements> {
	return {
		['audio_meter_stereo']: {
			type: 'composite',
			name: 'Audio meter (stereo)',
			description: 'A pair of vertical level meters',
			options: [
				{
					type: 'number',
					id: 'levelLeft',
					label: 'Left level (dB)',
					tooltip: 'The dB value to show on the left bar. Usually an audio level feedback.',
					default: -60,
					min: -60,
					max: 0,
				},
				{
					type: 'number',
					id: 'levelRight',
					label: 'Right level (dB)',
					tooltip: 'The dB value to show on the right bar. Usually an audio level feedback.',
					default: -60,
					min: -60,
					max: 0,
				},
			],
			elements: [
				// Two bars filling the box as a pair, with a 6-unit gap down the middle (x 0..47 / 53..100)
				meterBar('meterLeft', 0, 47, 'levelLeft'),
				meterBar('meterRight', 53, 47, 'levelRight'),
			],
		},
	}
}
