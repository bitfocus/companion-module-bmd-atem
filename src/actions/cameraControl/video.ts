import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender, VideoSharpeningLevel } from '@atem-connection/camera-control'
import { CameraControlSourcePicker } from '../../options/cameraControl.js'
import type { AtemConfig } from '../../config.js'

export type AtemCameraControlVideoActions = {
	['cameraControlVideoManualWhiteBalance']: {
		options: {
			cameraId: number
			colorTemperature: number
			tint: number
		}
	}
	['cameraControlVideoIncrementManualWhiteBalance']: {
		options: {
			cameraId: number
			colorTemperatureIncrement: number
			tintIncrement: number
		}
	}
	['cameraControlVideoAutoWhiteBalance']: {
		options: {
			cameraId: number
		}
	}
	['cameraControlVideoExposure']: {
		options: {
			cameraId: number
			framerate: number
		}
	}
	['cameraControlIncrementVideoExposure']: {
		options: {
			cameraId: number
			direction: string
		}
	}
	['cameraControlVideoSharpeningLevel']: {
		options: {
			cameraId: number
			level: VideoSharpeningLevel
		}
	}
	['cameraControlVideoGain']: {
		options: {
			cameraId: number
			gain: number
		}
	}
	['cameraControlIncrementVideoGain']: {
		options: {
			cameraId: number
			increment: number
		}
	}
	['cameraControlVideoNdFilterStop']: {
		options: {
			cameraId: number
			stop: number
		}
	}
}

export function createCameraControlVideoActions(
	config: AtemConfig,
	atem: Atem | undefined,
	_state: StateWrapper,
): CompanionActionDefinitions<AtemCameraControlVideoActions> {
	if (!config.enableCameraControl) {
		return {
			['cameraControlVideoManualWhiteBalance']: undefined,
			['cameraControlVideoIncrementManualWhiteBalance']: undefined,
			['cameraControlVideoAutoWhiteBalance']: undefined,
			['cameraControlVideoExposure']: undefined,
			['cameraControlIncrementVideoExposure']: undefined,
			['cameraControlVideoSharpeningLevel']: undefined,
			['cameraControlVideoGain']: undefined,
			['cameraControlIncrementVideoGain']: undefined,
			['cameraControlVideoNdFilterStop']: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	return {
		['cameraControlVideoManualWhiteBalance']: {
			name: 'Camera Control: White Balance',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				colorTemperature: {
					id: 'colorTemperature',
					type: 'number',
					label: 'Color Temperature',
					default: 5600,
					min: 1000,
					max: 15000,
					clampValues: true,
				},
				tint: {
					id: 'tint',
					type: 'number',
					label: 'Tint',
					default: 0,
					min: -50,
					max: 50,
					description: 'Range -50 to 50',
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.videoManualWhiteBalance(options.cameraId, options.colorTemperature, options.tint)
			},
		},

		['cameraControlVideoIncrementManualWhiteBalance']: {
			name: 'Camera Control: Increment White Balance',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				colorTemperatureIncrement: {
					id: 'colorTemperatureIncrement',
					type: 'number',
					label: 'Color Temperature Increment',
					default: 100,
					min: -10000,
					max: 10000,
					description: 'e.g. 100 or -100',
					clampValues: true,
				},
				tintIncrement: {
					id: 'tintIncrement',
					type: 'number',
					label: 'Tint Increment',
					default: 0,
					min: -100,
					max: 100,
					description: 'e.g 10 or -10',
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = options.cameraId

				const colorTemperature =
					(_state.atemCameraState.get(cameraId)?.video.whiteBalance[0] ?? 0) + options.colorTemperatureIncrement
				let tint = (_state.atemCameraState.get(cameraId)?.video.whiteBalance[1] ?? 0) + options.tintIncrement

				if (tint > 50) {
					tint = 50
				} else if (tint < -50) {
					tint = -50
				}

				await commandSender?.videoManualWhiteBalance(cameraId, colorTemperature, tint)
			},
		},

		['cameraControlVideoAutoWhiteBalance']: {
			name: 'Camera Control: Trigger Auto White Balance',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
			}),
			callback: async ({ options }) => {
				await commandSender?.videoTriggerAutoWhiteBalance(options.cameraId)
			},
		},

		['cameraControlVideoExposure']: {
			name: 'Camera Control: Video Exposure',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				framerate: {
					id: 'framerate',
					type: 'number',
					label: 'Framerate',
					default: 60,
					min: 1,
					max: 400,
					description: 'eg for 1/60 use 60',
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.videoExposureUs(options.cameraId, Math.round(1000000 / options.framerate))
			},
		},

		['cameraControlIncrementVideoExposure']: {
			name: 'Camera Control: Increment Video Exposure',
			options: convertOptionsFields({
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
					description: 'Up for faster shutter speeds, down for slower.',
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				// Note: this list of exposures is based on the micro studio 4k g2.
				// unsure if this is correct for other models
				const exposureUs = [
					41667, 40000, 33333, 20833, 20000, 16667, 13333, 11111, 10000, 8333, 6667, 5556, 4000, 2778, 2000, 1379, 1000,
					690, 500,
				]

				const cameraId = options.cameraId
				const increment = options.direction == 'up' ? 1 : -1

				const currentExposreIndex = exposureUs.indexOf(_state.atemCameraState.get(cameraId)?.video.exposure ?? 41667)

				let targetExposureIndex = currentExposreIndex + increment

				if (targetExposureIndex < 0 || targetExposureIndex > exposureUs.length - 1) {
					targetExposureIndex = currentExposreIndex
				}

				await commandSender?.videoExposureUs(cameraId, exposureUs[targetExposureIndex])
			},
		},

		['cameraControlVideoSharpeningLevel']: {
			name: 'Camera Control: Video Sharpening Level',
			options: convertOptionsFields({
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
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.videoSharpeningLevel(options.cameraId, options.level)
			},
		},

		['cameraControlVideoGain']: {
			name: 'Camera Control: Video Gain',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				gain: {
					id: 'gain',
					type: 'number',
					label: 'Value',
					default: 0,
					min: 0,
					max: 128,
					description: 'Range 0 - 128',
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.videoGain(options.cameraId, options.gain)
			},
		},

		['cameraControlIncrementVideoGain']: {
			name: 'Camera Control: Increment Video Gain',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				increment: {
					id: 'increment',
					type: 'number',
					label: 'Value',
					default: 10,
					min: -200,
					max: 200,
					description: 'e.g 10 or -10',
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = options.cameraId
				const increment = options.increment

				let gain = Math.round((_state.atemCameraState.get(cameraId)?.video.gain ?? 0) + increment)

				if (gain > 127) {
					gain = 127
				} else if (gain < 0) {
					gain = 0
				}

				await commandSender?.videoGain(cameraId, gain)
			},
		},

		['cameraControlVideoNdFilterStop']: {
			name: 'Camera Control: ND Filter Stop',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				stop: {
					id: 'stop',
					type: 'number',
					label: 'Value',
					default: 4,
					min: 0,
					max: 15,
					description: 'Range 0.0 - 15.0',
					asInteger: false,
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.videoNdFilterStop(options.cameraId, options.stop)
			},
		},
	}
}

// videoManualWhiteBalance(cameraId: number, colorTemperature: number, tint: number, relative?: boolean): TRes;
