import type { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'

const sourceAvailabilityAll =
	Enums.SourceAvailability.Auxiliary |
	Enums.SourceAvailability.Multiviewer |
	Enums.SourceAvailability.SuperSourceArt |
	Enums.SourceAvailability.SuperSourceBox |
	Enums.SourceAvailability.KeySource |
	Enums.SourceAvailability.Auxiliary1 |
	Enums.SourceAvailability.Auxiliary2

export const ModelSpecSDIExtremeISO: ModelSpec = {
	id: Enums.Model.SDIExtremeISO,
	label: 'SDI Extreme ISO',
	inputs: [
		{
			id: 0,
			portType: Enums.InternalPortType.Black,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 1,
			portType: Enums.InternalPortType.External,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2,
			portType: Enums.InternalPortType.External,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3,
			portType: Enums.InternalPortType.External,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 4,
			portType: Enums.InternalPortType.External,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 5,
			portType: Enums.InternalPortType.External,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 6,
			portType: Enums.InternalPortType.External,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 7,
			portType: Enums.InternalPortType.External,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 8,
			portType: Enums.InternalPortType.External,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 1000,
			portType: Enums.InternalPortType.ColorBars,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2001,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability:
				Enums.SourceAvailability.Auxiliary |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Auxiliary1 |
				Enums.SourceAvailability.Auxiliary2,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2002,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability:
				Enums.SourceAvailability.Auxiliary |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Auxiliary1 |
				Enums.SourceAvailability.Auxiliary2,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3010,
			portType: Enums.InternalPortType.MediaPlayerFill,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3011,
			portType: Enums.InternalPortType.MediaPlayerKey,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3020,
			portType: Enums.InternalPortType.MediaPlayerFill,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3021,
			portType: Enums.InternalPortType.MediaPlayerKey,
			sourceAvailability: sourceAvailabilityAll,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 6000,
			portType: Enums.InternalPortType.SuperSource,
			sourceAvailability:
				Enums.SourceAvailability.Auxiliary |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Auxiliary1 |
				Enums.SourceAvailability.Auxiliary2,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 7001,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability:
				Enums.SourceAvailability.Auxiliary |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary1 |
				Enums.SourceAvailability.Auxiliary2,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8001,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8002,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8003,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8004,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 9001,
			portType: Enums.InternalPortType.MultiViewer,
			sourceAvailability:
				Enums.SourceAvailability.Auxiliary | Enums.SourceAvailability.Auxiliary1 | Enums.SourceAvailability.Auxiliary2,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 9101,
			portType: Enums.InternalPortType.MultiViewer,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 9102,
			portType: Enums.InternalPortType.MultiViewer,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 9103,
			portType: Enums.InternalPortType.MultiViewer,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 10010,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability:
				Enums.SourceAvailability.Auxiliary |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary1 |
				Enums.SourceAvailability.Auxiliary2,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 10011,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability:
				Enums.SourceAvailability.Auxiliary |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary1 |
				Enums.SourceAvailability.Auxiliary2,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 11001,
			portType: Enums.InternalPortType.ExternalDirect,
			sourceAvailability: Enums.SourceAvailability.Auxiliary | Enums.SourceAvailability.Auxiliary1,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 11002,
			portType: Enums.InternalPortType.ExternalDirect,
			sourceAvailability: Enums.SourceAvailability.Auxiliary | Enums.SourceAvailability.Auxiliary2,
			meAvailability: Enums.MeAvailability.None,
		},
	],
	auxes: 4,
	MEs: 1,
	USKs: 4,
	DSKs: 2,
	MVs: 1,
	multiviewerFullGrid: true,
	DVEs: 2,
	SSrc: 1,
	macros: 100,
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
		monitor: true,
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
				portType: Enums.ExternalPortType.HDMI,
			},
			{
				id: 6,
				portType: Enums.ExternalPortType.HDMI,
			},
			{
				id: 7,
				portType: Enums.ExternalPortType.HDMI,
			},
			{
				id: 8,
				portType: Enums.ExternalPortType.HDMI,
			},
			{
				id: 1301,
				portType: Enums.ExternalPortType.TSJack,
			},
			{
				id: 1302,
				portType: Enums.ExternalPortType.TSJack,
			},
		],
	},
}
