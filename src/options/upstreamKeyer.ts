import {
	assertNever,
	type DropdownChoice,
	type JsonValue,
	type CompanionInputFieldDropdown,
	type CompanionInputFieldMultiDropdown,
	type CompanionInputFieldCheckbox,
	type CompanionInputFieldNumber,
} from '@companion-module/base'
import { Enums } from 'atem-connection'
import { iterateTimes, stringifyValueAlways } from '../util.js'
import { WithDropdownPropertiesPicker } from './util.js'
import type { ModelSpec } from '../models/types.js'

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

export type UpstreamKeyerTypeString = 'luma' | 'chroma' | 'pattern' | 'dve'

export function AtemUpstreamKeyerTypePicker(): CompanionInputFieldDropdown<'type', UpstreamKeyerTypeString> {
	return {
		type: 'dropdown',
		id: 'type',
		label: 'Key Type',
		default: 'luma',
		choices: GetUpstreamKeyerTypeChoices(),
		expressionDescription: 'Should return a string: luma, chroma, pattern, dve',
		allowInvalidValues: true,
	}
}

export function GetUpstreamKeyerTypeChoices(): DropdownChoice<UpstreamKeyerTypeString>[] {
	return [
		{ id: 'luma', label: 'Luma' },
		{ id: 'chroma', label: 'Chroma' },
		{ id: 'pattern', label: 'Pattern' },
		{ id: 'dve', label: 'DVE' },
	]
}

export function upstreamKeyerTypeStringToEnum(ref: JsonValue | undefined): Enums.MixEffectKeyType | null {
	const refStr = stringifyValueAlways(ref).toLowerCase().trim()
	if (!refStr) return null

	// sanitise to <ascii>
	ref = refStr.replace(/[^a-z]/g, '')

	// Fuzzy match by first character
	if (refStr.startsWith('l')) {
		return Enums.MixEffectKeyType.Luma
	} else if (refStr.startsWith('c')) {
		return Enums.MixEffectKeyType.Chroma
	} else if (refStr.startsWith('p')) {
		return Enums.MixEffectKeyType.Pattern
	} else if (refStr.startsWith('d')) {
		return Enums.MixEffectKeyType.DVE
	} else {
		return null
	}
}

export function upstreamKeyerTypeEnumToString(type: Enums.MixEffectKeyType): UpstreamKeyerTypeString | undefined {
	switch (type) {
		case Enums.MixEffectKeyType.Luma:
			return 'luma'
		case Enums.MixEffectKeyType.Chroma:
			return 'chroma'
		case Enums.MixEffectKeyType.Pattern:
			return 'pattern'
		case Enums.MixEffectKeyType.DVE:
			return 'dve'
		default:
			assertNever(type)
			return undefined
	}
}

export type FlyKeyKeyFrameString = 'a' | 'b' | 'full'

export function AtemFlyKeyKeyFramePicker(
	includeFull?: boolean,
): CompanionInputFieldDropdown<'keyframe', FlyKeyKeyFrameString> {
	return {
		type: 'dropdown',
		id: 'keyframe',
		label: 'Key Frame',
		default: 'a',
		choices: GetFlyKeyKeyFrameChoices(includeFull),
		expressionDescription: `Should return a string: a, b${includeFull ? ', full' : ''}`,
		allowInvalidValues: true,
	}
}

export function GetFlyKeyKeyFrameChoices(includeFull?: boolean): DropdownChoice<FlyKeyKeyFrameString>[] {
	const choices: DropdownChoice<FlyKeyKeyFrameString>[] = [
		{ id: 'a', label: 'A' },
		{ id: 'b', label: 'B' },
	]
	if (includeFull) {
		choices.push({ id: 'full', label: 'Full' })
	}
	return choices
}

export function flyKeyKeyFrameStringToEnum(
	ref: JsonValue | undefined,
	includeFull?: boolean,
): Enums.FlyKeyKeyFrame | null {
	const refStr = stringifyValueAlways(ref).toLowerCase().trim()
	if (!refStr) return null

	if (refStr.startsWith('a')) {
		return Enums.FlyKeyKeyFrame.A
	} else if (refStr.startsWith('b')) {
		return Enums.FlyKeyKeyFrame.B
	} else if (includeFull && refStr.startsWith('f')) {
		return Enums.FlyKeyKeyFrame.Full
	} else {
		return null
	}
}

export function flyKeyKeyFrameEnumToString(frame: Enums.FlyKeyKeyFrame): FlyKeyKeyFrameString | undefined {
	switch (frame) {
		case Enums.FlyKeyKeyFrame.A:
			return 'a'
		case Enums.FlyKeyKeyFrame.B:
			return 'b'
		case Enums.FlyKeyKeyFrame.Full:
			return 'full'
		default:
			return undefined
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
	return WithDropdownPropertiesPicker({
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
			description: 'Center position of the fly key. Between -32 and 32.',
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
			description: 'Center position of the fly key. Between -18 and 18.',
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
			description: 'Size of the fly key in the X direction. Between 0 and 99.99.',
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
			description: 'Size of the fly key in the Y direction. Between 0 and 99.99.',
		},
	})
}

function GetUpstreamKeyerPatternChoices(): DropdownChoice<Enums.Pattern>[] {
	const options = [
		{ id: Enums.Pattern.LeftToRightBar, label: 'Left To Right Bar' },
		{ id: Enums.Pattern.TopToBottomBar, label: 'Top To Bottom Bar' },
		{ id: Enums.Pattern.HorizontalBarnDoor, label: 'Horizontal Barn Door' },
		{ id: Enums.Pattern.VerticalBarnDoor, label: 'Vertical Barn Door' },
		{ id: Enums.Pattern.CornersInFourBox, label: 'Corners In Four Box' },
		{ id: Enums.Pattern.RectangleIris, label: 'Rectangle Iris' },
		{ id: Enums.Pattern.DiamondIris, label: 'Diamond Iris' },
		{ id: Enums.Pattern.CircleIris, label: 'Circle Iris' },
		{ id: Enums.Pattern.TopLeftBox, label: 'Top Left Box' },
		{ id: Enums.Pattern.TopRightBox, label: 'Top Right Box' },
		{ id: Enums.Pattern.BottomRightBox, label: 'Bottom Right Box' },
		{ id: Enums.Pattern.BottomLeftBox, label: 'Bottom Left Box' },
		{ id: Enums.Pattern.TopCentreBox, label: 'Top Centre Box' },
		{ id: Enums.Pattern.RightCentreBox, label: 'Right Centre Box' },
		{ id: Enums.Pattern.BottomCentreBox, label: 'Bottom Centre Box' },
		{ id: Enums.Pattern.LeftCentreBox, label: 'Left Centre Box' },
		{ id: Enums.Pattern.TopLeftDiagonal, label: 'Top Left Diagonal' },
		{ id: Enums.Pattern.TopRightDiagonal, label: 'Top Right Diagonal' },
	]
	return options
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
