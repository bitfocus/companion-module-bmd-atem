import type { CompanionInputFieldDropdown } from '@companion-module/base'

export function AtemFadeToBlackStatePicker(): CompanionInputFieldDropdown<'state'> {
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
		disableAutoExpression: true,
	}
}
