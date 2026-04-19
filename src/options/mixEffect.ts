import {
	assertNever,
	type JsonValue,
	type CompanionInputFieldDropdown,
	type DropdownChoice,
} from '@companion-module/base'
import type { ModelSpec } from '../models/types.js'
import { iterateTimes, stringifyValueAlways } from '../util.js'
import { GetSourcesListForType } from '../choices.js'
import { type AtemState, Enums } from 'atem-connection'
import { SourcesToChoices } from './util.js'

export function AtemMEPicker(model: ModelSpec): CompanionInputFieldDropdown<'mixeffect'> {
	return {
		id: 'mixeffect',
		label: `M/E`,
		type: 'dropdown',
		default: 1,
		choices: iterateTimes(model.MEs, (i) => ({
			id: i + 1,
			label: `M/E ${i + 1}`,
		})),
	}
}

export function AtemMESourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'input'> {
	return {
		id: `input`,
		label: `Input`,
		type: 'dropdown',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
	}
}

export type TransitionStyleString = 'mix' | 'dip' | 'wipe' | 'dve' | 'sting'

export function AtemTransitionStylePicker(
	skipSting?: boolean,
): CompanionInputFieldDropdown<'style', TransitionStyleString> {
	const choices = GetTransitionStyleChoices(skipSting)

	return {
		type: 'dropdown',
		id: 'style',
		label: 'Transition Style',
		default: 'mix',
		choices,
		expressionDescription: `Should return a string: ${choices.map((c) => c.id).join(', ')}`,
		allowInvalidValues: true,
	}
}

export function GetTransitionStyleChoices(skipSting?: boolean): DropdownChoice<TransitionStyleString>[] {
	const options: DropdownChoice<TransitionStyleString>[] = [
		{ id: 'mix', label: 'Mix' },
		{ id: 'dip', label: 'Dip' },
		{ id: 'wipe', label: 'Wipe' },
		{ id: 'dve', label: 'DVE' },
	]
	if (!skipSting) {
		options.push({ id: 'sting', label: 'Sting' })
	}
	return options
}

export function transitionStyleStringToEnum(ref: JsonValue | undefined): Enums.TransitionStyle | null {
	const refStr = stringifyValueAlways(ref).toLowerCase().trim()
	if (!refStr) return null

	// sanitise to <ascii>
	ref = refStr.replace(/[^a-z]/g, '')

	// special case
	if (refStr.startsWith('dv')) {
		return Enums.TransitionStyle.DVE
	}

	// Fuzzy match by first character
	if (refStr.startsWith('m')) {
		return Enums.TransitionStyle.MIX
	} else if (refStr.startsWith('d')) {
		return Enums.TransitionStyle.DIP
	} else if (refStr.startsWith('w')) {
		return Enums.TransitionStyle.WIPE
	} else if (refStr.startsWith('v')) {
		return Enums.TransitionStyle.DVE
	} else if (refStr.startsWith('s')) {
		return Enums.TransitionStyle.STING
	} else {
		return null
	}
}

export function transitionStyleEnumToString(type: Enums.TransitionStyle): TransitionStyleString | undefined {
	switch (type) {
		case Enums.TransitionStyle.MIX:
			return 'mix'
		case Enums.TransitionStyle.DIP:
			return 'dip'
		case Enums.TransitionStyle.WIPE:
			return 'wipe'
		case Enums.TransitionStyle.DVE:
			return 'dve'
		case Enums.TransitionStyle.STING:
			return 'sting'
		default:
			assertNever(type)
			return undefined
	}
}
