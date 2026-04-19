import { Enums } from 'atem-connection'
import { WithDropdownPropertiesPicker } from './util.js'
import type {
	CompanionInputFieldCheckbox,
	CompanionInputFieldNumber,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
} from '@companion-module/base'

export function AtemDisplayClockPropertiesPickers(): {
	enabled: CompanionInputFieldCheckbox<'enabled'>
	size: CompanionInputFieldNumber<'size'>
	opacity: CompanionInputFieldNumber<'opacity'>
	x: CompanionInputFieldNumber<'x'>
	y: CompanionInputFieldNumber<'y'>
	autoHide: CompanionInputFieldCheckbox<'autoHide'>
	clockMode: CompanionInputFieldDropdown<'clockMode'>
	properties: CompanionInputFieldMultiDropdown<'properties'>
} {
	const offset = false

	return WithDropdownPropertiesPicker({
		enabled: {
			type: 'checkbox',
			id: 'enabled',
			label: 'Display',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'enabled')`,
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
			isVisibleExpression: `arrayIncludes($(options:properties), 'size')`,
			asInteger: false,
			clampValues: true,
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
			isVisibleExpression: `arrayIncludes($(options:properties), 'opacity')`,
			asInteger: false,
			clampValues: true,
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
			isVisibleExpression: `arrayIncludes($(options:properties), 'x')`,
			asInteger: false,
			clampValues: true,
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
			isVisibleExpression: `arrayIncludes($(options:properties), 'y')`,
			asInteger: false,
			clampValues: true,
		},
		//!offset?
		autoHide: {
			type: 'checkbox',
			id: 'autoHide',
			label: 'Auto Hide',
			default: false,
			isVisibleExpression: `arrayIncludes($(options:properties), 'autoHide')`,
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
			isVisibleExpression: `arrayIncludes($(options:properties), 'clockMode')`,
			disableAutoExpression: true,
		},
	})
}

export function AtemDisplayClockTimePickers(): {
	hours: CompanionInputFieldNumber<'hours'>
	minutes: CompanionInputFieldNumber<'minutes'>
	seconds: CompanionInputFieldNumber<'seconds'>
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
			asInteger: true,
			clampValues: true,
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
			asInteger: true,
			clampValues: true,
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
			asInteger: true,
			clampValues: true,
		},
	}
}

export function AtemDisplayClockTimeOffsetPickers(): {
	hours: CompanionInputFieldNumber<'hours'>
	minutes: CompanionInputFieldNumber<'minutes'>
	seconds: CompanionInputFieldNumber<'seconds'>
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
			asInteger: true,
			clampValues: true,
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
			asInteger: true,
			clampValues: true,
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
			asInteger: true,
			clampValues: true,
		},
	}
}
