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
	GetAudioInputsList,
	GetSourcesListForType,
	type TrueFalseToggle,
	type AudioInputSubset,
	GetUpstreamKeyerPatternChoices,
	FairlightAudioRoutingDestinations,
	FairlightAudioRoutingSources,
} from './choices.js'
import type { ModelSpec } from './models/index.js'
import { iterateTimes, NumberComparitor } from './util.js'
import { SourcesToChoices, WithDropdownPropertiesPicker } from './options/util.js'
import { AtemRatePicker, MaskPropertiesPickers } from './options/common.js'

export function AtemUSKPicker(model: ModelSpec): CompanionInputFieldDropdown<'key'> {
	return {
		type: 'dropdown',
		label: 'Key',
		id: 'key',
		default: 1,
		choices: iterateTimes(model.USKs, (i) => ({
			id: i + 1,
			label: `${i + 1}`,
		})),
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
	return WithDropdownPropertiesPicker({
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
	})
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
	return WithDropdownPropertiesPicker({
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
	})
}
export function AtemMediaPlayerPicker(model: ModelSpec): CompanionInputFieldDropdown<'mediaplayer'> {
	return {
		type: 'dropdown',
		id: 'mediaplayer',
		label: 'Media Player',
		default: 1,
		choices: iterateTimes(model.media.players, (i) => {
			return {
				id: i + 1,
				label: `Media Player ${i + 1}`,
			}
		}),
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
		sortSelection: true,
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
	return WithDropdownPropertiesPicker({
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
	})
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
