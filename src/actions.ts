import { Atem, AtemState, Enums } from 'atem-connection'
import * as _ from 'underscore'
import InstanceSkel = require('../../../instance_skel')
import { CompanionAction, CompanionActionEvent } from '../../../instance_skel_types'
import { CHOICES_KEYTRANS, GetDSKIdChoices, GetMacroChoices } from './choices'
import { AtemConfig } from './config'
import {
  AtemAuxPicker,
  AtemAuxSourcePicker,
  AtemDSKPicker,
  AtemKeyCutSourcePicker,
  AtemKeyFillSourcePicker,
  AtemMediaPlayerPicker,
  AtemMediaPlayerSourcePicker,
  AtemMEPicker,
  AtemMESourcePicker,
  AtemMultiviewerPicker,
  AtemMultiviewSourcePicker,
  AtemMultiviewWindowPicker,
  AtemRatePicker,
  AtemSuperSourceBoxPicker,
  AtemSuperSourceBoxSourcePicker,
  AtemSuperSourceIdPicker,
  AtemSuperSourcePropertiesPickers,
  AtemTransitionSelectionPickers,
  AtemTransitionStylePicker,
  AtemUSKPicker
} from './input'
import { ModelSpec } from './models'
import { getDSK, getSuperSourceBox, getUSK } from './state'
import {
  assertUnreachable,
  calculateTransitionSelection,
  compactObj,
  literal,
  MEDIA_PLAYER_SOURCE_CLIP_OFFSET
} from './util'

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
  SuperSourceBoxSource = 'setSsrcBoxSource',
  SuperSourceBoxOnAir = 'setSsrcBoxEnable',
  SuperSourceBoxProperties = 'setSsrcBoxProperties',
  TransitionStyle = 'transitionStyle',
  TransitionSelection = 'transitionSelection',
  TransitionRate = 'transitionRate',
  MediaPlayerSource = 'mediaPlayerSource',
  FadeToBlackAuto = 'fadeToBlackAuto',
  FadeToBlackRate = 'fadeToBlackRate'
}

function meActions(model: ModelSpec, state: AtemState) {
  return {
    [ActionId.Program]: literal<Required<CompanionAction>>({
      label: 'Set input on Program',
      options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)]
    }),
    [ActionId.Preview]: literal<Required<CompanionAction>>({
      label: 'Set input on Preview',
      options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)]
    }),
    [ActionId.Cut]: literal<Required<CompanionAction>>({
      label: 'CUT operation',
      options: [AtemMEPicker(model, 0)]
    }),
    [ActionId.Auto]: literal<Required<CompanionAction>>({
      label: 'AUTO transition operation',
      options: [AtemMEPicker(model, 0)]
    }),

    [ActionId.USKSource]: model.USKs
      ? literal<Required<CompanionAction>>({
          label: 'Set inputs on Upstream KEY',
          options: [
            AtemMEPicker(model, 0),
            AtemUSKPicker(model),
            AtemKeyFillSourcePicker(model, state),
            AtemKeyCutSourcePicker(model, state)
          ]
        })
      : undefined,
    [ActionId.USKOnAir]: model.USKs
      ? literal<Required<CompanionAction>>({
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
        })
      : undefined,
    [ActionId.TransitionStyle]: literal<Required<CompanionAction>>({
      label: 'Change transition style',
      options: [AtemMEPicker(model, 0), AtemTransitionStylePicker()]
    }),
    [ActionId.TransitionRate]: literal<Required<CompanionAction>>({
      label: 'Change transition rate',
      options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(true), AtemRatePicker('Transition Rate')]
    }),
    [ActionId.TransitionSelection]: literal<Required<CompanionAction>>({
      label: 'Change transition selection',
      options: [AtemMEPicker(model, 0), ...AtemTransitionSelectionPickers(model)]
    }),
    [ActionId.FadeToBlackAuto]: literal<Required<CompanionAction>>({
      label: 'AUTO fade to black',
      options: [AtemMEPicker(model, 0)]
    }),
    [ActionId.FadeToBlackRate]: literal<Required<CompanionAction>>({
      label: 'Change fade to black rate',
      options: [AtemMEPicker(model, 0), AtemRatePicker('Rate')]
    })
  }
}

function dskActions(model: ModelSpec, state: AtemState) {
  return {
    [ActionId.DSKSource]: model.DSKs
      ? literal<Required<CompanionAction>>({
          label: 'Set inputs on Downstream KEY',
          options: [AtemDSKPicker(model), AtemKeyFillSourcePicker(model, state), AtemKeyCutSourcePicker(model, state)]
        })
      : undefined,
    [ActionId.DSKAuto]: model.DSKs
      ? literal<Required<CompanionAction>>({
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
        })
      : undefined,
    [ActionId.DSKOnAir]: model.DSKs
      ? literal<Required<CompanionAction>>({
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
        })
      : undefined
  }
}

function macroActions(model: ModelSpec, state: AtemState) {
  return {
    [ActionId.MacroRun]: model.macros
      ? literal<Required<CompanionAction>>({
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
              choices: [
                { id: 'run', label: 'Run' },
                { id: 'runContinue', label: 'Run/Continue' }
              ]
            }
          ]
        })
      : undefined,
    [ActionId.MacroContinue]: model.macros
      ? literal<Required<CompanionAction>>({ label: 'Continue MACRO', options: [] })
      : undefined,
    [ActionId.MacroStop]: model.macros
      ? literal<Required<CompanionAction>>({ label: 'Stop MACROS', options: [] })
      : undefined
  }
}

function ssrcActions(model: ModelSpec, state: AtemState) {
  return {
    [ActionId.SuperSourceBoxSource]: model.SSrc
      ? literal<Required<CompanionAction>>({
          label: 'Change SuperSource box source',
          options: _.compact([
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker(),
            AtemSuperSourceBoxSourcePicker(model, state)
          ])
        })
      : undefined,
    [ActionId.SuperSourceBoxOnAir]: model.SSrc
      ? literal<Required<CompanionAction>>({
          label: 'Change SuperSource box enabled',
          options: _.compact([
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker(),
            {
              id: 'onair',
              type: 'dropdown',
              label: 'On Air',
              default: 'true',
              choices: CHOICES_KEYTRANS
            }
          ])
        })
      : undefined,
    [ActionId.SuperSourceBoxProperties]: model.SSrc
      ? literal<Required<CompanionAction>>({
          label: 'Change SuperSource box properties',
          options: _.compact([
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker(),
            ...AtemSuperSourcePropertiesPickers()
          ])
        })
      : undefined
  }
}

export function GetActionsList(model: ModelSpec, state: AtemState) {
  const actions: { [id in ActionId]: Required<CompanionAction> | undefined } = {
    ...meActions(model, state),
    ...dskActions(model, state),
    ...macroActions(model, state),
    ...ssrcActions(model, state),
    [ActionId.Aux]: model.auxes
      ? literal<Required<CompanionAction>>({
          label: 'Set AUX bus',
          options: [AtemAuxPicker(model), AtemAuxSourcePicker(model, state)]
        })
      : undefined,
    [ActionId.MultiviewerWindowSource]: model.MVs
      ? literal<Required<CompanionAction>>({
          label: 'Change MV window source',
          options: [
            AtemMultiviewerPicker(model),
            AtemMultiviewWindowPicker(model),
            AtemMultiviewSourcePicker(model, state)
          ]
        })
      : undefined,
    [ActionId.MediaPlayerSource]: model.media.players
      ? literal<Required<CompanionAction>>({
          label: 'Change media player source',
          options: [AtemMediaPlayerPicker(model), AtemMediaPlayerSourcePicker(model, state)]
        })
      : undefined
  }

  return compactObj(actions)
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
  const getOptBool = (key: string) => {
    return !!opt[key]
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
      case ActionId.SuperSourceBoxOnAir:
        const ssrcId = opt.ssrcId && model.SSrc > 1 ? parseInt(opt.ssrcId, 10) : 0
        const boxIndex = getOptInt('boxIndex')

        if (opt.onair === 'toggle') {
          const box = getSuperSourceBox(state, boxIndex, ssrcId)
          atem.setSuperSourceBoxSettings(
            {
              enabled: !box || !box.enabled
            },
            boxIndex,
            ssrcId
          )
        } else {
          atem.setSuperSourceBoxSettings(
            {
              enabled: opt.onair === 'true'
            },
            boxIndex,
            ssrcId
          )
        }
        break
      case ActionId.SuperSourceBoxSource:
        atem.setSuperSourceBoxSettings(
          {
            source: getOptInt('source')
          },
          getOptInt('boxIndex'),
          opt.ssrcId && model.SSrc > 1 ? parseInt(opt.ssrcId, 10) : 0
        )
        break
      case ActionId.SuperSourceBoxProperties:
        atem.setSuperSourceBoxSettings(
          {
            size: getOptInt('size'),
            x: getOptInt('x'),
            y: getOptInt('y'),
            cropped: getOptBool('cropEnable'),
            cropTop: getOptInt('cropTop'),
            cropBottom: getOptInt('cropBottom'),
            cropLeft: getOptInt('cropLeft'),
            cropRight: getOptInt('cropRight')
          },
          getOptInt('boxIndex'),
          opt.ssrcId && model.SSrc > 1 ? parseInt(opt.ssrcId, 10) : 0
        )
        break
      case ActionId.TransitionStyle:
        atem.setTransitionStyle(
          {
            style: getOptInt('style')
          },
          getOptInt('mixeffect')
        )
        break
      case ActionId.TransitionRate:
        const style = getOptInt('style') as Enums.TransitionStyle
        switch (style) {
          case Enums.TransitionStyle.MIX:
            atem.setMixTransitionSettings(
              {
                rate: getOptInt('rate')
              },
              getOptInt('mixeffect')
            )
            break
          case Enums.TransitionStyle.DIP:
            atem.setDipTransitionSettings(
              {
                rate: getOptInt('rate')
              },
              getOptInt('mixeffect')
            )
            break
          case Enums.TransitionStyle.WIPE:
            atem.setWipeTransitionSettings(
              {
                rate: getOptInt('rate')
              },
              getOptInt('mixeffect')
            )
            break
          case Enums.TransitionStyle.DVE:
            atem.setDVETransitionSettings(
              {
                rate: getOptInt('rate')
              },
              getOptInt('mixeffect')
            )
            break
          case Enums.TransitionStyle.STING:
            break
          default:
            assertUnreachable(style)
            instance.debug('Unknown transition style: ' + style)
            break
        }
        break
      case ActionId.TransitionSelection: {
        atem.setTransitionStyle(
          {
            selection: calculateTransitionSelection(model.USKs, action.options)
          },
          getOptInt('mixeffect')
        )
        break
      }
      case ActionId.MediaPlayerSource:
        const source = getOptInt('source')
        if (source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
          atem.setMediaPlayerSource(
            {
              sourceType: Enums.MediaSourceType.Clip,
              clipIndex: source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET
            },
            getOptInt('mediaplayer')
          )
        } else {
          atem.setMediaPlayerSource(
            {
              sourceType: Enums.MediaSourceType.Still,
              stillIndex: source
            },
            getOptInt('mediaplayer')
          )
        }
        break
      case ActionId.FadeToBlackAuto:
        atem.fadeToBlack(getOptInt('mixeffect'))
        break
      case ActionId.FadeToBlackRate:
        atem.setFadeToBlackRate(getOptInt('rate'), getOptInt('mixeffect'))
        break
      default:
        assertUnreachable(actionId)
        instance.debug('Unknown action: ' + action.action)
    }
  } catch (e) {
    instance.debug('Action failed: ' + e)
  }
}
