import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import { VideoInputGenerator } from './util/videoInput.js'

export const ModelSpecTwoME4K: ModelSpec = {
	id: Enums.Model.TwoME4K,
	label: '2 ME Production 4K',
	outputs: generateOutputs('Aux', 6),
	MEs: 2,
	USKs: 2,
	DSKs: 2,
	MVs: 2,
	multiviewerFullGrid: false,
	DVEs: 1,
	SSrc: 1,
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
		.addUpstreamKeyMasks(4)
		.addDownstreamKeyMasksAndClean(2)
		.addAuxiliaryOutputs(6)
		.addSuperSource()
		.addProgramPreview()
		.generate(),
	classicAudio: {
		inputs: [
			{
				id: 1,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 2,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 3,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 4,
				portType: Enums.ExternalPortType.SDI,
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
				id: 9,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 10,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 11,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 12,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 13,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 14,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 15,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 16,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 17,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 18,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 19,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 20,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 1001,
				portType: Enums.ExternalPortType.XLR,
			},
			{
				id: 1201,
				portType: Enums.ExternalPortType.RCA,
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
