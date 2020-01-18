import { AtemState, Enums } from 'atem-connection'
import { DropdownChoice } from '../../../instance_skel_types'
import { ModelSpec } from './models'
import { iterateTimes, literal } from './util'

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

export function GetTransitionStyleChoices(skipSting?: boolean) {
  const options = [
    { id: Enums.TransitionStyle.MIX, label: 'Mix' },
    { id: Enums.TransitionStyle.DIP, label: 'Dip' },
    { id: Enums.TransitionStyle.WIPE, label: 'Wipe' },
    { id: Enums.TransitionStyle.DVE, label: 'DVE' }
  ]
  if (!skipSting) {
    options.push({ id: Enums.TransitionStyle.STING, label: 'Sting' })
  }
  return options
}

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

export function GetSuperSourceIdChoices(model: ModelSpec): DropdownChoice[] {
  return iterateTimes(model.SSrc, i => ({
    id: i,
    label: `Super Source ${i + 1}`
  }))
}

export function GetMacroChoices(model: ModelSpec, state: AtemState): DropdownChoice[] {
  return iterateTimes(model.macros, i => {
    const macro = state.macro.macroProperties[i]
    return {
      id: i + 1,
      label: (macro?.isUsed ? `${macro.name} (#${i + 1})` : undefined) || `Macro ${i + 1}`
    }
  })
}
export function GetMediaPlayerChoices(model: ModelSpec): DropdownChoice[] {
  return iterateTimes(model.media.players, i => {
    return {
      id: i,
      label: `Media Player ${i + 1}`
    }
  })
}

export interface SourceInfo {
  id: number
  shortName: string
  longName: string
}
export function GetSourcesListForType(model: ModelSpec, state: AtemState, subset?: 'me' | 'aux' | 'mv') {
  const getSource = (id: number, defShort: string, defLong: string) => {
    const input = state.inputs[id]
    const shortName = input?.shortName || defShort
    const longName = input?.longName || defLong

    return literal<SourceInfo>({
      id,
      shortName,
      longName
    })
  }

  const sources: SourceInfo[] = []
  if (subset !== 'aux' || (subset === 'aux' && !model.auxInput1Direct)) {
    sources.push(
      getSource(0, 'Blck', 'Black'),
      getSource(1000, 'Bars', 'Bars'),
      getSource(2001, 'Col1', 'Color 1'),
      getSource(2002, 'Col2', 'Color 2')
    )
  }

  for (let i = 0; i < model.SSrc; i++) {
    if (model.SSrc === 1) {
      sources.push(getSource(6000, 'SSrc', 'Super Source'))
    } else {
      sources.push(getSource(6000 + i, `SSc${i + 1}`, `Super Source ${i + 1}`))
    }
  }

  for (let i = 1; i <= model.inputs; i++) {
    sources.push(getSource(i, `In ${i}`, `Input ${i}`))

    if ((!subset || subset === 'aux') && model.auxInput1Direct && i === 1) {
      sources.push(getSource(11000 + i, `In${i}D`, `Input ${i} - Direct`))
    }
  }

  if (subset !== 'aux' || (subset === 'aux' && !model.auxInput1Direct)) {
    for (let i = 1; i <= model.media.players; i++) {
      sources.push(getSource(3000 + i * 10, `MP ${i}`, `Media Player ${i}`))
      sources.push(getSource(3001 + i * 10, `MP${i}K`, `Media Player ${i} Key`))
    }
  }

  if (!subset || subset === 'mv') {
    for (let i = 1; i <= model.auxes; i++) {
      sources.push(getSource(8000 + i, `Aux${i}`, `Auxiliary ${i}`))
    }
  }

  if (!subset || subset === 'mv' || (subset === 'aux' && !model.auxInput1Direct)) {
    for (let i = 1; i <= model.DSKs; i++) {
      sources.push(getSource(7000 + i, `Cln${i}`, `Clean Feed ${i}`))
    }
  }

  for (let i = 1; i <= model.MEs; i++) {
    if (i === 1 && subset === 'me') {
      // Lower ME's can't be referenced by higher
      // We can't do anything beyond ME1 as it is a static list
      continue
    }

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
