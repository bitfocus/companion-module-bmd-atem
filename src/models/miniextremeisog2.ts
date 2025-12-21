import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import {
	AUDIO_FAIRLIGHT_INPUT_XLR,
	AUDIO_FAIRLIGHT_INPUT_XLR2,
	generateFairlightInputMadi,
	generateFairlightInputMediaPlayer,
	generateFairlightInputsOfType,
	generateFairlightInputThunderbolt,
} from './util/fairlight.js'
import { SourceAvailabilityWebcamOut, VideoInputGenerator } from './util/videoInput.js'
import {
	AUDIO_ROUTING_SOURCE_MONITOR,
	AUDIO_ROUTING_SOURCE_NO_AUDIO,
	AUDIO_ROUTING_SOURCE_PROGRAM,
	AUDIO_ROUTING_SOURCE_XLR,
	generateAuxRoutingOutputs,
	generateInputRoutingSources,
	generateMadiRoutingSources,
	generateMediaPlayerRoutingSources,
	generateThunderboltRoutingSources,
} from './util/audioRouting.js'

export const ModelSpecMiniExtremeISOG2: ModelSpec = {
	id: 33 as any,
	label: 'Mini Extreme ISO G2',
	inputs: VideoInputGenerator.begin({
		meCount: 1,
		baseSourceAvailability:
			Enums.SourceAvailability.Auxiliary |
			Enums.SourceAvailability.Multiviewer |
			Enums.SourceAvailability.SuperSourceBox |
			Enums.SourceAvailability.SuperSourceArt |
			SourceAvailabilityWebcamOut,
	})
		.addInternalColorsAndBlack()
		.addExternalInputs(8)
		.addMediaPlayers(2)
		.addThunderbolt()
		.addSuperSource()
		.addCleanFeeds(2)
		.addAuxiliaryOutputs(3)
		.addInputs(
			// Webcam Aux
			8200,
			1,
			Enums.InternalPortType.Auxiliary,
			Enums.SourceAvailability.Multiviewer,
			Enums.MeAvailability.None,
		)
		.addInputs(
			// Thunderbolt Aux
			8300,
			1,
			Enums.InternalPortType.Auxiliary,
			Enums.SourceAvailability.Multiviewer,
			Enums.MeAvailability.None,
		)
		.addProgramPreview()
		.addMultiviewers(1)
		.addMultiviewerStatusSources(true)
		.generate(),
	outputs: [
		...generateOutputs('Aux/Output', 3),
		{
			id: 3,
			name: 'Webcam (4)',
		},
		{
			id: 4,
			name: 'Thunderbolt (5)',
		},
	],
	MEs: 1,
	USKs: 4,
	DSKs: 2,
	MVs: 1,
	multiviewerFullGrid: true,
	DVEs: 1,
	SSrc: 1,
	macros: 100,
	displayClock: 1,
	media: {
		players: 2,
		stills: 20,
		clips: 2,
		captureStills: true,
	},
	streaming: true,
	recording: true,
	recordISO: true,
	fairlightAudio: {
		monitor: 'split',
		inputs: [
			...generateFairlightInputsOfType(1, 8, Enums.ExternalPortType.HDMI, 0),
			{ ...AUDIO_FAIRLIGHT_INPUT_XLR, maxDelay: 8 },
			{ ...AUDIO_FAIRLIGHT_INPUT_XLR2, maxDelay: 8 },
			...generateFairlightInputMadi(16, 0),
			...generateFairlightInputMediaPlayer(2, 0),
			...generateFairlightInputThunderbolt(1, 0),
		],
		audioRouting: {
			sources: [
				AUDIO_ROUTING_SOURCE_NO_AUDIO,
				...generateInputRoutingSources(8, false),
				AUDIO_ROUTING_SOURCE_XLR,
				...generateMadiRoutingSources(32),
				...generateMediaPlayerRoutingSources(2),
				...generateThunderboltRoutingSources(1),
				AUDIO_ROUTING_SOURCE_MONITOR,
				AUDIO_ROUTING_SOURCE_PROGRAM,
			],
			outputs: [...generateAuxRoutingOutputs(5, true)],
		},
	},
}
