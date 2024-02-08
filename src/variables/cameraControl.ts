import type { AtemCameraControlState, ColorAdjust } from '@atem-connection/camera-control'
import type { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import type { AtemConfig } from '../config.js'
import type { InstanceBaseExt } from '../util.js'

function roundToFactor(value: number, factor: number) {
	return Math.round(value * factor) / factor
}

export function updateCameraControlVariables(
	_instance: InstanceBaseExt<AtemConfig>,
	state: AtemCameraControlState,
	values: CompanionVariableValues
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
		1000
	)
}

export function initCameraControlVariables(
	_instance: InstanceBaseExt<AtemConfig>,
	cameraId: number,
	variables: CompanionVariableDefinition[]
): void {
	variables.push({
		variableId: `camera_${cameraId}_focus`,
		name: `Camera ${cameraId}: Focus`,
	})
	variables.push({
		variableId: `camera_${cameraId}_iris`,
		name: `Camera ${cameraId}: Iris`,
	})
	variables.push({
		variableId: `camera_${cameraId}_ois`,
		name: `Camera ${cameraId}: Optical Image Stabilisation`,
	})

	variables.push({
		variableId: `camera_${cameraId}_wb_temp`,
		name: `Camera ${cameraId}: White balance temperature`,
	})
	variables.push({
		variableId: `camera_${cameraId}_wb_tint`,
		name: `Camera ${cameraId}: White balance tint`,
	})
	variables.push({
		variableId: `camera_${cameraId}_exposure_us`,
		name: `Camera ${cameraId}: Exposure microseconds (us)`,
	})
	variables.push({
		variableId: `camera_${cameraId}_sharpening`,
		name: `Camera ${cameraId}: Sharpening level`,
	})
	variables.push({
		variableId: `camera_${cameraId}_shutter_speed`,
		name: `Camera ${cameraId}: Shutter speed (1/x)`,
	})
	variables.push({
		variableId: `camera_${cameraId}_gain`,
		name: `Camera ${cameraId}: Gain (dB)`,
	})
	variables.push({
		variableId: `camera_${cameraId}_nd_filter`,
		name: `Camera ${cameraId}: ND Filter`,
	})

	variables.push({
		variableId: `camera_${cameraId}_show_color_bars`,
		name: `Camera ${cameraId}: Show Color Bars`,
	})

	const defineRGBY = (key: string, name: string) => {
		variables.push({
			variableId: `camera_${cameraId}_color_${key}_red`,
			name: `Camera ${cameraId}: Color ${name} Adjust - Red`,
		})
		variables.push({
			variableId: `camera_${cameraId}_color_${key}_green`,
			name: `Camera ${cameraId}: Color ${name} Adjust - Green`,
		})
		variables.push({
			variableId: `camera_${cameraId}_color_${key}_blue`,
			name: `Camera ${cameraId}: Color ${name} Adjust - Blue`,
		})
		variables.push({
			variableId: `camera_${cameraId}_color_${key}_Luma`,
			name: `Camera ${cameraId}: Color ${name} Adjust - Luma`,
		})
	}
	defineRGBY('lift', 'Lift')
	defineRGBY('gamma', 'Gamma')
	defineRGBY('gain', 'Gain')
	defineRGBY('offset', 'Offset')

	variables.push({
		variableId: `camera_${cameraId}_contrast_pivot`,
		name: `Camera ${cameraId}: Contrast Pivot`,
	})
	variables.push({
		variableId: `camera_${cameraId}_contrast_adjust`,
		name: `Camera ${cameraId}: Contrast Adjust`,
	})
	variables.push({
		variableId: `camera_${cameraId}_lumamix`,
		name: `Camera ${cameraId}: Luma mix`,
	})
	variables.push({
		variableId: `camera_${cameraId}_hue_adjust`,
		name: `Camera ${cameraId}: Hue Adjust`,
	})
	variables.push({
		variableId: `camera_${cameraId}_saturation_adjust`,
		name: `Camera ${cameraId}: Saturation Adjust`,
	})
}
