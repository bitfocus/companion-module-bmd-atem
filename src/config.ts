import InstanceSkel = require('../../../instance_skel')
import { SomeCompanionConfigField } from '../../../instance_skel_types'
import { ALL_MODEL_CHOICES, ModelId } from './models'

export interface AtemConfig {
  host?: string
  modelID?: ModelId
  presets?: any // TODO
}

export function GetConfigFields(self: InstanceSkel<AtemConfig>): SomeCompanionConfigField[] {
  return [
    {
      type: 'text',
      id: 'info',
      width: 12,
      label: 'Information',
      value:
        "Should work with all models of Blackmagic Design ATEM mixers.<br />In general this should be left in 'Auto Detect', however a specific model can be selected below for offline programming."
    },
    {
      type: 'textinput',
      id: 'host',
      label: 'Target IP',
      width: 6,
      regex: self.REGEX_IP
    },
    {
      type: 'dropdown',
      id: 'modelID',
      label: 'Model',
      width: 6,
      choices: ALL_MODEL_CHOICES,
      default: 0
    },
    {
      type: 'dropdown',
      id: 'presets',
      label: 'Preset Style',
      width: 6,
      choices: [{ id: 0, label: 'Short Names' }, { id: 1, label: 'Long Names' }],
      default: 0
    }
  ]
}
