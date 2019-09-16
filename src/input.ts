import InstanceSkel = require('../../../instance_skel')
import { CompanionInputFieldDropdown } from '../../../instance_skel_types'
import { GetMEIdChoices, GetUSKIdChoices, GetDSKIdChoices, GetAuxIdChoices, GetMultiviewerIdChoices } from './choices'
import { AtemConfig } from './config'
import { ModelSpec } from './models'

export function AtemMESourcePicker(instance: InstanceSkel<AtemConfig>, id: number): CompanionInputFieldDropdown {
  return {
    id: `input${id ? id : ''}`,
    label: `Input${id ? ` Option ${id}` : ''}`,
    type: 'dropdown',
    default: 1,
    choices: this.CHOICES_MESOURCES
  }
}
export function AtemMEPicker(model: ModelSpec, id: number): CompanionInputFieldDropdown {
  return {
    id: `mixeffect${id ? id : ''}`,
    label: `M/E${id ? ` Option ${id}` : ''}`,
    type: 'dropdown',
    default: id,
    choices: GetMEIdChoices(model)
  }
}
export function AtemDSKPicker(model: ModelSpec): CompanionInputFieldDropdown {
  return {
    type: 'dropdown',
    label: 'Key',
    id: 'key',
    default: 0,
    choices: GetDSKIdChoices(model)
  }
}
export function AtemUSKPicker(model: ModelSpec): CompanionInputFieldDropdown {
  return {
    type: 'dropdown',
    label: 'Key',
    id: 'key',
    default: 0,
    choices: GetUSKIdChoices(model)
  }
}
export function AtemAuxPicker(model: ModelSpec): CompanionInputFieldDropdown {
  return {
    type: 'dropdown',
    id: 'aux',
    label: 'AUX',
    default: 0,
    choices: GetAuxIdChoices(model)
  }
}
export function AtemMultiviewerPicker(model: ModelSpec): CompanionInputFieldDropdown {
  return {
    type: 'dropdown',
    id: 'multiViewerId',
    label: 'MV',
    default: 0,
    choices: GetMultiviewerIdChoices(model)
  }
}
