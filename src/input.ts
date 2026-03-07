import {
	assertNever,
	type CompanionInputFieldCheckbox,
	type CompanionInputFieldDropdown,
	type CompanionInputFieldMultiDropdown,
	type CompanionInputFieldNumber,
	type CompanionInputFieldTextInput,
	type DropdownChoice,
} from '@companion-module/base'
import { type AtemState, Enums } from 'atem-connection'
import {
	CHOICES_KEYTRANS,
	CHOICES_SSRCBOXES,
	CHOICES_BORDER_BEVEL,
	CHOICES_NEXTTRANS_BACKGROUND,
	CHOICES_NEXTTRANS_KEY,
	GetAudioInputsList,
	GetAuxIdChoices,
	GetDSKIdChoices,
	GetMediaPlayerChoices,
	GetMEIdChoices,
	GetMultiviewerIdChoices,
	GetSourcesListForType,
	GetSuperSourceIdChoices,
	GetTransitionStyleChoices,
	GetUSKIdChoices,
	NextTransBackgroundChoices,
	NextTransKeyChoices,
	SourcesToChoices,
	type TrueFalseToggle,
	type AudioInputSubset,
	GetUpstreamKeyerTypeChoices,
	GetUpstreamKeyerPatternChoices,
	FairlightAudioRoutingDestinations,
	FairlightAudioRoutingSources,
} from './choices.js'
import type { ModelSpec } from './models/index.js'
import { iterateTimes, MEDIA_PLAYER_SOURCE_CLIP_OFFSET, compact, NumberComparitor } from './util.js'
import type { MyOptionsObject } from './common.js'
import * as Easing from './easings.js'

export type WithProperties<T> = T & {
	properties: Array<keyof T>
}

export type InputId<T extends number> = T extends 0 ? 'input' : `input${T}`
export function AtemMESourcePicker<T extends number>(
	model: ModelSpec,
	state: AtemState,
	id: T,
): CompanionInputFieldDropdown<InputId<T>> {
	return {
		id: `input${id ? id : ''}` as InputId<T>,
		label: `Input${id ? ` Option ${id}` : ''}`,
		type: 'dropdown',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
	}
}
export function AtemTransitionStylePicker(skipSting?: boolean): CompanionInputFieldDropdown<'style'> {
	return {
		type: 'dropdown',
		id: 'style',
		label: 'Transition Style',
		default: Enums.TransitionStyle.MIX,
		choices: GetTransitionStyleChoices(skipSting),
		disableAutoExpression: true, // Needs translating first
	}
}
export function AtemUpstreamKeyerTypePicker(): CompanionInputFieldDropdown<'type'> {
	return {
		type: 'dropdown',
		id: 'type',
		label: 'Key Type',
		default: Enums.MixEffectKeyType.Luma,
		choices: GetUpstreamKeyerTypeChoices(),
		disableAutoExpression: true, // Needs translating first
	}
}
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
export function AtemRatePicker(label: string): CompanionInputFieldNumber<'rate'> {
	return {
		type: 'number',
		id: 'rate',
		label,
		min: 1,
		max: 250,
		range: true,
		default: 25,
		asInteger: true,
		clampValues: true,
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
export type MeKey<T extends number> = T extends 0 ? 'mixeffect' : `mixeffect${T}`
export function AtemMEPicker<T extends number>(model: ModelSpec, id: T): CompanionInputFieldDropdown<MeKey<T>> {
	return {
		id: (id === 0 ? 'mixeffect' : `mixeffect${id}`) as MeKey<T>,
		label: `M/E${id ? ` Option ${id}` : ''}`,
		type: 'dropdown',
		default: id > 0 ? id - 1 : 0,
		choices: GetMEIdChoices(model),
	}
}
export function AtemDSKPicker(model: ModelSpec): CompanionInputFieldDropdown<'key'> {
	return {
		type: 'dropdown',
		label: 'Key',
		id: 'key',
		default: 1,
		choices: GetDSKIdChoices(model),
	}
}
export function AtemDSKMaskPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	maskEnabled: CompanionInputFieldCheckbox<'maskEnabled'>
	maskTop: CompanionInputFieldNumber<'maskTop'>
	maskBottom: CompanionInputFieldNumber<'maskBottom'>
	maskLeft: CompanionInputFieldNumber<'maskLeft'>
	maskRight: CompanionInputFieldNumber<'maskRight'>
} {
	const allProps: Omit<ReturnType<typeof AtemDSKMaskPropertiesPickers>, 'properties'> = {
		maskEnabled: {
			type: 'checkbox',
			label: 'Enabled',
			id: 'maskEnabled',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskEnabled')`,
		},
		maskTop: {
			type: 'number',
			label: 'Top',
			id: 'maskTop',
			default: 9,
			min: -9,
			step: 0.01,
			max: 9,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskTop')`,
			asInteger: false,
			clampValues: true,
		},
		maskBottom: {
			type: 'number',
			label: 'Bottom',
			id: 'maskBottom',
			default: -9,
			min: -9,
			step: 0.01,
			max: 9,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskBottom')`,
			asInteger: false,
			clampValues: true,
		},
		maskLeft: {
			type: 'number',
			label: 'Left',
			id: 'maskLeft',
			default: -16,
			min: -16,
			step: 0.01,
			max: 16,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskLeft')`,
			asInteger: false,
			clampValues: true,
		},
		maskRight: {
			type: 'number',
			label: 'Right',
			id: 'maskRight',
			default: 16,
			min: -16,
			step: 0.01,
			max: 16,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskRight')`,
			asInteger: false,
			clampValues: true,
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}

export function AtemDSKPreMultipliedKeyPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	preMultiply: CompanionInputFieldCheckbox<'preMultiply'>
	clip: CompanionInputFieldNumber<'clip'>
	gain: CompanionInputFieldNumber<'gain'>
	invert: CompanionInputFieldCheckbox<'invert'>
} {
	const allProps: Omit<ReturnType<typeof AtemDSKPreMultipliedKeyPropertiesPickers>, 'properties'> = {
		preMultiply: {
			type: 'checkbox',
			label: 'Enabled',
			id: 'preMultiply',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'preMultiply')`,
		},
		clip: {
			type: 'number',
			label: 'Clip',
			id: 'clip',
			range: true,
			default: 100,
			min: 0,
			step: 0.1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'clip')`,
			asInteger: false,
			clampValues: true,
		},
		gain: {
			type: 'number',
			label: 'Gain',
			id: 'gain',
			range: true,
			default: 0,
			min: 0,
			step: 0.1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'gain')`,
			asInteger: false,
			clampValues: true,
		},
		invert: {
			type: 'checkbox',
			label: 'Invert key',
			id: 'invert',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'invert')`,
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
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
export function AtemUSKMaskPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	maskEnabled: CompanionInputFieldCheckbox<'maskEnabled'>
	maskTop: CompanionInputFieldNumber<'maskTop'>
	maskBottom: CompanionInputFieldNumber<'maskBottom'>
	maskLeft: CompanionInputFieldNumber<'maskLeft'>
	maskRight: CompanionInputFieldNumber<'maskRight'>
} {
	const allProps: Omit<ReturnType<typeof AtemUSKMaskPropertiesPickers>, 'properties'> = {
		maskEnabled: {
			type: 'checkbox',
			label: 'Enabled',
			id: 'maskEnabled',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskEnabled')`,
		},
		maskTop: {
			type: 'number',
			label: 'Top',
			id: 'maskTop',
			default: 9,
			min: -9,
			step: 0.01,
			max: 9,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskTop')`,
			asInteger: false,
			clampValues: true,
		},
		maskBottom: {
			type: 'number',
			label: 'Bottom',
			id: 'maskBottom',
			default: -9,
			min: -9,
			step: 0.01,
			max: 9,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskBottom')`,
			asInteger: false,
			clampValues: true,
		},
		maskLeft: {
			type: 'number',
			label: 'Left',
			id: 'maskLeft',
			default: -16,
			min: -16,
			step: 0.01,
			max: 16,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskLeft')`,
			asInteger: false,
			clampValues: true,
		},
		maskRight: {
			type: 'number',
			label: 'Right',
			id: 'maskRight',
			default: 16,
			min: -16,
			step: 0.01,
			max: 16,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskRight')`,
			asInteger: false,
			clampValues: true,
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
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
		maskEnabled: {
			type: 'checkbox',
			label: 'Mask: Enabled',
			id: 'maskEnabled',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'maskEnabled')`,
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
export function AtemKeyFillSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'fill'> {
	return {
		type: 'dropdown',
		label: 'Fill Source',
		id: 'fill',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
	}
}
export function AtemKeyCutSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'cut'> {
	return {
		type: 'dropdown',
		label: 'Key Source',
		id: 'cut',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'key')),
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
export function AtemTransitionAnimationOptions(): {
	transitionRate: CompanionInputFieldNumber<'transitionRate'>
	transitionEasing: CompanionInputFieldDropdown<'transitionEasing'>
	transitionCurve: CompanionInputFieldDropdown<'transitionCurve'>
} {
	return {
		transitionRate: {
			type: 'number',
			id: 'transitionRate',
			label: 'Transition Rate (ms)',
			default: 0,
			min: 0,
			max: 99999,
			step: 1,
			asInteger: true,
			clampValues: true,
		},
		transitionEasing: {
			type: 'dropdown',
			label: 'Transition Easing',
			id: 'transitionEasing',
			default: 'linear',
			choices: [
				{ id: 'linear', label: 'Linear' },
				{ id: 'quadratic', label: 'Quadratic' },
				{ id: 'cubic', label: 'Cubic' },
				{ id: 'quartic', label: 'Quartic' },
				{ id: 'quintic', label: 'Quintic' },
				{ id: 'sinusoidal', label: 'Sinusoidal' },
				{ id: 'exponential', label: 'Exponential' },
				{ id: 'circular', label: 'Circular' },
				{ id: 'elastic', label: 'Elastic' },
				{ id: 'back', label: 'Back' },
				{ id: 'bounce', label: 'Bounce' },
			],
			disableAutoExpression: true,
		},
		transitionCurve: {
			type: 'dropdown',
			label: 'Transition curve',
			id: 'transitionCurve',
			default: 'ease-in',
			choices: [
				{ id: 'ease-in', label: 'Ease-in' },
				{ id: 'ease-out', label: 'Ease-out' },
				{ id: 'ease-in-out', label: 'Ease-in-out' },
			],
			isVisibleExpression: `$(options:transitionEasing) != null && $(options:transitionEasing) != 'linear'`,
			disableAutoExpression: true,
		},
	}
}
export function AtemSuperSourceBoxPicker(): CompanionInputFieldDropdown<'boxIndex'> {
	return {
		type: 'dropdown',
		id: 'boxIndex',
		label: 'Box #',
		default: 1,
		choices: CHOICES_SSRCBOXES,
	}
}
export function AtemSuperSourceIdPicker(model: ModelSpec): CompanionInputFieldDropdown<'ssrcId'> {
	const choices = GetSuperSourceIdChoices(model)
	return {
		type: 'dropdown',
		id: 'ssrcId',
		label: 'Super Source',
		default: 1,
		choices,
		isVisibleExpression: choices.length > 1 ? undefined : 'false', // Hide if only 1 choice
	}
}

export type SSrcArtOption = 'unchanged' | 'toggle' | 'foreground' | 'background'

export function AtemSSrcArtOptionToProtocolEnum(
	rawArtOption: SSrcArtOption,
	currentValue: Enums.SuperSourceArtOption | undefined,
): Enums.SuperSourceArtOption | undefined {
	switch (rawArtOption) {
		case 'toggle': {
			return currentValue === Enums.SuperSourceArtOption.Background
				? Enums.SuperSourceArtOption.Foreground
				: Enums.SuperSourceArtOption.Background
		}
		case 'background':
			return Enums.SuperSourceArtOption.Background
		case 'foreground':
			return Enums.SuperSourceArtOption.Foreground
		case 'unchanged':
			return undefined
		default:
			assertNever(rawArtOption)
			return undefined
	}
}

export function AtemSSrcArtOptionFromProtocolEnum(artOption: Enums.SuperSourceArtOption | undefined): SSrcArtOption {
	switch (artOption) {
		case Enums.SuperSourceArtOption.Foreground:
			return 'foreground'
		case Enums.SuperSourceArtOption.Background:
			return 'background'
		case undefined:
			return 'unchanged'
		default:
			assertNever(artOption)
			return 'unchanged'
	}
}

export function AtemSuperSourceArtOption(action: boolean): CompanionInputFieldDropdown<'artOption', SSrcArtOption> {
	const options: DropdownChoice<SSrcArtOption>[] = compact([
		action
			? {
					id: 'unchanged',
					label: 'Unchanged',
				}
			: undefined,
		{
			id: 'foreground',
			label: 'Foreground',
		},
		{
			id: 'background',
			label: 'Background',
		},
		action
			? {
					id: 'toggle',
					label: 'Toggle',
				}
			: undefined,
	])
	return {
		type: 'dropdown',
		id: 'artOption',
		label: 'Place in',
		default: options[0].id,
		choices: options,
	}
}

export type AtemSuperSourcePropertiesBase = {
	size: number
	onair: TrueFalseToggle
	source: number
	x: number
	y: number
	cropEnable: boolean
	cropTop: number
	cropBottom: number
	cropLeft: number
	cropRight: number
}
export type AtemSuperSourceProperties = WithProperties<AtemSuperSourcePropertiesBase>

export function AtemSuperSourcePropertiesPickers(
	model: ModelSpec,
	state: AtemState,
): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	size: CompanionInputFieldNumber<'size'>
	onair: CompanionInputFieldDropdown<'onair', TrueFalseToggle>
	source: CompanionInputFieldDropdown<'source'>
	x: CompanionInputFieldNumber<'x'>
	y: CompanionInputFieldNumber<'y'>
	cropEnable: CompanionInputFieldCheckbox<'cropEnable'>
	cropTop: CompanionInputFieldNumber<'cropTop'>
	cropBottom: CompanionInputFieldNumber<'cropBottom'>
	cropLeft: CompanionInputFieldNumber<'cropLeft'>
	cropRight: CompanionInputFieldNumber<'cropRight'>
} {
	const allProps: Omit<ReturnType<typeof AtemSuperSourcePropertiesPickers>, 'properties'> = {
		size: {
			type: 'number',
			id: 'size',
			label: 'Size',
			min: 0,
			max: 1,
			range: true,
			default: 0.5,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'size')`,
			asInteger: false,
			clampValues: true,
		},

		onair: {
			id: 'onair',
			type: 'dropdown',
			label: 'On Air',
			default: 'true',
			choices: CHOICES_KEYTRANS,
			isVisibleExpression: `arrayIncludes($(options:properties), 'onair')`,
			disableAutoExpression: true, // Needs translating first
		},
		source: {
			type: 'dropdown',
			id: 'source',
			label: 'Source',
			default: 0,
			choices: SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-box')),
			isVisibleExpression: `arrayIncludes($(options:properties), 'source')`,
		},
		x: {
			type: 'number',
			id: 'x',
			label: 'X',
			min: -48,
			max: 48,
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
			min: -27,
			max: 27,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'y')`,
			asInteger: false,
			clampValues: true,
		},
		cropEnable: {
			type: 'checkbox',
			id: 'cropEnable',
			label: 'Crop Enable',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'cropEnable')`,
		},
		cropTop: {
			type: 'number',
			id: 'cropTop',
			label: 'Crop Top',
			min: 0,
			max: 18,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'cropTop')`,
			asInteger: false,
			clampValues: true,
		},
		cropBottom: {
			type: 'number',
			id: 'cropBottom',
			label: 'Crop Bottom',
			min: 0,
			max: 18,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'cropBottom')`,
			asInteger: false,
			clampValues: true,
		},
		cropLeft: {
			type: 'number',
			id: 'cropLeft',
			label: 'Crop Left',
			min: 0,
			max: 32,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'cropLeft')`,
			asInteger: false,
			clampValues: true,
		},
		cropRight: {
			type: 'number',
			id: 'cropRight',
			label: 'Crop Right',
			min: 0,
			max: 32,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'cropRight')`,
			asInteger: false,
			clampValues: true,
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}
export function AtemSuperSourcePropertiesPickersForOffset(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	size: CompanionInputFieldNumber<'size'>
	x: CompanionInputFieldNumber<'x'>
	y: CompanionInputFieldNumber<'y'>
	cropTop: CompanionInputFieldNumber<'cropTop'>
	cropBottom: CompanionInputFieldNumber<'cropBottom'>
	cropLeft: CompanionInputFieldNumber<'cropLeft'>
	cropRight: CompanionInputFieldNumber<'cropRight'>
} {
	const allProps: Omit<ReturnType<typeof AtemSuperSourcePropertiesPickersForOffset>, 'properties'> = {
		size: {
			type: 'number',
			id: 'size',
			label: 'Size',
			min: -1,
			max: 1,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'size')`,
			asInteger: false,
			clampValues: true,
		},

		x: {
			type: 'number',
			id: 'x',
			label: 'X',
			min: -48,
			max: 48,
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
			min: -27,
			max: 27,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'y')`,
			asInteger: false,
			clampValues: true,
		},

		cropTop: {
			type: 'number',
			id: 'cropTop',
			label: 'Crop Top',
			min: -18,
			max: 18,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'cropTop')`,
			asInteger: false,
			clampValues: true,
		},
		cropBottom: {
			type: 'number',
			id: 'cropBottom',
			label: 'Crop Bottom',
			min: -18,
			max: 18,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'cropBottom')`,
			asInteger: false,
			clampValues: true,
		},
		cropLeft: {
			type: 'number',
			id: 'cropLeft',
			label: 'Crop Left',
			min: -32,
			max: 32,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'cropLeft')`,
			asInteger: false,
			clampValues: true,
		},
		cropRight: {
			type: 'number',
			id: 'cropRight',
			label: 'Crop Right',
			min: -32,
			max: 32,
			range: true,
			default: 0,
			step: 0.01,
			isVisibleExpression: `arrayIncludes($(options:properties), 'cropRight')`,
			asInteger: false,
			clampValues: true,
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}

export type AtemSuperSourceArtPropertiesBase = {
	fill: number
	key: number
	artOption: SSrcArtOption
	artPreMultiplied: boolean
	artClip: number
	artGain: number
	artInvertKey: boolean
}
export type AtemSuperSourceArtProperties = WithProperties<AtemSuperSourceArtPropertiesBase>

export function AtemSuperSourceArtPropertiesPickers(
	model: ModelSpec,
	state: AtemState,
	action: boolean,
): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	fill: CompanionInputFieldDropdown<'fill'>
	key: CompanionInputFieldDropdown<'key'>
	artOption: CompanionInputFieldDropdown<'artOption', SSrcArtOption>
	artPreMultiplied: CompanionInputFieldCheckbox<'artPreMultiplied'>
	artClip: CompanionInputFieldNumber<'artClip'>
	artGain: CompanionInputFieldNumber<'artGain'>
	artInvertKey: CompanionInputFieldCheckbox<'artInvertKey'>
} {
	const artSources = SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-art'))

	const allProps: Omit<ReturnType<typeof AtemSuperSourceArtPropertiesPickers>, 'properties'> = {
		fill: {
			type: 'dropdown',
			id: 'fill',
			label: 'Fill Source',
			default: 0,
			choices: artSources,
			isVisibleExpression: `arrayIncludes($(options:properties), 'fill')`,
		},
		key: {
			type: 'dropdown',
			id: 'key',
			label: 'Key Source',
			default: 0,
			choices: artSources,
			isVisibleExpression: `arrayIncludes($(options:properties), 'key')`,
		},
		artOption: {
			...AtemSuperSourceArtOption(action),
			isVisibleExpression: `arrayIncludes($(options:properties), 'artOption')`,
		},
		artPreMultiplied: {
			type: 'checkbox',
			id: 'artPreMultiplied',
			label: 'Pre-multiplied',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'artPreMultiplied')`,
		},
		artClip: {
			type: 'number',
			id: 'artClip',
			label: 'Clip',
			min: 0,
			max: 100,
			range: true,
			default: 50,
			step: 1,
			isVisibleExpression: `arrayIncludes($(options:properties), 'artClip')`,
			asInteger: false,
			clampValues: true,
		},
		artGain: {
			type: 'number',
			id: 'artGain',
			label: 'Gain',
			min: 0,
			max: 100,
			range: true,
			default: 50,
			step: 1,
			isVisibleExpression: `arrayIncludes($(options:properties), 'artGain')`,
			asInteger: false,
			clampValues: true,
		},
		artInvertKey: {
			type: 'checkbox',
			id: 'artInvertKey',
			label: 'Invert Key',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'artInvertKey')`,
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}

export function DropdownPropertiesPicker(
	allProps: Record<
		string,
		| CompanionInputFieldTextInput
		| CompanionInputFieldCheckbox
		| CompanionInputFieldDropdown
		| CompanionInputFieldNumber
		| CompanionInputFieldMultiDropdown
	>,
): CompanionInputFieldMultiDropdown<'properties'> {
	return {
		type: 'multidropdown',
		id: 'properties',
		label: 'Properties',
		minSelection: 1,
		default: Object.values(allProps).map((p) => p.id),
		choices: Object.values(allProps).map((p) => ({ id: p.id, label: p.label })),
		disableAutoExpression: true,
	}
}

export function AtemSuperSourceArtSourcePicker<T extends string>(
	model: ModelSpec,
	state: AtemState,
	id: T,
	label: string,
): CompanionInputFieldDropdown<T> {
	return {
		type: 'dropdown',
		id: id,
		label: label,
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-art')),
	}
}
export function AtemSuperSourceBoxSourcePicker(
	model: ModelSpec,
	state: AtemState,
): CompanionInputFieldDropdown<'source'> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-box')),
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

export function AtemMediaPlayerSourcePicker(
	model: ModelSpec,
	state: AtemState,
	includeClips = true,
): CompanionInputFieldDropdown<'source'> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: [
			...(includeClips
				? iterateTimes(model.media.clips, (i) => {
						const clip = state.media.clipPool[i]
						return {
							id: i + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
							label: clip?.name ? `Clip #${i + 1}: ${clip.name}` : `Clip #${i + 1}`,
						}
					})
				: []),
			...iterateTimes(model.media.stills, (i) => {
				const still = state.media.stillPool[i]
				return {
					id: i,
					label: still?.fileName ? `Still #${i + 1}: ${still.fileName}` : `Still #${i + 1}`,
				}
			}),
		],
		disableAutoExpression: true, // TODO: allow this to be dynamic!
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

export type FadeDurationFieldsType = {
	fadeDuration: number
	fadeAlgorithm: Easing.algorithm
	fadeCurve: Easing.curve
}

export const FadeDurationFields = {
	fadeDuration: {
		type: 'number',
		label: 'Fade Duration (ms)',
		id: 'fadeDuration',
		default: 0,
		min: 0,
		step: 10,
		max: 60000,
		asInteger: true,
		clampValues: true,
	},
	fadeAlgorithm: {
		type: 'dropdown',
		label: 'Algorithm',
		id: 'fadeAlgorithm',
		default: 'linear',
		choices: [
			{ id: 'linear', label: 'Linear' },
			{ id: 'quadratic', label: 'Quadratic' },
			{ id: 'cubic', label: 'Cubic' },
			{ id: 'quartic', label: 'Quartic' },
			{ id: 'quintic', label: 'Quintic' },
			{ id: 'sinusoidal', label: 'Sinusoidal' },
			{ id: 'exponential', label: 'Exponential' },
			{ id: 'circular', label: 'Circular' },
			{ id: 'elastic', label: 'Elastic' },
			{ id: 'back', label: 'Back' },
			{ id: 'bounce', label: 'Bounce' },
		],
		disableAutoExpression: true,
	},
	fadeCurve: {
		type: 'dropdown',
		label: 'Fade curve',
		id: 'fadeCurve',
		default: 'ease-in',
		choices: [
			{ id: 'ease-in', label: 'Ease-in' },
			{ id: 'ease-out', label: 'Ease-out' },
			{ id: 'ease-in-out', label: 'Ease-in-out' },
		],
		isVisibleExpression: `$(options:fadeAlgorithm) != null && $(options:fadeAlgorithm) != 'linear'`,
		disableAutoExpression: true,
	},
} as const satisfies MyOptionsObject<FadeDurationFieldsType, CompanionInputFieldNumber | CompanionInputFieldDropdown>

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

export function AtemUSKFlyKeyPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	flyEnabled: CompanionInputFieldCheckbox<'flyEnabled'>
	positionX: CompanionInputFieldNumber<'positionX'>
	positionY: CompanionInputFieldNumber<'positionY'>
	sizeX: CompanionInputFieldNumber<'sizeX'>
	sizeY: CompanionInputFieldNumber<'sizeY'>
} {
	const allProps: Omit<ReturnType<typeof AtemUSKFlyKeyPropertiesPickers>, 'properties'> = {
		flyEnabled: {
			type: 'checkbox',
			label: 'Enabled',
			id: 'flyEnabled',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'flyEnabled')`,
		},
		positionX: {
			type: 'number',
			label: 'Position X',
			id: 'positionX',
			default: 0,
			min: -32,
			step: 0.01,
			max: 32,
			isVisibleExpression: `arrayIncludes($(options:properties), 'positionX')`,
			asInteger: false,
			clampValues: true,
		},
		positionY: {
			type: 'number',
			label: 'Position Y',
			id: 'positionY',
			default: 0,
			min: -18,
			step: 0.01,
			max: 18,
			isVisibleExpression: `arrayIncludes($(options:properties), 'positionY')`,
			asInteger: false,
			clampValues: true,
		},
		sizeX: {
			type: 'number',
			label: 'Size X',
			id: 'sizeX',
			default: 1.0,
			min: 0.0,
			step: 0.01,
			max: 99.99,
			isVisibleExpression: `arrayIncludes($(options:properties), 'sizeX')`,
			asInteger: false,
			clampValues: true,
		},
		sizeY: {
			type: 'number',
			label: 'Size Y',
			id: 'sizeY',
			default: 1.0,
			min: 0.0,
			step: 0.01,
			max: 99.99,
			isVisibleExpression: `arrayIncludes($(options:properties), 'sizeY')`,
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
