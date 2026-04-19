import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender } from '@atem-connection/camera-control'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../../options/common.js'
import type { AtemConfig } from '../../config.js'
import { CameraControlSourcePicker } from '../../options/cameraControl.js'

export type AtemCameraControlLensActions = {
	['cameraControlLensFocus']: {
		options: {
			cameraId: number
			delta: number
		}
	}
	['cameraControlLensAutoFocus']: {
		options: {
			cameraId: number
		}
	}
	['cameraControlLensIris']: {
		options: {
			cameraId: number
			isNormalised: boolean
			fStop: number
			normalised: number
		}
	}
	['cameraControlIncrementLensIris']: {
		options: {
			cameraId: number
			fStopIncrement: number
		}
	}
	['cameraControlLensAutoIris']: {
		options: {
			cameraId: number
		}
	}
	['cameraControlLensOpticalImageStabilisation']: {
		options: {
			cameraId: number
			state: TrueFalseToggle
		}
	}
	['cameraControlLensZoom']: {
		options: {
			cameraId: number
			zoom: number
		}
	}
}

export function createCameraControlLensActions(
	config: AtemConfig,
	atem: Atem | undefined,
	state: StateWrapper,
): CompanionActionDefinitions<AtemCameraControlLensActions> {
	if (!config.enableCameraControl) {
		return {
			['cameraControlLensFocus']: undefined,
			['cameraControlLensAutoFocus']: undefined,
			['cameraControlLensIris']: undefined,
			['cameraControlIncrementLensIris']: undefined,
			['cameraControlLensAutoIris']: undefined,
			['cameraControlLensOpticalImageStabilisation']: undefined,
			['cameraControlLensZoom']: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	return {
		['cameraControlLensFocus']: {
			name: 'Camera Control: Focus adjust',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				delta: {
					id: 'delta',
					type: 'number',
					label: 'Delta',
					default: 0.1,
					min: -1,
					max: 1,
					description: 'Max range -1.0 - 1.0',
					clampValues: true,
					asInteger: false,
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.lensFocus(options.cameraId, options.delta, true)
			},
		},

		['cameraControlLensAutoFocus']: {
			name: 'Camera Control: Trigger Auto Focus',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
			}),
			callback: async ({ options }) => {
				const cameraId = options.cameraId

				await commandSender?.lensTriggerAutoFocus(cameraId)
			},
		},

		['cameraControlLensIris']: {
			name: 'Camera Control: Iris',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				isNormalised: {
					id: 'isNormalised',
					type: 'checkbox',
					label: 'Normalised',
					default: true,
					disableAutoExpression: true,
				},
				fStop: {
					id: 'fStop',
					type: 'number',
					label: 'Value',
					default: 4,
					min: -1,
					max: 16,
					description: 'Max range -1.0 - 16.0',
					isVisibleExpression: `!$(options:isNormalised)`,
					asInteger: false,
					clampValues: true,
				},
				normalised: {
					id: 'normalised',
					type: 'number',
					label: 'Value',
					default: 0.5,
					min: 0,
					max: 1,
					description: 'Range 0.0 - 1.0',
					isVisibleExpression: `!$(options:isNormalised)`,
					asInteger: false,
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				if (options.isNormalised) {
					await commandSender?.lensIrisNormalised(options.cameraId, options.normalised)
				} else {
					await commandSender?.lensIrisFStop(options.cameraId, options.fStop)
				}
			},
		},

		['cameraControlIncrementLensIris']: {
			name: 'Camera Control: Increment Iris',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				fStopIncrement: {
					id: 'fStopIncrement',
					type: 'number',
					label: 'Value',
					default: 1,
					min: -100,
					max: 100,
					description: 'e.g. 1 or -1',
					asInteger: false,
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = options.cameraId
				const increment = options.fStopIncrement

				let iris = (state.atemCameraState.get(cameraId)?.lens.iris ?? 0) + increment

				if (iris > 16) {
					iris = 1
				} else if (iris < -1) {
					iris = 0
				}

				await commandSender?.lensIrisFStop(cameraId, iris)
			},
		},

		['cameraControlLensAutoIris']: {
			name: 'Camera Control: Trigger Auto Iris',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
			}),
			callback: async ({ options }) => {
				await commandSender?.lensTriggerAutoIris(options.cameraId)
			},
		},

		['cameraControlLensOpticalImageStabilisation']: {
			name: 'Camera Control: Set Optical Image Stabilisation enabled',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				state: {
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				const cameraId = options.cameraId

				let target: boolean
				if (options.state === 'toggle') {
					const cameraState = state.atemCameraState.get(cameraId)
					target = !cameraState?.lens?.opticalImageStabilisation
				} else {
					target = options.state === 'true'
				}

				await commandSender?.lensEnableOpticalImageStabilisation(cameraId, target)
			},
		},

		['cameraControlLensZoom']: {
			name: 'Camera Control: Zoom (Continuous)',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				zoom: {
					id: 'zoom',
					type: 'number',
					label: 'Zoom speed',
					default: 0,
					min: -1,
					max: 1,
					description: 'Max range -1.0 - 1.0',
					asInteger: false,
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.lensSetContinuousZoomSpeed(options.cameraId, options.zoom)
			},
		},
	}
}
