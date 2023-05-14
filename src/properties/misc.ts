import {
	CompanionPropertyType,
	type CompanionPropertyDefinitions,
} from '@companion-module/base/dist/module-api/properties.js'
import type { AtemInstance } from '../index.js'
import { PropertyId } from './id.js'

export function createMiscPropertyDefinitions(this: AtemInstance): CompanionPropertyDefinitions {
	return {
		[PropertyId.DeviceIp]: {
			name: 'IP address of ATEM',
			description: '',

			type: CompanionPropertyType.String,

			getValues: async () => {
				return this.config.host ?? ''
			},
		},
	}
}
