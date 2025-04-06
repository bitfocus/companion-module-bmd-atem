import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import {
	AUDIO_FAIRLIGHT_INPUT_TS_JACK,
	AUDIO_FAIRLIGHT_INPUT_XLR,
	generateFairlightInputMediaPlayer,
	generateFairlightInputsOfType,
} from './util/fairlight.js'
import { VideoInputGenerator } from './util/videoInput.js'

export const ModelSpecTVSPro4K: ModelSpec = {
	id: Enums.Model.TVSPro4K,
	label: 'TV Studio Pro 4K',
	outputs: generateOutputs('Aux', 1),
	MEs: 1,
	USKs: 1,
	DSKs: 2,
	MVs: 1,
	multiviewerFullGrid: false,
	DVEs: 1,
	SSrc: 0,
	macros: 100,
	displayClock: 0,
	media: {
		players: 2,
		stills: 20,
		clips: 2,
		captureStills: false,
	},
	streaming: false,
	recording: false,
	recordISO: false,
	inputs: VideoInputGenerator.begin({
		meCount: 1,
		baseSourceAvailability: Enums.SourceAvailability.Auxiliary | Enums.SourceAvailability.Multiviewer,
	})
		.addInternalColorsAndBlack()
		.addExternalInputs(8)
		.addMediaPlayers(2)
		.addUpstreamKeyMasks(1)
		.addDownstreamKeyMasksAndClean(2)
		.addAuxiliaryOutputs(1)
		.addProgramPreview()
		.generate(),
	fairlightAudio: {
		monitor: 'combined',
		inputs: [
			...generateFairlightInputsOfType(1, 8, Enums.ExternalPortType.SDI),
			AUDIO_FAIRLIGHT_INPUT_XLR,
			AUDIO_FAIRLIGHT_INPUT_TS_JACK,
			...generateFairlightInputMediaPlayer(2),
		],
	},
}
