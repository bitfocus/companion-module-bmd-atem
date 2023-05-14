import {
	CompanionPropertyType,
	type CompanionPropertyDefinitions,
} from '@companion-module/base/dist/module-api/properties'
import type { AtemInstance } from '../index'
import { PropertyId } from './id'

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
