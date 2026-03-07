import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/common.js'
import type { CompanionActionDefinition, CompanionActionDefinitions } from '@companion-module/base'
import { ActionId } from '../ActionId.js'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender } from '@atem-connection/camera-control'
import { CameraControlSourcePicker } from '../../choices.js'
import type { AtemConfig } from '../../config.js'

type RgbyAdjustmentProps = {
	cameraId: number
	red: number
	green: number
	blue: number
	luma: number
}

export type AtemCameraControlColorActions = {
	[ActionId.CameraControlColorLiftAdjust]: {
		options: RgbyAdjustmentProps
	}
	[ActionId.CameraControlColorGammaAdjust]: {
		options: RgbyAdjustmentProps
	}
	[ActionId.CameraControlColorGainAdjust]: {
		options: RgbyAdjustmentProps
	}
	[ActionId.CameraControlColorOffsetAdjust]: {
		options: RgbyAdjustmentProps
	}
	[ActionId.CameraControlColorContrastAdjust]: {
		options: {
			cameraId: number
			contrast: number
			pivot: number
		}
	}
	[ActionId.CameraControlColorLumaMix]: {
		options: {
			cameraId: number
			lumaMix: number
		}
	}
	[ActionId.CameraControlColorHueSaturationAdjust]: {
		options: {
			cameraId: number
			hue: number
			saturation: number
		}
	}
}

export function createCameraControlColorActions(
	config: AtemConfig,
	atem: Atem | undefined,
	_state: StateWrapper,
): CompanionActionDefinitions<AtemCameraControlColorActions> {
	if (!config.enableCameraControl) {
		return {
			[ActionId.CameraControlColorLiftAdjust]: undefined,
			[ActionId.CameraControlColorGammaAdjust]: undefined,
			[ActionId.CameraControlColorGainAdjust]: undefined,
			[ActionId.CameraControlColorOffsetAdjust]: undefined,
			[ActionId.CameraControlColorContrastAdjust]: undefined,
			[ActionId.CameraControlColorLumaMix]: undefined,
			[ActionId.CameraControlColorHueSaturationAdjust]: undefined,
		}
	}

	const commandSender = atem && new AtemCameraControlDirectCommandSender(atem)

	const createRgbaAction = (
		name: string,
		doSend: (cameraId: number, red: number, green: number, blue: number, luma: number) => Promise<void>,
	): CompanionActionDefinition<RgbyAdjustmentProps> => ({
		name: name,
		options: convertOptionsFields({
			cameraId: CameraControlSourcePicker(),
			red: {
				id: 'red',
				type: 'number',
				label: 'Red',
				default: 0,
				min: -2,
				max: 2,
				description: 'eg for -2.0 to 2.0',
				asInteger: false,
				clampValues: true,
			},
			green: {
				id: 'green',
				type: 'number',
				label: 'Green',
				default: 0,
				min: -2,
				max: 2,
				description: 'eg for -2.0 to 2.0',
				asInteger: false,
				clampValues: true,
			},
			blue: {
				id: 'blue',
				type: 'number',
				label: 'Blue',
				default: 0,
				min: -2,
				max: 2,
				description: 'eg for -2.0 to 2.0',
				asInteger: false,
				clampValues: true,
			},
			luma: {
				id: 'luma',
				type: 'number',
				label: 'Luma',
				default: 0,
				min: -2,
				max: 2,
				description: 'eg for -2.0 to 2.0',
				asInteger: false,
				clampValues: true,
			},
		}),
		callback: async ({ options }) => doSend(options.cameraId, options.red, options.green, options.blue, options.luma),
	})

	return {
		[ActionId.CameraControlColorLiftAdjust]: createRgbaAction(
			'Camera Control: Color Lift Adjust',
			async (cameraId, red, green, blue, luma) => commandSender?.colorLiftAdjust(cameraId, red, green, blue, luma),
		),
		[ActionId.CameraControlColorGammaAdjust]: createRgbaAction(
			'Camera Control: Color Gamma Adjust',
			async (cameraId, red, green, blue, luma) => commandSender?.colorGammaAdjust(cameraId, red, green, blue, luma),
		),
		[ActionId.CameraControlColorGainAdjust]: createRgbaAction(
			'Camera Control: Color Gain Adjust',
			async (cameraId, red, green, blue, luma) => commandSender?.colorGainAdjust(cameraId, red, green, blue, luma),
		),
		[ActionId.CameraControlColorOffsetAdjust]: createRgbaAction(
			'Camera Control: Color Offset Adjust',
			async (cameraId, red, green, blue, luma) => commandSender?.colorOffsetAdjust(cameraId, red, green, blue, luma),
		),

		[ActionId.CameraControlColorContrastAdjust]: {
			name: 'Camera Control: Contrast Adjust',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				contrast: {
					id: 'contrast',
					type: 'number',
					label: 'Value',
					default: 1.0,
					min: 0,
					max: 1,
					description: 'eg for 0.0 to 1.0',
					asInteger: false,
					clampValues: true,
				},
				pivot: {
					id: 'pivot',
					type: 'number',
					label: 'Value',
					default: 1.0,
					min: 0,
					max: 1,
					description: 'eg for 0.0 to 1.0',
					asInteger: false,
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.colorContrastAdjust(options.cameraId, options.contrast, options.pivot)
			},
		},

		[ActionId.CameraControlColorLumaMix]: {
			name: 'Camera Control: Color LumaMix',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				lumaMix: {
					id: 'lumaMix',
					type: 'number',
					label: 'Value',
					default: 1.0,
					min: 0,
					max: 1,
					description: 'eg for 0.0 to 1.0',
					asInteger: false,
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.colorLumaMix(options.cameraId, options.lumaMix)
			},
		},
		[ActionId.CameraControlColorHueSaturationAdjust]: {
			name: 'Camera Control: Color Hue & Saturation',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				hue: {
					id: 'hue',
					type: 'number',
					label: 'Hue',
					default: 0.0,
					min: -1,
					max: 1,
					description: 'eg for -1.0 to 1.0',
					asInteger: false,
					clampValues: true,
				},
				saturation: {
					id: 'saturation',
					type: 'number',
					label: 'Saturation',
					default: 1.0,
					min: 0,
					max: 2,
					description: 'eg for 0.0 to 2.0',
					asInteger: false,
					clampValues: true,
				},
			}),
			callback: async ({ options }) => {
				await commandSender?.colorHueSaturationAdjust(options.cameraId, options.hue, options.saturation)
			},
		},
	}
}

// colorLiftAdjust(cameraId: number, red: number, green: number, blue: number, luma: number, relative?: boolean): TRes;
// colorGammaAdjust(cameraId: number, red: number, green: number, blue: number, luma: number, relative?: boolean): TRes;
// colorGainAdjust(cameraId: number, red: number, green: number, blue: number, luma: number, relative?: boolean): TRes;
// colorOffsetAdjust(cameraId: number, red: number, green: number, blue: number, luma: number, relative?: boolean): TRes;
// colorContrastAdjust(cameraId: number, constrast: number, pivot: number, relative?: boolean): TRes;
// colorLumaMix(cameraId: number, lumaMix: number, relative?: boolean): TRes;
// colorHueSaturationAdjust(cameraId: number, hue: number, saturation: number, relative?: boolean): TRes;
