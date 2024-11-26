import { type Atem } from 'atem-connection'
import { ActionId } from '../ActionId.js'
import type { MyActionDefinitions } from '../types.js'
import type { StateWrapper } from '../../state.js'
import {
	AtemCameraControlBatchCommandSender,
	AtemCameraControlDirectCommandSender,
} from '@atem-connection/camera-control'
import { CameraControlSourcePicker, type TrueFalseToggle } from '../../choices.js'
import type { AtemConfig } from '../../config.js'
import type { ModelSpec } from '../../models/types.js'
import { InternalPortType } from 'atem-connection/dist/enums/index.js'

export interface AtemCameraControlDisplayActions {
	[ActionId.CameraControlMediaRecordSingle]: {
		cameraId: string
		state: TrueFalseToggle
	}
	[ActionId.CameraControlMediaRecordMultiple]: {
		cameraIds: number[]
		state: TrueFalseToggle
	}
}

export function createCameraControlMediaActions(
	config: AtemConfig,
	model: ModelSpec,
	atem: Atem | undefined,
	state: StateWrapper,
): MyActionDefinitions<AtemCameraControlDisplayActions> {
	if (!config.enableCameraControl) {
		return {
			[ActionId.CameraControlMediaRecordSingle]: undefined,
			[ActionId.CameraControlMediaRecordMultiple]: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	return {
		[ActionId.CameraControlMediaRecordSingle]: {
			name: 'Camera Control: Set Camera Recording',
			options: {
				cameraId: CameraControlSourcePicker(),
				state: {
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: [
						{ id: 'true', label: 'Recording' },
						{ id: 'false', label: 'Stopped' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')

				let target: boolean
				if (options.getPlainString('state') === 'toggle') {
					const cameraState = state.atemCameraState.get(cameraId)
					target = !cameraState?.display?.colorBarEnable
				} else {
					target = options.getPlainString('state') === 'true'
				}

				if (target) {
					await commandSender?.mediaTriggerSetRecording(cameraId)
				} else {
					await commandSender?.mediaTriggerSetStopped(cameraId)
				}
			},
		},
		[ActionId.CameraControlMediaRecordMultiple]: {
			name: 'Camera Control: Set Multiple Camera Recording',
			options: {
				cameraIds: {
					id: 'cameraIds',
					type: 'multidropdown',
					label: 'Camera Id',
					choices: model.inputs
						.filter((input) => input.portType === InternalPortType.External)
						.map((input) => {
							const inputState = state.state.inputs[input.id]
							const label = inputState?.longName ? `${inputState.longName} (${input.id})` : `Camera ${input.id}`

							return {
								label,
								id: input.id,
							}
						}),
					default: [1],
				},
				state: {
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'true',
					choices: [
						{ id: 'true', label: 'Recording' },
						{ id: 'false', label: 'Stopped' },
					],
				},
			},
			callback: async ({ options }) => {
				const cameraIds = options.getRaw('cameraIds')

				if (!cameraIds || !Array.isArray(cameraIds) || cameraIds.length === 0) return

				const target = options.getPlainString('state') === 'true'

				if (!atem) return

				const commandBatch = new AtemCameraControlBatchCommandSender(atem)

				for (const cameraId of cameraIds) {
					if (target) {
						commandBatch.mediaTriggerSetRecording(cameraId)
					} else {
						commandBatch.mediaTriggerSetStopped(cameraId)
					}
				}

				await commandBatch.sendBatch()
			},
		},
	}
}
