export enum ActionId {
	Program = 'program',
	ProgramVariables = 'programVariables',
	Preview = 'preview',
	PreviewVariables = 'previewVariables',
	Cut = 'cut',
	Auto = 'auto',
	TBar = 'tBar',
	Aux = 'aux',
	AuxVariables = 'auxVariables',
	USKType = 'uskType',
	USKSource = 'uskSource',
	USKSourceVariables = 'uskSourceVariables',
	USKOnAir = 'usk',
	USKFly = 'uskFly',
	USKMaskLumaChromaPattern = 'uskMaskLumaChromaPattern',
	USKDVEProperties = 'uskDveProperties',
	USKFlyInfinite = 'uskFlyInfinite',
	DSKSource = 'dskSource',
	DSKSourceVariables = 'dskSourceVariables',
	DSKRate = 'dskRate',
	DSKMask = 'dskMask',
	DSKPreMultipliedKey = 'dskPreMultipliedKey',
	DSKOnAir = 'dsk',
	DSKTie = 'dskTie',
	DSKAuto = 'dskAuto',
	MacroRun = 'macrorun',
	MacroContinue = 'macrocontinue',
	MacroStop = 'macrostop',
	MacroLoop = 'macroloop',
	MultiviewerWindowSource = 'setMvSource',
	MultiviewerWindowSourceVariables = 'setMvSourceVariables',
	MultiviewerLayout = 'multiviewerLayout',
	SuperSourceArt = 'ssrcArt',
	SuperSourceBoxSource = 'setSsrcBoxSource',
	SuperSourceBoxSourceVaraibles = 'setSsrcBoxSourceVariables',
	SuperSourceBoxOnAir = 'setSsrcBoxEnable',
	SuperSourceBoxProperties = 'setSsrcBoxProperties',
	SuperSourceBoxPropertiesDelta = 'setSsrcBoxPropertiesDelta',
	PreviewTransition = 'previewTransition',
	TransitionStyle = 'transitionStyle',
	TransitionSelection = 'transitionSelection',
	TransitionSelectionComponent = 'transitionSelectionComponent',
	TransitionSelectComponents = 'transitionSelectComponents',
	TransitionRate = 'transitionRate',
	MediaPlayerSource = 'mediaPlayerSource',
	MediaPlayerSourceVariables = 'mediaPlayerSourceVariables',
	MediaPlayerCycle = 'mediaPlayerCycle',
	MediaCaptureStill = 'mediaCaptureStill',
	MediaDeleteStill = 'mediaDeleteStill',
	FadeToBlackAuto = 'fadeToBlackAuto',
	FadeToBlackRate = 'fadeToBlackRate',
	StreamStartStop = 'streamStartStop',
	StreamService = 'streamService',
	RecordStartStop = 'recordStartStop',
	RecordSwitchDisk = 'recordSwitchDisk',
	RecordFilename = 'recordFilename',
	RecordISO = 'recordISO',
	ClassicAudioGain = 'classicAudioGain',
	ClassicAudioGainDelta = 'classicAudioGainDelta',
	ClassicAudioMixOption = 'classicAudioMixOption',
	ClassicAudioResetPeaks = 'classicAudioResetPeaks',
	ClassicAudioMasterGain = 'classicAudioMasterGain',
	ClassicAudioMasterGainDelta = 'classicAudioMasterGainDelta',
	ClassicAudioMasterPan = 'classicAudioMasterPan',
	ClassicAudioMasterPanDelta = 'classicAudioMasterPanDelta',
	FairlightAudioFaderGain = 'fairlightAudioFaderGain',
	FairlightAudioFaderGainDelta = 'fairlightAudioFaderGainDelta',
	FairlightAudioInputGain = 'fairlightAudioInputGain',
	FairlightAudioInputGainDelta = 'fairlightAudioInputGainDelta',
	FairlightAudioInputDelay = 'fairlightAudioInputDelay',
	FairlightAudioInputDelayDelta = 'fairlightAudioInputDelayDelta',
	FairlightAudioMixOption = 'fairlightAudioMixOption',
	FairlightAudioResetPeaks = 'fairlightAudioResetPeaks',
	FairlightAudioResetSourcePeaks = 'fairlightAudioResetSourcePeaks',
	FairlightAudioMasterGain = 'fairlightAudioMasterGain',
	FairlightAudioMasterGainDelta = 'fairlightAudioMasterGainDelta',
	FairlightAudioMonitorSolo = 'fairlightAudioMonitorSolo',
	FairlightAudioMonitorOutputGain = 'fairlightAudioMonitorGain',
	FairlightAudioMonitorOutputGainDelta = 'fairlightAudioMonitorGainDelta',
	FairlightAudioMonitorMasterMuted = 'fairlightAudioMonitorMasterMuted',
	FairlightAudioMonitorMasterGain = 'fairlightAudioMonitorMasterGain',
	FairlightAudioMonitorMasterGainDelta = 'fairlightAudioMonitorMasterGainDelta',
	FairlightAudioMonitorTalkbackMuted = 'fairlightAudioMonitorTalkbackMuted',
	FairlightAudioMonitorTalkbackGain = 'fairlightAudioMonitorTalkbackGain',
	FairlightAudioMonitorTalkbackGainDelta = 'fairlightAudioMonitorTalkbackGainDelta',
	// FairlightAudioMonitorSidetoneMuted = 'fairlightAudioMonitorSidetoneMuted',
	FairlightAudioMonitorSidetoneGain = 'fairlightAudioMonitorSidetoneGain',
	FairlightAudioMonitorSidetoneGainDelta = 'fairlightAudioMonitorSidetoneGainDelta',
	SaveStartupState = 'saveStartupState',
	ClearStartupState = 'clearStartupState',
	InputName = 'inputName',
	DisplayClockState = 'displayClockState',
	DisplayClockConfigure = 'displayClockConfigure',
	DisplayClockStartTime = 'displayClockStartTime',
	Timecode = 'timecode',
	TimecodeMode = 'timecodeMode',

	CameraControlLensFocus = 'cameraControlLensFocus',
	CameraControlLensAutoFocus = 'cameraControlLensAutoFocus',
	CameraControlLensIris = 'cameraControlLensIris',
	CameraControlIncrementLensIris = 'cameraControlIncrementLensIris',
	CameraControlLensAutoIris = 'cameraControlLensAutoIris',
	CameraControlLensOpticalImageStabilisation = 'cameraControlLensOpticalImageStabilisation',
	CameraControlLensZoom = 'cameraControlLensZoom',

	CameraControlVideoManualWhiteBalance = 'cameraControlVideoManualWhiteBalance',
	CameraControlVideoIncrementManualWhiteBalance = 'cameraControlVideoIncrementManualWhiteBalance',
	CameraControlVideoAutoWhiteBalance = 'cameraControlVideoAutoWhiteBalance',
	CameraControlVideoExposure = 'cameraControlVideoExposure',
	CameraControlIncrementVideoExposure = 'cameraControlIncrementVideoExposure',
	CameraControlVideoSharpeningLevel = 'cameraControlVideoSharpeningLevel',
	CameraControlVideoGain = 'cameraControlVideoGain',
	CameraControlIncrementVideoGain = 'cameraControlIncrementVideoGain',
	CameraControlVideoNdFilterStop = 'cameraControlVideoNdFilterStop',

	CameraControlDisplayColorBars = 'cameraControlDisplayColorBars',

	CameraControlColorLiftAdjust = 'cameraControlColorLiftAdjust',
	CameraControlColorGammaAdjust = 'cameraControlColorGammaAdjust',
	CameraControlColorGainAdjust = 'cameraControlColorGainAdjust',
	CameraControlColorOffsetAdjust = 'cameraControlColorOffsetAdjust',
	CameraControlColorContrastAdjust = 'cameraControlColorContrastAdjust',
	CameraControlColorLumaMix = 'cameraControlColorLumaMix',
	CameraControlColorHueSaturationAdjust = 'cameraControlColorHueSaturationAdjust',
}
