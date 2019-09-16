import { DropdownChoice } from '../../../instance_skel_types'
import { ModelSpec } from './models'
import { iterateTimes, literal } from './util'
import { AtemState } from 'atem-connection'

export const CHOICES_SSRCBOXES: DropdownChoice[] = [
  { id: 0, label: 'Box 1' },
  { id: 1, label: 'Box 2' },
  { id: 2, label: 'Box 3' },
  { id: 3, label: 'Box 4' }
]

export const CHOICES_KEYTRANS: DropdownChoice[] = [
  { id: 'true', label: 'On Air' },
  { id: 'false', label: 'Off' },
  { id: 'toggle', label: 'Toggle' }
]

export function GetMEIdChoices(model: ModelSpec): DropdownChoice[] {
  return iterateTimes(model.MEs, i => ({
    id: i,
    label: `M/E ${i + 1}`
  }))
}

export function GetAuxIdChoices(model: ModelSpec): DropdownChoice[] {
  return iterateTimes(model.auxes, i => ({
    id: i,
    label: `${i + 1}`
  }))
}

export function GetUSKIdChoices(model: ModelSpec): DropdownChoice[] {
  return iterateTimes(model.USKs, i => ({
    id: i,
    label: `${i + 1}`
  }))
}

export function GetDSKIdChoices(model: ModelSpec): DropdownChoice[] {
  return iterateTimes(model.DSKs, i => ({
    id: i,
    label: `${i + 1}`
  }))
}

export function GetMultiviewerIdChoices(model: ModelSpec): DropdownChoice[] {
  return iterateTimes(model.MVs, i => ({
    id: i,
    label: `MV ${i + 1}`
  }))
}

export interface SourceInfo {
  id: number
  shortName: string
  longName: string
}
export function GetSourcesListForType(model: ModelSpec, state: AtemState, subset?: 'me' | 'aux' | 'mv') {
  const getSource = (id: number, defShort: string, defLong: string) => {
    const input = state.inputs[id]
    const shortName = input ? input.shortName || defShort : defShort
    const longName = input ? input.longName || defLong : defLong

    return literal<SourceInfo>({
      id,
      shortName,
      longName
    })
  }

  const sources: SourceInfo[] = [
    getSource(0, 'Blck', 'Black'),
    getSource(1000, 'Bars', 'Bars'),
    getSource(2001, 'Col2', 'Color 2'),
    getSource(2002, 'Col1', 'Color 1')
  ]

  for (let i = 0; i < model.SSrc; i++) {
    if (model.SSrc === 1) {
      sources.push(getSource(6000, 'SSrc', 'Super Source'))
    } else {
      sources.push(getSource(6000 + i, `SSc${i}`, `Super Source ${i}`))
    }
  }

  for (let i = 1; i <= model.inputs; i++) {
    sources.push(getSource(i, `In ${i}`, `Input ${i}`))
  }

  for (let i = 1; i <= model.MPs; i++) {
    sources.push(getSource(3000 + i * 10, `MP ${i}`, `Media Player ${i}`))
    sources.push(getSource(3001 + i * 10, `MP${i}K`, `Media Player ${i} Key`))
  }

  if (!subset || subset === 'mv') {
    for (let i = 1; i <= model.auxes; i++) {
      sources.push(getSource(8000 + i, `Aux${i}`, `Auxilary ${i}`))
    }
  }

  if (!subset || subset === 'mv' || subset === 'aux') {
    for (let i = 1; i <= model.DSKs; i++) {
      sources.push(getSource(7000 + i, `Cln${i}`, `Clean Feed ${i}`))
    }
  }

  for (let i = 1; i <= model.MEs; i++) {
    // Lower ME's can't be referenced by higher
    // TODO - filter out to block that
    sources.push(getSource(10000 + i * 10, `M${i}PG`, `ME ${i} Program`))
    sources.push(getSource(10000 + i * 10 + 1, `M${i}PV`, `ME ${i} Preview`))
  }

  sources.sort((a, b) => a.id - b.id)
  return sources
}

export function SourcesToChoices(sources: SourceInfo[]): DropdownChoice[] {
  return sources.map(s => ({
    id: s.id,
    label: s.longName
  }))
}