import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { AtemConfig } from '../config.js'
import type { StateWrapper } from '../state.js'

export type AtemCcuFeedbacks = {
	['ccuSelectedCamera']: {
		type: 'boolean'
		options: { cameraId: number }
	}
}

export function createCcuFeedbacks(
	config: AtemConfig,
	state: StateWrapper,
): CompanionFeedbackDefinitions<AtemCcuFeedbacks> {
	if (!config.enableCameraControl) return { ['ccuSelectedCamera']: undefined }
	return {
		['ccuSelectedCamera']: {
			type: 'boolean',
			name: 'CCU: Selected camera',
			description: 'The camera the CCU actions act on (CCU: Select camera)',
			options: [
				{ type: 'number', id: 'cameraId', label: 'Camera (ATEM input)', default: 1, min: 1, max: 254, asInteger: true },
			],
			defaultStyle: { bgcolor: 0xffff00, color: 0x000000 },
			callback: ({ options }): boolean => Math.round(Number(options.cameraId)) === state.ccuSelected.camera,
		},
	}
}
