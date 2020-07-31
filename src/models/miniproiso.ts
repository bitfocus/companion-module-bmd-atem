import { ModelSpec } from '.'
import { Enums } from 'atem-connection'

export const ModelSpecMiniProISO: ModelSpec = {
  id: Enums.Model.MiniProISO,
  label: 'Mini Pro ISO',
  auxes: 1,
  MEs: 1,
  USKs: 1,
  DSKs: 1,
  MVs: 0,
  multiviewerFullGrid: false,
  SSrc: 0,
  macros: 100,
  media: {
    players: 1,
    stills: 20,
    clips: 0
  },
  inputs: [
    {
      id: 0,
      portType: Enums.InternalPortType.Black,
      sourceAvailability: Enums.SourceAvailability.KeySource,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 1,
      portType: Enums.InternalPortType.External,
      sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 2,
      portType: Enums.InternalPortType.External,
      sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 3,
      portType: Enums.InternalPortType.External,
      sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 4,
      portType: Enums.InternalPortType.External,
      sourceAvailability: Enums.SourceAvailability.KeySource | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 1000,
      portType: Enums.InternalPortType.ColorBars,
      sourceAvailability: Enums.SourceAvailability.KeySource,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 2001,
      portType: Enums.InternalPortType.ColorGenerator,
      sourceAvailability: Enums.SourceAvailability.None,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 2002,
      portType: Enums.InternalPortType.ColorGenerator,
      sourceAvailability: Enums.SourceAvailability.None,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 3010,
      portType: Enums.InternalPortType.MediaPlayerFill,
      sourceAvailability: Enums.SourceAvailability.KeySource,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 3011,
      portType: Enums.InternalPortType.MediaPlayerKey,
      sourceAvailability: Enums.SourceAvailability.KeySource,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 8001,
      portType: Enums.InternalPortType.Auxiliary,
      sourceAvailability: Enums.SourceAvailability.None,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 9001,
      portType: Enums.InternalPortType.MultiViewer,
      sourceAvailability: Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 10010,
      portType: Enums.InternalPortType.MEOutput,
      sourceAvailability: Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 10011,
      portType: Enums.InternalPortType.MEOutput,
      sourceAvailability: Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 11001,
      portType: Enums.InternalPortType.ExternalDirect,
      sourceAvailability: Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    }
  ]
}
