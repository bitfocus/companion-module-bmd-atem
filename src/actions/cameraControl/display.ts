import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { ActionId } from '../ActionId.js'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender } from '@atem-connection/camera-control'
import { CHOICES_ON_OFF_TOGGLE, CameraControlSourcePicker, type TrueFalseToggle } from '../../choices.js'
import type { AtemConfig } from '../../config.js'

export type AtemCameraControlDisplayActions = {
	[ActionId.CameraControlDisplayColorBars]: {
		options: {
			cameraId: number
			state: TrueFalseToggle
		}
	}
}

export function createCameraControlDisplayActions(
	config: AtemConfig,
	atem: Atem | undefined,
	state: StateWrapper,
): CompanionActionDefinitions<AtemCameraControlDisplayActions> {
	if (!config.enableCameraControl) {
		return {
			[ActionId.CameraControlDisplayColorBars]: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	return {
		[ActionId.CameraControlDisplayColorBars]: {
			name: 'Camera Control: Show Color Bars',
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
					target = !cameraState?.display?.colorBarEnable
					console.log('camera', cameraState, target)
				} else {
					target = options.state === 'true'
				}

				await commandSender?.displayColorBars(cameraId, target)
			},
		},
	}
}
