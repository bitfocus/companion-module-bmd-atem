import { AtemState, Enums } from 'atem-connection'
import * as _ from 'underscore'
import { DropdownChoice } from '../../../instance_skel_types'

export const MODEL_AUTO_DETECT = 0
export type ModelId = 0 | Enums.Model

export interface ModelSpec {
  id: ModelId
  label: string
  inputs: number
  auxes: number
  MEs: number
  USKs: number
  DSKs: number
  // MPs: number
  MVs: number
  multiviewerFullGrid: boolean
  auxInput1Direct?: boolean
  SSrc: number
  macros: number
  media: {
    players: number
    stills: number
    clips: number
  }
}

export const ALL_MODELS: ModelSpec[] = [
  {
    id: MODEL_AUTO_DETECT,
    label: 'Auto Detect',
    inputs: 8,
    auxes: 3,
    MEs: 1,
    USKs: 1,
    DSKs: 2,
    MVs: 1,
    multiviewerFullGrid: false,
    SSrc: 1,
    macros: 100,
    media: {
      players: 2,
      stills: 20,
      clips: 0
    }
  },
  {
    id: Enums.Model.TVS,
    label: 'TV Studio',
    inputs: 8,
    auxes: 1,
    MEs: 1,
    USKs: 1,
    DSKs: 2,
    MVs: 1,
    multiviewerFullGrid: false,
    SSrc: 0,
    macros: 100,
    media: {
      players: 2,
      stills: 20,
      clips: 0
    }
  },
  {
    id: Enums.Model.OneME,
    label: '1 ME Production',
    inputs: 8,
    auxes: 3,
    MEs: 1,
    USKs: 4,
    DSKs: 2,
    MVs: 1,
    multiviewerFullGrid: false,
    SSrc: 1,
    macros: 100,
    media: {
      players: 2,
      stills: 32,
      clips: 2
    }
  },
  {
    id: Enums.Model.TwoME,
    label: '2 ME Production',
    inputs: 16,
    auxes: 6,
    MEs: 2,
    USKs: 2,
    DSKs: 2,
    MVs: 2,
    multiviewerFullGrid: false,
    SSrc: 1,
    macros: 100,
    media: {
      players: 2,
      stills: 32,
      clips: 2
    }
  },
  {
    id: Enums.Model.PS4K,
    label: 'Production Studio 4K',
    inputs: 8,
    auxes: 1,
    MEs: 1,
    USKs: 1,
    DSKs: 2,
    MVs: 1,
    multiviewerFullGrid: false,
    SSrc: 0,
    macros: 100,
    media: {
      players: 2,
      stills: 20,
      clips: 0
    }
  },
  {
    id: Enums.Model.OneME4K,
    label: '1 ME Production 4K',
    inputs: 10,
    auxes: 3,
    MEs: 1,
    USKs: 4,
    DSKs: 2,
    MVs: 1,
    multiviewerFullGrid: false,
    SSrc: 1,
    macros: 100,
    media: {
      players: 2,
      stills: 32,
      clips: 2
    }
  },
  {
    id: Enums.Model.TwoME4K,
    label: '2 ME Production 4K',
    inputs: 20,
    auxes: 6,
    MEs: 2,
    USKs: 2,
    DSKs: 2,
    MVs: 2,
    multiviewerFullGrid: false,
    SSrc: 1,
    macros: 100,
    media: {
      players: 2,
      stills: 32,
      clips: 2
    }
  },
  {
    id: Enums.Model.TwoMEBS4K,
    label: '4 ME Broadcast 4K',
    inputs: 20,
    auxes: 6,
    MEs: 4,
    USKs: 4,
    DSKs: 2,
    MVs: 2,
    multiviewerFullGrid: false,
    SSrc: 1,
    macros: 100,
    media: {
      players: 4,
      stills: 64,
      clips: 2
    }
  },
  {
    id: Enums.Model.TVSHD,
    label: 'TV Studio HD',
    inputs: 8,
    auxes: 1,
    MEs: 1,
    USKs: 1,
    DSKs: 2,
    MVs: 1,
    multiviewerFullGrid: false,
    SSrc: 0,
    macros: 100,
    media: {
      players: 2,
      stills: 20,
      clips: 0
    }
  },
  {
    id: Enums.Model.TVSProHD,
    label: 'TV Studio Pro HD',
    inputs: 8,
    auxes: 1,
    MEs: 1,
    USKs: 1,
    DSKs: 2,
    MVs: 1,
    multiviewerFullGrid: false,
    SSrc: 0,
    macros: 100,
    media: {
      players: 2,
      stills: 20,
      clips: 0
    }
  },
  {
    id: Enums.Model.TVSPro4K,
    label: 'TV Studio Pro 4K',
    inputs: 8,
    auxes: 1,
    MEs: 1,
    USKs: 1,
    DSKs: 2,
    MVs: 1,
    multiviewerFullGrid: false,
    SSrc: 0,
    macros: 100,
    media: {
      players: 2,
      stills: 20,
      clips: 2
    }
  },
  {
    id: Enums.Model.Constellation,
    label: 'Constellation',
    inputs: 40,
    auxes: 24,
    MEs: 4,
    USKs: 4,
    DSKs: 4,
    MVs: 4,
    multiviewerFullGrid: true,
    SSrc: 2,
    macros: 100,
    media: {
      players: 4,
      stills: 64,
      clips: 4
    }
  },
  {
    id: Enums.Model.Constellation8K,
    label: 'Constellation 8K',
    inputs: 10,
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
    }
  },
  {
    id: Enums.Model.Mini,
    label: 'Mini',
    inputs: 4,
    auxes: 1,
    MEs: 1,
    USKs: 1,
    DSKs: 1,
    MVs: 0,
    multiviewerFullGrid: false,
    auxInput1Direct: true,
    SSrc: 0,
    macros: 100,
    media: {
      players: 1,
      stills: 20,
      clips: 0
    }
  }
]

export const ALL_MODEL_CHOICES: DropdownChoice[] = ALL_MODELS.map(({ id, label }) => ({ id, label }))
ALL_MODEL_CHOICES.sort((a, b) => {
  const aStr = a.label.toLowerCase()
  const bStr = b.label.toLowerCase()
  if (a.id === MODEL_AUTO_DETECT) {
    return -1
  }
  if (b.id === MODEL_AUTO_DETECT) {
    return 1
  }
  if (aStr < bStr) {
    return -1
  }
  if (aStr > bStr) {
    return 1
  }
  return 0
})

export function GetModelSpec(id: ModelId) {
  return ALL_MODELS.find(m => m.id === id)
}

export function GetAutoDetectModel() {
  return ALL_MODELS[0]
}

export function GetParsedModelSpec({ info, inputs, settings }: AtemState): ModelSpec {
  const defaults = GetAutoDetectModel()
  return {
    id: info.model,
    label: info.productIdentifier ?? 'Blackmagic ATEM',
    inputs: _.values(inputs).filter(i => i?.isExternal).length,
    auxes: info.capabilities?.auxilliaries ?? defaults.auxes,
    MEs: info.capabilities?.mixEffects ?? defaults.MEs,
    USKs: info.mixEffects[0]?.keyCount ?? defaults.USKs,
    DSKs: info.capabilities?.downstreamKeyers ?? defaults.DSKs,
    MVs: _.values(settings.multiViewers).length,
    multiviewerFullGrid: false, // TODO
    auxInput1Direct: false, // TODO
    SSrc: info.capabilities?.superSources ?? defaults.SSrc,
    macros: info.macroPool?.macroCount ?? defaults.macros,
    media: {
      players: info.capabilities?.mediaPlayers ?? defaults.media.players,
      stills: info.mediaPool?.stillCount ?? defaults.media.stills,
      clips: info.mediaPool?.clipCount ?? defaults.media.clips
    }
  }
}
