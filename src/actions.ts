import { Atem, AtemState, Enums } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionAction, CompanionActionEvent, CompanionActions } from '../../../instance_skel_types'
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
import { assertUnreachable, calculateTransitionSelection, literal, MEDIA_PLAYER_SOURCE_CLIP_OFFSET, compact } from './util'

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

type CompanionActionExt = CompanionAction // & Required<Pick<CompanionAction, 'callback'>>
type CompanionActionsExt = { [id in ActionId]: CompanionActionExt | undefined }

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function meActions(model: ModelSpec, state: AtemState) {
  return {
    [ActionId.Program]: literal<CompanionActionExt>({
      label: 'Set input on Program',
      options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)]
    }),
    [ActionId.Preview]: literal<CompanionActionExt>({
      label: 'Set input on Preview',
      options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)]
    }),
    [ActionId.Cut]: literal<CompanionActionExt>({
      label: 'CUT operation',
      options: [AtemMEPicker(model, 0)]
    }),
    [ActionId.Auto]: literal<CompanionActionExt>({
      label: 'AUTO transition operation',
      options: [AtemMEPicker(model, 0)]
    }),

    [ActionId.USKSource]: model.USKs
      ? literal<CompanionActionExt>({
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
      ? literal<CompanionActionExt>({
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
    [ActionId.TransitionStyle]: literal<CompanionActionExt>({
      label: 'Change transition style',
      options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(model.media.clips === 0)]
    }),
    [ActionId.TransitionRate]: literal<CompanionActionExt>({
      label: 'Change transition rate',
      options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(true), AtemRatePicker('Transition Rate')]
    }),
    [ActionId.TransitionSelection]: literal<CompanionActionExt>({
      label: 'Change transition selection',
      options: [AtemMEPicker(model, 0), ...AtemTransitionSelectionPickers(model)]
    }),
    [ActionId.FadeToBlackAuto]: literal<CompanionActionExt>({
      label: 'AUTO fade to black',
      options: [AtemMEPicker(model, 0)]
    }),
    [ActionId.FadeToBlackRate]: literal<CompanionActionExt>({
      label: 'Change fade to black rate',
      options: [AtemMEPicker(model, 0), AtemRatePicker('Rate')]
    })
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function dskActions(model: ModelSpec, state: AtemState) {
  return {
    [ActionId.DSKSource]: model.DSKs
      ? literal<CompanionActionExt>({
          label: 'Set inputs on Downstream KEY',
          options: [AtemDSKPicker(model), AtemKeyFillSourcePicker(model, state), AtemKeyCutSourcePicker(model, state)]
        })
      : undefined,
    [ActionId.DSKAuto]: model.DSKs
      ? literal<CompanionActionExt>({
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
      ? literal<CompanionActionExt>({
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function macroActions(model: ModelSpec, state: AtemState) {
  return {
    [ActionId.MacroRun]: model.macros
      ? literal<CompanionActionExt>({
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
      ? literal<CompanionActionExt>({ label: 'Continue MACRO', options: [] })
      : undefined,
    [ActionId.MacroStop]: model.macros
      ? literal<CompanionActionExt>({ label: 'Stop MACROS', options: [] })
      : undefined
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ssrcActions(model: ModelSpec, state: AtemState) {
  return {
    [ActionId.SuperSourceBoxSource]: model.SSrc
      ? literal<CompanionActionExt>({
          label: 'Change SuperSource box source',
          options: compact([
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker(),
            AtemSuperSourceBoxSourcePicker(model, state)
          ])
        })
      : undefined,
    [ActionId.SuperSourceBoxOnAir]: model.SSrc
      ? literal<CompanionActionExt>({
          label: 'Change SuperSource box enabled',
          options: compact([
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
      ? literal<CompanionActionExt>({
          label: 'Change SuperSource box properties',
          options: compact([
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker(),
            ...AtemSuperSourcePropertiesPickers()
          ])
        })
      : undefined
  }
}

export function GetActionsList(model: ModelSpec, state: AtemState): CompanionActions {
  const actions: CompanionActionsExt = {
    ...meActions(model, state),
    ...dskActions(model, state),
    ...macroActions(model, state),
    ...ssrcActions(model, state),
    [ActionId.Aux]: model.auxes
      ? literal<CompanionActionExt>({
          label: 'Set AUX bus',
          options: [AtemAuxPicker(model), AtemAuxSourcePicker(model, state)]
        })
      : undefined,
    [ActionId.MultiviewerWindowSource]: model.MVs
      ? literal<CompanionActionExt>({
          label: 'Change MV window source',
          options: [
            AtemMultiviewerPicker(model),
            AtemMultiviewWindowPicker(model),
            AtemMultiviewSourcePicker(model, state)
          ]
        })
      : undefined,
    [ActionId.MediaPlayerSource]: model.media.players
      ? literal<CompanionActionExt>({
          label: 'Change media player source',
          options: [AtemMediaPlayerPicker(model), AtemMediaPlayerSourcePicker(model, state)]
        })
      : undefined
  }

  return actions
}

export function HandleAction(
  instance: InstanceSkel<AtemConfig>,
  atem: Atem,
  model: ModelSpec,
  state: AtemState,
  action: CompanionActionEvent
): void {
  try {
    const res = executeAction(instance, atem, model, state, action)
    res.catch(e => {
      instance.debug('Action execution error: ' + e)
    })
  } catch (e) {
    instance.debug('Action failed: ' + e)
  }
}

function executeAction(
  instance: InstanceSkel<AtemConfig>,
  atem: Atem,
  model: ModelSpec,
  state: AtemState,
  action: CompanionActionEvent
): Promise<unknown> {
  const opt = action.options
  const getOptNumber = (key: string): number => {
    const val = Number(opt[key])
    if (isNaN(val)) {
      throw new Error(`Invalid option '${key}'`)
    }
    return val
  }
  const getOptBool = (key: string): boolean => {
    return !!opt[key]
  }

  /* tslint:enable:no-switch-case-fall-through */
  const actionId = action.action as ActionId
  switch (actionId) {
    case ActionId.Program:
      return atem.changeProgramInput(getOptNumber('input'), getOptNumber('mixeffect'))
    case ActionId.Preview:
      return atem.changePreviewInput(getOptNumber('input'), getOptNumber('mixeffect'))
    case ActionId.USKSource:
      return Promise.all([
        atem.setUpstreamKeyerFillSource(getOptNumber('fill'), getOptNumber('mixeffect'), getOptNumber('key')),
        atem.setUpstreamKeyerCutSource(getOptNumber('cut'), getOptNumber('mixeffect'), getOptNumber('key'))
      ])
    case ActionId.DSKSource:
      return Promise.all([
        atem.setDownstreamKeyFillSource(getOptNumber('fill'), getOptNumber('key')),
        atem.setDownstreamKeyCutSource(getOptNumber('cut'), getOptNumber('key'))
      ])
    case ActionId.Aux:
      return atem.setAuxSource(getOptNumber('input'), getOptNumber('aux'))
    case ActionId.Cut:
      return atem.cut(getOptNumber('mixeffect'))
    case ActionId.USKOnAir: {
      const meIndex = getOptNumber('mixeffect')
      const keyIndex = getOptNumber('key')
      if (opt.onair === 'toggle') {
        const usk = getUSK(state, meIndex, keyIndex)
        return atem.setUpstreamKeyerOnAir(!usk || !usk.onAir, meIndex, keyIndex)
      } else {
        return atem.setUpstreamKeyerOnAir(opt.onair === 'true', meIndex, keyIndex)
      }
    }
    case ActionId.DSKAuto:
      return atem.autoDownstreamKey(getOptNumber('downstreamKeyerId'))
    case ActionId.DSKOnAir: {
      const keyIndex = getOptNumber('key')
      if (opt.onair === 'toggle') {
        const dsk = getDSK(state, keyIndex)
        return atem.setDownstreamKeyOnAir(!dsk || !dsk.onAir, keyIndex)
      } else {
        return atem.setDownstreamKeyOnAir(opt.onair === 'true', keyIndex)
      }
    }
    case ActionId.Auto:
      return atem.autoTransition(getOptNumber('mixeffect'))
    case ActionId.MacroRun: {
      const macroIndex = getOptNumber('macro') - 1
      const { macroPlayer, macroRecorder } = state.macro
      if (opt.action === 'runContinue' && macroPlayer.isWaiting && macroPlayer.macroIndex === macroIndex) {
        return atem.macroContinue()
      } else if (macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex) {
        return atem.macroStopRecord()
      } else {
        return atem.macroRun(macroIndex)
      }
    }
    case ActionId.MacroContinue:
      return atem.macroContinue()
    case ActionId.MacroStop:
      return atem.macroStop()
    case ActionId.MultiviewerWindowSource:
      return atem.setMultiViewerSource(
        {
          windowIndex: getOptNumber('windowIndex'),
          source: getOptNumber('source')
        },
        getOptNumber('multiViewerId')
      )
    case ActionId.SuperSourceBoxOnAir: {
      const ssrcId = opt.ssrcId && model.SSrc > 1 ? Number(opt.ssrcId) : 0
      const boxIndex = getOptNumber('boxIndex')

      if (opt.onair === 'toggle') {
        const box = getSuperSourceBox(state, boxIndex, ssrcId)
        return atem.setSuperSourceBoxSettings(
          {
            enabled: !box || !box.enabled
          },
          boxIndex,
          ssrcId
        )
      } else {
        return atem.setSuperSourceBoxSettings(
          {
            enabled: opt.onair === 'true'
          },
          boxIndex,
          ssrcId
        )
      }
    }
    case ActionId.SuperSourceBoxSource:
      return atem.setSuperSourceBoxSettings(
        {
          source: getOptNumber('source')
        },
        getOptNumber('boxIndex'),
        opt.ssrcId && model.SSrc > 1 ? Number(opt.ssrcId) : 0
      )
    case ActionId.SuperSourceBoxProperties:
      return atem.setSuperSourceBoxSettings(
        {
          size: getOptNumber('size') * 1000,
          x: getOptNumber('x') * 100,
          y: getOptNumber('y') * 100,
          cropped: getOptBool('cropEnable'),
          cropTop: getOptNumber('cropTop') * 1000,
          cropBottom: getOptNumber('cropBottom') * 1000,
          cropLeft: getOptNumber('cropLeft') * 1000,
          cropRight: getOptNumber('cropRight') * 1000
        },
        getOptNumber('boxIndex'),
        opt.ssrcId && model.SSrc > 1 ? Number(opt.ssrcId) : 0
      )
    case ActionId.TransitionStyle:
      return atem.setTransitionStyle(
        {
          style: getOptNumber('style')
        },
        getOptNumber('mixeffect')
      )
    case ActionId.TransitionRate: {
      const style = getOptNumber('style') as Enums.TransitionStyle
      switch (style) {
        case Enums.TransitionStyle.MIX:
          return atem.setMixTransitionSettings(
            {
              rate: getOptNumber('rate')
            },
            getOptNumber('mixeffect')
          )
        case Enums.TransitionStyle.DIP:
          return atem.setDipTransitionSettings(
            {
              rate: getOptNumber('rate')
            },
            getOptNumber('mixeffect')
          )
        case Enums.TransitionStyle.WIPE:
          return atem.setWipeTransitionSettings(
            {
              rate: getOptNumber('rate')
            },
            getOptNumber('mixeffect')
          )
        case Enums.TransitionStyle.DVE:
          return atem.setDVETransitionSettings(
            {
              rate: getOptNumber('rate')
            },
            getOptNumber('mixeffect')
          )
        case Enums.TransitionStyle.STING:
          return Promise.resolve()
        default:
          assertUnreachable(style)
          instance.debug('Unknown transition style: ' + style)
          return Promise.resolve()
      }
    }
    case ActionId.TransitionSelection: {
      return atem.setTransitionStyle(
        {
          selection: calculateTransitionSelection(model.USKs, action.options)
        },
        getOptNumber('mixeffect')
      )
    }
    case ActionId.MediaPlayerSource: {
      const source = getOptNumber('source')
      if (source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
        return atem.setMediaPlayerSource(
          {
            sourceType: Enums.MediaSourceType.Clip,
            clipIndex: source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET
          },
          getOptNumber('mediaplayer')
        )
      } else {
        return atem.setMediaPlayerSource(
          {
            sourceType: Enums.MediaSourceType.Still,
            stillIndex: source
          },
          getOptNumber('mediaplayer')
        )
      }
    }
    case ActionId.FadeToBlackAuto:
      return atem.fadeToBlack(getOptNumber('mixeffect'))
    case ActionId.FadeToBlackRate:
      return atem.setFadeToBlackRate(getOptNumber('rate'), getOptNumber('mixeffect'))
    default:
      assertUnreachable(actionId)
      instance.debug('Unknown action: ' + action.action)
      return Promise.resolve()
  }
}
