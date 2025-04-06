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

export const ModelSpecConstellationHD1ME: ModelSpec = {
	id: Enums.Model.ConstellationHD1ME,
	label: '1 M/E Constellation HD',
	outputs: generateOutputs('Output', 6),
	MEs: 1,
	USKs: 4,
	DSKs: 1,
	MVs: 1,
	multiviewerFullGrid: true,
	DVEs: 1,
	SSrc: 0,
	macros: 100,
	displayClock: 1,
	media: {
		players: 2,
		stills: 20,
		clips: 2,
		captureStills: true,
	},
	streaming: false,
	recording: false,
	recordISO: false,
	inputs: VideoInputGenerator.begin({
		meCount: 1,
		baseSourceAvailability:
			Enums.SourceAvailability.Auxiliary |
			Enums.SourceAvailability.Multiviewer |
			Enums.SourceAvailability.SuperSourceBox |
			Enums.SourceAvailability.SuperSourceArt,
	})
		.addInternalColorsAndBlack()
		.addExternalInputs(10)
		.addMediaPlayers(2)
		.addUpstreamKeyMasks(4)
		.addDownstreamKeyMasks(2)
		.addCleanFeeds(1) // TODO - is this correct?
		.addAuxiliaryOutputs(6)
		.addProgramPreview()
		.generate(),
	fairlightAudio: {
		monitor: 'split',
		inputs: [
			...generateFairlightInputsOfType(1, 10, Enums.ExternalPortType.SDI),
			AUDIO_FAIRLIGHT_INPUT_TS_JACK,
			AUDIO_FAIRLIGHT_INPUT_TRS_JACK,
			...generateFairlightInputMediaPlayer(2),
		],
		audioRouting: {
			sources: [
				AUDIO_ROUTING_SOURCE_NO_AUDIO,
				...generateInputRoutingSources(10, false),
				AUDIO_ROUTING_SOURCE_MICROPHONE,
				AUDIO_ROUTING_SOURCE_TRS,
				...generateMediaPlayerRoutingSources(2),
				...generateTalkbackRoutingSources(false, false),
				AUDIO_ROUTING_SOURCE_PROGRAM,
				...generateMixMinusRoutingSources(6),
			],
			outputs: [
				//
				...generateAuxRoutingOutputs(6),
			],
		},
	},
}
