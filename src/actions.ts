import { AtemState } from 'atem-connection'
import { CompanionActions } from '../../../instance_skel_types'
import { CHOICES_KEYTRANS } from './choices'
import {
  AtemAuxPicker,
  AtemAuxSourcePicker,
  AtemDSKPicker,
  AtemKeyCutSourcePicker,
  AtemKeyFillSourcePicker,
  AtemMEPicker,
  AtemMESourcePicker,
  AtemMultiviewerPicker,
  AtemMultiviewSourcePicker,
  AtemMultiviewWindowPicker,
  AtemSuperSourceBoxPicker,
  AtemSuperSourceBoxSourcePicker,
  AtemUSKPicker
} from './input'
import { ModelSpec } from './models'

export enum ActionId {
  Program = 'program',
  Preview = 'preview',
  Cut = 'cut',
  Auto = 'auto',
  Aux = 'aux',
  USKSource = 'uskSource',
  USKOnAir = 'usk',
  DSKSource = 'dskSource',
  DSKOnAir = 'dsk',
  DSKAuto = 'dskAuto',
  MacroRun = 'macrorun',
  MacroContinue = 'macrocontinue',
  MacroStop = 'macrostop',
  MultiviewerWindowSource = 'setMvSource',
  SuperSourceBoxSource = 'setSsrcBoxSource'
}

export function GetActionsList(model: ModelSpec, state: AtemState) {
  const actions: CompanionActions = {}

  actions[ActionId.Program] = {
    label: 'Set input on Program',
    options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)]
  }
  actions[ActionId.Preview] = {
    label: 'Set input on Preview',
    options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)]
  }
  actions[ActionId.Cut] = {
    label: 'CUT operation',
    options: [AtemMEPicker(model, 0)]
  }
  actions[ActionId.Auto] = {
    label: 'AUTO transition operation',
    options: [AtemMEPicker(model, 0)]
  }

  actions[ActionId.Aux] = {
    label: 'Set AUX bus',
    options: [AtemAuxPicker(model), AtemAuxSourcePicker(model, state)]
  }

  actions[ActionId.USKSource] = {
    label: 'Set inputs on Upstream KEY',
    options: [
      AtemMEPicker(model, 0),
      AtemUSKPicker(model),
      AtemKeyFillSourcePicker(model, state),
      AtemKeyCutSourcePicker(model, state)
    ]
  }
  actions[ActionId.USKOnAir] = {
    label: 'Set Upstream KEY OnAir',
    options: [
      {
        id: 'onair',
        type: 'dropdown',
        label: 'On Air',
        default: 'true',
        choices: CHOICES_KEYTRANS
      },
      AtemMEPicker(model, 0),
      AtemUSKPicker(model)
    ]
  }

  actions[ActionId.DSKSource] = {
    label: 'Set inputs on Downstream KEY',
    options: [AtemDSKPicker(model), AtemKeyFillSourcePicker(model, state), AtemKeyCutSourcePicker(model, state)]
  }
  actions[ActionId.DSKAuto] = {
    label: 'AUTO DSK Transition',
    options: [AtemDSKPicker(model)]
  }
  actions[ActionId.DSKOnAir] = {
    label: 'Set Downstream KEY OnAir',
    options: [
      {
        id: 'onair',
        type: 'dropdown',
        label: 'On Air',
        default: 'true',
        choices: CHOICES_KEYTRANS
      },
      AtemDSKPicker(model)
    ]
  }

  actions[ActionId.MacroRun] = {
    label: 'Run MACRO',
    options: [
      {
        type: 'textinput',
        id: 'macro',
        label: 'Macro number',
        default: 1,
        regex: '/^([1-9]|[1-9][0-9]|100)$/'
      },
      {
        type: 'dropdown',
        id: 'action',
        label: 'Action',
        default: 'run',
        choices: [{ id: 'run', label: 'Run' }, { id: 'runContinue', label: 'Run/Continue' }]
      }
    ]
  }
  actions[ActionId.MacroContinue] = { label: 'Continue MACRO' }
  actions[ActionId.MacroStop] = { label: 'Stop MACROS' }

  actions[ActionId.MultiviewerWindowSource] = {
    label: 'Change MV window source',
    options: [AtemMultiviewerPicker(model), AtemMultiviewWindowPicker(), AtemMultiviewSourcePicker(model, state)]
  }
  actions[ActionId.SuperSourceBoxSource] = {
    label: 'Change SuperSource box source',
    options: [AtemSuperSourceBoxPicker(), AtemSuperSourceBoxSourcePicker(model, state)]
  }

  return actions
}
