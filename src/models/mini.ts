import type { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'

export const ModelSpecMini: ModelSpec = {
	id: Enums.Model.Mini,
	label: 'Mini',
	auxes: 1,
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
	inputs: [
		{
			id: 0,
			portType: Enums.InternalPortType.Black,
			sourceAvailability: Enums.SourceAvailability.KeySource,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 1,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 4,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 1000,
			portType: Enums.InternalPortType.ColorBars,
			sourceAvailability: Enums.SourceAvailability.KeySource,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2001,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability: Enums.SourceAvailability.None,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 2002,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability: Enums.SourceAvailability.None,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3010,
			portType: Enums.InternalPortType.MediaPlayerFill,
			sourceAvailability: Enums.SourceAvailability.KeySource,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 3011,
			portType: Enums.InternalPortType.MediaPlayerKey,
			sourceAvailability: Enums.SourceAvailability.KeySource,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 8001,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.None,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 10010,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 10011,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 11001,
			portType: Enums.InternalPortType.External,
			sourceAvailability: Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
	],
	fairlightAudio: {
		monitor: null,
		inputs: [
			{
				id: 1,
				portType: Enums.ExternalPortType.HDMI,
				// supportedConfigurations: [2, 4],
			},
			{
				id: 2,
				portType: Enums.ExternalPortType.HDMI,
				// supportedConfigurations: [2, 4],
			},
			{
				id: 3,
				portType: Enums.ExternalPortType.HDMI,
				// supportedConfigurations: [2, 4],
			},
			{
				id: 4,
				portType: Enums.ExternalPortType.HDMI,
				// supportedConfigurations: [2, 4],
			},
			{
				id: 1301,
				portType: Enums.ExternalPortType.TSJack,
				// supportedConfigurations: [2, 4],
				maxDelay: 8,
			},
			{
				id: 1302,
				portType: Enums.ExternalPortType.TSJack,
				// supportedConfigurations: [2, 4],
				maxDelay: 8,
			},
		],
	},
}
