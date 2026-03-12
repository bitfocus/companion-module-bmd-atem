import {
	assertNever,
	DropdownChoice,
	type JsonValue,
	type CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	CompanionInputFieldCheckbox,
	CompanionInputFieldNumber,
} from '@companion-module/base'
import { Enums } from 'atem-connection'
import { stringifyValueAlways } from '../util.js'
import { WithDropdownPropertiesPicker } from './util.js'

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
