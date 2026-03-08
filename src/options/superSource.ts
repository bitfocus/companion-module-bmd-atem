import type {
	CompanionInputFieldMultiDropdown,
	CompanionInputFieldNumber,
	CompanionInputFieldDropdown,
	CompanionInputFieldCheckbox,
} from '@companion-module/base'
import { AtemState } from 'atem-connection'
import { TrueFalseToggle, CHOICES_KEYTRANS, GetSourcesListForType } from '../choices.js'
import { WithProperties, DropdownPropertiesPicker, SourcesToChoices } from './util.js'
import { ModelSpec } from '../models/types.js'

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
