import {
	FixupBooleanOrVariablesValueToExpressions,
	FixupNumericOrVariablesValueToExpressions,
	type CompanionStaticUpgradeResult,
	type CompanionStaticUpgradeScript,
} from '@companion-module/base'
import type { AtemConfig } from '../config.js'
import { Enums } from 'atem-connection'
import type { SSrcArtOption } from '../input.js'
import type { FairlightMixOption2 } from '../choices.js'

type ActionFixupRule = {
	newType?: string
	options: Record<string, OptionFixupRule>
}

type OptionFixupRule = {
	newName?: string
	transform?:
		| {
				type: 'default'
				value: any
		  }
		| {
				type: 'lookup'
				lookup: Record<any, any>
		  }
		| {
				type: 'number'
				zeroBased: boolean
				variables: boolean
		  }
		| {
				type: 'boolean'
				variables: boolean
		  }
}

const timeOfDayModeValueMap: Record<Enums.TimeMode, string> = {
	[Enums.TimeMode.FreeRun]: 'freerun',
	[Enums.TimeMode.TimeOfDay]: 'timeofday',
}
const ssrcArtOptionValueMap: Record<any, SSrcArtOption> = {
	[undefined as any]: 'unchanged',
	[Enums.SuperSourceArtOption.Foreground]: 'foreground',
	[Enums.SuperSourceArtOption.Background]: 'background',
}
const fairlightMixOptionValueMap: Record<any, FairlightMixOption2> = {
	[Enums.FairlightAudioMixOption.On]: 'on',
	[Enums.FairlightAudioMixOption.Off]: 'off',
	[Enums.FairlightAudioMixOption.AudioFollowVideo]: 'afv',
}

const actionFixupRules: Record<string, ActionFixupRule> = {
	timecodeMode: {
		options: {
			mode: { transform: { type: 'lookup', lookup: timeOfDayModeValueMap } },
		},
	},
	ssrcArt: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			fill: { transform: { type: 'number', zeroBased: false, variables: false } },
			key: { transform: { type: 'number', zeroBased: false, variables: false } },
			artOption: { transform: { type: 'lookup', lookup: ssrcArtOptionValueMap } },
		},
	},
	ssrcArtVariables: {
		newType: 'ssrcArt',
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: true } },
			fill: { transform: { type: 'number', zeroBased: false, variables: true } },
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
			// Fill in the missing ones:
			artOption: { transform: { type: 'default', value: 'unchanged' } },
			artPreMultiplied: { transform: { type: 'default', value: false } },
			artClip: { transform: { type: 'default', value: 50 } },
			artGain: { transform: { type: 'default', value: 50 } },
			artInvertKey: { transform: { type: 'default', value: false } },
		},
	},
	setSsrcBoxSource: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setSsrcBoxSourceVariables: {
		newType: 'setSsrcBoxSource',
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: true } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: true } },
			source: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	setSsrcBoxEnable: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setSsrcBoxProperties: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setSsrcBoxPropertiesDelta: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setMvSource: {
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: true, variables: false } },
			windowIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
			source: { transform: { type: 'number', zeroBased: false, variables: false } },
		},
	},
	setMvSourceVariables: {
		newType: 'setMvSource',
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: true, variables: true } },
			windowIndex: { transform: { type: 'number', zeroBased: true, variables: true } },
			source: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	multiviewerLayout: {
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: true, variables: true } },
		},
	},
	mediaPlayerSource: {
		options: {
			mediaplayer: { transform: { type: 'number', zeroBased: true, variables: false } },
			// TODO: translate source!!
		},
	},
	mediaPlayerSourceVariables2: {
		options: {
			// TODO - me!
		},
	},
	mediaDeleteStill: {
		options: {
			slot: { transform: { type: 'number', zeroBased: true, variables: true } },
		},
	},
	fairlightAudioMixOption: {
		options: {
			option: { transform: { type: 'lookup', lookup: fairlightMixOptionValueMap } },
		},
	},
	dskSource: {
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
			fill: { transform: { type: 'number', zeroBased: false, variables: false } },
			cut: { transform: { type: 'number', zeroBased: false, variables: false } },
		},
	},
	dskSourceVariables: {
		newType: 'dskSource',
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: true } },
			fill: { transform: { type: 'number', zeroBased: false, variables: true } },
			cut: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	dskRate: {
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	dskMask: {
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	dskPreMultipliedKey: {
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	dsk: {
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	dskTie: {
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	dskAuto: {
		options: {
			downstreamKeyerId: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	aux: {
		options: {
			aux: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	auxVariables: {
		newType: 'aux',
		options: {
			aux: { transform: { type: 'number', zeroBased: true, variables: true } },
			input: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	uskPatternProperties: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	uskPatternPropertiesVariables: {
		newType: 'uskPatternProperties',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: true } },
			key: { transform: { type: 'number', zeroBased: true, variables: true } },
			style: { transform: { type: 'number', zeroBased: false, variables: true } },
			size: { transform: { type: 'number', zeroBased: false, variables: true } },
			symmetry: { transform: { type: 'number', zeroBased: false, variables: true } },
			softness: { transform: { type: 'number', zeroBased: false, variables: true } },
			positionX: { transform: { type: 'number', zeroBased: false, variables: true } },
			positionY: { transform: { type: 'number', zeroBased: false, variables: true } },
			invert: { transform: { type: 'lookup', lookup: { true: true, false: false } } },
		},
	},
	fadeToBlackAuto: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	fadeToBlackRate: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	tBar: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			position: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	auto: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	cut: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	preview: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	previewVariables: {
		newType: 'preview',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: true } },
			input: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	program: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	programVariables: {
		newType: 'program',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: true } },
			input: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	previewTransition: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: true } },
		},
	},
	transitionStyle: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	transitionSelection: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	transitionSelectionComponent: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	transitionSelectComponents: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	transitionRate: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	uskType: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	uskSource: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	uskSourceVariables: {
		newType: 'uskSource',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: true } },
			key: { transform: { type: 'number', zeroBased: true, variables: true } },
			fill: { transform: { type: 'number', zeroBased: false, variables: true } },
			cut: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	usk: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	uskMaskLumaChromaPattern: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	uskFlyKeyLumaChromaPattern: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	uskFlyKeyLumaChromaPatternVariables: {
		newType: 'uskFlyKeyLumaChromaPattern',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: true } },
			key: { transform: { type: 'number', zeroBased: true, variables: true } },
			flyEnabled: { transform: { type: 'boolean', variables: true } },
			positionX: { transform: { type: 'number', zeroBased: false, variables: true } },
			positionY: { transform: { type: 'number', zeroBased: false, variables: true } },
			sizeX: { transform: { type: 'number', zeroBased: false, variables: true } },
			sizeY: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	uskDveProperties: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	uskDvePropertiesVariables: {
		newType: 'uskDveProperties',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: true } },
			key: { transform: { type: 'number', zeroBased: true, variables: true } },
			positionX: { transform: { type: 'number', zeroBased: false, variables: true } },
			positionY: { transform: { type: 'number', zeroBased: false, variables: true } },
			sizeX: { transform: { type: 'number', zeroBased: false, variables: true } },
			sizeY: { transform: { type: 'number', zeroBased: false, variables: true } },
			rotation: { transform: { type: 'number', zeroBased: false, variables: true } },
			maskEnabled: { transform: { type: 'boolean', variables: true } },
			maskTop: { transform: { type: 'number', zeroBased: false, variables: true } },
			maskBottom: { transform: { type: 'number', zeroBased: false, variables: true } },
			maskLeft: { transform: { type: 'number', zeroBased: false, variables: true } },
			maskRight: { transform: { type: 'number', zeroBased: false, variables: true } },
			shadowEnabled: { transform: { type: 'boolean', variables: true } },
			lightSourceDirection: { transform: { type: 'number', zeroBased: false, variables: true } },
			lightSourceAltitude: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderEnabled: { transform: { type: 'boolean', variables: true } },
			borderHue: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderSaturation: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderLuma: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderBevel: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderOuterWidth: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderInnerWidth: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderOuterSoftness: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderInnerSoftness: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderOpacity: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderBevelPosition: { transform: { type: 'number', zeroBased: false, variables: true } },
			borderBevelSoftness: { transform: { type: 'number', zeroBased: false, variables: true } },
			rate: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	uskSetKeyframe: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
			//
		},
	},
	uskStoreKeyframe: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
			//
		},
	},
	uskFly: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
			//
		},
	},
	uskFlyInfinite: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
			//
		},
	},

	cameraControlLensFocus: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			delta: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlLensAutoFocus: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlLensIris: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			fStop: { transform: { type: 'number', zeroBased: false, variables: true } },
			normalised: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlIncrementLensIris: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			fStopIncrement: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlLensAutoIris: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlLensOpticalImageStabilisation: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlLensZoom: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			zoom: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},

	cameraControlVideoManualWhiteBalance: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			colorTemperature: { transform: { type: 'number', zeroBased: false, variables: true } },
			tint: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlVideoIncrementManualWhiteBalance: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			colorTemperatureIncrement: { transform: { type: 'number', zeroBased: false, variables: true } },
			tintIncrement: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlVideoAutoWhiteBalance: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlVideoExposure: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			framerate: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlIncrementVideoExposure: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlVideoSharpeningLevel: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlVideoGain: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			gain: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlIncrementVideoGain: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			increment: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlVideoNdFilterStop: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			stop: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},

	cameraControlDisplayColorBars: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},

	cameraControlMediaRecordSingle: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},

	cameraControlColorLiftAdjust: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			red: { transform: { type: 'number', zeroBased: false, variables: true } },
			green: { transform: { type: 'number', zeroBased: false, variables: true } },
			blue: { transform: { type: 'number', zeroBased: false, variables: true } },
			luma: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlColorGammaAdjust: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			red: { transform: { type: 'number', zeroBased: false, variables: true } },
			green: { transform: { type: 'number', zeroBased: false, variables: true } },
			blue: { transform: { type: 'number', zeroBased: false, variables: true } },
			luma: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlColorGainAdjust: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			red: { transform: { type: 'number', zeroBased: false, variables: true } },
			green: { transform: { type: 'number', zeroBased: false, variables: true } },
			blue: { transform: { type: 'number', zeroBased: false, variables: true } },
			luma: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlColorOffsetAdjust: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			red: { transform: { type: 'number', zeroBased: false, variables: true } },
			green: { transform: { type: 'number', zeroBased: false, variables: true } },
			blue: { transform: { type: 'number', zeroBased: false, variables: true } },
			luma: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlColorContrastAdjust: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			contrast: { transform: { type: 'number', zeroBased: false, variables: true } },
			pivot: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlColorLumaMix: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			lumaMix: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlColorHueSaturationAdjust: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
			hue: { transform: { type: 'number', zeroBased: false, variables: true } },
			saturation: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
}

export const UpgradeToExpressions: CompanionStaticUpgradeScript<AtemConfig, undefined> = (_context, props) => {
	const result: CompanionStaticUpgradeResult<AtemConfig, undefined> = {
		updatedConfig: null,
		updatedSecrets: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		const rule = actionFixupRules[action.actionId]
		if (!rule) continue

		result.updatedActions.push(action)
		if (rule.newType) action.actionId = rule.newType

		for (const [optionKey, optionRule] of Object.entries(rule.options)) {
			if (!action.options[optionKey]) continue

			if (optionRule.transform) {
				const oldValue = action.options[optionKey]?.value as any
				if (optionRule.transform.type === 'lookup' && oldValue in optionRule.transform.lookup) {
					// Basic object lookup to transform
					const newValue = optionRule.transform.lookup[oldValue]
					action.options[optionKey] = { isExpression: false, value: newValue }
				} else if (optionRule.transform.type === 'number') {
					// Convert number from 0-based (e.g. for indexes), optionally considering if there are variables
					action.options[optionKey] = FixupNumericOrVariablesValueToExpressions(oldValue)
					if (action.options[optionKey] && optionRule.transform.zeroBased) {
						// Attempt to offset by 1
						if (typeof action.options[optionKey].value === 'number') {
							action.options[optionKey].value += 1
						} else if (typeof action.options[optionKey].value === 'string') {
							action.options[optionKey].value += ' + 1'
						}
					}
				} else if (optionRule.transform.type === 'default') {
					// Fill in value if missing
					if (!action.options[optionKey]) {
						action.options[optionKey] = { isExpression: false, value: optionRule.transform.value }
					}
				} else if (optionRule.transform.type === 'boolean') {
					// Convert boolean, optionally considering if there are variables
					action.options[optionKey] = FixupBooleanOrVariablesValueToExpressions(oldValue)
				}
			}

			if (optionRule.newName) {
				action.options[optionRule.newName] = action.options[optionKey]
				delete action.options[optionKey]
			}
		}

		// TODO
	}

	return result
}
