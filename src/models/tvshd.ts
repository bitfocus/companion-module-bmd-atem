import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import { VideoInputGenerator } from './util/videoInput.js'

export const ModelSpecTVSHD: ModelSpec = {
	id: Enums.Model.TVSHD,
	label: 'TV Studio HD',
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
		clips: 0,
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
				id: 1301,
				portType: Enums.ExternalPortType.TSJack,
			},
		],
	},
}
