import {
	FixupBooleanOrVariablesValueToExpressions,
	FixupNumericOrVariablesValueToExpressions,
	type ExpressionOrValue,
	type CompanionStaticUpgradeResult,
	type CompanionStaticUpgradeScript,
	type JsonValue,
} from '@companion-module/base'
import type { AtemConfig } from '../config.js'
import { Enums } from 'atem-connection'
import type { SSrcArtOption } from '../options/superSource.js'
import type { FairlightMixOption2 } from '../options/audio.js'
import { OffsetNumericExpressionOrValueByX } from './util.js'
import type { FlyKeyKeyFrameString, UpstreamKeyerTypeString } from '../options/upstreamKeyer.js'
import type { TransitionStyleString } from '../options/mixEffect.js'

type ActionFixupRule = {
	newType?: string
	options: Record<string, OptionFixupRule>
}
type FeedbackFixupRule = ActionFixupRule

type OptionFixupCustomFn = (val: ExpressionOrValue<JsonValue | undefined>) => ExpressionOrValue<JsonValue | undefined>

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
				defaultValue?: number
		  }
		| {
				type: 'boolean'
				variables: boolean
		  }
		| {
				type: 'custom'
				fn: OptionFixupCustomFn
		  }
}

const timecodeModeValueMap: Record<Enums.TimeMode, string> = {
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
const uskTypeValueMap: Record<Enums.MixEffectKeyType, UpstreamKeyerTypeString> = {
	[Enums.MixEffectKeyType.Luma]: 'luma',
	[Enums.MixEffectKeyType.Chroma]: 'chroma',
	[Enums.MixEffectKeyType.Pattern]: 'pattern',
	[Enums.MixEffectKeyType.DVE]: 'dve',
}
const transitionStyleValueMap: Record<Enums.TransitionStyle, TransitionStyleString> = {
	[Enums.TransitionStyle.MIX]: 'mix',
	[Enums.TransitionStyle.DIP]: 'dip',
	[Enums.TransitionStyle.WIPE]: 'wipe',
	[Enums.TransitionStyle.DVE]: 'dve',
	[Enums.TransitionStyle.STING]: 'sting',
}
const flyKeyKeyFrameValueMap: Record<Enums.FlyKeyKeyFrame, FlyKeyKeyFrameString> = {
	[Enums.FlyKeyKeyFrame.None]: '' as any,
	[Enums.FlyKeyKeyFrame.A]: 'a',
	[Enums.FlyKeyKeyFrame.B]: 'b',
	[Enums.FlyKeyKeyFrame.Full]: 'full',
	[Enums.FlyKeyKeyFrame.RunToInfinite]: 'infinite' as any,
}

const MEDIA_PLAYER_SOURCE_CLIP_OFFSET = 1000
const fixupMediaPoolNumericSource: OptionFixupCustomFn = (val) => {
	if (val.isExpression) return val // Should never hit, don't know how to handle
	const numVal = Number(val.value)
	if (isNaN(numVal)) return { isExpression: false, value: 'still1' } // default
	if (numVal >= 0 && numVal < MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
		return { isExpression: false, value: `still${numVal + 1}` }
	} else if (numVal >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
		return { isExpression: false, value: `clip${numVal - MEDIA_PLAYER_SOURCE_CLIP_OFFSET + 1}` }
	} else {
		return val
	}
}

const actionFixupRules: Record<string, ActionFixupRule> = {
	timecodeMode: {
		options: {
			mode: { transform: { type: 'lookup', lookup: timecodeModeValueMap } },
		},
	},
	ssrcArt: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
			fill: { transform: { type: 'number', zeroBased: false, variables: false } },
			key: { transform: { type: 'number', zeroBased: false, variables: false } },
			artOption: { transform: { type: 'lookup', lookup: ssrcArtOptionValueMap } },
		},
	},
	ssrcArtVariables: {
		newType: 'ssrcArt',
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: false, variables: true, defaultValue: 1 } },
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
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setSsrcBoxSourceVariables: {
		newType: 'setSsrcBoxSource',
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: false, variables: true, defaultValue: 1 } },
			boxIndex: { transform: { type: 'number', zeroBased: false, variables: true } },
			source: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	setSsrcBoxEnable: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setSsrcBoxProperties: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setSsrcBoxPropertiesDelta: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
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
			multiViewerId: { transform: { type: 'number', zeroBased: false, variables: true } },
			windowIndex: { transform: { type: 'number', zeroBased: false, variables: true } },
			source: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	multiviewerLayout: {
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},

	mediaPlayerSource: {
		options: {
			mediaplayer: { transform: { type: 'number', zeroBased: true, variables: false } },
			source: { transform: { type: 'custom', fn: fixupMediaPoolNumericSource } },
			defaultClip: { transform: { type: 'default', value: false } },
		},
	},
	mediaPlayerSourceVariables: {
		newType: 'mediaPlayerSource',
		options: {
			mediaplayer: { transform: { type: 'number', zeroBased: false, variables: true } },
			isClip: { newName: 'defaultClip', transform: { type: 'default', value: false } },
			slot: { newName: 'source', transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	mediaPlayerCycle: {
		options: {
			mediaplayer: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	mediaDeleteStill: {
		options: {
			slot: {
				newName: 'source',
				transform: {
					type: 'custom',
					fn: (v) => fixupMediaPoolNumericSource(v.isExpression ? v : { ...v, value: Number(v.value) - 1 }),
				},
			},
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
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
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
		newType: 'dskOnAir',
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
			aux: { transform: { type: 'number', zeroBased: false, variables: true } },
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
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
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
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
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
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
			input: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	previewTransition: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	transitionStyle: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			style: { transform: { type: 'lookup', lookup: transitionStyleValueMap } },
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
			style: { transform: { type: 'lookup', lookup: transitionStyleValueMap } },
		},
	},
	uskType: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
			type: { transform: { type: 'lookup', lookup: uskTypeValueMap } },
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
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
			fill: { transform: { type: 'number', zeroBased: false, variables: true } },
			cut: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	usk: {
		newType: 'uskOnAir',
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
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
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
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
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
			keyframe: { transform: { type: 'lookup', lookup: flyKeyKeyFrameValueMap } },
			//
		},
	},
	uskStoreKeyframe: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
			keyframe: { transform: { type: 'lookup', lookup: flyKeyKeyFrameValueMap } },
		},
	},
	uskFly: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
			keyframe: { transform: { type: 'lookup', lookup: flyKeyKeyFrameValueMap } },
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
	cameraControlDisplayFocusAssist: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlDisplayFalseColor: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlDisplayZebra: {
		options: {
			cameraId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	cameraControlOutputStatusOverlay: {
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

const feedbackFixupRules: Record<string, FeedbackFixupRule> = {
	fairlightAudioMixOption: {
		options: {
			option: { transform: { type: 'lookup', lookup: fairlightMixOptionValueMap } },
		},
	},
	timecodeMode: {
		options: {
			mode: { transform: { type: 'lookup', lookup: timecodeModeValueMap } },
		},
	},
	fadeToBlackIsBlack: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	fadeToBlackRate: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	preview_bg: {
		newType: 'preview',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	previewVariables: {
		newType: 'preview',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
			input: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	program_bg: {
		newType: 'program',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	programVariables: {
		newType: 'program',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
			input: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	previewTransition: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	transitionStyle: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			style: { transform: { type: 'lookup', lookup: transitionStyleValueMap } },
		},
	},
	transitionSelection: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	transitionRate: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			style: { transform: { type: 'lookup', lookup: transitionStyleValueMap } },
		},
	},
	inTransition: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	usk_bg: {
		newType: 'uskOnAir',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	usk_type: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	usk_source: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	usk_source_variables: {
		newType: 'usk_source',
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: false, variables: true } },
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
			fill: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	usk_keyframe: {
		options: {
			mixeffect: { transform: { type: 'number', zeroBased: true, variables: false } },
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	aux_bg: {
		newType: 'aux',
		options: {
			aux: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	auxVariables: {
		newType: 'aux',
		options: {
			aux: { transform: { type: 'number', zeroBased: false, variables: true } },
			input: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	dsk_bg: {
		newType: 'dskOnAir',
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	dskTie: {
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	dsk_source: {
		options: {
			key: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	dsk_source_variables: {
		newType: 'dsk_source',
		options: {
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
			input: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	mv_source: {
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: true, variables: false } },
			windowIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	mv_source_variables: {
		newType: 'mv_source',
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: false, variables: true } },
			windowIndex: { transform: { type: 'number', zeroBased: false, variables: true } },
			source: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	multiviewerLayout: {
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	ssrc_art_properties: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
			artOption: { transform: { type: 'lookup', lookup: ssrcArtOptionValueMap } },
		},
	},
	ssrcArtPropertiesVariables: {
		newType: 'ssrc_art_properties',
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: false, variables: false, defaultValue: 1 } },
			fill: { transform: { type: 'number', zeroBased: false, variables: true } },
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
			artOption: { transform: { type: 'default', value: 'foreground' } },
			artPreMultiplied: { transform: { type: 'default', value: true } },
			artClip: { transform: { type: 'default', value: 50 } },
			artGain: { transform: { type: 'default', value: 50 } },
			artInvertKey: { transform: { type: 'default', value: false } },
		},
	},
	ssrc_art_source: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
		},
	},
	ssrc_art_option: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
		},
	},
	ssrc_box_enable: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	ssrc_box_source: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	ssrc_box_source_variables: {
		newType: 'ssrc_box_source',
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: false, variables: true, defaultValue: 1 } },
			boxIndex: { transform: { type: 'number', zeroBased: false, variables: true } },
			source: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	ssrc_box_properties: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false, defaultValue: 1 } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},

	mediaPoolPreview: {
		options: {
			source: { transform: { type: 'custom', fn: fixupMediaPoolNumericSource } },
			defaultClip: { transform: { type: 'default', value: false } },
		},
	},
	mediaPoolPreviewVariables: {
		newType: 'mediaPoolPreview',
		options: {
			source: { transform: { type: 'number', zeroBased: false, variables: true } },
			isClip: { newName: 'defaultClip', transform: { type: 'default', value: false } },
			showStatus: { transform: { type: 'default', value: true } },
		},
	},
	mediaPlayerSource: {
		options: {
			mediaplayer: { transform: { type: 'number', zeroBased: true, variables: false } },
			source: { transform: { type: 'custom', fn: fixupMediaPoolNumericSource } },
			defaultClip: { transform: { type: 'default', value: false } },
		},
	},
	mediaPlayerSourceVariables2: {
		newType: 'mediaPlayerSource',
		options: {
			mediaplayer: { transform: { type: 'number', zeroBased: false, variables: true } },
			isClip: { newName: 'defaultClip', transform: { type: 'default', value: false } },
			slot: { newName: 'source', transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
}

function applyTransform(
	optionTransform: OptionFixupRule['transform'],
	valueObj: ExpressionOrValue<JsonValue | undefined>,
): ExpressionOrValue<JsonValue | undefined> | undefined {
	if (!optionTransform) return valueObj

	const oldValue = valueObj?.value as any
	if (optionTransform.type === 'lookup' && oldValue in optionTransform.lookup) {
		// Basic object lookup to transform
		const newValue = optionTransform.lookup[oldValue]
		return { isExpression: false, value: newValue }
	} else if (optionTransform.type === 'number') {
		// If defaultValue is specified and value is missing/undefined, use that
		if (optionTransform.defaultValue !== undefined && (valueObj === undefined || valueObj.value === undefined)) {
			return { isExpression: false, value: optionTransform.defaultValue }
		}

		// Convert number from 0-based (e.g. for indexes), optionally considering if there are variables
		const newValue = FixupNumericOrVariablesValueToExpressions(valueObj)
		if (optionTransform.zeroBased) {
			// Attempt to offset by 1
			return OffsetNumericExpressionOrValueByX(newValue, 1)
		}
		return newValue
	} else if (optionTransform.type === 'default') {
		// Fill in value if missing
		if (!valueObj) {
			return { isExpression: false, value: optionTransform.value }
		}
		return valueObj
	} else if (optionTransform.type === 'boolean') {
		// Convert boolean, optionally considering if there are variables
		return FixupBooleanOrVariablesValueToExpressions(valueObj)
	} else if (optionTransform.type === 'custom') {
		// Custom function to transform value
		return optionTransform.fn(valueObj)
	}

	return valueObj
}

function applyOptionsFixupRules(
	optionRules: Record<string, OptionFixupRule>,
	entityOptions: Record<string, any>,
): void {
	for (const [optionKey, optionRule] of Object.entries(optionRules)) {
		if (optionRule.transform) {
			entityOptions[optionKey] = applyTransform(optionRule.transform, entityOptions[optionKey])
		}

		if (optionRule.newName) {
			entityOptions[optionRule.newName] = entityOptions[optionKey]
			delete entityOptions[optionKey]
		}
	}
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

		applyOptionsFixupRules(rule.options, action.options)

		console.log('fixed up action', action, rule)
	}

	for (const feedback of props.feedbacks) {
		const rule = feedbackFixupRules[feedback.feedbackId]
		if (!rule) continue

		result.updatedFeedbacks.push(feedback)
		if (rule.newType) feedback.feedbackId = rule.newType

		applyOptionsFixupRules(rule.options, feedback.options)

		console.log('fixed up feedback', feedback, rule)
	}

	return result
}

/**
 * Migrate any feedbacks that still have legacy numeric option values.
 *
 * The initial API 2.0 upgrade script was missing entries for `fairlightAudioMixOption` and
 * `transitionStyle` feedbacks, so those were never converted from numeric enum IDs to string
 * IDs. This script fixes any remaining instances.
 */
export const FixLegacyNumericFeedbackOptions: CompanionStaticUpgradeScript<AtemConfig, undefined> = (
	_context,
	props,
) => {
	const result: CompanionStaticUpgradeResult<AtemConfig, undefined> = {
		updatedConfig: null,
		updatedSecrets: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	const fairlightMixOptionMap: Record<number, string> = {
		[Enums.FairlightAudioMixOption.On]: 'on',
		[Enums.FairlightAudioMixOption.Off]: 'off',
		[Enums.FairlightAudioMixOption.AudioFollowVideo]: 'afv',
	}

	const transitionStyleMap: Record<number, string> = {
		[Enums.TransitionStyle.MIX]: 'mix',
		[Enums.TransitionStyle.DIP]: 'dip',
		[Enums.TransitionStyle.WIPE]: 'wipe',
		[Enums.TransitionStyle.DVE]: 'dve',
		[Enums.TransitionStyle.STING]: 'sting',
	}

	function migrateNumericOption(
		optionVal: ExpressionOrValue<JsonValue | undefined> | undefined,
		lookup: Record<number, string>,
	): ExpressionOrValue<JsonValue | undefined> | undefined {
		if (!optionVal || optionVal.isExpression) return undefined
		const raw = optionVal.value
		if (typeof raw === 'number' && raw in lookup) {
			return { isExpression: false, value: lookup[raw] }
		}
		return undefined
	}

	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === 'fairlightAudioMixOption') {
			const migrated = migrateNumericOption(feedback.options['option'], fairlightMixOptionMap)
			if (migrated) {
				feedback.options['option'] = migrated
				result.updatedFeedbacks.push(feedback)
			}
		} else if (feedback.feedbackId === 'transitionStyle') {
			const migrated = migrateNumericOption(feedback.options['style'], transitionStyleMap)
			if (migrated) {
				feedback.options['style'] = migrated
				result.updatedFeedbacks.push(feedback)
			}
		}
	}

	return result
}
