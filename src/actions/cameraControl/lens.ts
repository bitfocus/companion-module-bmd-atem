import { type Atem } from 'atem-connection'
import { ActionId } from '../ActionId.js'
import type { MyActionDefinitions } from '../types.js'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender } from '@atem-connection/camera-control'
import { CHOICES_ON_OFF_TOGGLE, CameraControlSourcePicker, type TrueFalseToggle } from '../../choices.js'
import type { AtemConfig } from '../../config.js'

export interface AtemCameraControlLensActions {
	[ActionId.CameraControlLensFocus]: {
		cameraId: string
		delta: string
	}
	[ActionId.CameraControlLensAutoFocus]: {
		cameraId: string
	}
	[ActionId.CameraControlLensIris]: {
		cameraId: string
		isNormalised: boolean
		fStop: string
		normalised: string
	}
	[ActionId.CameraControlIncrementLensIris]: {
		cameraId: string
		normalisedIncrement: string
	}
	[ActionId.CameraControlLensAutoIris]: {
		cameraId: string
	}
	[ActionId.CameraControlLensOpticalImageStabilisation]: {
		cameraId: string
		state: TrueFalseToggle
	}
}

export function createCameraControlLensActions(
	config: AtemConfig,
	atem: Atem | undefined,
	state: StateWrapper
): MyActionDefinitions<AtemCameraControlLensActions> {
	if (!config.enableCameraControl) {
		return {
			[ActionId.CameraControlLensFocus]: undefined,
			[ActionId.CameraControlLensAutoFocus]: undefined,
			[ActionId.CameraControlLensIris]: undefined,
			[ActionId.CameraControlIncrementLensIris]: undefined,
			[ActionId.CameraControlLensAutoIris]: undefined,
			[ActionId.CameraControlLensOpticalImageStabilisation]: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	return {
		[ActionId.CameraControlLensFocus]: {
			name: 'Camera Control: Focus adjust',
			options: {
				cameraId: CameraControlSourcePicker(),
				delta: {
					id: 'delta',
					type: 'textinput',
					label: 'Delta',
					default: '0.1',
					tooltip: 'Max range -1.0 - 1.0',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const value = await options.getParsedNumber('delta')

				await commandSender?.lensFocus(cameraId, value, true)
			},
		},

		[ActionId.CameraControlLensAutoFocus]: {
			name: 'Camera Control: Trigger Auto Focus',
			options: {
				cameraId: CameraControlSourcePicker(),
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')

				await commandSender?.lensTriggerAutoFocus(cameraId)
			},
		},

		[ActionId.CameraControlLensIris]: {
			name: 'Camera Control: Iris',
			options: {
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
					isVisible: (opts) => !opts.isNormalised,
				},
				normalised: {
					id: 'normalised',
					type: 'textinput',
					label: 'Value',
					default: '0.5',
					tooltip: 'Range 0.0 - 1.0',
					useVariables: true,
					isVisible: (opts) => !!opts.isNormalised,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')

				const isNormalised = options.getPlainBoolean('isNormalised')
				if (isNormalised) {
					const value = await options.getParsedNumber('normalised')
					await commandSender?.lensIrisNormalised(cameraId, value)
				} else {
					const value = await options.getParsedNumber('fStop')
					await commandSender?.lensIrisFStop(cameraId, value)
				}
			},
		},

		[ActionId.CameraControlIncrementLensIris]: {
			name: 'Camera Control: Increment Iris',
			options: {
				cameraId: CameraControlSourcePicker(),
				normalisedIncrement: {
					id: 'normalisedIncrement',
					type: 'textinput',
					label: 'Value',
					default: '0.1',
					tooltip: 'e.g. 0.1 or -0.1',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const increment = await options.getParsedNumber('normalisedIncrement')

				let targetIris = (state.atemCameraState.get(cameraId)?.lens.iris ?? 0) + increment

				if (targetIris > 1) {
					targetIris = 1
				} else if (targetIris < 0) {
					targetIris = 0
				}

				await commandSender?.lensIrisNormalised(cameraId, targetIris)
			},
		},

		[ActionId.CameraControlLensAutoIris]: {
			name: 'Camera Control: Trigger Auto Iris',
			options: {
				cameraId: CameraControlSourcePicker(),
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')

				await commandSender?.lensTriggerAutoIris(cameraId)
			},
		},

		[ActionId.CameraControlLensOpticalImageStabilisation]: {
			name: 'Camera Control: Set Optical Image Stabilisation enabled',
			options: {
				cameraId: CameraControlSourcePicker(),
				state: {
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')

				let target: boolean
				if (options.getPlainString('state') === 'toggle') {
					const cameraState = state.atemCameraState.get(cameraId)
					target = !cameraState?.lens?.opticalImageStabilisation
				} else {
					target = options.getPlainString('state') === 'true'
				}

				await commandSender?.lensEnableOpticalImageStabilisation(cameraId, target)
			},
		},
	}
}
