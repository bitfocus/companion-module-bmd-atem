import { type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../common.js'
import type { CompanionActionDefinition, CompanionActionDefinitions } from '@companion-module/base'
import { ActionId } from '../ActionId.js'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender } from '@atem-connection/camera-control'
import { CameraControlSourcePicker } from '../../choices.js'
import type { AtemConfig } from '../../config.js'

type RgbyAdjustmentProps = {
	cameraId: string
	red: string
	green: string
	blue: string
	luma: string
}

export type AtemCameraControlColorActions = {
	[ActionId.CameraControlColorLiftAdjust]: { options: RgbyAdjustmentProps }
	[ActionId.CameraControlColorGammaAdjust]: { options: RgbyAdjustmentProps }
	[ActionId.CameraControlColorGainAdjust]: { options: RgbyAdjustmentProps }
	[ActionId.CameraControlColorOffsetAdjust]: { options: RgbyAdjustmentProps }
	[ActionId.CameraControlColorContrastAdjust]: {
		options: {
			cameraId: string
			contrast: string
			pivot: string
		}
	}
	[ActionId.CameraControlColorLumaMix]: {
		options: {
			cameraId: string
			lumaMix: string
		}
	}
	[ActionId.CameraControlColorHueSaturationAdjust]: {
		options: {
			cameraId: string
			hue: string
			saturation: string
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
				type: 'textinput',
				label: 'Red',
				default: '0.0',
				tooltip: 'eg for -2.0 to 2.0',
				useVariables: true,
			},
			green: {
				id: 'green',
				type: 'textinput',
				label: 'Green',
				default: '0.0',
				tooltip: 'eg for -2.0 to 2.0',
				useVariables: true,
			},
			blue: {
				id: 'blue',
				type: 'textinput',
				label: 'Blue',
				default: '0.0',
				tooltip: 'eg for -2.0 to 2.0',
				useVariables: true,
			},
			luma: {
				id: 'luma',
				type: 'textinput',
				label: 'Luma',
				default: '0.0',
				tooltip: 'eg for -2.0 to 2.0',
				useVariables: true,
			},
		}),
		callback: async ({ options }) => {
			const cameraId = await options.cameraId
			const red = await options.red
			const green = await options.green
			const blue = await options.blue
			const luma = await options.luma

			await doSend(cameraId, red, green, blue, luma)
		},
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
					type: 'textinput',
					label: 'Value',
					default: '1.0',
					tooltip: 'eg for 0.0 to 1.0',
					useVariables: true,
				},
				pivot: {
					id: 'pivot',
					type: 'textinput',
					label: 'Value',
					default: '1.0',
					tooltip: 'eg for 0.0 to 1.0',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId
				const contrast = await options.contrast
				const pivot = await options.pivot

				await commandSender?.colorContrastAdjust(cameraId, contrast, pivot)
			},
		},

		[ActionId.CameraControlColorLumaMix]: {
			name: 'Camera Control: Color LumaMix',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				lumaMix: {
					id: 'lumaMix',
					type: 'textinput',
					label: 'Value',
					default: '1.0',
					tooltip: 'eg for 0.0 to 1.0',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId
				const lumaMix = await options.lumaMix

				await commandSender?.colorLumaMix(cameraId, lumaMix)
			},
		},
		[ActionId.CameraControlColorHueSaturationAdjust]: {
			name: 'Camera Control: Color Hue & Saturation',
			options: convertOptionsFields({
				cameraId: CameraControlSourcePicker(),
				hue: {
					id: 'hue',
					type: 'textinput',
					label: 'Hue',
					default: '0.0',
					tooltip: 'eg for -1.0 to 1.0',
					useVariables: true,
				},
				saturation: {
					id: 'saturation',
					type: 'textinput',
					label: 'Saturation',
					default: '1.0',
					tooltip: 'eg for 0.0 to 2.0',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				const cameraId = await options.cameraId
				const hue = await options.hue
				const saturation = await options.saturation

				await commandSender?.colorHueSaturationAdjust(cameraId, hue, saturation)
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
