import {
	type CompanionPresetGroup,
	type SomeButtonGraphicsElement,
	ButtonGraphicsDecorationType,
	ButtonGraphicsShowStatusIcons,
} from '@companion-module/base'
import type { AtemState } from 'atem-connection'
import { AtemAudioInputPicker } from '../options/audio.js'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'

/**
 * Stereo level meters for a fairlight audio input, drawn with gauge elements (layered preset).
 *
 * Each bar's value is driven by a feedback-typed local variable bound to the `fairlightAudioInputLevel`
 * value feedback. Binding the feedback is also what subscribes the switcher to start sending levels.
 * The label reads the live `audio_input_<id>_name` variable, so it follows input renames.
 */
export function createAudioMeterPresets(context: PresetsBuilderContext, state: AtemState): void {
	// Only fairlight audio reports levels
	if (!context.model.fairlightAudio) return

	const inputPicker = AtemAudioInputPicker(context.model, state)
	if (!inputPicker) return

	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'audio_meters',
		name: `Audio Meters`,
		definitions: groups,
	})

	// One meter button per audio input
	groups.push({
		id: 'audio_input_meter',
		name: `Input level meter`,
		type: 'template',
		presetId: 'audio_input_meter',
		templateVariableName: 'input',
		templateValues: inputPicker.choices.map((input) => ({
			name: `${input.label} level meter`,
			value: input.id,
		})),
	})

	// A vertical bar, positioned in a 0-100 coordinate space. The dimmed track shows the meter extent
	// when quiet, and the zoned stops give a classic green/amber/red look rather than a gradient wash.
	const meterBar = (id: string, x: number, levelVariable: string): SomeButtonGraphicsElement => ({
		type: 'gauge',
		id,
		x,
		y: 6,
		width: 20,
		height: 70,
		orientation: 'vertical',
		min: -60,
		max: 0,
		value: { isExpression: true, value: `$(local:${levelVariable})` },
		multiColour: true,
		trackStyle: 'dimmed',
		roundedEnds: false,
		stops: [
			{ value: -60, color: 0x00c800, gradient: false },
			{ value: -18, color: 0x00c800, gradient: false },
			{ value: -9, color: 0xe6c800, gradient: false },
			{ value: -3, color: 0xdc0000, gradient: false },
		],
	})

	context.definitions[`audio_input_meter`] = {
		name: `Audio input level meter`,
		type: 'layered',
		// Reclaim the whole button for the meters by hiding the topbar/status icons
		canvas: {
			decoration: ButtonGraphicsDecorationType.None,
			showStatusIcons: ButtonGraphicsShowStatusIcons.None,
		},
		elements: [
			// Two bars centred as a pair (x 27..73, midpoint 50) with a 6-unit gap between them
			meterBar('meterLeft', 27, 'levelLeft'),
			meterBar('meterRight', 53, 'levelRight'),
			{
				type: 'text',
				id: 'label',
				x: 0,
				y: 78,
				width: 100,
				height: 20,
				// Variable-string (not expression) mode, so the nested $(local:input) resolves first —
				// the same pattern the multiviewer window-source preset uses for live source names
				text: '$(atem:audio_input_$(local:input)_name)',
				halign: 'center',
				valign: 'center',
				fontsizeAllowShrink: true,
				color: 0xffffff,
				outlineColor: 0x000000,
			},
		],
		feedbacks: [],
		steps: [{ down: [], up: [] }],
		localVariables: [
			{
				variableType: 'feedback',
				variableName: 'levelLeft',
				feedbackId: 'fairlightAudioInputLevel',
				options: {
					input: { isExpression: true, value: '$(local:input)' },
					source: '-65280',
					meter: 'inputLeftLevel',
				},
			},
			{
				variableType: 'feedback',
				variableName: 'levelRight',
				feedbackId: 'fairlightAudioInputLevel',
				options: {
					input: { isExpression: true, value: '$(local:input)' },
					source: '-65280',
					meter: 'inputRightLevel',
				},
			},
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
		],
	}
}
