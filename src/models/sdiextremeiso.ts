import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import { AUDIO_FAIRLIGHT_INPUT_MINI_TS_JACKS, generateFairlightInputsOfType } from './util/fairlight.js'
import { VideoInputGenerator } from './util/videoInput.js'

export const ModelSpecSDIExtremeISO: ModelSpec = {
	id: Enums.Model.SDIExtremeISO,
	label: 'SDI Extreme ISO',
	inputs: VideoInputGenerator.begin({
		meCount: 1,
		baseSourceAvailability:
			Enums.SourceAvailability.Auxiliary |
			Enums.SourceAvailability.Multiviewer |
			Enums.SourceAvailability.SuperSourceBox |
			Enums.SourceAvailability.SuperSourceArt |
			Enums.SourceAvailability.Auxiliary1 |
			Enums.SourceAvailability.Auxiliary2,
	})
		.addInternalColorsAndBlack()
		.addExternalInputs(8)
		.addMediaPlayers(2)
		.addSuperSource()
		.addCleanFeeds(1)
		.addAuxiliaryOutputs(4)
		.addProgramPreview()
		.addDirectInputForAux(2)
		.addMultiviewers(1)
		.addMultiviewerStatusSources()
		.generate(),
	outputs: [
		...generateOutputs('Output', 4),
		{
			id: 4,
			name: 'Webcam (5)',
		},
	],
	MEs: 1,
	USKs: 4,
	DSKs: 2,
	MVs: 1,
	multiviewerFullGrid: true,
	DVEs: 2,
	SSrc: 1,
	macros: 100,
	displayClock: 0,
	media: {
		players: 2,
		stills: 20,
		clips: 0,
		captureStills: true,
	},
	streaming: true,
	recording: true,
	recordISO: true,
	fairlightAudio: {
		monitor: 'split',
		inputs: [
			...generateFairlightInputsOfType(1, 8, Enums.ExternalPortType.SDI),
			...AUDIO_FAIRLIGHT_INPUT_MINI_TS_JACKS,
		],
	},
}
