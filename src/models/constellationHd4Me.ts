import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import {
	AUDIO_ROUTING_SOURCE_MICROPHONE,
	AUDIO_ROUTING_SOURCE_NO_AUDIO,
	AUDIO_ROUTING_SOURCE_PROGRAM,
	AUDIO_ROUTING_SOURCE_TRS,
	generateAuxRoutingOutputs,
	generateInputRoutingSources,
	generateMadiRoutingOutputs,
	generateMadiRoutingSources,
	generateMediaPlayerRoutingSources,
	generateMixMinusRoutingSources,
	generateTalkbackRoutingSources,
} from './util/audioRouting.js'
import {
	AUDIO_FAIRLIGHT_INPUT_TRS_JACK,
	AUDIO_FAIRLIGHT_INPUT_TS_JACK,
	generateFairlightInputMadi,
	generateFairlightInputMediaPlayer,
	generateFairlightInputsOfType,
} from './util/fairlight.js'
import { VideoInputGenerator } from './util/videoInput.js'

export const ModelSpecConstellationHD4ME: ModelSpec = {
	id: Enums.Model.ConstellationHD4ME,
	label: '4 M/E Constellation HD',
	outputs: generateOutputs('Output', 24),
	MEs: 4,
	USKs: 4,
	DSKs: 4,
	MVs: 4,
	multiviewerFullGrid: true,
	DVEs: 4,
	SSrc: 2,
	macros: 100,
	displayClock: 1,
	media: { players: 4, stills: 60, clips: 4, captureStills: true },
	streaming: false,
	recording: false,
	recordISO: false,
	inputs: VideoInputGenerator.begin({
		meCount: 4,
		baseSourceAvailability:
			Enums.SourceAvailability.Auxiliary |
			Enums.SourceAvailability.Multiviewer |
			Enums.SourceAvailability.SuperSourceBox |
			Enums.SourceAvailability.SuperSourceArt,
	})
		.addInternalColorsAndBlack()
		.addExternalInputs(40)
		.addMediaPlayers(4)
		.addUpstreamKeyMasks(16)
		.addDownstreamKeyMasksAndClean(4)
		.addAuxiliaryOutputs(24)
		.addSuperSource(2)
		.addProgramPreview()
		.generate(),
	fairlightAudio: {
		monitor: 'split',
		inputs: [
			...generateFairlightInputsOfType(1, 40, Enums.ExternalPortType.SDI),
			AUDIO_FAIRLIGHT_INPUT_TS_JACK,
			AUDIO_FAIRLIGHT_INPUT_TRS_JACK,
			...generateFairlightInputMadi(32),
			...generateFairlightInputMediaPlayer(4),
		],
		audioRouting: {
			sources: [
				AUDIO_ROUTING_SOURCE_NO_AUDIO,
				...generateInputRoutingSources(40, false),
				AUDIO_ROUTING_SOURCE_MICROPHONE,
				AUDIO_ROUTING_SOURCE_TRS,
				...generateMadiRoutingSources(32),
				...generateMediaPlayerRoutingSources(4),
				...generateTalkbackRoutingSources(false, false),
				AUDIO_ROUTING_SOURCE_PROGRAM,
				...generateMixMinusRoutingSources(24),
			],
			outputs: [
				//
				...generateMadiRoutingOutputs(32),
				...generateAuxRoutingOutputs(24),
			],
		},
	},
}
