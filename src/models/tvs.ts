import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'

export const ModelSpecTVS: ModelSpec = {
	id: Enums.Model.TVS,
	label: 'TV Studio',
	outputs: generateOutputs('Aux', 1),
	MEs: 1,
	USKs: 1,
	DSKs: 2,
	MVs: 1,
	multiviewerFullGrid: false,
	DVEs: 0,
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
	inputs: [
		{
			id: 0,
			portType: Enums.InternalPortType.Black,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 1,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 4,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 5,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 6,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 1000,
			portType: Enums.InternalPortType.ColorBars,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2001,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2002,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3010,
			portType: Enums.InternalPortType.MediaPlayerFill,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3011,
			portType: Enums.InternalPortType.MediaPlayerKey,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3020,
			portType: Enums.InternalPortType.MediaPlayerFill,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3021,
			portType: Enums.InternalPortType.MediaPlayerKey,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 7001,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 7002,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 10010,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 10011,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
	],
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
				id: 1101,
				portType: Enums.ExternalPortType.AESEBU,
			},
		],
	},
}
