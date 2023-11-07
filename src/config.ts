import { Regex, type SomeCompanionConfigField } from '@companion-module/base'
import { ALL_MODEL_CHOICES } from './models/index.js'
import type { InstanceBaseExt } from './util.js'

export const fadeFpsDefault = 10

export enum PresetStyleName {
	Short = 0,
	Long = 1,
}

export interface AtemConfig {
	bonjour_host?: string
	host?: string
	modelID?: string
	presets?: string
	fadeFps?: number
}

export function GetConfigFields(_self: InstanceBaseExt<AtemConfig>): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				'This works with all models of Blackmagic Design ATEM mixers. <br />' +
				'Firmware versions 7.5.2 and later are known to work, other versions may experience problems. <br />' +
				'Firmware versions after 9.2 are not verified to be working at the time of writing, but they likely will work fine. <br />' +
				"In general the model can be left in 'Auto Detect', however a specific model can be selected below for offline programming. <br />" +
				'Devices must be controlled over a network, USB control is NOT supported.',
		},
		{
			type: 'bonjour-device',
			id: 'bonjour_host',
			label: 'Device',
			width: 6,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			isVisible: (options) => !options['bonjour_host'],
			default: '',
			regex: Regex.IP,
		},
		{
			type: 'static-text',
			id: 'host-filler',
			width: 6,
			label: '',
			isVisible: (options) => !!options['bonjour_host'],
			value: '',
		},
		// {
		// 	type: 'textinput',
		// 	id: 'host',
		// 	label: 'Target IP',
		// 	width: 6,
		// 	regex: self.REGEX_IP,
		// },
		{
			type: 'dropdown',
			id: 'modelID',
			label: 'Model',
			width: 6,
			choices: ALL_MODEL_CHOICES,
			default: 0,
		},
		{
			type: 'dropdown',
			id: 'presets',
			label: 'Preset Style',
			width: 6,
			choices: [
				{ id: PresetStyleName.Short, label: 'Short Names' },
				{ id: PresetStyleName.Long, label: 'Long Names' },
			],
			default: PresetStyleName.Short,
		},
		{
			type: 'number',
			id: 'fadeFps',
			label: 'Framerate for fades',
			tooltip: 'Higher is smoother, but has higher impact on system performance',
			width: 6,
			min: 5,
			max: 60,
			step: 1,
			default: fadeFpsDefault,
		},
	]
}
