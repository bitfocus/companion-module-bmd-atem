import { ModelSpec } from '.'
import { Enums } from 'atem-connection'

export const ModelSpecConstellation8K: ModelSpec = {
  id: Enums.Model.Constellation8K,
  label: 'Constellation 8K',
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
    clips: 2
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 2001,
      portType: Enums.InternalPortType.ColorGenerator,
      sourceAvailability:
        Enums.SourceAvailability.SuperSourceBox |
        Enums.SourceAvailability.SuperSourceArt |
        Enums.SourceAvailability.Multiviewer |
        Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 2002,
      portType: Enums.InternalPortType.ColorGenerator,
      sourceAvailability:
        Enums.SourceAvailability.SuperSourceBox |
        Enums.SourceAvailability.SuperSourceArt |
        Enums.SourceAvailability.Multiviewer |
        Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
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
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 4010,
      portType: Enums.InternalPortType.Mask,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 4020,
      portType: Enums.InternalPortType.Mask,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 4030,
      portType: Enums.InternalPortType.Mask,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 4040,
      portType: Enums.InternalPortType.Mask,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 5010,
      portType: Enums.InternalPortType.Mask,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 5020,
      portType: Enums.InternalPortType.Mask,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 6000,
      portType: Enums.InternalPortType.SuperSource,
      sourceAvailability:
        Enums.SourceAvailability.KeySource |
        Enums.SourceAvailability.SuperSourceBox |
        Enums.SourceAvailability.Multiviewer |
        Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.Me1
    },
    {
      id: 7001,
      portType: Enums.InternalPortType.MEOutput,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 7002,
      portType: Enums.InternalPortType.MEOutput,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 8001,
      portType: Enums.InternalPortType.Auxiliary,
      sourceAvailability: Enums.SourceAvailability.Multiviewer,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 8002,
      portType: Enums.InternalPortType.Auxiliary,
      sourceAvailability: Enums.SourceAvailability.Multiviewer,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 8003,
      portType: Enums.InternalPortType.Auxiliary,
      sourceAvailability: Enums.SourceAvailability.Multiviewer,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 8004,
      portType: Enums.InternalPortType.Auxiliary,
      sourceAvailability: Enums.SourceAvailability.Multiviewer,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 8005,
      portType: Enums.InternalPortType.Auxiliary,
      sourceAvailability: Enums.SourceAvailability.Multiviewer,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 8006,
      portType: Enums.InternalPortType.Auxiliary,
      sourceAvailability: Enums.SourceAvailability.Multiviewer,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 10010,
      portType: Enums.InternalPortType.MEOutput,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    },
    {
      id: 10011,
      portType: Enums.InternalPortType.MEOutput,
      sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    }
  ],
  fairlightAudio: {
    inputs: [
      {
        id: 1,
        portType: 1
      },
      {
        id: 2,
        portType: 1
      },
      {
        id: 3,
        portType: 1
      },
      {
        id: 4,
        portType: 1
      },
      {
        id: 5,
        portType: 1
      },
      {
        id: 6,
        portType: 1
      },
      {
        id: 7,
        portType: 1
      },
      {
        id: 8,
        portType: 1
      },
      {
        id: 9,
        portType: 1
      },
      {
        id: 10,
        portType: 1
      },
      {
        id: 1301,
        portType: 512
      },
      {
        id: 1401,
        portType: 2048
      },
      {
        id: 1501,
        portType: 1024
      },
      {
        id: 1502,
        portType: 1024
      },
      {
        id: 1503,
        portType: 1024
      },
      {
        id: 1504,
        portType: 1024
      },
      {
        id: 1505,
        portType: 1024
      },
      {
        id: 1506,
        portType: 1024
      },
      {
        id: 1507,
        portType: 1024
      },
      {
        id: 1508,
        portType: 1024
      },
      {
        id: 1509,
        portType: 1024
      },
      {
        id: 1510,
        portType: 1024
      },
      {
        id: 1511,
        portType: 1024
      },
      {
        id: 1512,
        portType: 1024
      },
      {
        id: 1513,
        portType: 1024
      },
      {
        id: 1514,
        portType: 1024
      },
      {
        id: 1515,
        portType: 1024
      },
      {
        id: 1516,
        portType: 1024
      },
      {
        id: 1517,
        portType: 1024
      },
      {
        id: 1518,
        portType: 1024
      },
      {
        id: 1519,
        portType: 1024
      },
      {
        id: 1520,
        portType: 1024
      },
      {
        id: 1521,
        portType: 1024
      },
      {
        id: 1522,
        portType: 1024
      },
      {
        id: 1523,
        portType: 1024
      },
      {
        id: 1524,
        portType: 1024
      },
      {
        id: 1525,
        portType: 1024
      },
      {
        id: 1526,
        portType: 1024
      },
      {
        id: 1527,
        portType: 1024
      },
      {
        id: 1528,
        portType: 1024
      },
      {
        id: 1529,
        portType: 1024
      },
      {
        id: 1530,
        portType: 1024
      },
      {
        id: 1531,
        portType: 1024
      },
      {
        id: 1532,
        portType: 1024
      },
      {
        id: 2001,
        portType: 256
      },
      {
        id: 2002,
        portType: 256
      },
      {
        id: 2003,
        portType: 256
      },
      {
        id: 2004,
        portType: 256
      }
    ]
  }
}
