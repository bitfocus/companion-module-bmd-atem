import type {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	CompanionInputFieldNumber,
	CompanionInputFieldTextInput,
	CompanionOptionValues,
	DropdownChoice,
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
	FairlightAudioRoutingDestinations,
	FairlightAudioRoutingSources,
} from './choices.js'
import type { ModelSpec } from './models/index.js'
import { iterateTimes, MEDIA_PLAYER_SOURCE_CLIP_OFFSET, compact, NumberComparitor } from './util.js'
import type { MyOptionsObject } from './common.js'
import * as Easing from './easings.js'

export function AtemMESourcePicker(model: ModelSpec, state: AtemState, id: number): CompanionInputFieldDropdown {
	return {
		id: `input${id ? id : ''}`,
		label: `Input${id ? ` Option ${id}` : ''}`,
		type: 'dropdown',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
	}
}
export function AtemTransitionStylePicker(skipSting?: boolean): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'style',
		label: 'Transition Style',
		default: Enums.TransitionStyle.MIX,
		choices: GetTransitionStyleChoices(skipSting),
	}
}
export function AtemUpstreamKeyerTypePicker(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'style',
		label: 'Key Type',
		default: Enums.MixEffectKeyType.Luma,
		choices: GetUpstreamKeyerTypeChoices(),
	}
}
export function AtemRatePicker(label: string): CompanionInputFieldNumber {
	return {
		type: 'number',
		id: 'rate',
		label,
		min: 1,
		max: 250,
		range: true,
		default: 25,
	}
}
export function AtemTransitionSelectComponentsPickers(model: ModelSpec): {
	background: CompanionInputFieldDropdown
	[id: `key${string}`]: CompanionInputFieldDropdown
} {
	const pickers: ReturnType<typeof AtemTransitionSelectComponentsPickers> = {
		background: {
			type: 'dropdown',
			id: 'background',
			label: 'Background',
			choices: CHOICES_NEXTTRANS_BACKGROUND,
			default: NextTransBackgroundChoices.NoChange,
		},
	}

	for (let i = 0; i < model.USKs; i++) {
		pickers[`key${i}`] = {
			label: `Key ${i + 1}`,
			type: 'dropdown',
			id: `key${i}`,
			choices: CHOICES_NEXTTRANS_KEY,
			default: NextTransKeyChoices.NoChange,
		}
	}

	return pickers
}
export function AtemTransitionSelectionPicker(model: ModelSpec): CompanionInputFieldMultiDropdown {
	const choices: DropdownChoice[] = [{ id: 'background', label: 'Background' }]

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
export function AtemTransitionSelectionComponentPicker(model: ModelSpec): CompanionInputFieldDropdown {
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
export function AtemMEPicker(model: ModelSpec, id: number): CompanionInputFieldDropdown {
	return {
		id: `mixeffect${id ? id : ''}`,
		label: `M/E${id ? ` Option ${id}` : ''}`,
		type: 'dropdown',
		default: id > 0 ? id - 1 : 0,
		choices: GetMEIdChoices(model),
	}
}
export function AtemDSKPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Key',
		id: 'key',
		default: 0,
		choices: GetDSKIdChoices(model),
	}
}
export function AtemDSKMaskPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown
	maskEnabled: CompanionInputFieldCheckbox
	maskTop: CompanionInputFieldNumber
	maskBottom: CompanionInputFieldNumber
	maskLeft: CompanionInputFieldNumber
	maskRight: CompanionInputFieldNumber
} {
	const allProps: Omit<ReturnType<typeof AtemDSKMaskPropertiesPickers>, 'properties'> = {
		maskEnabled: {
			type: 'checkbox',
			label: 'Enabled',
			id: 'maskEnabled',
			default: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskEnabled'),
		},
		maskTop: {
			type: 'number',
			label: 'Top',
			id: 'maskTop',
			default: 9,
			min: -9,
			step: 0.01,
			max: 9,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskTop'),
		},
		maskBottom: {
			type: 'number',
			label: 'Bottom',
			id: 'maskBottom',
			default: -9,
			min: -9,
			step: 0.01,
			max: 9,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskBottom'),
		},
		maskLeft: {
			type: 'number',
			label: 'Left',
			id: 'maskLeft',
			default: -16,
			min: -16,
			step: 0.01,
			max: 16,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskLeft'),
		},
		maskRight: {
			type: 'number',
			label: 'Right',
			id: 'maskRight',
			default: 16,
			min: -16,
			step: 0.01,
			max: 16,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskRight'),
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}

export function AtemDSKPreMultipliedKeyPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown
	preMultiply: CompanionInputFieldCheckbox
	clip: CompanionInputFieldNumber
	gain: CompanionInputFieldNumber
	invert: CompanionInputFieldCheckbox
} {
	const allProps: Omit<ReturnType<typeof AtemDSKPreMultipliedKeyPropertiesPickers>, 'properties'> = {
		preMultiply: {
			type: 'checkbox',
			label: 'Enabled',
			id: 'preMultiply',
			default: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('preMultiply'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('clip'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('gain'),
		},
		invert: {
			type: 'checkbox',
			label: 'Invert key',
			id: 'invert',
			default: false,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('invert'),
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}

export function AtemUSKPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Key',
		id: 'key',
		default: 0,
		choices: GetUSKIdChoices(model),
	}
}
export function AtemUSKMaskPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown
	maskEnabled: CompanionInputFieldCheckbox
	maskTop: CompanionInputFieldNumber
	maskBottom: CompanionInputFieldNumber
	maskLeft: CompanionInputFieldNumber
	maskRight: CompanionInputFieldNumber
} {
	const allProps: Omit<ReturnType<typeof AtemUSKMaskPropertiesPickers>, 'properties'> = {
		maskEnabled: {
			type: 'checkbox',
			label: 'Enabled',
			id: 'maskEnabled',
			default: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskEnabled'),
		},
		maskTop: {
			type: 'number',
			label: 'Top',
			id: 'maskTop',
			default: 9,
			min: -9,
			step: 0.01,
			max: 9,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskTop'),
		},
		maskBottom: {
			type: 'number',
			label: 'Bottom',
			id: 'maskBottom',
			default: -9,
			min: -9,
			step: 0.01,
			max: 9,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskBottom'),
		},
		maskLeft: {
			type: 'number',
			label: 'Left',
			id: 'maskLeft',
			default: -16,
			min: -16,
			step: 0.01,
			max: 16,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskLeft'),
		},
		maskRight: {
			type: 'number',
			label: 'Right',
			id: 'maskRight',
			default: 16,
			min: -16,
			step: 0.01,
			max: 16,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskRight'),
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}
export function AtemUSKDVEPropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown

	positionX: CompanionInputFieldNumber
	positionY: CompanionInputFieldNumber
	sizeX: CompanionInputFieldNumber
	sizeY: CompanionInputFieldNumber
	rotation: CompanionInputFieldNumber
	maskEnabled: CompanionInputFieldCheckbox
	maskTop: CompanionInputFieldNumber
	maskBottom: CompanionInputFieldNumber
	maskLeft: CompanionInputFieldNumber
	maskRight: CompanionInputFieldNumber
	shadowEnabled: CompanionInputFieldCheckbox
	lightSourceDirection: CompanionInputFieldNumber
	lightSourceAltitude: CompanionInputFieldNumber
	borderEnabled: CompanionInputFieldCheckbox
	borderHue: CompanionInputFieldNumber
	borderSaturation: CompanionInputFieldNumber
	borderLuma: CompanionInputFieldNumber
	borderBevel: CompanionInputFieldDropdown
	borderOuterWidth: CompanionInputFieldNumber
	borderInnerWidth: CompanionInputFieldNumber
	borderOuterSoftness: CompanionInputFieldNumber
	borderInnerSoftness: CompanionInputFieldNumber
	borderOpacity: CompanionInputFieldNumber
	borderBevelPosition: CompanionInputFieldNumber
	borderBevelSoftness: CompanionInputFieldNumber
	rate: CompanionInputFieldNumber
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('positionX'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('positionY'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('sizeX'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('sizeY'),
		},
		rotation: {
			type: 'number',
			label: 'Rotation',
			id: 'rotation',
			range: true,
			default: 0,
			min: 0,
			max: 360,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('rotation'),
		},
		maskEnabled: {
			type: 'checkbox',
			label: 'Mask: Enabled',
			id: 'maskEnabled',
			default: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskEnabled'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskTop'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskBottom'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskLeft'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskRight'),
		},
		shadowEnabled: {
			type: 'checkbox',
			label: 'Shadow: Enabled',
			id: 'shadowEnabled',
			default: false,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('shadowEnabled'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('lightSourceDirection'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('lightSourceAltitude'),
		},
		borderEnabled: {
			type: 'checkbox',
			label: 'Border: Enabled',
			id: 'borderEnabled',
			default: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderEnabled'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderHue'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderSaturation'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderLuma'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderOuterWidth'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderInnerWidth'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderOuterSoftness'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderInnerSoftness'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderOpacity'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderBevelPosition'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderBevelSoftness'),
		},
		rate: AtemRatePicker('Rate'),
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}
export function AtemUSKDVEPropertiesVariablesPickers(): {
	properties: CompanionInputFieldMultiDropdown

	positionX: CompanionInputFieldTextInput
	positionY: CompanionInputFieldTextInput
	sizeX: CompanionInputFieldTextInput
	sizeY: CompanionInputFieldTextInput
	rotation: CompanionInputFieldTextInput
	maskEnabled: CompanionInputFieldTextInput
	maskTop: CompanionInputFieldTextInput
	maskBottom: CompanionInputFieldTextInput
	maskLeft: CompanionInputFieldTextInput
	maskRight: CompanionInputFieldTextInput
	shadowEnabled: CompanionInputFieldTextInput
	lightSourceDirection: CompanionInputFieldTextInput
	lightSourceAltitude: CompanionInputFieldTextInput
	borderEnabled: CompanionInputFieldTextInput
	borderHue: CompanionInputFieldTextInput
	borderSaturation: CompanionInputFieldTextInput
	borderLuma: CompanionInputFieldTextInput
	borderBevel: CompanionInputFieldTextInput
	borderOuterWidth: CompanionInputFieldTextInput
	borderInnerWidth: CompanionInputFieldTextInput
	borderOuterSoftness: CompanionInputFieldTextInput
	borderInnerSoftness: CompanionInputFieldTextInput
	borderOpacity: CompanionInputFieldTextInput
	borderBevelPosition: CompanionInputFieldTextInput
	borderBevelSoftness: CompanionInputFieldTextInput
	rate: CompanionInputFieldTextInput
} {
	const allProps: Omit<ReturnType<typeof AtemUSKDVEPropertiesVariablesPickers>, 'properties'> = {
		positionX: {
			type: 'textinput',
			label: 'Position: X',
			id: 'positionX',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('positionX'),
		},
		positionY: {
			type: 'textinput',
			label: 'Position: Y',
			id: 'positionY',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('positionY'),
		},
		sizeX: {
			type: 'textinput',
			label: 'Size: X',
			id: 'sizeX',
			default: '0.5',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('sizeX'),
		},
		sizeY: {
			type: 'textinput',
			label: 'Size: Y',
			id: 'sizeY',
			default: '0.5',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('sizeY'),
		},
		rotation: {
			type: 'textinput',
			label: 'Rotation',
			id: 'rotation',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('rotation'),
		},
		maskEnabled: {
			type: 'textinput',
			label: 'Mask: Enabled',
			id: 'maskEnabled',
			default: 'true',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskEnabled'),
		},
		maskTop: {
			type: 'textinput',
			label: 'Mask: Top',
			id: 'maskTop',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskTop'),
		},
		maskBottom: {
			type: 'textinput',
			label: 'Mask: Bottom',
			id: 'maskBottom',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskBottom'),
		},
		maskLeft: {
			type: 'textinput',
			label: 'Mask: Left',
			id: 'maskLeft',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskLeft'),
		},
		maskRight: {
			type: 'textinput',
			label: 'Mask: Right',
			id: 'maskRight',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskRight'),
		},
		shadowEnabled: {
			type: 'textinput',
			label: 'Shadow: Enabled',
			id: 'shadowEnabled',
			default: 'false',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('shadowEnabled'),
		},
		lightSourceDirection: {
			type: 'textinput',
			label: 'Shadow: Angle',
			id: 'lightSourceDirection',
			default: '36',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('lightSourceDirection'),
		},
		lightSourceAltitude: {
			type: 'textinput',
			label: 'Shadow: Altitude',
			id: 'lightSourceAltitude',
			default: '25',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('lightSourceAltitude'),
		},
		borderEnabled: {
			type: 'textinput',
			label: 'Border: Enabled',
			id: 'borderEnabled',
			default: 'true',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderEnabled'),
		},
		borderHue: {
			type: 'textinput',
			label: 'Border: Hue',
			id: 'borderHue',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderHue'),
		},
		borderSaturation: {
			type: 'textinput',
			label: 'Border: Sat',
			id: 'borderSaturation',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderSaturation'),
		},
		borderLuma: {
			type: 'textinput',
			label: 'Border: Lum',
			id: 'borderLuma',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderLuma'),
		},
		borderBevel: {
			type: 'textinput',
			label: 'Border: Style',
			id: 'borderBevel',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderStyle'),
		},
		borderOuterWidth: {
			type: 'textinput',
			label: 'Border: Outer Width',
			id: 'borderOuterWidth',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderOuterWidth'),
		},
		borderInnerWidth: {
			type: 'textinput',
			label: 'Border: Inner Width',
			id: 'borderInnerWidth',
			default: '0.2',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderInnerWidth'),
		},
		borderOuterSoftness: {
			type: 'textinput',
			label: 'Border: Outer Soften',
			id: 'borderOuterSoftness',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderOuterSoftness'),
		},
		borderInnerSoftness: {
			type: 'textinput',
			label: 'Border: Inner Soften',
			id: 'borderInnerSoftness',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderInnerSoftness'),
		},
		borderOpacity: {
			type: 'textinput',
			label: 'Border: Opacity',
			id: 'borderOpacity',
			default: '100',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderOpacity'),
		},
		borderBevelPosition: {
			type: 'textinput',
			label: 'Border: Bevel Position',
			id: 'borderBevelPosition',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderBevelPosition'),
		},
		borderBevelSoftness: {
			type: 'textinput',
			label: 'Border: Bevel Soften',
			id: 'borderBevelSoftness',
			default: '0',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderBevelSoftness'),
		},
		rate: {
			type: 'textinput',
			id: 'rate',
			label: 'Rate',
			default: '25',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('rate'),
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}
export function AtemUSKKeyframePropertiesPickers(): {
	properties: CompanionInputFieldMultiDropdown

	positionX: CompanionInputFieldNumber
	positionY: CompanionInputFieldNumber
	sizeX: CompanionInputFieldNumber
	sizeY: CompanionInputFieldNumber
	rotation: CompanionInputFieldNumber
	maskTop: CompanionInputFieldNumber
	maskBottom: CompanionInputFieldNumber
	maskLeft: CompanionInputFieldNumber
	maskRight: CompanionInputFieldNumber
	lightSourceDirection: CompanionInputFieldNumber
	lightSourceAltitude: CompanionInputFieldNumber
	borderHue: CompanionInputFieldNumber
	borderSaturation: CompanionInputFieldNumber
	borderLuma: CompanionInputFieldNumber
	borderOuterWidth: CompanionInputFieldNumber
	borderInnerWidth: CompanionInputFieldNumber
	borderOuterSoftness: CompanionInputFieldNumber
	borderInnerSoftness: CompanionInputFieldNumber
	borderOpacity: CompanionInputFieldNumber
	borderBevelPosition: CompanionInputFieldNumber
	borderBevelSoftness: CompanionInputFieldNumber
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('positionX'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('positionY'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('sizeX'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('sizeY'),
		},
		rotation: {
			type: 'number',
			label: 'Rotation',
			id: 'rotation',
			range: true,
			default: 0,
			min: 0,
			max: 360,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('rotation'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskTop'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskBottom'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskLeft'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('maskRight'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('lightSourceDirection'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('lightSourceAltitude'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderHue'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderSaturation'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderLuma'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderOuterWidth'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderInnerWidth'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderOuterSoftness'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderInnerSoftness'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderOpacity'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderBevelPosition'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('borderBevelSoftness'),
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}
export function AtemAuxPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'aux',
		label: 'Aux/Output',
		default: 0,
		choices: GetAuxIdChoices(model),
	}
}
export function AtemMultiviewerPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'multiViewerId',
		label: 'MV',
		default: 0,
		choices: GetMultiviewerIdChoices(model),
	}
}
export function AtemKeyFillSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Fill Source',
		id: 'fill',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
	}
}
export function AtemKeyCutSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Key Source',
		id: 'cut',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'key')),
	}
}
export function AtemAuxSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Input',
		id: 'input',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'aux')),
	}
}
export function AtemSuperSourceBoxPicker(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'boxIndex',
		label: 'Box #',
		default: 0,
		choices: CHOICES_SSRCBOXES,
	}
}
export function AtemSuperSourceIdPicker(model: ModelSpec): CompanionInputFieldDropdown | undefined {
	const choices = GetSuperSourceIdChoices(model)
	if (choices.length > 1) {
		return {
			type: 'dropdown',
			id: 'ssrcId',
			label: 'Super Source',
			default: 0,
			choices,
		}
	} else {
		return undefined
	}
}
export function AtemSuperSourceArtOption(action: boolean): CompanionInputFieldDropdown {
	const options = compact([
		action
			? {
					id: 'unchanged',
					label: 'Unchanged',
				}
			: undefined,
		{
			id: Enums.SuperSourceArtOption.Foreground,
			label: 'Foreground',
		},
		{
			id: Enums.SuperSourceArtOption.Background,
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

export interface AtemSuperSourceProperties {
	properties: Array<
		'size' | 'onair' | 'source' | 'x' | 'y' | 'cropEnable' | 'cropTop' | 'cropBottom' | 'cropLeft' | 'cropRight'
	>
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
export function AtemSuperSourcePropertiesPickers(
	model: ModelSpec,
	state: AtemState,
): MyOptionsObject<
	AtemSuperSourceProperties,
	| CompanionInputFieldMultiDropdown
	| CompanionInputFieldDropdown
	| CompanionInputFieldNumber
	| CompanionInputFieldCheckbox
> {
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('size'),
		},

		onair: {
			id: 'onair',
			type: 'dropdown',
			label: 'On Air',
			default: 'true',
			choices: CHOICES_KEYTRANS,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('onair'),
		},
		source: {
			type: 'dropdown',
			id: 'source',
			label: 'Source',
			default: 0,
			choices: SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-box')),
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('source'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('x'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('y'),
		},
		cropEnable: {
			type: 'checkbox',
			id: 'cropEnable',
			label: 'Crop Enable',
			default: false,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropEnable'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropTop'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropBottom'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropLeft'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropRight'),
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}
export function AtemSuperSourcePropertiesPickersForOffset(): {
	properties: CompanionInputFieldMultiDropdown
	size: CompanionInputFieldNumber
	x: CompanionInputFieldNumber
	y: CompanionInputFieldNumber
	cropTop: CompanionInputFieldNumber
	cropBottom: CompanionInputFieldNumber
	cropLeft: CompanionInputFieldNumber
	cropRight: CompanionInputFieldNumber
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('size'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('x'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('y'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropTop'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropBottom'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropLeft'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropRight'),
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}
export interface AtemSuperSourceArtProperties {
	properties: Array<'fill' | 'key' | 'artOption' | 'artPreMultiplied' | 'artClip' | 'artGain' | 'artInvertKey'>
	fill: number
	key: number
	artOption: 'unchanged' | Enums.SuperSourceArtOption | 'toggle'
	artPreMultiplied: boolean
	artClip: number
	artGain: number
	artInvertKey: boolean
}
export function AtemSuperSourceArtPropertiesPickers(
	model: ModelSpec,
	state: AtemState,
	action: boolean,
): MyOptionsObject<
	AtemSuperSourceArtProperties,
	| CompanionInputFieldCheckbox
	| CompanionInputFieldDropdown
	| CompanionInputFieldNumber
	| CompanionInputFieldMultiDropdown
> {
	const artSources = SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-art'))

	const allProps: Omit<ReturnType<typeof AtemSuperSourceArtPropertiesPickers>, 'properties'> = {
		fill: {
			type: 'dropdown',
			id: 'fill',
			label: 'Fill Source',
			default: 0,
			choices: artSources,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('fill'),
		},
		key: {
			type: 'dropdown',
			id: 'key',
			label: 'Key Source',
			default: 0,
			choices: artSources,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('key'),
		},
		artOption: {
			...AtemSuperSourceArtOption(action),
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artOption'),
		},
		artPreMultiplied: {
			type: 'checkbox',
			id: 'artPreMultiplied',
			label: 'Pre-multiplied',
			default: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artPreMultiplied'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artClip'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artGain'),
		},
		artInvertKey: {
			type: 'checkbox',
			id: 'artInvertKey',
			label: 'Invert Key',
			default: false,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artInvertKey'),
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}

export interface AtemSuperSourceArtPropertiesVariables {
	properties: Array<'fill' | 'key'> // | 'artOption' | 'artPreMultiplied' | 'artClip' | 'artGain' | 'artInvertKey'>
	fill: string
	key: string
	// artOption: 'unchanged' | Enums.SuperSourceArtOption | 'toggle'
	// artPreMultiplied: boolean
	// artClip: number
	// artGain: number
	// artInvertKey: boolean
}
export function AtemSuperSourceArtPropertiesVariablesPickers(): MyOptionsObject<
	AtemSuperSourceArtPropertiesVariables,
	CompanionInputFieldTextInput | CompanionInputFieldMultiDropdown
> {
	const allProps: Omit<ReturnType<typeof AtemSuperSourceArtPropertiesVariablesPickers>, 'properties'> = {
		fill: {
			type: 'textinput',
			id: 'fill',
			label: 'Fill Source',
			default: '1',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('fill'),
		},
		key: {
			type: 'textinput',
			id: 'key',
			label: 'Key Source',
			default: '1',
			useVariables: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('key'),
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
): CompanionInputFieldMultiDropdown {
	return {
		type: 'multidropdown',
		id: 'properties',
		label: 'Properties',
		minSelection: 1,
		default: Object.values(allProps).map((p) => p.id),
		choices: Object.values(allProps).map((p) => ({ id: p.id, label: p.label })),
	}
}

export function AtemSuperSourceArtSourcePicker(
	model: ModelSpec,
	state: AtemState,
	id: string,
	label: string,
): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: id,
		label: label,
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-art')),
	}
}
export function AtemSuperSourceBoxSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-box')),
	}
}
export function AtemMultiviewSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'mv')),
	}
}
export function AtemMultiviewWindowPicker(model: ModelSpec): CompanionInputFieldDropdown {
	const choices = model.multiviewerFullGrid
		? iterateTimes(16, (i) => ({
				id: i,
				label: `Window ${i + 1}`,
			}))
		: iterateTimes(8, (i) => ({
				id: i + 2,
				label: `Window ${i + 3}`,
			}))

	return {
		type: 'dropdown',
		id: 'windowIndex',
		label: 'Window #',
		default: 2,
		choices,
	}
}
export function AtemMediaPlayerPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'mediaplayer',
		label: 'Media Player',
		default: 0,
		choices: GetMediaPlayerChoices(model),
	}
}

export function AtemMediaPlayerSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: [
			...iterateTimes(model.media.clips, (i) => {
				const clip = state.media.clipPool[i]
				return {
					id: i + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
					label: clip?.name ? `Clip #${i + 1}: ${clip.name}` : `Clip #${i + 1}`,
				}
			}),
			...iterateTimes(model.media.stills, (i) => {
				const still = state.media.stillPool[i]
				return {
					id: i,
					label: still?.fileName ? `Still #${i + 1}: ${still.fileName}` : `Still #${i + 1}`,
				}
			}),
		],
	}
}

export function AtemFadeToBlackStatePicker(): CompanionInputFieldDropdown {
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
	}
}

export function AtemMatchMethod(): CompanionInputFieldDropdown {
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
	}
}

export function AtemAudioInputPicker(
	model: ModelSpec,
	state: AtemState,
	subset?: AudioInputSubset,
): CompanionInputFieldDropdown {
	const inputs = SourcesToChoices(GetAudioInputsList(model, state, subset))
	return {
		type: 'dropdown',
		id: 'input',
		label: 'Input',
		default: inputs[0]?.id,
		choices: inputs,
	}
}

export function AtemFairlightAudioSourcePicker(): CompanionInputFieldDropdown {
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
	}
}

export function NumberComparitorPicker(): CompanionInputFieldDropdown {
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
	}
}

export interface FadeDurationFieldsType {
	fadeDuration: number
	fadeAlgorithm: Easing.algorithm
	fadeCurve: Easing.curve
}

export const FadeDurationFields: MyOptionsObject<
	FadeDurationFieldsType,
	CompanionInputFieldNumber | CompanionInputFieldDropdown
> = {
	fadeDuration: {
		type: 'number',
		label: 'Fade Duration (ms)',
		id: 'fadeDuration',
		default: 0,
		min: 0,
		step: 10,
		max: 60000,
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
		isVisible: (options: CompanionOptionValues): boolean => {
			return options.fadeDuration != null && (options.fadeDuration as number) > 0
		},
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
		isVisible: (options: CompanionOptionValues): boolean => {
			return (
				options.fadeDuration != null &&
				options.fadeAlgorithm != null &&
				(options.fadeDuration as number) > 0 &&
				(options.fadeAlgorithm as string) !== 'linear'
			)
		},
	},
}

export const FaderLevelDeltaChoice: CompanionInputFieldNumber = {
	type: 'number',
	label: 'Delta',
	id: 'delta',
	default: 1,
	max: 100,
	min: -100,
}

export function AtemAllSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state)),
	}
}

export function AtemDisplayClockPropertiesPickers(): {
	enabled: CompanionInputFieldCheckbox
	size: CompanionInputFieldNumber
	opacity: CompanionInputFieldNumber
	x: CompanionInputFieldNumber
	y: CompanionInputFieldNumber
	autoHide: CompanionInputFieldCheckbox
	clockMode: CompanionInputFieldDropdown
	properties: CompanionInputFieldMultiDropdown
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('enabled'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('size'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('opacity'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('x'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('y'),
		},
		//!offset?
		autoHide: {
			type: 'checkbox',
			id: 'autoHide',
			label: 'Auto Hide',
			default: false,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('autoHide'),
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
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('clockMode'),
		},
	}

	return {
		properties: DropdownPropertiesPicker(allProps),
		...allProps,
	}
}

export function AtemDisplayClockTimePickers(): {
	hours: CompanionInputFieldNumber
	minutes: CompanionInputFieldNumber
	seconds: CompanionInputFieldNumber
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
		},
	}
}

export function AtemDisplayClockTimeOffsetPickers(): {
	hours: CompanionInputFieldNumber
	minutes: CompanionInputFieldNumber
	seconds: CompanionInputFieldNumber
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
		},
	}
}

export function AtemFairlightAudioRoutingSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
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
): CompanionInputFieldMultiDropdown {
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
): CompanionInputFieldDropdown {
	const sources = FairlightAudioRoutingDestinations(model, state)

	return {
		type: 'dropdown',
		id: 'destination',
		label: 'Destination',
		default: sources[0].id,
		choices: sources,
	}
}
