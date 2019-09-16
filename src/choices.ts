import { DropdownChoice } from '../../../instance_skel_types'
import { ModelSpec } from './models'
import { iterateTimes } from './util'

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
