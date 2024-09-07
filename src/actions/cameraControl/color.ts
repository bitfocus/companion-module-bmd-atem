import { type Atem } from 'atem-connection'
import { ActionId } from '../ActionId.js'
import type { MyActionDefinition, MyActionDefinitions } from '../types.js'
import type { StateWrapper } from '../../state.js'
import { AtemCameraControlDirectCommandSender } from '@atem-connection/camera-control'
import { CameraControlSourcePicker } from '../../choices.js'
import type { AtemConfig } from '../../config.js'

interface RgbyAdjustmentProps {
	cameraId: string
	red: string
	green: string
	blue: string
	luma: string
}

export interface AtemCameraControlColorActions {
	[ActionId.CameraControlColorLiftAdjust]: RgbyAdjustmentProps
	[ActionId.CameraControlColorGammaAdjust]: RgbyAdjustmentProps
	[ActionId.CameraControlColorGainAdjust]: RgbyAdjustmentProps
	[ActionId.CameraControlColorOffsetAdjust]: RgbyAdjustmentProps
	[ActionId.CameraControlColorContrastAdjust]: {
		cameraId: string
		contrast: string
		pivot: string
	}
	[ActionId.CameraControlColorLumaMix]: {
		cameraId: string
		lumaMix: string
	}
	[ActionId.CameraControlColorHueSaturationAdjust]: {
		cameraId: string
		hue: string
		saturation: string
	}
}

export function createCameraControlColorActions(
	config: AtemConfig,
	atem: Atem | undefined,
	_state: StateWrapper,
): MyActionDefinitions<AtemCameraControlColorActions> {
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
	): MyActionDefinition<RgbyAdjustmentProps> => ({
		name: name,
		options: {
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
		},
		callback: async ({ options }) => {
			const cameraId = await options.getParsedNumber('cameraId')
			const red = await options.getParsedNumber('red')
			const green = await options.getParsedNumber('green')
			const blue = await options.getParsedNumber('blue')
			const luma = await options.getParsedNumber('luma')

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
			options: {
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
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const contrast = await options.getParsedNumber('contrast')
				const pivot = await options.getParsedNumber('pivot')

				await commandSender?.colorContrastAdjust(cameraId, contrast, pivot)
			},
		},

		[ActionId.CameraControlColorLumaMix]: {
			name: 'Camera Control: Color LumaMix',
			options: {
				cameraId: CameraControlSourcePicker(),
				lumaMix: {
					id: 'lumaMix',
					type: 'textinput',
					label: 'Value',
					default: '1.0',
					tooltip: 'eg for 0.0 to 1.0',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const lumaMix = await options.getParsedNumber('lumaMix')

				await commandSender?.colorLumaMix(cameraId, lumaMix)
			},
		},
		[ActionId.CameraControlColorHueSaturationAdjust]: {
			name: 'Camera Control: Color Hue & Saturation',
			options: {
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
			},
			callback: async ({ options }) => {
				const cameraId = await options.getParsedNumber('cameraId')
				const hue = await options.getParsedNumber('hue')
				const saturation = await options.getParsedNumber('saturation')

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
