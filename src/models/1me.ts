import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import { VideoInputGenerator } from './util/videoInput.js'

export const ModelSpecOneME: ModelSpec = {
	id: Enums.Model.OneME,
	label: '1 ME Production',
	outputs: generateOutputs('Aux', 3),
	MEs: 1,
	USKs: 4,
	DSKs: 2,
	MVs: 1,
	multiviewerFullGrid: false,
	DVEs: 1,
	SSrc: 0,
	macros: 100,
	displayClock: 0,
	media: {
		players: 2,
		stills: 32,
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
		.addCleanFeeds(2)
		.addAuxiliaryOutputs(3)
		.addProgramPreview()
		.generate(),
	classicAudio: {
		inputs: [
			{
				id: 1,
				portType: Enums.ExternalPortType.HDMI,
			},
			{
				id: 2,
				portType: Enums.ExternalPortType.HDMI,
			},
			{
				id: 3,
				portType: Enums.ExternalPortType.HDMI,
			},
			{
				id: 4,
				portType: Enums.ExternalPortType.HDMI,
			},
			{
				id: 5,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 6,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 7,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 8,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 1001,
				portType: Enums.ExternalPortType.XLR,
			},
			{
				id: 2001,
				portType: Enums.ExternalPortType.Internal,
			},
			{
				id: 2002,
				portType: Enums.ExternalPortType.Internal,
			},
		],
	},
}
