import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import {
	AUDIO_ROUTING_OUTPUT_PROGRAM,
	AUDIO_ROUTING_OUTPUT_RETURN,
	AUDIO_ROUTING_SOURCE_CONTROL,
	AUDIO_ROUTING_SOURCE_HEADPHONES,
	AUDIO_ROUTING_SOURCE_MICROPHONE,
	AUDIO_ROUTING_SOURCE_MONITOR,
	AUDIO_ROUTING_SOURCE_NO_AUDIO,
	AUDIO_ROUTING_SOURCE_PROGRAM,
	AUDIO_ROUTING_SOURCE_RCA,
	AUDIO_ROUTING_SOURCE_STUDIO,
	AUDIO_ROUTING_SOURCE_XLR,
	generateAuxRoutingOutputs,
	generateAuxRoutingSources,
	generateInputRoutingSources,
	generateMadiRoutingOutputs,
	generateMadiRoutingSources,
	generateMediaPlayerRoutingSources,
	generateTalkbackRoutingSources,
} from './util/audioRouting.js'

const sourceAvailabilityAll =
	Enums.SourceAvailability.Auxiliary |
	Enums.SourceAvailability.Multiviewer |
	Enums.SourceAvailability.SuperSourceArt |
	Enums.SourceAvailability.SuperSourceBox |
	Enums.SourceAvailability.KeySource

export const ModelSpecTVSHD8: ModelSpec = {
	id: Enums.Model.TelevisionStudioHD8,
	label: 'Television Studio HD8',
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
				Enums.SourceAvailability.SuperSourceBox,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2002,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability:
				Enums.SourceAvailability.Auxiliary |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.SuperSourceBox,
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
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.KeySource,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 7001,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Auxiliary | Enums.SourceAvailability.Multiviewer,
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
			id: 9001,
			portType: Enums.InternalPortType.MultiViewer,
			sourceAvailability: Enums.SourceAvailability.Auxiliary,
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
			sourceAvailability: Enums.SourceAvailability.Auxiliary | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 10011,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Auxiliary | Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
	],
	outputs: generateOutputs('Aux', 2),
	MEs: 1,
	USKs: 4,
	DSKs: 2,
	MVs: 1,
	multiviewerFullGrid: true,
	DVEs: 1,
	SSrc: 1,
	macros: 100,
	displayClock: 1,
	media: {
		players: 2,
		stills: 20,
		clips: 2,
		captureStills: true,
	},
	streaming: true,
	recording: true,
	recordISO: false,
	fairlightAudio: {
		monitor: 'split',
		audioRouting: {
			sources: [
				AUDIO_ROUTING_SOURCE_NO_AUDIO,
				...generateInputRoutingSources(8, true),
				AUDIO_ROUTING_SOURCE_XLR,
				AUDIO_ROUTING_SOURCE_RCA,
				AUDIO_ROUTING_SOURCE_MICROPHONE,
				...generateMadiRoutingSources(16),
				...generateMediaPlayerRoutingSources(2),
				...generateTalkbackRoutingSources(true, true),
				AUDIO_ROUTING_SOURCE_MONITOR,
				AUDIO_ROUTING_SOURCE_PROGRAM,
				AUDIO_ROUTING_SOURCE_CONTROL,
				AUDIO_ROUTING_SOURCE_STUDIO,
				AUDIO_ROUTING_SOURCE_HEADPHONES,
				...generateAuxRoutingSources(2),
			],
			outputs: [
				...generateMadiRoutingOutputs(32),
				...generateAuxRoutingOutputs(2),
				AUDIO_ROUTING_OUTPUT_PROGRAM,
				AUDIO_ROUTING_OUTPUT_RETURN,
			],
		},
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
				id: 1001,
				portType: Enums.ExternalPortType.XLR,
			},
			{
				id: 1201,
				portType: Enums.ExternalPortType.RCA,
			},
			{
				id: 1301,
				portType: Enums.ExternalPortType.TSJack,
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
