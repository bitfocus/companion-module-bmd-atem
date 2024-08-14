import { generateOutputs, type ModelSpec } from './types.js'
import { Enums } from 'atem-connection'

export const ModelSpecConstellationHD4ME: ModelSpec = {
	id: Enums.Model.ConstellationHD4ME,
	label: '4 M/E Constellation HD',
	outputs: generateOutputs('Output', 24),
	MEs: 4,
	USKs: 4,
	DSKs: 4,
	MVs: 4,
	multiviewerFullGrid: true,
	DVEs: 4,
	SSrc: 2,
	macros: 100,
	displayClock: 1,
	media: {
		players: 4,
		stills: 60,
		clips: 4,
		captureStills: true,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 11,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 12,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 13,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 14,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 15,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 16,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 17,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 18,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 19,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 20,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 21,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 22,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 23,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 24,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 25,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 26,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 27,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 28,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 29,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 30,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 31,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 32,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 33,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 34,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 35,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 36,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 37,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 38,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 39,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 40,
			portType: Enums.InternalPortType.External,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 2001,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 2002,
			portType: Enums.InternalPortType.ColorGenerator,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 3020,
			portType: Enums.InternalPortType.MediaPlayerFill,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 3021,
			portType: Enums.InternalPortType.MediaPlayerKey,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 3030,
			portType: Enums.InternalPortType.MediaPlayerFill,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 3031,
			portType: Enums.InternalPortType.MediaPlayerKey,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 3040,
			portType: Enums.InternalPortType.MediaPlayerFill,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 3041,
			portType: Enums.InternalPortType.MediaPlayerKey,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.SuperSourceArt |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			id: 4050,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4060,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4070,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4080,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4090,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4100,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4110,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4120,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4130,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4140,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4150,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 4160,
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
			id: 5030,
			portType: Enums.InternalPortType.Mask,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 5040,
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
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
		},
		{
			id: 6001,
			portType: Enums.InternalPortType.SuperSource,
			sourceAvailability:
				Enums.SourceAvailability.KeySource |
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability:
				Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3 | Enums.MeAvailability.Me4,
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
			id: 7003,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 7004,
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
			id: 8007,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8008,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8009,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8010,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8011,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8012,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8013,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8014,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8015,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8016,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8017,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8018,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8019,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8020,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8021,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8022,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8023,
			portType: Enums.InternalPortType.Auxiliary,
			sourceAvailability: Enums.SourceAvailability.Multiviewer,
			meAvailability: Enums.MeAvailability.None,
		},
		{
			id: 8024,
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
		{
			id: 10020,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 10021,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1,
		},
		{
			id: 10030,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2,
		},
		{
			id: 10031,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2,
		},
		{
			id: 10040,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3,
		},
		{
			id: 10041,
			portType: Enums.InternalPortType.MEOutput,
			sourceAvailability:
				Enums.SourceAvailability.SuperSourceBox |
				Enums.SourceAvailability.Multiviewer |
				Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.Me1 | Enums.MeAvailability.Me2 | Enums.MeAvailability.Me3,
		},
	],
	fairlightAudio: {
		monitor: 'split',
		audioRouting: false,
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
				id: 21,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 22,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 23,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 24,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 25,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 26,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 27,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 28,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 29,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 30,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 31,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 32,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 33,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 34,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 35,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 36,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 37,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 38,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 39,
				portType: Enums.ExternalPortType.SDI,
			},
			{
				id: 40,
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
