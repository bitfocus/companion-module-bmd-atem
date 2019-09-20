import * as _ from 'underscore'
import { Atem, AtemState } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionActionEvent, CompanionActions } from '../../../instance_skel_types'
import { CHOICES_KEYTRANS, GetDSKIdChoices, GetMacroChoices } from './choices'
import { AtemConfig } from './config'
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
  AtemUSKPicker,
  AtemSuperSourceIdPicker
} from './input'
import { ModelSpec } from './models'
import { getDSK, getUSK } from './state'
import { assertUnreachable } from './util'

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
    options: [
      {
        type: 'dropdown',
        id: 'downstreamKeyerId',
        label: 'DSK',
        default: 0,
        choices: GetDSKIdChoices(model)
      }
    ]
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
        type: 'dropdown',
        id: 'macro',
        label: 'Macro',
        default: 1,
        choices: GetMacroChoices(model, state)
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
  actions[ActionId.MacroContinue] = { label: 'Continue MACRO', options: [] }
  actions[ActionId.MacroStop] = { label: 'Stop MACROS', options: [] }

  actions[ActionId.MultiviewerWindowSource] = {
    label: 'Change MV window source',
    options: [AtemMultiviewerPicker(model), AtemMultiviewWindowPicker(model), AtemMultiviewSourcePicker(model, state)]
  }
  actions[ActionId.SuperSourceBoxSource] = {
    label: 'Change SuperSource box source',
    options: _.compact([
      AtemSuperSourceBoxPicker(),
      AtemSuperSourceIdPicker(model),
      AtemSuperSourceBoxSourcePicker(model, state)
    ])
  }

  return actions
}

export function HandleAction(
  instance: InstanceSkel<AtemConfig>,
  atem: Atem,
  model: ModelSpec,
  state: AtemState,
  action: CompanionActionEvent
) {
  const opt = action.options
  const getOptInt = (key: string) => {
    const val = parseInt(opt[key], 10)
    if (isNaN(val)) {
      throw new Error(`Invalid option '${key}'`)
    }
    return val
  }

  try {
    const actionId = action.action as ActionId
    switch (actionId) {
      case ActionId.Program:
        atem.changeProgramInput(getOptInt('input'), getOptInt('mixeffect'))
        break
      case ActionId.Preview:
        atem.changePreviewInput(getOptInt('input'), getOptInt('mixeffect'))
        break
      case ActionId.USKSource:
        atem.setUpstreamKeyerFillSource(getOptInt('fill'), getOptInt('mixeffect'), getOptInt('key'))
        atem.setUpstreamKeyerCutSource(getOptInt('cut'), getOptInt('mixeffect'), getOptInt('key'))
        break
      case ActionId.DSKSource:
        atem.setDownstreamKeyFillSource(getOptInt('fill'), getOptInt('key'))
        atem.setDownstreamKeyCutSource(getOptInt('cut'), getOptInt('key'))
        break
      case ActionId.Aux:
        atem.setAuxSource(getOptInt('input'), getOptInt('aux'))
        break
      case ActionId.Cut:
        atem.cut(getOptInt('mixeffect'))
        break
      case ActionId.USKOnAir: {
        const meIndex = getOptInt('mixeffect')
        const keyIndex = getOptInt('key')
        if (opt.onair === 'toggle') {
          const usk = getUSK(state, meIndex, keyIndex)
          atem.setUpstreamKeyerOnAir(!usk || !usk.onAir, meIndex, keyIndex)
        } else {
          atem.setUpstreamKeyerOnAir(opt.onair === 'true', meIndex, keyIndex)
        }
        break
      }
      case ActionId.DSKAuto:
        atem.autoDownstreamKey(getOptInt('downstreamKeyerId'))
        break
      case ActionId.DSKOnAir: {
        const keyIndex = getOptInt('key')
        if (opt.onair === 'toggle') {
          const dsk = getDSK(state, keyIndex)
          atem.setDownstreamKeyOnAir(!dsk || !dsk.onAir, keyIndex)
        } else {
          atem.setDownstreamKeyOnAir(opt.onair === 'true', keyIndex)
        }
        break
      }
      case ActionId.Auto:
        atem.autoTransition(getOptInt('mixeffect'))
        break
      case ActionId.MacroRun:
        const macroIndex = getOptInt('macro') - 1
        const { macroPlayer, macroRecorder } = state.macro
        if (opt.action === 'runContinue' && macroPlayer.isWaiting && macroPlayer.macroIndex === macroIndex) {
          atem.macroContinue()
        } else if (macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex) {
          atem.macroStopRecord()
        } else {
          atem.macroRun(macroIndex)
        }
        break
      case ActionId.MacroContinue:
        atem.macroContinue()
        break
      case ActionId.MacroStop:
        atem.macroStop()
        break
      case ActionId.MultiviewerWindowSource:
        atem.setMultiViewerSource(
          {
            windowIndex: getOptInt('windowIndex'),
            source: getOptInt('source')
          },
          getOptInt('multiViewerId')
        )
        break
      case ActionId.SuperSourceBoxSource:
        atem.setSuperSourceBoxSettings(
          {
            source: getOptInt('source')
          },
          getOptInt('boxIndex'),
          opt['ssrcId'] && model.SSrc > 1 ? parseInt(opt['ssrcId'], 10) : 0
        )
        break
      default:
        assertUnreachable(actionId)
        instance.debug('Unknown action: ' + action.action)
    }
  } catch (e) {
    instance.debug('Action failed: ' + e)
  }
}
