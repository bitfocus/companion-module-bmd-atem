import type { AtemCameraControlState, ColorAdjust } from '@atem-connection/camera-control'
import type { CompanionVariableDefinitions } from '@companion-module/base'
import type { InstanceBaseExt } from '../util.js'
import type { VariablesSchema } from './schema.js'

function roundToFactor(value: number, factor: number) {
	return Math.round(value * factor) / factor
}

export function updateCameraControlVariables(
	_instance: InstanceBaseExt,
	state: AtemCameraControlState,
	values: Partial<VariablesSchema>,
): void {
	values[`camera_${state.cameraId}_focus`] = roundToFactor(state.lens.focus, 1000)
	values[`camera_${state.cameraId}_iris`] = roundToFactor(state.lens.iris, 1000)
	values[`camera_${state.cameraId}_ois`] = state.lens.opticalImageStabilisation ? 1 : 0

	values[`camera_${state.cameraId}_wb_temp`] = state.video.whiteBalance[0]
	values[`camera_${state.cameraId}_wb_tint`] = state.video.whiteBalance[1]
	values[`camera_${state.cameraId}_exposure_us`] = state.video.exposure
	values[`camera_${state.cameraId}_sharpening`] = state.video.videoSharpeningLevel
	values[`camera_${state.cameraId}_shutter_speed`] = state.video.shutterSpeed
	values[`camera_${state.cameraId}_gain`] = state.video.gain
	values[`camera_${state.cameraId}_nd_filter`] = state.video.ndFilterStop

	values[`camera_${state.cameraId}_show_color_bars`] = state.display.colorBarEnable ? 1 : 0
	values[`camera_${state.cameraId}_focus_assist`] = state.display.exposureAndFocusTools.focusAssist ? 1 : 0
	values[`camera_${state.cameraId}_false_color`] = state.display.exposureAndFocusTools.falseColor ? 1 : 0
	values[`camera_${state.cameraId}_zebra`] = state.display.exposureAndFocusTools.zebra ? 1 : 0
	values[`camera_${state.cameraId}_status_overlay`] = state.output.overlayEnable ? 1 : 0

	const defineRGBY = (key: string, vals: ColorAdjust) => {
		values[`camera_${state.cameraId}_color_${key}_red`] = roundToFactor(vals.red, 1000)
		values[`camera_${state.cameraId}_color_${key}_green`] = roundToFactor(vals.green, 1000)
		values[`camera_${state.cameraId}_color_${key}_blue`] = roundToFactor(vals.blue, 1000)
		values[`camera_${state.cameraId}_color_${key}_luma`] = roundToFactor(vals.luma, 1000)
	}
	defineRGBY('lift', state.colorCorrection.liftAdjust)
	defineRGBY('gamma', state.colorCorrection.gammaAdjust)
	defineRGBY('gain', state.colorCorrection.gainAdjust)
	defineRGBY('offset', state.colorCorrection.offsetAdjust)

	values[`camera_${state.cameraId}_contrast_pivot`] = roundToFactor(state.colorCorrection.contrastAdjust.pivot, 1000)
	values[`camera_${state.cameraId}_contrast_adjust`] = roundToFactor(state.colorCorrection.contrastAdjust.adj, 1000)
	values[`camera_${state.cameraId}_lumamix`] = roundToFactor(state.colorCorrection.lumaMix, 1000)
	values[`camera_${state.cameraId}_hue_adjust`] = roundToFactor(state.colorCorrection.colorAdjust.hue, 1000)
	values[`camera_${state.cameraId}_saturation_adjust`] = roundToFactor(
		state.colorCorrection.colorAdjust.saturation,
		1000,
	)
}

export function initCameraControlVariables(
	_instance: InstanceBaseExt,
	cameraId: number,
	variables: CompanionVariableDefinitions<VariablesSchema>,
): void {
	variables[`camera_${cameraId}_focus`] = {
		name: `Camera ${cameraId}: Focus`,
	}
	variables[`camera_${cameraId}_iris`] = {
		name: `Camera ${cameraId}: Iris`,
	}
	variables[`camera_${cameraId}_ois`] = {
		name: `Camera ${cameraId}: Optical Image Stabilisation`,
	}

	variables[`camera_${cameraId}_wb_temp`] = {
		name: `Camera ${cameraId}: White balance temperature`,
	}
	variables[`camera_${cameraId}_wb_tint`] = {
		name: `Camera ${cameraId}: White balance tint`,
	}
	variables[`camera_${cameraId}_exposure_us`] = {
		name: `Camera ${cameraId}: Exposure microseconds (us)`,
	}
	variables[`camera_${cameraId}_sharpening`] = {
		name: `Camera ${cameraId}: Sharpening level`,
	}
	variables[`camera_${cameraId}_shutter_speed`] = {
		name: `Camera ${cameraId}: Shutter speed (1/x)`,
	}
	variables[`camera_${cameraId}_gain`] = {
		name: `Camera ${cameraId}: Gain (dB)`,
	}
	variables[`camera_${cameraId}_nd_filter`] = {
		name: `Camera ${cameraId}: ND Filter`,
	}

	variables[`camera_${cameraId}_show_color_bars`] = {
		name: `Camera ${cameraId}: Show Color Bars`,
	}
	variables[`camera_${cameraId}_focus_assist`] = {
		name: `Camera ${cameraId}: Focus Assist`,
	}
	variables[`camera_${cameraId}_false_color`] = {
		name: `Camera ${cameraId}: False Color`,
	}
	variables[`camera_${cameraId}_zebra`] = {
		name: `Camera ${cameraId}: Zebra`,
	}
	variables[`camera_${cameraId}_status_overlay`] = {
		name: `Camera ${cameraId}: Status Overlay`,
	}

	const defineRGBY = (key: string, name: string) => {
		variables[`camera_${cameraId}_color_${key}_red`] = {
			name: `Camera ${cameraId}: Color ${name} Adjust - Red`,
		}
		variables[`camera_${cameraId}_color_${key}_green`] = {
			name: `Camera ${cameraId}: Color ${name} Adjust - Green`,
		}
		variables[`camera_${cameraId}_color_${key}_blue`] = {
			name: `Camera ${cameraId}: Color ${name} Adjust - Blue`,
		}
		variables[`camera_${cameraId}_color_${key}_luma`] = {
			name: `Camera ${cameraId}: Color ${name} Adjust - Luma`,
		}
	}
	defineRGBY('lift', 'Lift')
	defineRGBY('gamma', 'Gamma')
	defineRGBY('gain', 'Gain')
	defineRGBY('offset', 'Offset')

	variables[`camera_${cameraId}_contrast_pivot`] = {
		name: `Camera ${cameraId}: Contrast Pivot`,
	}
	variables[`camera_${cameraId}_contrast_adjust`] = {
		name: `Camera ${cameraId}: Contrast Adjust`,
	}
	variables[`camera_${cameraId}_lumamix`] = {
		name: `Camera ${cameraId}: Luma mix`,
	}
	variables[`camera_${cameraId}_hue_adjust`] = {
		name: `Camera ${cameraId}: Hue Adjust`,
	}
	variables[`camera_${cameraId}_saturation_adjust`] = {
		name: `Camera ${cameraId}: Saturation Adjust`,
	}
}
