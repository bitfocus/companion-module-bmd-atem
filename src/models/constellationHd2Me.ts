import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import {
	AUDIO_ROUTING_SOURCE_NO_AUDIO,
	generateInputRoutingSources,
	AUDIO_ROUTING_SOURCE_MICROPHONE,
	AUDIO_ROUTING_SOURCE_TRS,
	generateMediaPlayerRoutingSources,
	generateTalkbackRoutingSources,
	AUDIO_ROUTING_SOURCE_PROGRAM,
	generateMixMinusRoutingSources,
	generateAuxRoutingOutputs,
} from './util/audioRouting.js'
import {
	AUDIO_FAIRLIGHT_INPUT_TRS_JACK,
	AUDIO_FAIRLIGHT_INPUT_TS_JACK,
	generateFairlightInputMediaPlayer,
	generateFairlightInputsOfType,
} from './util/fairlight.js'
import { VideoInputGenerator } from './util/videoInput.js'

export const ModelSpecConstellationHD2ME: ModelSpec = {
	id: Enums.Model.ConstellationHD2ME,
	label: '2 M/E Constellation HD',
	outputs: generateOutputs('Output', 12),
	MEs: 2,
	USKs: 4,
	DSKs: 2,
	MVs: 2,
	multiviewerFullGrid: true,
	DVEs: 1,
	SSrc: 1,
	macros: 100,
	displayClock: 1,
	media: {
		players: 2,
		stills: 40,
		clips: 2,
		captureStills: true,
	},
	streaming: false,
	recording: false,
	recordISO: false,
	inputs: VideoInputGenerator.begin({
		meCount: 2,
		baseSourceAvailability:
			Enums.SourceAvailability.Auxiliary |
			Enums.SourceAvailability.Multiviewer |
			Enums.SourceAvailability.SuperSourceBox |
			Enums.SourceAvailability.SuperSourceArt,
	})
		.addInternalColorsAndBlack()
		.addExternalInputs(20)
		.addMediaPlayers(2)
		.addUpstreamKeyMasks(8)
		.addDownstreamKeyMasksAndClean(2)
		.addAuxiliaryOutputs(12)
		.addSuperSource()
		.addProgramPreview()
		.generate(),
	fairlightAudio: {
		monitor: 'split',
		inputs: [
			...generateFairlightInputsOfType(1, 20, Enums.ExternalPortType.SDI),
			AUDIO_FAIRLIGHT_INPUT_TS_JACK,
			AUDIO_FAIRLIGHT_INPUT_TRS_JACK,
			...generateFairlightInputMediaPlayer(2),
		],
		audioRouting: {
			sources: [
				AUDIO_ROUTING_SOURCE_NO_AUDIO,
				...generateInputRoutingSources(20, false),
				AUDIO_ROUTING_SOURCE_MICROPHONE,
				AUDIO_ROUTING_SOURCE_TRS,
				...generateMediaPlayerRoutingSources(2),
				...generateTalkbackRoutingSources(false, false),
				AUDIO_ROUTING_SOURCE_PROGRAM,
				...generateMixMinusRoutingSources(12),
			],
			outputs: [
				//
				...generateAuxRoutingOutputs(12),
			],
		},
	},
}
