import {
	assertNever,
	type CompanionInputFieldCheckbox,
	type CompanionInputFieldDropdown,
	type CompanionInputFieldMultiDropdown,
	type CompanionInputFieldNumber,
	type DropdownChoice,
} from '@companion-module/base'
import { type AtemState, Enums } from 'atem-connection'
import {
	CHOICES_BORDER_BEVEL,
	CHOICES_NEXTTRANS_BACKGROUND,
	CHOICES_NEXTTRANS_KEY,
	GetAudioInputsList,
	GetAuxIdChoices,
	GetMediaPlayerChoices,
	GetMultiviewerIdChoices,
	GetSourcesListForType,
	GetUSKIdChoices,
	NextTransBackgroundChoices,
	NextTransKeyChoices,
	type TrueFalseToggle,
	type AudioInputSubset,
	GetUpstreamKeyerPatternChoices,
	FairlightAudioRoutingDestinations,
	FairlightAudioRoutingSources,
} from './choices.js'
import type { ModelSpec } from './models/index.js'
import { iterateTimes, NumberComparitor } from './util.js'
import { DropdownPropertiesPicker, SourcesToChoices } from './options/util.js'
import { AtemRatePicker, MaskPropertiesPickers } from './options/common.js'

export function AtemUpstreamKeyerPatternPicker(): CompanionInputFieldDropdown<'pattern'> {
	return {
		type: 'dropdown',
		id: 'pattern',
		label: 'Pattern',
		default: Enums.Pattern.LeftToRightBar,
		choices: GetUpstreamKeyerPatternChoices(),
		disableAutoExpression: true, // Needs translating first
	}
}
export function AtemTransitionSelectComponentsPickers(model: ModelSpec): {
	background: CompanionInputFieldDropdown<'background', NextTransBackgroundChoices>
	[id: `key${string}`]: CompanionInputFieldDropdown<`key${string}`, NextTransKeyChoices>
} {
	const pickers: ReturnType<typeof AtemTransitionSelectComponentsPickers> = {
		background: {
			type: 'dropdown',
			id: 'background',
			label: 'Background',
			choices: CHOICES_NEXTTRANS_BACKGROUND,
			default: NextTransBackgroundChoices.NoChange,
			disableAutoExpression: true, // Needs translating first
		},
	}

	for (let i = 0; i < model.USKs; i++) {
		pickers[`key${i}`] = {
			label: `Key ${i + 1}`,
			type: 'dropdown',
			id: `key${i}`,
			choices: CHOICES_NEXTTRANS_KEY,
			default: NextTransKeyChoices.NoChange,
			disableAutoExpression: true, // Needs translating first
		}
	}

	return pickers
}
export type TransitionSelectionComponent = 'background' | `key${number}`
export function AtemTransitionSelectionPicker(
	model: ModelSpec,
): CompanionInputFieldMultiDropdown<'selection', TransitionSelectionComponent> {
	const choices: DropdownChoice<TransitionSelectionComponent>[] = [{ id: 'background', label: 'Background' }]

	for (let i = 0; i < model.USKs; i++) {
		choices.push({
			id: `key${i}`,
			label: `Key ${i + 1}`,
		})
	}

	return {
		type: 'multidropdown',
		id: 'selection',
		label: 'Selection',
		default: ['background'],
		minSelection: 1,
		choices,
	}
}
export function AtemTransitionSelectionComponentPicker(model: ModelSpec): CompanionInputFieldDropdown<'component'> {
	const options: DropdownChoice[] = [
		{
			id: 0,
			label: 'Background',
		},
	]

	for (let i = 0; i < model.USKs; i++) {
		options.push({
			id: i + 1,
			label: `Key ${i + 1}`,
		})
	}

	return {
		label: 'Component',
		type: 'dropdown',
		id: 'component',
		choices: options,
		default: 0,
	}
}

export function AtemUSKPicker(model: ModelSpec): CompanionInputFieldDropdown<'key'> {
	return {
		type: 'dropdown',
		label: 'Key',
		id: 'key',
		default: 1,
		choices: GetUSKIdChoices(model),
	}
}
export function AtemUSKDVEPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>

	positionX: CompanionInputFieldNumber<'positionX'>
	positionY: CompanionInputFieldNumber<'positionY'>
	sizeX: CompanionInputFieldNumber<'sizeX'>
	sizeY: CompanionInputFieldNumber<'sizeY'>
	rotation: CompanionInputFieldNumber<'rotation'>
	maskEnabled: CompanionInputFieldCheckbox<'maskEnabled'>
	maskTop: CompanionInputFieldNumber<'maskTop'>
	maskBottom: CompanionInputFieldNumber<'maskBottom'>
	maskLeft: CompanionInputFieldNumber<'maskLeft'>
	maskRight: CompanionInputFieldNumber<'maskRight'>
	shadowEnabled: CompanionInputFieldCheckbox<'shadowEnabled'>
	lightSourceDirection: CompanionInputFieldNumber<'lightSourceDirection'>
	lightSourceAltitude: CompanionInputFieldNumber<'lightSourceAltitude'>
	borderEnabled: CompanionInputFieldCheckbox<'borderEnabled'>
	borderHue: CompanionInputFieldNumber<'borderHue'>
	borderSaturation: CompanionInputFieldNumber<'borderSaturation'>
	borderLuma: CompanionInputFieldNumber<'borderLuma'>
	borderBevel: CompanionInputFieldDropdown<'borderBevel'>
	borderOuterWidth: CompanionInputFieldNumber<'borderOuterWidth'>
	borderInnerWidth: CompanionInputFieldNumber<'borderInnerWidth'>
	borderOuterSoftness: CompanionInputFieldNumber<'borderOuterSoftness'>
	borderInnerSoftness: CompanionInputFieldNumber<'borderInnerSoftness'>
	borderOpacity: CompanionInputFieldNumber<'borderOpacity'>
	borderBevelPosition: CompanionInputFieldNumber<'borderBevelPosition'>
	borderBevelSoftness: CompanionInputFieldNumber<'borderBevelSoftness'>
	rate: CompanionInputFieldNumber<'rate'>
} {
	const allProps: Omit<ReturnType<typeof AtemUSKDVEPropertiesPickers>, 'properties'> = {
		positionX: {
			type: 'number',
			label: 'Position: X',
			id: 'positionX',
			default: 0,
			min: -1000,
			range: true,
			step: 0.01,
			max: 1000,
			isVisibleExpression: `arrayIncludes($(options:properties), 'positionX')`,
			asInteger: false,
			clampValues: true,
		},
		positionY: {
			type: 'number',
			label: 'Position: Y',
			id: 'positionY',
			default: 0,
			range: true,
			min: -1000,
			step: 0.01,
			max: 1000,
			isVisibleExpression: `arrayIncludes($(options:properties), 'positionY')`,
			asInteger: false,
			clampValues: true,
		},
		sizeX: {
			type: 'number',
			label: 'Size: X',
			id: 'sizeX',
			default: 0.5,
			range: true,
			min: 0,
			step: 0.01,
			max: 99.99,
			isVisibleExpression: `arrayIncludes($(options:properties), 'sizeX')`,
			asInteger: false,
			clampValues: true,
		},
		sizeY: {
			type: 'number',
			label: 'Size: Y',
			id: 'sizeY',
			default: 0.5,
			range: true,
			min: 0,
			step: 0.01,
			max: 99.99,
			isVisibleExpression: `arrayIncludes($(options:properties), 'sizeY')`,
			asInteger: false,
			clampValues: true,
		},
		rotation: {
			type: 'number',
			label: 'Rotation',
			id: 'rotation',
			range: true,
			default: 0,
			min: 0,
			max: 360,
			isVisibleExpression: `arrayIncludes($(options:properties), 'rotation')`,
			asInteger: false,
			clampValues: true,
		},
		...MaskPropertiesPickers(52, 38, true),
		shadowEnabled: {
			type: 'checkbox',
			label: 'Shadow: Enabled',
			id: 'shadowEnabled',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'shadowEnabled')`,
		},
		lightSourceDirection: {
			type: 'number',
			label: 'Shadow: Angle',
			id: 'lightSourceDirection',
			default: 36,
			min: 0,
			range: true,
			step: 1,
			max: 359,
			isVisibleExpression: `arrayIncludes($(options:properties), 'lightSourceDirection')`,
			asInteger: false,
			clampValues: true,
		},
		lightSourceAltitude: {
			type: 'number',
			label: 'Shadow: Altitude',
			id: 'lightSourceAltitude',
			default: 25,
			min: 10,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'lightSourceAltitude')`,
			asInteger: false,
			clampValues: true,
		},
		borderEnabled: {
			type: 'checkbox',
			label: 'Border: Enabled',
			id: 'borderEnabled',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderEnabled')`,
		},
		borderHue: {
			type: 'number',
			label: 'Border: Hue',
			id: 'borderHue',
			default: 0,
			min: 0,
			range: true,
			step: 0.1,
			max: 360,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderHue')`,
			asInteger: false,
			clampValues: true,
		},
		borderSaturation: {
			type: 'number',
			label: 'Border: Sat',
			id: 'borderSaturation',
			default: 0,
			min: 0,
			range: true,
			step: 0.1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderSaturation')`,
			asInteger: false,
			clampValues: true,
		},
		borderLuma: {
			type: 'number',
			label: 'Border: Lum',
			id: 'borderLuma',
			default: 0,
			min: 0,
			range: true,
			step: 0.1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderLuma')`,
			asInteger: false,
			clampValues: true,
		},
		borderBevel: {
			type: 'dropdown',
			label: 'Border: Style',
			id: 'borderBevel',
			default: 0,
			choices: CHOICES_BORDER_BEVEL,
		},
		borderOuterWidth: {
			type: 'number',
			label: 'Border: Outer Width',
			id: 'borderOuterWidth',
			default: 0,
			min: 0,
			range: true,
			step: 0.01,
			max: 16,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderOuterWidth')`,
			asInteger: false,
			clampValues: true,
		},
		borderInnerWidth: {
			type: 'number',
			label: 'Border: Inner Width',
			id: 'borderInnerWidth',
			default: 0.2,
			min: 0,
			range: true,
			step: 0.01,
			max: 16,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderInnerWidth')`,
			asInteger: false,
			clampValues: true,
		},
		borderOuterSoftness: {
			type: 'number',
			label: 'Border: Outer Soften',
			id: 'borderOuterSoftness',
			default: 0,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderOuterSoftness')`,
			asInteger: false,
			clampValues: true,
		},
		borderInnerSoftness: {
			type: 'number',
			label: 'Border: Inner Soften',
			id: 'borderInnerSoftness',
			default: 0,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderInnerSoftness')`,
			asInteger: false,
			clampValues: true,
		},
		borderOpacity: {
			type: 'number',
			label: 'Border: Opacity',
			id: 'borderOpacity',
			default: 100,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderOpacity')`,
			asInteger: true,
			clampValues: true,
		},
		borderBevelPosition: {
			type: 'number',
			label: 'Border: Bevel Position',
			id: 'borderBevelPosition',
			default: 0,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderBevelPosition')`,
			asInteger: true,
			clampValues: true,
		},
		borderBevelSoftness: {
			type: 'number',
			label: 'Border: Bevel Soften',
			id: 'borderBevelSoftness',
			default: 0,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderBevelSoftness')`,
			asInteger: true,
			clampValues: true,
		},
		rate: AtemRatePicker('Rate'),
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}
export function AtemUSKKeyframePropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>

	positionX: CompanionInputFieldNumber<'positionX'>
	positionY: CompanionInputFieldNumber<'positionY'>
	sizeX: CompanionInputFieldNumber<'sizeX'>
	sizeY: CompanionInputFieldNumber<'sizeY'>
	rotation: CompanionInputFieldNumber<'rotation'>
	maskTop: CompanionInputFieldNumber<'maskTop'>
	maskBottom: CompanionInputFieldNumber<'maskBottom'>
	maskLeft: CompanionInputFieldNumber<'maskLeft'>
	maskRight: CompanionInputFieldNumber<'maskRight'>
	lightSourceDirection: CompanionInputFieldNumber<'lightSourceDirection'>
	lightSourceAltitude: CompanionInputFieldNumber<'lightSourceAltitude'>
	borderHue: CompanionInputFieldNumber<'borderHue'>
	borderSaturation: CompanionInputFieldNumber<'borderSaturation'>
	borderLuma: CompanionInputFieldNumber<'borderLuma'>
	borderOuterWidth: CompanionInputFieldNumber<'borderOuterWidth'>
	borderInnerWidth: CompanionInputFieldNumber<'borderInnerWidth'>
	borderOuterSoftness: CompanionInputFieldNumber<'borderOuterSoftness'>
	borderInnerSoftness: CompanionInputFieldNumber<'borderInnerSoftness'>
	borderOpacity: CompanionInputFieldNumber<'borderOpacity'>
	borderBevelPosition: CompanionInputFieldNumber<'borderBevelPosition'>
	borderBevelSoftness: CompanionInputFieldNumber<'borderBevelSoftness'>
} {
	const allProps: Omit<ReturnType<typeof AtemUSKKeyframePropertiesPickers>, 'properties'> = {
		positionX: {
			type: 'number',
			label: 'Position: X',
			id: 'positionX',
			default: 0,
			min: -1000,
			range: true,
			step: 0.01,
			max: 1000,
			isVisibleExpression: `arrayIncludes($(options:properties), 'positionX')`,
			asInteger: false,
			clampValues: true,
		},
		positionY: {
			type: 'number',
			label: 'Position: Y',
			id: 'positionY',
			default: 0,
			range: true,
			min: -1000,
			step: 0.01,
			max: 1000,
			isVisibleExpression: `arrayIncludes($(options:properties), 'positionY')`,
			asInteger: false,
			clampValues: true,
		},
		sizeX: {
			type: 'number',
			label: 'Size: X',
			id: 'sizeX',
			default: 0.5,
			range: true,
			min: 0,
			step: 0.01,
			max: 99.99,
			isVisibleExpression: `arrayIncludes($(options:properties), 'sizeX')`,
			asInteger: false,
			clampValues: true,
		},
		sizeY: {
			type: 'number',
			label: 'Size: Y',
			id: 'sizeY',
			default: 0.5,
			range: true,
			min: 0,
			step: 0.01,
			max: 99.99,
			isVisibleExpression: `arrayIncludes($(options:properties), 'sizeY')`,
			asInteger: false,
			clampValues: true,
		},
		rotation: {
			type: 'number',
			label: 'Rotation',
			id: 'rotation',
			range: true,
			default: 0,
			min: 0,
			max: 360,
			isVisibleExpression: `arrayIncludes($(options:properties), 'rotation')`,
			asInteger: false,
			clampValues: true,
		},
		maskTop: {
			type: 'number',
			label: 'Mask: Top',
			id: 'maskTop',
			default: 0,
			range: true,
			min: 0,
			step: 0.01,
			max: 38,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskTop')`,
			asInteger: false,
			clampValues: true,
		},
		maskBottom: {
			type: 'number',
			label: 'Mask: Bottom',
			id: 'maskBottom',
			default: 0,
			range: true,
			min: 0,
			step: 0.01,
			max: 38,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskBottom')`,
			asInteger: false,
			clampValues: true,
		},
		maskLeft: {
			type: 'number',
			label: 'Mask: Left',
			id: 'maskLeft',
			default: 0,
			range: true,
			min: 0,
			step: 0.01,
			max: 52,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskLeft')`,
			asInteger: false,
			clampValues: true,
		},
		maskRight: {
			type: 'number',
			label: 'Mask: Right',
			id: 'maskRight',
			default: 0,
			range: true,
			min: 0,
			step: 0.01,
			max: 52,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskRight')`,
			asInteger: false,
			clampValues: true,
		},
		lightSourceDirection: {
			type: 'number',
			label: 'Shadow: Angle',
			id: 'lightSourceDirection',
			default: 36,
			min: 0,
			range: true,
			step: 1,
			max: 359,
			isVisibleExpression: `arrayIncludes($(options:properties), 'lightSourceDirection')`,
			asInteger: false,
			clampValues: true,
		},
		lightSourceAltitude: {
			type: 'number',
			label: 'Shadow: Altitude',
			id: 'lightSourceAltitude',
			default: 25,
			min: 10,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'lightSourceAltitude')`,
			asInteger: false,
			clampValues: true,
		},
		borderHue: {
			type: 'number',
			label: 'Border: Hue',
			id: 'borderHue',
			default: 0,
			min: 0,
			range: true,
			step: 0.1,
			max: 360,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderHue')`,
			asInteger: false,
			clampValues: true,
		},
		borderSaturation: {
			type: 'number',
			label: 'Border: Sat',
			id: 'borderSaturation',
			default: 0,
			min: 0,
			range: true,
			step: 0.1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderSaturation')`,
			asInteger: false,
			clampValues: true,
		},
		borderLuma: {
			type: 'number',
			label: 'Border: Lum',
			id: 'borderLuma',
			default: 0,
			min: 0,
			range: true,
			step: 0.1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderLuma')`,
			asInteger: false,
			clampValues: true,
		},
		borderOuterWidth: {
			type: 'number',
			label: 'Border: Outer Width',
			id: 'borderOuterWidth',
			default: 0,
			min: 0,
			range: true,
			step: 0.01,
			max: 16,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderOuterWidth')`,
			asInteger: false,
			clampValues: true,
		},
		borderInnerWidth: {
			type: 'number',
			label: 'Border: Inner Width',
			id: 'borderInnerWidth',
			default: 0.2,
			min: 0,
			range: true,
			step: 0.01,
			max: 16,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderInnerWidth')`,
			asInteger: false,
			clampValues: true,
		},
		borderOuterSoftness: {
			type: 'number',
			label: 'Border: Outer Soften',
			id: 'borderOuterSoftness',
			default: 0,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderOuterSoftness')`,
			asInteger: false,
			clampValues: true,
		},
		borderInnerSoftness: {
			type: 'number',
			label: 'Border: Inner Soften',
			id: 'borderInnerSoftness',
			default: 0,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderInnerSoftness')`,
			asInteger: false,
			clampValues: true,
		},
		borderOpacity: {
			type: 'number',
			label: 'Border: Opacity',
			id: 'borderOpacity',
			default: 100,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderOpacity')`,
			asInteger: false,
			clampValues: true,
		},
		borderBevelPosition: {
			type: 'number',
			label: 'Border: Bevel Position',
			id: 'borderBevelPosition',
			default: 0,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderBevelPosition')`,
			asInteger: false,
			clampValues: true,
		},
		borderBevelSoftness: {
			type: 'number',
			label: 'Border: Bevel Soften',
			id: 'borderBevelSoftness',
			default: 0,
			min: 0,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderBevelSoftness')`,
			asInteger: false,
			clampValues: true,
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}
export function AtemAuxPicker(model: ModelSpec): CompanionInputFieldDropdown<'aux'> {
	return {
		type: 'dropdown',
		id: 'aux',
		label: 'Aux/Output',
		default: 1,
		choices: GetAuxIdChoices(model),
	}
}
export function AtemMultiviewerPicker(model: ModelSpec): CompanionInputFieldDropdown<'multiViewerId'> {
	return {
		type: 'dropdown',
		id: 'multiViewerId',
		label: 'MV',
		default: 1,
		choices: GetMultiviewerIdChoices(model),
	}
}
export function AtemAuxSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'input'> {
	return {
		type: 'dropdown',
		label: 'Input',
		id: 'input',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'aux')),
	}
}

export function AtemMultiviewSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'source'> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'mv')),
	}
}
export function AtemMultiviewWindowPicker(model: ModelSpec): CompanionInputFieldDropdown<'windowIndex'> {
	const choices = model.multiviewerFullGrid
		? iterateTimes(16, (i) => ({
				id: i + 1,
				label: `Window ${i + 1}`,
			}))
		: iterateTimes(8, (i) => ({
				id: i + 3,
				label: `Window ${i + 3}`,
			}))

	return {
		type: 'dropdown',
		id: 'windowIndex',
		label: 'Window #',
		default: model.multiviewerFullGrid ? 1 : 3,
		choices,
	}
}
export function AtemMediaPlayerPicker(model: ModelSpec): CompanionInputFieldDropdown<'mediaplayer'> {
	return {
		type: 'dropdown',
		id: 'mediaplayer',
		label: 'Media Player',
		default: 1,
		choices: GetMediaPlayerChoices(model),
	}
}

export function AtemFadeToBlackStatePicker(): CompanionInputFieldDropdown<'state'> {
	return {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: 'on',
		choices: [
			{
				id: 'on',
				label: 'On',
			},
			{
				id: 'off',
				label: 'Off',
			},
			{
				id: 'fading',
				label: 'Fading',
			},
		],
		disableAutoExpression: true,
	}
}

export function AtemMatchMethod(): CompanionInputFieldDropdown<'matchmethod'> {
	return {
		id: 'matchmethod',
		label: 'Match method',
		type: 'dropdown',
		default: 'exact',
		choices: [
			{
				id: 'exact',
				label: 'Exact',
			},
			{
				id: 'contains',
				label: 'Contains',
			},
			{
				id: 'not-contain',
				label: 'Not Contain',
			},
		],
		disableAutoExpression: true, // Needs translating first
	}
}

export function AtemAudioInputPicker(
	model: ModelSpec,
	state: AtemState,
	subset?: AudioInputSubset,
): CompanionInputFieldDropdown<'input'> {
	const inputs = SourcesToChoices(GetAudioInputsList(model, state, subset))
	return {
		type: 'dropdown',
		id: 'input',
		label: 'Input',
		default: inputs[0]?.id,
		choices: inputs,
	}
}

export function AtemFairlightAudioSourcePicker(): CompanionInputFieldDropdown<'source'> {
	const sources: DropdownChoice[] = [
		{
			id: '-65280',
			label: 'Stereo',
		},
		{
			id: '-256',
			label: 'Mono (Ch1)',
		},
		{
			id: '-255',
			label: 'Mono (Ch2)',
		},
	]

	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: sources[0].id,
		choices: sources,
		disableAutoExpression: true, // This is a pretty messy value currently
	}
}

export function NumberComparitorPicker(): CompanionInputFieldDropdown<'comparitor'> {
	const options = [
		{ id: NumberComparitor.Equal, label: 'Equal' },
		{ id: NumberComparitor.NotEqual, label: 'Not Equal' },
		{ id: NumberComparitor.GreaterThan, label: 'Greater than' },
		{ id: NumberComparitor.GreaterThanEqual, label: 'Greater than or equal' },
		{ id: NumberComparitor.LessThan, label: 'Less than' },
		{ id: NumberComparitor.LessThanEqual, label: 'Less than or equal' },
	]
	return {
		type: 'dropdown',
		label: 'Comparitor',
		id: 'comparitor',
		default: NumberComparitor.Equal,
		choices: options,
		disableAutoExpression: true, // Needs translating first
	}
}

export const FaderLevelDeltaChoice: CompanionInputFieldNumber<'delta'> = {
	type: 'number',
	label: 'Delta',
	id: 'delta',
	default: 1,
	max: 100,
	min: -100,
	asInteger: false,
	clampValues: true,
}

export function AtemAllSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'source'> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state)),
	}
}

export function AtemDisplayClockPropertiesPickers(): {
	enabled: CompanionInputFieldCheckbox<'enabled'>
	size: CompanionInputFieldNumber<'size'>
	opacity: CompanionInputFieldNumber<'opacity'>
	x: CompanionInputFieldNumber<'x'>
	y: CompanionInputFieldNumber<'y'>
	autoHide: CompanionInputFieldCheckbox<'autoHide'>
	clockMode: CompanionInputFieldDropdown<'clockMode'>
	properties: CompanionInputFieldMultiDropdown<'properties'>
} {
	// Array <
	// 	| CompanionInputFieldNumber
	// 	| CompanionInputFieldCheckbox
	// 	| CompanionInputFieldDropdown
	// 	| CompanionInputFieldMultiDropdown
	// >
	const offset = false
	const allProps: Omit<ReturnType<typeof AtemDisplayClockPropertiesPickers>, 'properties'> = {
		enabled: {
			type: 'checkbox',
			id: 'enabled',
			label: 'Display',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'enabled')`,
		},
		size: {
			type: 'number',
			id: 'size',
			label: 'Size',
			min: offset ? -1 : 0,
			max: 1,
			range: true,
			default: offset ? 0 : 0.5,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'size')`,
			asInteger: false,
			clampValues: true,
		},
		opacity: {
			type: 'number',
			id: 'opacity',
			label: 'Opacity',
			min: offset ? -1 : 0,
			max: 1,
			range: true,
			default: offset ? 0 : 1,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'opacity')`,
			asInteger: false,
			clampValues: true,
		},
		x: {
			type: 'number',
			id: 'x',
			label: 'X',
			min: -16,
			max: 16,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'x')`,
			asInteger: false,
			clampValues: true,
		},
		y: {
			type: 'number',
			id: 'y',
			label: 'Y',
			min: -9,
			max: 9,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'y')`,
			asInteger: false,
			clampValues: true,
		},
		//!offset?
		autoHide: {
			type: 'checkbox',
			id: 'autoHide',
			label: 'Auto Hide',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'autoHide')`,
		},
		// startFrom: 1 << 6,
		//!offset?
		clockMode: {
			id: 'clockMode',
			label: 'Mode',
			type: 'dropdown',
			default: Enums.DisplayClockClockMode.Countdown,
			choices: [
				{ id: Enums.DisplayClockClockMode.Countdown, label: 'Count down' },
				{ id: Enums.DisplayClockClockMode.Countup, label: 'Count up' },
				{ id: Enums.DisplayClockClockMode.TimeOfDay, label: 'Time of Day' },
			],
			isVisibleExpression: `arrayIncludes($(options:properties), 'clockMode')`,
			disableAutoExpression: true,
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}

export function AtemDisplayClockTimePickers(): {
	hours: CompanionInputFieldNumber<'hours'>
	minutes: CompanionInputFieldNumber<'minutes'>
	seconds: CompanionInputFieldNumber<'seconds'>
} {
	return {
		hours: {
			type: 'number',
			id: 'hours',
			label: 'Hours',
			min: 0,
			max: 23,
			range: true,
			default: 0,
			step: 1,
			asInteger: true,
			clampValues: true,
		},
		minutes: {
			type: 'number',
			id: 'minutes',
			label: 'Minutes',
			min: 0,
			max: 59,
			range: true,
			default: 0,
			step: 1,
			asInteger: true,
			clampValues: true,
		},
		seconds: {
			type: 'number',
			id: 'seconds',
			label: 'Seconds',
			min: 0,
			max: 59,
			range: true,
			default: 0,
			step: 1,
			asInteger: true,
			clampValues: true,
		},
	}
}

export function AtemDisplayClockTimeOffsetPickers(): {
	hours: CompanionInputFieldNumber<'hours'>
	minutes: CompanionInputFieldNumber<'minutes'>
	seconds: CompanionInputFieldNumber<'seconds'>
} {
	return {
		hours: {
			type: 'number',
			id: 'hours',
			label: 'Hours',
			min: -23,
			max: 23,
			range: true,
			default: 0,
			step: 1,
			asInteger: true,
			clampValues: true,
		},
		minutes: {
			type: 'number',
			id: 'minutes',
			label: 'Minutes',
			min: -59,
			max: 59,
			range: true,
			default: 0,
			step: 1,
			asInteger: true,
			clampValues: true,
		},
		seconds: {
			type: 'number',
			id: 'seconds',
			label: 'Seconds',
			min: -59,
			max: 59,
			range: true,
			default: 0,
			step: 1,
			asInteger: true,
			clampValues: true,
		},
	}
}

export function AtemFairlightAudioRoutingSourcePicker(
	model: ModelSpec,
	state: AtemState,
): CompanionInputFieldDropdown<'source'> {
	const sources = FairlightAudioRoutingSources(model, state)

	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: sources[0].id,
		choices: sources,
	}
}

export function AtemFairlightAudioRoutingDestinationsPicker(
	model: ModelSpec,
	state: AtemState,
): CompanionInputFieldMultiDropdown<'destinations'> {
	const sources = FairlightAudioRoutingDestinations(model, state)

	return {
		type: 'multidropdown',
		id: 'destinations',
		label: 'Destinations',
		default: [sources[0].id],
		choices: sources,
	}
}

export function AtemFairlightAudioRoutingDestinationPicker(
	model: ModelSpec,
	state: AtemState,
): CompanionInputFieldDropdown<'destination'> {
	const sources = FairlightAudioRoutingDestinations(model, state)

	return {
		type: 'dropdown',
		id: 'destination',
		label: 'Destination',
		default: sources[0].id,
		choices: sources,
	}
}

export function AtemUSKPatternPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	style: CompanionInputFieldDropdown<'style'>
	invert: CompanionInputFieldCheckbox<'invert'>
	size: CompanionInputFieldNumber<'size'>
	symmetry: CompanionInputFieldNumber<'symmetry'>
	softness: CompanionInputFieldNumber<'softness'>
	positionX: CompanionInputFieldNumber<'positionX'>
	positionY: CompanionInputFieldNumber<'positionY'>
} {
	const allProps: Omit<ReturnType<typeof AtemUSKPatternPropertiesPickers>, 'properties'> = {
		style: {
			type: 'dropdown',
			label: 'Style: ',
			id: 'style',
			default: Enums.Pattern.LeftToRightBar,
			choices: GetUpstreamKeyerPatternChoices(),
			isVisibleExpression: `arrayIncludes($(options:properties), 'style')`,
			disableAutoExpression: true, // Needs translating first
		},
		invert: {
			type: 'checkbox',
			label: 'Invert Pattern',
			id: 'invert',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'invert')`,
		},
		size: {
			type: 'number',
			label: 'Size',
			id: 'size',
			default: 50,
			range: true,
			min: 0.0,
			step: 0.01,
			max: 100.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'size')`,
			asInteger: false,
			clampValues: true,
		},
		symmetry: {
			type: 'number',
			label: 'Symmetry',
			id: 'symmetry',
			default: 81.6,
			range: true,
			min: 0.0,
			step: 0.01,
			max: 100.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'symmetry')`,
			asInteger: false,
			clampValues: true,
		},
		softness: {
			type: 'number',
			label: 'Softness',
			id: 'softness',
			default: 50,
			range: true,
			min: 0.0,
			step: 0.01,
			max: 100.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'softness')`,
			asInteger: false,
			clampValues: true,
		},
		positionX: {
			type: 'number',
			label: 'Position: X',
			id: 'positionX',
			default: 0.5,
			min: 0.0,
			range: true,
			step: 0.01,
			max: 1.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'positionX')`,
			asInteger: false,
			clampValues: true,
		},
		positionY: {
			type: 'number',
			label: 'Position: Y',
			id: 'positionY',
			default: 0.5,
			range: true,
			min: 0.0,
			step: 0.01,
			max: 1.0,
			isVisibleExpression: `arrayIncludes($(options:properties), 'positionY')`,
			asInteger: false,
			clampValues: true,
		},
	}
	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}

export function resolveTrueFalseToggle(value: TrueFalseToggle | boolean, current: boolean | undefined): boolean {
	switch (value) {
		case 'false':
		case false:
			return false
		case 'true':
		case true:
			return true
		case 'toggle':
			return !current
		default:
			assertNever(value)
			return false
	}
}
