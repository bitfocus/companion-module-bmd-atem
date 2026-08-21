import type { CompanionInputFieldDropdown, DropdownChoice, JsonValue } from '@companion-module/base'
import type { FairlightAudioLevels } from 'atem-connection/dist/state/levels.js'
import type { FairlightMasterLevels } from '../audioLevels.js'
import { stringifyValueAlways } from '../util.js'

export type FairlightMeter = keyof FairlightAudioLevels

/** The expander only exists on a source, the master has every other meter */
const MASTER_ONLY_EXCLUDES = 'expanderGainReduction' as const

const METER_CHOICES: DropdownChoice<FairlightMeter>[] = [
	{ id: 'inputLeftLevel', label: 'Input: Left' },
	{ id: 'inputRightLevel', label: 'Input: Right' },
	{ id: 'inputLeftPeak', label: 'Input: Left peak' },
	{ id: 'inputRightPeak', label: 'Input: Right peak' },

	{ id: 'outputLeftLevel', label: 'Output: Left' },
	{ id: 'outputRightLevel', label: 'Output: Right' },
	{ id: 'outputLeftPeak', label: 'Output: Left peak' },
	{ id: 'outputRightPeak', label: 'Output: Right peak' },

	{ id: 'leftLevel', label: 'Post fader: Left' },
	{ id: 'rightLevel', label: 'Post fader: Right' },
	{ id: 'leftPeak', label: 'Post fader: Left peak' },
	{ id: 'rightPeak', label: 'Post fader: Right peak' },

	{ id: 'expanderGainReduction', label: 'Gain reduction: Expander' },
	{ id: 'compressorGainReduction', label: 'Gain reduction: Compressor' },
	{ id: 'limiterGainReduction', label: 'Gain reduction: Limiter' },
]

const MASTER_METER_CHOICES = METER_CHOICES.filter((c) => c.id !== MASTER_ONLY_EXCLUDES)

function meterPicker(choices: DropdownChoice<FairlightMeter>[]): CompanionInputFieldDropdown<'meter', FairlightMeter> {
	return {
		type: 'dropdown',
		id: 'meter',
		label: 'Meter',
		default: 'inputLeftLevel',
		choices,
		expressionDescription: `Should return a string: ${choices.map((c) => c.id).join(', ')}`,
		allowInvalidValues: true,
	}
}

export function AtemFairlightMeterPicker(): CompanionInputFieldDropdown<'meter', FairlightMeter> {
	return meterPicker(METER_CHOICES)
}

export function AtemFairlightMasterMeterPicker(): CompanionInputFieldDropdown<'meter', FairlightMeter> {
	return meterPicker(MASTER_METER_CHOICES)
}

const ALL_METERS = new Set<string>(METER_CHOICES.map((c) => c.id))

/** Parse a raw meter picker value, or null when it does not name a meter */
export function parseFairlightMeter(rawValue: JsonValue | undefined): FairlightMeter | null {
	const str = stringifyValueAlways(rawValue).trim()
	return ALL_METERS.has(str) ? (str as FairlightMeter) : null
}

/** As {@link parseFairlightMeter}, but rejecting the meters the master does not have */
export function parseFairlightMasterMeter(rawValue: JsonValue | undefined): keyof FairlightMasterLevels | null {
	const meter = parseFairlightMeter(rawValue)
	return meter === null || meter === MASTER_ONLY_EXCLUDES ? null : meter
}
