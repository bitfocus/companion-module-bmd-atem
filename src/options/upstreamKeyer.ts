import { assertNever, DropdownChoice, type JsonValue, type CompanionInputFieldDropdown } from '@companion-module/base'
import { Enums } from 'atem-connection'
import { stringifyValueAlways } from '../util.js'

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
