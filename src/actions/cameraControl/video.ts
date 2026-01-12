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
	[ActionId.CameraControlVideoIncrementManualWhiteBalance]: {
		cameraId: string
		colorTemperatureIncrement: string
		tintIncrement: string
	}
	[ActionId.CameraControlVideoAutoWhiteBalance]: {
		cameraId: string
	}
	[ActionId.CameraControlVideoExposure]: {
		cameraId: string
		framerate: string
	}
	[ActionId.CameraControlIncrementVideoExposure]: {
		cameraId: string
		direction: string
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
	_state: StateWrapper,
): MyActionDefinitions<AtemCameraControlVideoActions> {
	if (!config.enableCameraControl) {
		return {
			[ActionId.CameraControlVideoManualWhiteBalance]: undefined,
			[ActionId.CameraControlVideoIncrementManualWhiteBalance]: undefined,
			[ActionId.CameraControlVideoAutoWhiteBalance]: undefined,
			[ActionId.CameraControlVideoExposure]: undefined,
			[ActionId.CameraControlIncrementVideoExposure]: undefined,
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

		[ActionId.CameraControlVideoIncrementManualWhiteBalance]: {
			name: 'Camera Control: Increment White Balance',
			options: {
				cameraId: CameraControlSourcePicker(),
				colorTemperatureIncrement: {
					id: 'colorTemperatureIncrement',
					type: 'textinput',
					label: 'Color Temperature Increment',
					default: '100',
					tooltip: 'e.g. 100 or -100',
					useVariables: true,
				},
				tintIncrement: {
					id: 'tintIncrement',
					type: 'textinput',
					label: 'Tint Increment',
					default: '0',
					tooltip: 'e.g 10 or -10',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const colorTemperatureIncrement = await options.getParsedNumber('colorTemperatureIncrement')
				const tintIncrement = await options.getParsedNumber('tintIncrement')

				const colorTemperature =
					(_state.atemCameraState.get(cameraId)?.video.whiteBalance[0] ?? 0) + colorTemperatureIncrement
				let tint = (_state.atemCameraState.get(cameraId)?.video.whiteBalance[1] ?? 0) + tintIncrement

				if (tint > 50) {
					tint = 50
				} else if (tint < -50) {
					tint = -50
				}

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

		[ActionId.CameraControlIncrementVideoExposure]: {
			name: 'Camera Control: Increment Video Exposure',
			options: {
				cameraId: CameraControlSourcePicker(),
				direction: {
					id: 'direction',
					type: 'dropdown',
					label: 'Direction',
					choices: [
						{ id: 'up', label: 'Up +' },
						{ id: 'down', label: 'Down -' },
					],
					default: 'up',
					tooltip: 'Up for faster shutter speeds, down for slower.',
				},
			},
			callback: async ({ options }) => {
				const exposureUs = [
					41667, 40000, 33333, 20833, 20000, 16667, 13333, 11111, 10000, 8333, 6667, 5556, 4000, 2778, 2000, 1379, 1000,
					690, 500,
				]

				const cameraId = await options.getParsedNumber('cameraId')
				const increment = options.getPlainString('direction') == 'up' ? 1 : -1

				const currentExposreIndex = exposureUs.indexOf(_state.atemCameraState.get(cameraId)?.video.exposure ?? 41667)

				let targetExposureIndex = currentExposreIndex + increment

				if (targetExposureIndex < 0 || targetExposureIndex > exposureUs.length - 1) {
					targetExposureIndex = currentExposreIndex
				}

				await commandSender?.videoExposureUs(cameraId, exposureUs[targetExposureIndex])
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
					tooltip: 'Range -12 - 36',
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
					default: '2',
					tooltip: 'e.g 2 or -2',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const increment = await options.getParsedNumber('increment')

				let gain = (_state.atemCameraState.get(cameraId)?.video.gain ?? 0) + increment

				if (gain > 36) {
					gain = 36
				} else if (gain < -12) {
					gain = -12
				}

				await commandSender?.videoGain(cameraId, gain)
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
