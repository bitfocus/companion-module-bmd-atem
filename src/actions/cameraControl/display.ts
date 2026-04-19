import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender } from '@atem-connection/camera-control'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../../options/common.js'
import type { AtemConfig } from '../../config.js'
import { CameraControlSourcePicker } from '../../options/cameraControl.js'

export type AtemCameraControlDisplayActions = {
	['cameraControlDisplayColorBars']: {
		options: {
			cameraId: number
			state: TrueFalseToggle
		}
	}
	['cameraControlDisplayFocusAssist']: {
		options: {
			cameraId: number
			state: TrueFalseToggle
		}
	}
	['cameraControlDisplayFalseColor']: {
		options: {
			cameraId: number
			state: TrueFalseToggle
		}
	}
	['cameraControlDisplayZebra']: {
		options: {
			cameraId: number
			state: TrueFalseToggle
		}
	}
	['cameraControlOutputStatusOverlay']: {
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
			['cameraControlDisplayColorBars']: undefined,
			['cameraControlDisplayFocusAssist']: undefined,
			['cameraControlDisplayFalseColor']: undefined,
			['cameraControlDisplayZebra']: undefined,
			['cameraControlOutputStatusOverlay']: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	return {
		['cameraControlDisplayColorBars']: {
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
		['cameraControlDisplayFocusAssist']: {
			name: 'Camera Control: Focus Assist',
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
				const cameraId = options.cameraId
				const cameraState = state.atemCameraState.get(cameraId)
				const tools = cameraState?.display?.exposureAndFocusTools

				let target: boolean
				if (options.state === 'toggle') {
					target = !tools?.focusAssist
				} else {
					target = options.state === 'true'
				}

				await commandSender?.displayExposureAndFocusTools(
					cameraId,
					tools?.zebra ?? false,
					target,
					tools?.falseColor ?? false,
				)
			},
		},
		['cameraControlDisplayFalseColor']: {
			name: 'Camera Control: False Color',
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
				const cameraId = options.cameraId
				const cameraState = state.atemCameraState.get(cameraId)
				const tools = cameraState?.display?.exposureAndFocusTools

				let target: boolean
				if (options.state === 'toggle') {
					target = !tools?.falseColor
				} else {
					target = options.state === 'true'
				}

				await commandSender?.displayExposureAndFocusTools(
					cameraId,
					tools?.zebra ?? false,
					tools?.focusAssist ?? false,
					target,
				)
			},
		},
		['cameraControlDisplayZebra']: {
			name: 'Camera Control: Zebra',
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
				const cameraId = options.cameraId
				const cameraState = state.atemCameraState.get(cameraId)
				const tools = cameraState?.display?.exposureAndFocusTools

				let target: boolean
				if (options.state === 'toggle') {
					target = !tools?.zebra
				} else {
					target = options.state === 'true'
				}

				await commandSender?.displayExposureAndFocusTools(
					cameraId,
					target,
					tools?.focusAssist ?? false,
					tools?.falseColor ?? false,
				)
			},
		},
		['cameraControlOutputStatusOverlay']: {
			name: 'Camera Control: Status Overlay',
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
				const cameraId = options.cameraId

				let target: boolean
				if (options.state === 'toggle') {
					const cameraState = state.atemCameraState.get(cameraId)
					target = !cameraState?.output?.overlayEnable
				} else {
					target = options.state === 'true'
				}

				await commandSender?.outputOverlayEnable(cameraId, target)
			},
		},
	}
}
