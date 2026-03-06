import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { ActionId } from '../ActionId.js'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender } from '@atem-connection/camera-control'
import { CHOICES_ON_OFF_TOGGLE, CameraControlSourcePicker, type TrueFalseToggle } from '../../choices.js'
import type { AtemConfig } from '../../config.js'

export type AtemCameraControlLensActions = {
	[ActionId.CameraControlLensFocus]: {
		options: {
			cameraId: string
			delta: string
		}
	}
	[ActionId.CameraControlLensAutoFocus]: {
		options: {
			cameraId: string
		}
	}
	[ActionId.CameraControlLensIris]: {
		options: {
			cameraId: string
			isNormalised: boolean
			fStop: string
			normalised: string
		}
	}
	[ActionId.CameraControlIncrementLensIris]: {
		options: {
			cameraId: string
			fStopIncrement: string
		}
	}
	[ActionId.CameraControlLensAutoIris]: {
		options: {
			cameraId: string
		}
	}
	[ActionId.CameraControlLensOpticalImageStabilisation]: {
		options: {
			cameraId: string
			state: TrueFalseToggle
		}
	}
	[ActionId.CameraControlLensZoom]: {
		options: {
			cameraId: string
			zoom: string
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
			[ActionId.CameraControlLensFocus]: undefined,
			[ActionId.CameraControlLensAutoFocus]: undefined,
			[ActionId.CameraControlLensIris]: undefined,
			[ActionId.CameraControlIncrementLensIris]: undefined,
			[ActionId.CameraControlLensAutoIris]: undefined,
			[ActionId.CameraControlLensOpticalImageStabilisation]: undefined,
			[ActionId.CameraControlLensZoom]: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	return {
		[ActionId.CameraControlLensFocus]: {
			name: 'Camera Control: Focus adjust',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				delta: {
					id: 'delta',
					type: 'textinput',
					label: 'Delta',
					default: '0.1',
					tooltip: 'Max range -1.0 - 1.0',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId
				const value = await options.delta

				await commandSender?.lensFocus(cameraId, value, true)
			},
		},

		[ActionId.CameraControlLensAutoFocus]: {
			name: 'Camera Control: Trigger Auto Focus',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId

				await commandSender?.lensTriggerAutoFocus(cameraId)
			},
		},

		[ActionId.CameraControlLensIris]: {
			name: 'Camera Control: Iris',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				isNormalised: {
					id: 'isNormalised',
					type: 'checkbox',
					label: 'Normalised',
					default: true,
				},
				fStop: {
					id: 'fStop',
					type: 'textinput',
					label: 'Value',
					default: '4',
					tooltip: 'Max range -1.0 - 16.0',
					useVariables: true,
					isVisibleExpression: `!$(options:isNormalised)`,
				},
				normalised: {
					id: 'normalised',
					type: 'textinput',
					label: 'Value',
					default: '0.5',
					tooltip: 'Range 0.0 - 1.0',
					useVariables: true,
					isVisibleExpression: `!$(options:isNormalised)`,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId

				const isNormalised = options.isNormalised
				if (isNormalised) {
					const value = await options.normalised
					await commandSender?.lensIrisNormalised(cameraId, value)
				} else {
					const value = await options.fStop
					await commandSender?.lensIrisFStop(cameraId, value)
				}
			},
		},

		[ActionId.CameraControlIncrementLensIris]: {
			name: 'Camera Control: Increment Iris',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				fStopIncrement: {
					id: 'fStopIncrement',
					type: 'textinput',
					label: 'Value',
					default: '1',
					tooltip: 'e.g. 1 or -1',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId
				const increment = await options.fStopIncrement

				let iris = (state.atemCameraState.get(cameraId)?.lens.iris ?? 0) + increment

				if (iris > 16) {
					iris = 1
				} else if (iris < -1) {
					iris = 0
				}

				await commandSender?.lensIrisFStop(cameraId, iris)
			},
		},

		[ActionId.CameraControlLensAutoIris]: {
			name: 'Camera Control: Trigger Auto Iris',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId

				await commandSender?.lensTriggerAutoIris(cameraId)
			},
		},

		[ActionId.CameraControlLensOpticalImageStabilisation]: {
			name: 'Camera Control: Set Optical Image Stabilisation enabled',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				state: {
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId

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

		[ActionId.CameraControlLensZoom]: {
			name: 'Camera Control: Zoom (Continuous)',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				zoom: {
					id: 'zoom',
					type: 'textinput',
					label: 'Zoom speed',
					default: '0.0',
					tooltip: 'Max range -1.0 - 1.0',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId
				const value = await options.zoom
				await commandSender?.lensSetContinuousZoomSpeed(cameraId, value)
			},
		},
	}
}
