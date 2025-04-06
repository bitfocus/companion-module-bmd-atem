import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import { AUDIO_FAIRLIGHT_INPUT_MINI_TS_JACKS, generateFairlightInputsOfType } from './util/fairlight.js'
import { VideoInputGenerator } from './util/videoInput.js'

export const ModelSpecSDI: ModelSpec = {
	id: Enums.Model.SDI,
	label: 'SDI',
	outputs: [
		...generateOutputs('Output', 2),
		{
			id: 2,
			name: 'Webcam (3)',
		},
	],
	MEs: 1,
	USKs: 1,
	DSKs: 1,
	MVs: 0,
	multiviewerFullGrid: false,
	DVEs: 1,
	SSrc: 0,
	macros: 100,
	displayClock: 0,
	media: {
		players: 1,
		stills: 20,
		clips: 0,
		captureStills: true,
	},
	streaming: false,
	recording: false,
	recordISO: false,
	inputs: VideoInputGenerator.begin({
		meCount: 1,
		baseSourceAvailability: Enums.SourceAvailability.Auxiliary,
	})
		.addInternalColorsAndBlack(true)
		.addExternalInputs(4)
		.addMediaPlayers(1, true)
		.addAuxiliaryOutputs(2)
		.addProgramPreview()
		.addDirectInputForAux(1)
		.generate(),
	fairlightAudio: {
		monitor: null,
		inputs: [
			...generateFairlightInputsOfType(1, 4, Enums.ExternalPortType.SDI),
			...AUDIO_FAIRLIGHT_INPUT_MINI_TS_JACKS,
		],
	},
}
