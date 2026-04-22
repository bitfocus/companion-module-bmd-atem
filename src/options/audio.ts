import type {
	CompanionInputFieldDropdown,
	DropdownChoice,
	CompanionInputFieldNumber,
	JsonValue,
} from '@companion-module/base'
import { Enums, type AtemState } from 'atem-connection'
import type { ModelSpec } from '../models/types.js'
import { SourcesToChoices } from './util.js'
import { assertUnreachable, stringifyValueAlways } from '../util.js'
import type { MiniSourceInfo } from '../options/sources.js'

export enum NumberComparitor {
	Equal = 'eq',
	NotEqual = 'ne',
	LessThan = 'lt',
	LessThanEqual = 'lte',
	GreaterThan = 'gt',
	GreaterThanEqual = 'gte',
}

export function compareNumber(target: number, comparitor: NumberComparitor, currentValue: number): boolean {
	const targetValue = Number(target)
	if (isNaN(targetValue)) {
		return false
	}

	switch (comparitor) {
		case NumberComparitor.GreaterThan:
			return currentValue > targetValue
		case NumberComparitor.GreaterThanEqual:
			return currentValue >= targetValue
		case NumberComparitor.LessThan:
			return currentValue < targetValue
		case NumberComparitor.LessThanEqual:
			return currentValue <= targetValue
		case NumberComparitor.NotEqual:
			return currentValue != targetValue
		default:
			return currentValue === targetValue
	}
}

export function AtemAudioInputPicker(
	model: ModelSpec,
	state: AtemState,
	subset?: AudioInputSubset,
): CompanionInputFieldDropdown<'input'> | null {
	const inputs = SourcesToChoices(GetAudioInputsList(model, state, subset))
	if (inputs.length === 0) return null

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

export type FairlightMixOption2 = 'on' | 'off' | 'afv'

export function fairlightMixOptionStringToEnum(ref: JsonValue | undefined): Enums.FairlightAudioMixOption | null {
	const refStr = stringifyValueAlways(ref).toLowerCase().trim()
	if (!refStr) return null

	if (refStr === 'on') return Enums.FairlightAudioMixOption.On
	if (refStr === 'off') return Enums.FairlightAudioMixOption.Off
	if (refStr === 'afv' || refStr === 'audiofollowvideo') return Enums.FairlightAudioMixOption.AudioFollowVideo

	// Legacy numeric values (stored before API 2.0 migration)
	if (refStr === String(Enums.FairlightAudioMixOption.On)) return Enums.FairlightAudioMixOption.On
	if (refStr === String(Enums.FairlightAudioMixOption.Off)) return Enums.FairlightAudioMixOption.Off
	if (refStr === String(Enums.FairlightAudioMixOption.AudioFollowVideo))
		return Enums.FairlightAudioMixOption.AudioFollowVideo

	return null
}

export const CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION: DropdownChoice<FairlightMixOption2>[] = [
	{
		id: 'on',
		label: 'On',
	},
	{
		id: 'off',
		label: 'Off',
	},
	{
		id: 'afv',
		label: 'AFV',
	},
]

export const CHOICES_CLASSIC_AUDIO_MIX_OPTION: DropdownChoice<Enums.AudioMixOption>[] = [
	{
		id: Enums.AudioMixOption.On,
		label: 'On',
	},
	{
		id: Enums.AudioMixOption.Off,
		label: 'Off',
	},
	{
		id: Enums.AudioMixOption.AudioFollowVideo,
		label: 'AFV',
	},
]

export type AudioInputSubset = 'delay' | 'routing'

function GetAudioInputsList(model: ModelSpec, state: AtemState, subset?: AudioInputSubset): MiniSourceInfo[] {
	const getSource = (id: number, videoId: number | undefined, defLong: string): MiniSourceInfo => {
		const input = videoId !== undefined ? state.inputs[videoId] : undefined
		const longName = input?.longName || defLong

		return {
			id,
			longName,
		}
	}

	const sources: MiniSourceInfo[] = []
	for (const input of model.classicAudio?.inputs ?? model.fairlightAudio?.inputs ?? []) {
		if (subset === 'delay' && (!('maxDelay' in input) || !input.maxDelay)) continue
		if (subset !== 'routing' && 'routingOnly' in input && input.routingOnly) continue

		switch (input.portType) {
			case Enums.ExternalPortType.Unknown:
			case Enums.ExternalPortType.Component:
			case Enums.ExternalPortType.Composite:
			case Enums.ExternalPortType.SVideo:
				// No audio on these
				break
			case Enums.ExternalPortType.SDI:
			case Enums.ExternalPortType.HDMI:
				sources.push(getSource(input.id, input.id, `Input ${input.id}`))
				break
			case Enums.ExternalPortType.XLR: {
				const offset = input.id - 1000
				sources.push(getSource(input.id, undefined, offset > 1 ? `XLR ${offset}` : `XLR`))
				break
			}
			case Enums.ExternalPortType.AESEBU:
				sources.push(getSource(input.id, undefined, `AES/EBU`))
				break
			case Enums.ExternalPortType.RCA:
				sources.push(getSource(input.id, undefined, `RCA`))
				break
			case Enums.ExternalPortType.Internal: {
				const mpId = input.id - 2000
				if (mpId === 51) {
					// No way to discover this other than to know it :(
					sources.push(getSource(input.id, undefined, `Thunderbolt`))
				} else {
					sources.push(getSource(input.id, 3000 + mpId * 10, `Media Player ${mpId}`))
				}
				break
			}
			case Enums.ExternalPortType.TSJack: {
				const micId = input.id - 1300
				sources.push(getSource(input.id, undefined, `Mic ${micId}`))
				break
			}
			case Enums.ExternalPortType.MADI: {
				const channelId = input.id - 1500
				sources.push(getSource(input.id, undefined, `MADI ${channelId}`))
				break
			}
			case Enums.ExternalPortType.TRSJack:
				sources.push(getSource(input.id, undefined, `TRS`))
				break
			case Enums.ExternalPortType.RJ45:
				sources.push(getSource(input.id, undefined, 'RJ45'))
				break
			default:
				assertUnreachable(input.portType)
				break
		}
	}

	sources.sort((a, b) => a.id - b.id)
	return sources
}
