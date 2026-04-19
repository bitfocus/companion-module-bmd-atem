import {
	type CompanionInputFieldMultiDropdown,
	type CompanionInputFieldNumber,
	type CompanionInputFieldDropdown,
	type CompanionInputFieldCheckbox,
	assertNever,
	type DropdownChoice,
} from '@companion-module/base'
import { type AtemState, Enums } from 'atem-connection'
import { type TrueFalseToggle, CHOICES_KEYTRANS, GetSourcesListForType } from '../choices.js'
import { type WithProperties, SourcesToChoices, WithDropdownPropertiesPicker } from './util.js'
import type { ModelSpec } from '../models/types.js'
import { compact, iterateTimes } from '../util.js'

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

export type AtemSuperSourceBoxPropertiesBase = {
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

	return WithDropdownPropertiesPicker({
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
	})
}
