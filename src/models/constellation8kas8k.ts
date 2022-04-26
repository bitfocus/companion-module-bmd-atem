import { ModelSpec } from './types'
import { Enums } from 'atem-connection'

export const ModelSpecConstellation8KAs8K: ModelSpec = {
	id: Enums.Model.Constellation8K,
	label: 'Constellation 8K (8K Mode)',
	auxes: 6,
	MEs: 1,
	USKs: 4,
	DSKs: 2,
	MVs: 1,
	multiviewerFullGrid: true,
	SSrc: 1,
	macros: 100,
	media: {
		players: 1,
		stills: 24,
		clips: 2,
	},
	streaming: false,
	recording: false,
	recordISO: false,
	inputs: [
		{
			id: 0,
			portType: Enums.InternalPortType.Black,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 1,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 4,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 5,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 6,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 7,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 8,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 9,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 10,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 1000,
			portType: Enums.InternalPortType.ColorBars,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2001,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2002,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3010,
			portType: Enums.InternalPortType.MediaPlayerFill,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3011,
			portType: Enums.InternalPortType.MediaPlayerKey,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 4010,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4020,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4030,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4040,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 5010,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 5020,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 6000,
			portType: Enums.InternalPortType.SuperSource,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 7001,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 7002,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
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
			id: 8005,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8006,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 10010,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 10011,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
	],
	fairlightAudio: {
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
				id: 1301,
				portType: Enums.ExternalPortType.TSJack,
			},
			{
				id: 1401,
				portType: Enums.ExternalPortType.TRSJack,
			},
			{
				id: 1501,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1502,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1503,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1504,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1505,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1506,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1507,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1508,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1509,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1510,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1511,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1512,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1513,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1514,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1515,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1516,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1517,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1518,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1519,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1520,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1521,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1522,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1523,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1524,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1525,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1526,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1527,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1528,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1529,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1530,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1531,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 1532,
				portType: Enums.ExternalPortType.MADI,
			},
			{
				id: 2001,
				portType: Enums.ExternalPortType.Internal,
			},
			{
				id: 2002,
				portType: Enums.ExternalPortType.Internal,
			},
			{
				id: 2003,
				portType: Enums.ExternalPortType.Internal,
			},
			{
				id: 2004,
				portType: Enums.ExternalPortType.Internal,
			},
		],
	},
}
