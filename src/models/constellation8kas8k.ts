import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import {
	AUDIO_ROUTING_SOURCE_NO_AUDIO,
	generateInputRoutingSources,
	AUDIO_ROUTING_SOURCE_MICROPHONE,
	AUDIO_ROUTING_SOURCE_TRS,
	generateMadiRoutingSources,
	generateMediaPlayerRoutingSources,
	generateTalkbackRoutingSources,
	AUDIO_ROUTING_SOURCE_PROGRAM,
	generateMixMinusRoutingSources,
	generateAuxRoutingOutputs,
	generateMadiRoutingOutputs,
} from './util/audioRouting.js'
import {
	AUDIO_FAIRLIGHT_INPUT_TRS_JACK,
	AUDIO_FAIRLIGHT_INPUT_TS_JACK,
	generateFairlightInputMadi,
	generateFairlightInputMediaPlayer,
	generateFairlightInputsOfType,
} from './util/fairlight.js'
import { VideoInputGenerator } from './util/videoInput.js'

export const ModelSpecConstellation8KAs8K: ModelSpec = {
	id: Enums.Model.Constellation8K,
	label: 'Constellation 8K (8K Mode)',
	outputs: generateOutputs('Output', 6),
	MEs: 1,
	USKs: 4,
	DSKs: 2,
	MVs: 1,
	multiviewerFullGrid: true,
	DVEs: 1,
	SSrc: 1,
	macros: 100,
	displayClock: 0,
	media: { players: 1, stills: 24, clips: 2, captureStills: false },
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
		.addMediaPlayers(1)
		.addUpstreamKeyMasks(4)
		.addDownstreamKeyMasksAndClean(2)
		.addAuxiliaryOutputs(6)
		.addSuperSource()
		.addProgramPreview()
		.generate(),
	fairlightAudio: {
		monitor: 'split',
		audioRouting: {
			sources: [
				AUDIO_ROUTING_SOURCE_NO_AUDIO,
				...generateInputRoutingSources(10, true),
				AUDIO_ROUTING_SOURCE_MICROPHONE,
				AUDIO_ROUTING_SOURCE_TRS,
				...generateMadiRoutingSources(32),
				...generateMediaPlayerRoutingSources(1),
				...generateTalkbackRoutingSources(true, false),
				AUDIO_ROUTING_SOURCE_PROGRAM,
				...generateMixMinusRoutingSources(6),
			],
			outputs: [
				//
				...generateMadiRoutingOutputs(8),
				...generateAuxRoutingOutputs(6),
			],
		},
		inputs: [
			...generateFairlightInputsOfType(1, 10, Enums.ExternalPortType.SDI),
			AUDIO_FAIRLIGHT_INPUT_TS_JACK,
			AUDIO_FAIRLIGHT_INPUT_TRS_JACK,
			...generateFairlightInputMadi(32),
			...generateFairlightInputMediaPlayer(4),
		],
	},
}
