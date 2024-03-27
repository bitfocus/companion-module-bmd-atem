import { type Atem } from 'atem-connection'
import { ActionId } from '../ActionId.js'
import type { MyActionDefinitions } from '../types.js'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender, VideoSharpeningLevel } from '@atem-connection/camera-control'
import { CameraControlSourcePicker } from '../../choices.js'
import type { AtemConfig } from '../../config.js'

export interface AtemCameraControlVideoActions {
	[ActionId.CameraControlVideoManualWhiteBalance]: {
		cameraId: string
		colorTemperature: string
		tint: string
	}
	[ActionId.CameraControlVideoAutoWhiteBalance]: {
		cameraId: string
	}
	[ActionId.CameraControlVideoExposure]: {
		cameraId: string
		framerate: string
	}
	[ActionId.CameraControlVideoSharpeningLevel]: {
		cameraId: string
		level: VideoSharpeningLevel
	}
	[ActionId.CameraControlVideoGain]: {
		cameraId: string
		gain: string
	}
	[ActionId.CameraControlIncrementVideoGain]: {
		cameraId: string
		increment: string
	}
	[ActionId.CameraControlVideoNdFilterStop]: {
		cameraId: string
		stop: string
	}
}

export function createCameraControlVideoActions(
	config: AtemConfig,
	atem: Atem | undefined,
	_state: StateWrapper
): MyActionDefinitions<AtemCameraControlVideoActions> {
	if (!config.enableCameraControl) {
		return {
			[ActionId.CameraControlVideoManualWhiteBalance]: undefined,
			[ActionId.CameraControlVideoAutoWhiteBalance]: undefined,
			[ActionId.CameraControlVideoExposure]: undefined,
			[ActionId.CameraControlVideoSharpeningLevel]: undefined,
			[ActionId.CameraControlVideoGain]: undefined,
			[ActionId.CameraControlIncrementVideoGain]: undefined,
			[ActionId.CameraControlVideoNdFilterStop]: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	return {
		[ActionId.CameraControlVideoManualWhiteBalance]: {
			name: 'Camera Control: White Balance',
			options: {
				cameraId: CameraControlSourcePicker(),
				colorTemperature: {
					id: 'colorTemperature',
					type: 'textinput',
					label: 'Color Temperature',
					default: '5600',
					useVariables: true,
				},
				tint: {
					id: 'tint',
					type: 'textinput',
					label: 'Tint',
					default: '0',
					tooltip: 'Range -50 to 50',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const colorTemperature = await options.getParsedNumber('colorTemperature')
				const tint = await options.getParsedNumber('tint')

				await commandSender?.videoManualWhiteBalance(cameraId, colorTemperature, tint)
			},
		},

		[ActionId.CameraControlVideoAutoWhiteBalance]: {
			name: 'Camera Control: Trigger Auto White Balance',
			options: {
				cameraId: CameraControlSourcePicker(),
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')

				await commandSender?.videoTriggerAutoWhiteBalance(cameraId)
			},
		},

		[ActionId.CameraControlVideoExposure]: {
			name: 'Camera Control: Video Exposure',
			options: {
				cameraId: CameraControlSourcePicker(),
				framerate: {
					id: 'framerate',
					type: 'textinput',
					label: 'Framerate',
					default: '60',
					tooltip: 'eg for 1/60 use 50',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const framerate = await options.getParsedNumber('framerate')

				await commandSender?.videoExposureUs(cameraId, Math.round(1000000 / framerate))
			},
		},

		[ActionId.CameraControlVideoSharpeningLevel]: {
			name: 'Camera Control: Video Sharpening Level',
			options: {
				cameraId: CameraControlSourcePicker(),
				level: {
					id: 'level',
					type: 'dropdown',
					label: 'Level',
					default: VideoSharpeningLevel.Low,
					choices: [
						{
							id: VideoSharpeningLevel.Off,
							label: 'Off',
						},
						{
							id: VideoSharpeningLevel.Low,
							label: 'Low',
						},
						{
							id: VideoSharpeningLevel.Medium,
							label: 'Medium',
						},
						{
							id: VideoSharpeningLevel.High,
							label: 'High',
						},
					],
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const level = options.getPlainNumber('level')

				await commandSender?.videoSharpeningLevel(cameraId, level)
			},
		},

		[ActionId.CameraControlVideoGain]: {
			name: 'Camera Control: Video Gain',
			options: {
				cameraId: CameraControlSourcePicker(),
				gain: {
					id: 'gain',
					type: 'textinput',
					label: 'Value',
					default: '0',
					tooltip: 'Range 0 - 128',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const gain = await options.getParsedNumber('gain')

				await commandSender?.videoGain(cameraId, gain)
			},
		},

		[ActionId.CameraControlIncrementVideoGain]: {
			name: 'Camera Control: Increment Video Gain',
			options: {
				cameraId: CameraControlSourcePicker(),
				increment: {
					id: 'increment',
					type: 'textinput',
					label: 'Value',
					default: '10',
					tooltip: 'e.g 10 or -10',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const increment = await options.getParsedNumber('increment')

				let target_gain = (_state.atemCameraState.get(cameraId)?.video.gain ?? 0) + increment

				if (target_gain > 128) {
					target_gain = 128
				} else if (target_gain < 0) {
					target_gain = 0
				}

				await commandSender?.videoGain(cameraId, target_gain)
			},
		},

		[ActionId.CameraControlVideoNdFilterStop]: {
			name: 'Camera Control: ND Filter Stop',
			options: {
				cameraId: CameraControlSourcePicker(),
				stop: {
					id: 'stop',
					type: 'textinput',
					label: 'Value',
					default: '4',
					tooltip: 'Range 0.0 - 15.0',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const stop = await options.getParsedNumber('stop')

				await commandSender?.videoNdFilterStop(cameraId, stop)
			},
		},
	}
}

// videoManualWhiteBalance(cameraId: number, colorTemperature: number, tint: number, relative?: boolean): TRes;
