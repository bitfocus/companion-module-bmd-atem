import {
	type CompanionPresetGroup,
	ButtonGraphicsDecorationType,
	ButtonGraphicsShowStatusIcons,
} from '@companion-module/base'
import type { AtemState } from 'atem-connection'
import { AtemAudioInputPicker } from '../options/audio.js'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'

/**
 * Stereo level meters for a fairlight audio input, drawn with the `audio_meter_stereo` composite element.
 *
 * Each bar's value is driven by a feedback-typed local variable bound to the `fairlightAudioInputLevel`
 * value feedback, passed into the composite's level options. Binding the feedback is also what subscribes
 * the switcher to start sending levels. The label reads the live `audio_input_<id>_name` variable, so it
 * follows input renames. Building the preset from the shared composite means custom buttons that use the
 * same element look identical to the one we ship.
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

	context.definitions[`audio_input_meter`] = {
		name: `Audio input level meter`,
		type: 'layered',
		// Reclaim the whole button for the meters by hiding the topbar/status icons
		canvas: {
			decoration: ButtonGraphicsDecorationType.None,
			showStatusIcons: ButtonGraphicsShowStatusIcons.None,
		},
		elements: [
			// The shared stereo meter composite, wiring each bar to its level local variable. It carries
			// no padding, so the preset positions it in the upper region and leaves room for the label.
			{
				type: 'composite',
				id: 'meter',
				elementId: 'audio_meter_stereo',
				x: 27,
				y: 6,
				width: 46,
				height: 70,
				options: {
					levelLeft: { isExpression: true, value: '$(local:levelLeft)' },
					levelRight: { isExpression: true, value: '$(local:levelRight)' },
				},
			},
			{
				type: 'text',
				id: 'label',
				x: 0,
				y: 78,
				width: 100,
				height: 20,
				// Variable-string (not expression) mode, so the nested $(local:input) resolves first and
				// the label follows input renames
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
