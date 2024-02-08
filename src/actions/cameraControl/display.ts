import { type Atem } from 'atem-connection'
import { ActionId } from '../ActionId.js'
import type { MyActionDefinitions } from '../types.js'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender } from '@atem-connection/camera-control'
import { CHOICES_ON_OFF_TOGGLE, CameraControlSourcePicker, type TrueFalseToggle } from '../../choices.js'
import type { AtemConfig } from '../../config.js'

export interface AtemCameraControlDisplayActions {
	[ActionId.CameraControlDisplayColorBars]: {
		cameraId: string
		state: TrueFalseToggle
	}
}

export function createCameraControlDisplayActions(
	config: AtemConfig,
	atem: Atem | undefined,
	state: StateWrapper
): MyActionDefinitions<AtemCameraControlDisplayActions> {
	if (!config.enableCameraControl) {
		return {
			[ActionId.CameraControlDisplayColorBars]: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	return {
		[ActionId.CameraControlDisplayColorBars]: {
			name: 'Camera Control: Show Color Bars',
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
					target = !cameraState?.display?.colorBarEnable
					console.log('camera', cameraState, target)
				} else {
					target = options.getPlainString('state') === 'true'
				}

				await commandSender?.displayColorBars(cameraId, target)
			},
		},
	}
}
