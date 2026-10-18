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
/**
 * A local variable carrying an input's level (dB) for a meter: the Fairlight level feedback, or on
 * classic mixer switchers the classic one.
 */
export function audioLevelVariable(
	context: PresetsBuilderContext,
	variableName: string,
	input: string,
	side: 'Left' | 'Right',
): any {
	const inputValue = { isExpression: true as const, value: input }
	return context.model.fairlightAudio
		? {
				variableType: 'feedback' as const,
				variableName,
				feedbackId: 'fairlightAudioInputLevel' as const,
				options: { input: inputValue, source: '-65280', meter: side === 'Left' ? 'inputLeftLevel' : 'inputRightLevel' },
			}
		: {
				variableType: 'feedback' as const,
				variableName,
				feedbackId: 'classicAudioInputLevel' as const,
				options: { input: inputValue, meter: side === 'Left' ? 0 : 1 },
			}
}

export function createAudioMeterPresets(context: PresetsBuilderContext, state: AtemState): void {
	// Only fairlight audio reports levels
	if (!context.model.fairlightAudio && !context.model.classicAudio) return

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
				text: '$(atem:audio_input_$(local:input)_short)',
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
			audioLevelVariable(context, 'levelLeft', '$(local:input)', 'Left'),
			audioLevelVariable(context, 'levelRight', '$(local:input)', 'Right'),
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
		],
	}

	// One button metering a range of inputs: up to MULTI_MAX stereo meters side by side, as many as
	// $(local:count) starting at input $(local:first), each scaled to its share of the button width
	const MULTI_MAX = 16
	groups.push({
		id: 'audio_inputs_meter',
		name: `Meters for a range of inputs`,
		description: "Set the first input and how many inputs in the button's local variables (first, count)",
		type: 'template',
		presetId: 'audio_inputs_meter',
		templateVariableName: 'count',
		templateValues: [4, 6, 8, 12, 16].map((count) => ({ name: `Inputs 1 - ${count}`, value: count })),
		commonVariableValues: { first: 1 },
	})
	const slots = Array.from({ length: MULTI_MAX }, (_, i) => i)
	const shown = (i: number) => ({ isExpression: true, value: `${i} < $(local:count)` }) as const
	const left = (i: number) => ({ isExpression: true, value: `${i} * 100 / $(local:count)` }) as const
	const width = (share: number) => ({ isExpression: true, value: `100 / $(local:count) * ${share}` }) as const
	context.definitions['audio_inputs_meter'] = {
		name: `Audio level meters for a range of inputs`,
		type: 'layered',
		canvas: {
			decoration: ButtonGraphicsDecorationType.None,
			showStatusIcons: ButtonGraphicsShowStatusIcons.None,
		},
		elements: slots.flatMap((i) => [
			{
				type: 'composite' as const,
				id: `meter${i}`,
				elementId: 'audio_meter_stereo' as const,
				enabled: shown(i),
				x: left(i),
				y: 4,
				width: width(0.8),
				height: 78,
				options: {
					levelLeft: { isExpression: true as const, value: `$(local:levelLeft${i})` },
					levelRight: { isExpression: true as const, value: `$(local:levelRight${i})` },
				},
			},
			{
				type: 'text' as const,
				id: `label${i}`,
				enabled: shown(i),
				x: left(i),
				y: 83,
				width: width(1),
				height: 15,
				text: `$(local:label${i})`,
				halign: 'center' as const,
				valign: 'center' as const,
				fontsizeAllowShrink: true,
				color: 0xffffff,
				outlineColor: 0x000000,
			},
		]),
		feedbacks: [],
		steps: [{ down: [], up: [] }],
		localVariables: [
			...slots.flatMap((i) =>
				(['Left', 'Right'] as const).map((side) =>
					audioLevelVariable(context, `level${side}${i}`, `$(local:first) + ${i}`, side),
				),
			),
			...slots.map((i) => ({
				variableType: 'feedback' as const,
				variableName: `label${i}`,
				feedbackId: 'audioInputShortName' as const,
				options: { input: { isExpression: true as const, value: `$(local:first) + ${i}` } },
			})),
			{ variableType: 'simple' as const, variableName: 'first', startupValue: 1 },
			{ variableType: 'simple' as const, variableName: 'count', startupValue: 8 },
		],
	}
}
