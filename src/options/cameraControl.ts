import type { CompanionInputFieldNumber } from '@companion-module/base'

export function CameraControlSourcePicker(): CompanionInputFieldNumber<'cameraId'> {
	return {
		id: 'cameraId',
		type: 'number',
		label: 'Camera Id',
		default: 1,
		min: 1,
		max: 40,
		asInteger: true,
	}
}
