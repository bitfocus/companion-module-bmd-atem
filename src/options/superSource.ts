import {
	type CompanionInputFieldMultiDropdown,
	type CompanionInputFieldNumber,
	type CompanionInputFieldDropdown,
	type CompanionInputFieldCheckbox,
	assertNever,
	type DropdownChoice,
	type JsonValue,
} from '@companion-module/base'
import { type AtemState, Enums } from 'atem-connection'
import { type TrueFalseToggle, CHOICES_KEYTRANS } from '../options/common.js'
import { type WithProperties, SourcesToChoices, WithDropdownPropertiesPicker } from './util.js'
import type { ModelSpec } from '../models/types.js'
import { compact, iterateTimes } from '../util.js'
import { GetSourcesListForType } from './sources.js'
import { CHOICES_BORDER_BEVEL } from './upstreamKeyer-dve.js'

export function AtemSuperSourceIdPicker(model: ModelSpec): CompanionInputFieldDropdown<'ssrcId'> {
	const choices = iterateTimes(model.SSrc, (i) => ({
		id: i + 1,
		label: `Super Source ${i + 1}`,
	}))

	return {
		type: 'dropdown',
		id: 'ssrcId',
		label: 'Super Source',
		default: 1,
		choices,
		isVisibleExpression: choices.length > 1 ? undefined : 'false', // Hide if only 1 choice
		allowInvalidValues: choices.length > 1 ? undefined : true, // Allow any value when hidden
	}
}
export function AtemSuperSourceBoxPicker(): CompanionInputFieldDropdown<'boxIndex'> {
	return {
		type: 'dropdown',
		id: 'boxIndex',
		label: 'Box #',
		default: 1,
		choices: [
			{ id: 1, label: 'Box 1' },
			{ id: 2, label: 'Box 2' },
			{ id: 3, label: 'Box 3' },
			{ id: 4, label: 'Box 4' },
		],
	}
}
/** Box picker that also offers an "All boxes" choice (id 0), for per-box border control */
export function AtemSuperSourceBoxPickerWithAll(): CompanionInputFieldDropdown<'boxIndex'> {
	return {
		type: 'dropdown',
		id: 'boxIndex',
		label: 'Box #',
		default: 0,
		choices: [
			{ id: 0, label: 'All boxes' },
			{ id: 1, label: 'Box 1' },
			{ id: 2, label: 'Box 2' },
			{ id: 3, label: 'Box 3' },
			{ id: 4, label: 'Box 4' },
		],
		expressionDescription: 'Should return a box number, eg 1, 2, 3, 4. Use 0 for all boxes',
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
		expressionDescription: 'Should return a source number, eg 1, 3010, 4010',
		allowInvalidValues: true,
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
		expressionDescription: 'Should return a source number, eg 1, 3010, 4010',
		allowInvalidValues: true,
	}
}

export type AtemSuperSourceBoxPropertiesBase = {
	size: number
	onair: TrueFalseToggle
	source: JsonValue
	x: number
	y: number
	cropEnable: boolean
	cropTop: number
	cropBottom: number
	cropLeft: number
	cropRight: number
}
export type AtemSuperSourceBoxProperties = WithProperties<AtemSuperSourceBoxPropertiesBase>

export function AtemSuperSourceBoxPropertiesPickers(
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
	return WithDropdownPropertiesPicker({
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
			expressionDescription: 'Should return a source number, eg 1, 3010, 4010',
			allowInvalidValues: true,
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
	})
}

export function AtemSuperSourceBoxPropertiesPickersForOffset(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	size: CompanionInputFieldNumber<'size'>
	x: CompanionInputFieldNumber<'x'>
	y: CompanionInputFieldNumber<'y'>
	cropTop: CompanionInputFieldNumber<'cropTop'>
	cropBottom: CompanionInputFieldNumber<'cropBottom'>
	cropLeft: CompanionInputFieldNumber<'cropLeft'>
	cropRight: CompanionInputFieldNumber<'cropRight'>
} {
	return WithDropdownPropertiesPicker({
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
	})
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

export type AtemSuperSourceArtPropertiesBase = {
	fill: JsonValue
	key: JsonValue
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
	const artFillSources = SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-art'))
	const artKeySources = SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-art-key'))

	return WithDropdownPropertiesPicker({
		fill: {
			type: 'dropdown',
			id: 'fill',
			label: 'Fill Source',
			default: 0,
			choices: artFillSources,
			isVisibleExpression: `arrayIncludes($(options:properties), 'fill')`,
			expressionDescription: 'Should return a source number, eg 1, 3010, 4010',
			allowInvalidValues: true,
		},
		key: {
			type: 'dropdown',
			id: 'key',
			label: 'Key Source',
			default: 0,
			choices: artKeySources,
			isVisibleExpression: `arrayIncludes($(options:properties), 'key')`,
			expressionDescription: 'Should return a source number, eg 1, 3010, 4010',
			allowInvalidValues: true,
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
	})
}

export type AtemSuperSourceBorderPropertiesBase = {
	borderEnabled: boolean
	borderBevel: Enums.BorderBevel
	borderOuterWidth: number
	borderInnerWidth: number
	borderOuterSoftness: number
	borderInnerSoftness: number
	borderBevelSoftness: number
	borderBevelPosition: number
	borderHue: number
	borderSaturation: number
	borderLuma: number
	borderLightSourceDirection: number
	borderLightSourceAltitude: number
}
export type AtemSuperSourceBorderProperties = WithProperties<AtemSuperSourceBorderPropertiesBase>

export function AtemSuperSourceBorderPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	borderEnabled: CompanionInputFieldCheckbox<'borderEnabled'>
	borderBevel: CompanionInputFieldDropdown<'borderBevel'>
	borderOuterWidth: CompanionInputFieldNumber<'borderOuterWidth'>
	borderInnerWidth: CompanionInputFieldNumber<'borderInnerWidth'>
	borderOuterSoftness: CompanionInputFieldNumber<'borderOuterSoftness'>
	borderInnerSoftness: CompanionInputFieldNumber<'borderInnerSoftness'>
	borderBevelSoftness: CompanionInputFieldNumber<'borderBevelSoftness'>
	borderBevelPosition: CompanionInputFieldNumber<'borderBevelPosition'>
	borderHue: CompanionInputFieldNumber<'borderHue'>
	borderSaturation: CompanionInputFieldNumber<'borderSaturation'>
	borderLuma: CompanionInputFieldNumber<'borderLuma'>
	borderLightSourceDirection: CompanionInputFieldNumber<'borderLightSourceDirection'>
	borderLightSourceAltitude: CompanionInputFieldNumber<'borderLightSourceAltitude'>
} {
	return WithDropdownPropertiesPicker({
		borderEnabled: {
			type: 'checkbox',
			label: 'Border: Enabled',
			id: 'borderEnabled',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderEnabled')`,
		},
		borderBevel: {
			type: 'dropdown',
			label: 'Border: Style',
			id: 'borderBevel',
			default: 0,
			choices: CHOICES_BORDER_BEVEL,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderBevel')`,
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
			asInteger: true,
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
		borderLightSourceDirection: {
			type: 'number',
			label: 'Border: Light Source Direction',
			id: 'borderLightSourceDirection',
			default: 36,
			min: 0,
			range: true,
			step: 1,
			max: 359,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderLightSourceDirection')`,
			asInteger: false,
			clampValues: true,
		},
		borderLightSourceAltitude: {
			type: 'number',
			label: 'Border: Light Source Altitude',
			id: 'borderLightSourceAltitude',
			default: 25,
			min: 10,
			range: true,
			step: 1,
			max: 100,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderLightSourceAltitude')`,
			asInteger: true,
			clampValues: true,
		},
	})
}

export type AtemSuperSourceBoxBorderPropertiesBase = {
	borderEnabled: boolean
	borderWidthOutHorizontal: number
	borderWidthOutVertical: number
	borderWidthInLeft: number
	borderWidthInRight: number
	borderWidthInTop: number
	borderWidthInBottom: number
	borderHue: number
	borderSaturation: number
	borderLuma: number
}
export type AtemSuperSourceBoxBorderProperties = WithProperties<AtemSuperSourceBoxBorderPropertiesBase>

function BoxBorderWidthPicker<T extends string>(id: T, label: string): CompanionInputFieldNumber<T> {
	return {
		type: 'number',
		label: label,
		id: id,
		default: 0,
		min: 0,
		range: true,
		step: 0.01,
		max: 16,
		isVisibleExpression: `arrayIncludes($(options:properties), '${id}')`,
		asInteger: false,
		clampValues: true,
	}
}

export function AtemSuperSourceBoxBorderPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown<'properties'>
	borderEnabled: CompanionInputFieldCheckbox<'borderEnabled'>
	borderWidthOutHorizontal: CompanionInputFieldNumber<'borderWidthOutHorizontal'>
	borderWidthOutVertical: CompanionInputFieldNumber<'borderWidthOutVertical'>
	borderWidthInLeft: CompanionInputFieldNumber<'borderWidthInLeft'>
	borderWidthInRight: CompanionInputFieldNumber<'borderWidthInRight'>
	borderWidthInTop: CompanionInputFieldNumber<'borderWidthInTop'>
	borderWidthInBottom: CompanionInputFieldNumber<'borderWidthInBottom'>
	borderHue: CompanionInputFieldNumber<'borderHue'>
	borderSaturation: CompanionInputFieldNumber<'borderSaturation'>
	borderLuma: CompanionInputFieldNumber<'borderLuma'>
} {
	return WithDropdownPropertiesPicker({
		borderEnabled: {
			type: 'checkbox',
			label: 'Border: Enabled',
			id: 'borderEnabled',
			default: true,
			isVisibleExpression: `arrayIncludes($(options:properties), 'borderEnabled')`,
		},
		borderWidthOutHorizontal: BoxBorderWidthPicker('borderWidthOutHorizontal', 'Border: Outer Width (Horizontal)'),
		borderWidthOutVertical: BoxBorderWidthPicker('borderWidthOutVertical', 'Border: Outer Width (Vertical)'),
		borderWidthInLeft: BoxBorderWidthPicker('borderWidthInLeft', 'Border: Inner Width (Left)'),
		borderWidthInRight: BoxBorderWidthPicker('borderWidthInRight', 'Border: Inner Width (Right)'),
		borderWidthInTop: BoxBorderWidthPicker('borderWidthInTop', 'Border: Inner Width (Top)'),
		borderWidthInBottom: BoxBorderWidthPicker('borderWidthInBottom', 'Border: Inner Width (Bottom)'),
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
	})
}
