import { AtemState, Enums } from 'atem-connection'
import * as _ from 'underscore'
import InstanceSkel = require('../../../instance_skel')
import {
  CompanionFeedbackEvent,
  CompanionFeedbackResult,
  CompanionFeedbacks,
  CompanionInputFieldColor
} from '../../../instance_skel_types'
import { GetMacroChoices } from './choices'
import { AtemConfig } from './config'
import {
  AtemAuxPicker,
  AtemAuxSourcePicker,
  AtemDSKPicker,
  AtemKeyFillSourcePicker,
  AtemMEPicker,
  AtemMESourcePicker,
  AtemMultiviewerPicker,
  AtemMultiviewSourcePicker,
  AtemMultiviewWindowPicker,
  AtemSuperSourceBoxPicker,
  AtemSuperSourceBoxSourcePicker,
  AtemSuperSourceIdPicker,
  AtemTransitionRatePicker,
  AtemTransitionStylePicker,
  AtemUSKPicker
} from './input'
import { ModelSpec } from './models'
import { getDSK, getME, getMultiviewerWindow, getSuperSourceBox, getUSK } from './state'
import { assertUnreachable } from './util'

export enum FeedbackId {
  PreviewBG = 'preview_bg',
  PreviewBG2 = 'preview_bg_2',
  PreviewBG3 = 'preview_bg_3',
  PreviewBG4 = 'preview_bg_4',
  ProgramBG = 'program_bg',
  ProgramBG2 = 'program_bg_2',
  ProgramBG3 = 'program_bg_3',
  ProgramBG4 = 'program_bg_4',
  AuxBG = 'aux_bg',
  USKBG = 'usk_bg',
  USKSource = 'usk_source',
  DSKBG = 'dsk_bg',
  DSKSource = 'dsk_source',
  Macro = 'macro',
  MVSource = 'mv_source',
  SSrcBoxSource = 'ssrc_box_source',
  TransitionStyle = 'transitionStyle',
  TransitionRate = 'transitionRate'
}

export enum MacroFeedbackType {
  IsRunning = 'isRunning',
  IsWaiting = 'isWaiting',
  IsRecording = 'isRecording',
  IsUsed = 'isUsed'
}

export function ForegroundPicker(color: number): CompanionInputFieldColor {
  return {
    type: 'colorpicker',
    label: 'Foreground color',
    id: 'fg',
    default: color
  }
}
export function BackgroundPicker(color: number): CompanionInputFieldColor {
  return {
    type: 'colorpicker',
    label: 'Background color',
    id: 'bg',
    default: color
  }
}

export function GetFeedbacksList(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
  const feedbacks: CompanionFeedbacks = {}

  // Preview
  feedbacks[FeedbackId.PreviewBG] = {
    label: 'Change colors from preview',
    description: 'If the input specified is in use by preview on the M/E stage specified, change colors of the bank',
    options: [
      ForegroundPicker(instance.rgb(255, 255, 255)),
      BackgroundPicker(instance.rgb(0, 255, 0)),
      AtemMESourcePicker(model, state, 0),
      AtemMEPicker(model, 0)
    ]
  }
  if (model.MEs >= 2) {
    feedbacks[FeedbackId.PreviewBG2] = {
      label: 'Change colors from two preview sources',
      description:
        'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(0, 255, 0)),
        AtemMESourcePicker(model, state, 1),
        AtemMEPicker(model, 1),
        AtemMESourcePicker(model, state, 2),
        AtemMEPicker(model, 2)
      ]
    }
  }
  if (model.MEs >= 3) {
    feedbacks[FeedbackId.PreviewBG3] = {
      label: 'Change colors from three preview sources',
      description:
        'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(0, 255, 0)),
        AtemMESourcePicker(model, state, 1),
        AtemMEPicker(model, 1),
        AtemMESourcePicker(model, state, 2),
        AtemMEPicker(model, 2),
        AtemMESourcePicker(model, state, 3),
        AtemMEPicker(model, 3)
      ]
    }
  }
  if (model.MEs >= 4) {
    feedbacks[FeedbackId.PreviewBG4] = {
      label: 'Change colors from four preview sources',
      description:
        'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(0, 255, 0)),
        AtemMESourcePicker(model, state, 1),
        AtemMEPicker(model, 1),
        AtemMESourcePicker(model, state, 2),
        AtemMEPicker(model, 2),
        AtemMESourcePicker(model, state, 3),
        AtemMEPicker(model, 3),
        AtemMESourcePicker(model, state, 4),
        AtemMEPicker(model, 4)
      ]
    }
  }

  // Program
  feedbacks[FeedbackId.ProgramBG] = {
    label: 'Change colors from program',
    description: 'If the input specified is in use by program on the M/E stage specified, change colors of the bank',
    options: [
      ForegroundPicker(instance.rgb(255, 255, 255)),
      BackgroundPicker(instance.rgb(255, 0, 0)),
      AtemMESourcePicker(model, state, 0),
      AtemMEPicker(model, 0)
    ]
  }
  if (model.MEs >= 2) {
    feedbacks[FeedbackId.ProgramBG2] = {
      label: 'Change colors from two program sources',
      description:
        'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(255, 0, 0)),
        AtemMESourcePicker(model, state, 1),
        AtemMEPicker(model, 1),
        AtemMESourcePicker(model, state, 2),
        AtemMEPicker(model, 2)
      ]
    }
  }
  if (model.MEs >= 3) {
    feedbacks[FeedbackId.ProgramBG3] = {
      label: 'Change colors from three program sources',
      description:
        'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(255, 0, 0)),
        AtemMESourcePicker(model, state, 1),
        AtemMEPicker(model, 1),
        AtemMESourcePicker(model, state, 2),
        AtemMEPicker(model, 2),
        AtemMESourcePicker(model, state, 3),
        AtemMEPicker(model, 3)
      ]
    }
  }
  if (model.MEs >= 4) {
    feedbacks[FeedbackId.ProgramBG4] = {
      label: 'Change colors from four program sources',
      description:
        'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(255, 0, 0)),
        AtemMESourcePicker(model, state, 1),
        AtemMEPicker(model, 1),
        AtemMESourcePicker(model, state, 2),
        AtemMEPicker(model, 2),
        AtemMESourcePicker(model, state, 3),
        AtemMEPicker(model, 3),
        AtemMESourcePicker(model, state, 4),
        AtemMEPicker(model, 4)
      ]
    }
  }

  // Aux
  if (model.auxes) {
    feedbacks[FeedbackId.AuxBG] = {
      label: 'Change colors from AUX bus',
      description: 'If the input specified is in use by the aux bus specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(255, 255, 0)),
        AtemAuxPicker(model),
        AtemAuxSourcePicker(model, state)
      ]
    }
  }

  if (model.USKs) {
    feedbacks[FeedbackId.USKBG] = {
      label: 'Change colors from upstream keyer state',
      description: 'If the specified upstream keyer is active, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(255, 0, 0)),
        AtemMEPicker(model, 0),
        AtemUSKPicker(model)
      ]
    }
    feedbacks[FeedbackId.USKSource] = {
      label: 'Change colors from upstream keyer fill source',
      description: 'If the input specified is in use by the USK specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(238, 238, 0)),
        AtemMEPicker(model, 0),
        AtemUSKPicker(model),
        AtemKeyFillSourcePicker(model, state)
      ]
    }
  }

  if (model.DSKs) {
    feedbacks[FeedbackId.DSKBG] = {
      label: 'Change colors from downstream keyer state',
      description: 'If the specified downstream keyer is active, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(255, 0, 0)),
        AtemDSKPicker(model)
      ]
    }
    feedbacks[FeedbackId.DSKSource] = {
      label: 'Change colors from downstream keyer fill source',
      description: 'If the input specified is in use by the DSK specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(238, 238, 0)),
        AtemDSKPicker(model),
        AtemKeyFillSourcePicker(model, state)
      ]
    }
  }

  if (model.macros) {
    feedbacks[FeedbackId.Macro] = {
      label: 'Change colors from macro state',
      description: 'If the specified macro is running or waiting, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(238, 238, 0)),
        {
          type: 'dropdown',
          label: 'Macro Number (1-100)',
          id: 'macroIndex',
          default: 1,
          choices: GetMacroChoices(model, state)
        },
        {
          type: 'dropdown',
          label: 'State',
          id: 'state',
          default: MacroFeedbackType.IsWaiting,
          choices: [
            { id: MacroFeedbackType.IsRunning, label: 'Is Running' },
            { id: MacroFeedbackType.IsWaiting, label: 'Is Waiting' },
            { id: MacroFeedbackType.IsRecording, label: 'Is Recording' },
            { id: MacroFeedbackType.IsUsed, label: 'Is Used' }
          ]
        }
      ]
    }
  }

  if (model.MVs) {
    feedbacks[FeedbackId.MVSource] = {
      label: 'Change colors from MV window',
      description: 'If the specified MV window is set to the specified source, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(255, 255, 0)),
        AtemMultiviewerPicker(model),
        AtemMultiviewWindowPicker(model),
        AtemMultiviewSourcePicker(model, state)
      ]
    }
  }

  if (model.SSrc) {
    feedbacks[FeedbackId.SSrcBoxSource] = {
      label: 'Change colors from SuperSorce box source',
      description: 'If the specified SuperSource box is set to the specified source, change color of the bank',
      options: _.compact([
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(255, 255, 0)),
        AtemSuperSourceIdPicker(model),
        AtemSuperSourceBoxPicker(),
        AtemSuperSourceBoxSourcePicker(model, state)
      ])
    }
  }

  feedbacks[FeedbackId.TransitionStyle] = {
    label: 'Change colors from transition style',
    description: 'If the specified tansition style is active, change color of the bank',
    options: [
      ForegroundPicker(instance.rgb(0, 0, 0)),
      BackgroundPicker(instance.rgb(255, 255, 0)),
      AtemMEPicker(model, 0),
      AtemTransitionStylePicker()
    ]
  }
  feedbacks[FeedbackId.TransitionRate] = {
    label: 'Change colors from transition rate',
    description: 'If the specified tansition rate is active, change color of the bank',
    options: [
      ForegroundPicker(instance.rgb(0, 0, 0)),
      BackgroundPicker(instance.rgb(255, 255, 0)),
      AtemMEPicker(model, 0),
      AtemTransitionStylePicker(),
      AtemTransitionRatePicker()
    ]
  }

  return feedbacks
}

export function ExecuteFeedback(
  instance: InstanceSkel<AtemConfig>,
  state: AtemState,
  feedback: CompanionFeedbackEvent
): CompanionFeedbackResult {
  const opt = feedback.options
  const getOptColors = () => ({ color: parseInt(opt.fg, 10), bgcolor: parseInt(opt.bg, 10) })

  const feedbackType = feedback.type as FeedbackId
  switch (feedbackType) {
    case FeedbackId.PreviewBG: {
      const me = getME(state, opt.mixeffect)
      if (me && me.previewInput === parseInt(opt.input, 10)) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.PreviewBG2: {
      const me1 = getME(state, opt.mixeffect1)
      const me2 = getME(state, opt.mixeffect2)
      if (
        me1 &&
        me1.previewInput === parseInt(opt.input1, 10) &&
        me2 &&
        me2.previewInput === parseInt(opt.input2, 10)
      ) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.PreviewBG3: {
      const me1 = getME(state, opt.mixeffect1)
      const me2 = getME(state, opt.mixeffect2)
      const me3 = getME(state, opt.mixeffect3)
      if (
        me1 &&
        me1.previewInput === parseInt(opt.input1, 10) &&
        me2 &&
        me2.previewInput === parseInt(opt.input2, 10) &&
        me3 &&
        me3.previewInput === parseInt(opt.input3, 10)
      ) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.PreviewBG4: {
      const me1 = getME(state, opt.mixeffect1)
      const me2 = getME(state, opt.mixeffect2)
      const me3 = getME(state, opt.mixeffect3)
      const me4 = getME(state, opt.mixeffect4)
      if (
        me1 &&
        me1.previewInput === parseInt(opt.input1, 10) &&
        me2 &&
        me2.previewInput === parseInt(opt.input2, 10) &&
        me3 &&
        me3.previewInput === parseInt(opt.input3, 10) &&
        me4 &&
        me4.previewInput === parseInt(opt.input4, 10)
      ) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.ProgramBG: {
      const me = getME(state, opt.mixeffect)
      if (me && me.programInput === parseInt(opt.input, 10)) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.ProgramBG2: {
      const me1 = getME(state, opt.mixeffect1)
      const me2 = getME(state, opt.mixeffect2)
      if (
        me1 &&
        me1.programInput === parseInt(opt.input1, 10) &&
        me2 &&
        me2.programInput === parseInt(opt.input2, 10)
      ) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.ProgramBG3: {
      const me1 = getME(state, opt.mixeffect1)
      const me2 = getME(state, opt.mixeffect2)
      const me3 = getME(state, opt.mixeffect3)
      if (
        me1 &&
        me1.programInput === parseInt(opt.input1, 10) &&
        me2 &&
        me2.programInput === parseInt(opt.input2, 10) &&
        me3 &&
        me3.programInput === parseInt(opt.input3, 10)
      ) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.ProgramBG4: {
      const me1 = getME(state, opt.mixeffect1)
      const me2 = getME(state, opt.mixeffect2)
      const me3 = getME(state, opt.mixeffect3)
      const me4 = getME(state, opt.mixeffect4)
      if (
        me1 &&
        me1.programInput === parseInt(opt.input1, 10) &&
        me2 &&
        me2.programInput === parseInt(opt.input2, 10) &&
        me3 &&
        me3.programInput === parseInt(opt.input3, 10) &&
        me4 &&
        me4.programInput === parseInt(opt.input4, 10)
      ) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.AuxBG:
      const auxSource = state.video.auxilliaries[opt.aux]
      if (auxSource === parseInt(opt.input, 10)) {
        return getOptColors()
      }
      break
    case FeedbackId.USKBG: {
      const usk = getUSK(state, opt.mixeffect, opt.key)
      if (usk && usk.onAir) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.USKSource: {
      const usk = getUSK(state, opt.mixeffect, opt.key)
      if (usk && usk.fillSource === parseInt(opt.fill, 10)) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.DSKBG: {
      const dsk = getDSK(state, opt.key)
      if (dsk && dsk.onAir) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.DSKSource: {
      const dsk = getDSK(state, opt.key)
      if (dsk && dsk.sources.fillSource === parseInt(opt.fill, 10)) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.Macro: {
      let macroIndex = parseInt(opt.macroIndex, 10)
      if (!isNaN(macroIndex)) {
        macroIndex -= 1
        const { macroPlayer, macroRecorder } = state.macro
        const type = opt.state as MacroFeedbackType

        let isActive = false
        switch (type) {
          case MacroFeedbackType.IsUsed:
            const macro = state.macro.macroProperties[macroIndex]
            isActive = macro && macro.isUsed
            break
          case MacroFeedbackType.IsRecording:
            isActive = macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex
            break
          case MacroFeedbackType.IsRunning:
            isActive = macroPlayer.isRunning && macroPlayer.macroIndex === macroIndex
            break
          case MacroFeedbackType.IsWaiting:
            isActive = macroPlayer.isWaiting && macroPlayer.macroIndex === macroIndex
            break
          default:
            assertUnreachable(type)
        }

        if (isActive) {
          return getOptColors()
        }
      }
      break
    }
    case FeedbackId.MVSource: {
      const window = getMultiviewerWindow(state, opt.multiViewerId, opt.windowIndex)
      if (window && window.source === parseInt(opt.source, 10)) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.SSrcBoxSource: {
      const box = getSuperSourceBox(state, opt.boxIndex, opt.ssrcId || 0)
      if (box && box.source === parseInt(opt.source, 10)) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.TransitionStyle: {
      const me = getME(state, opt.mixeffect)
      if (me && me.transitionProperties.style === parseInt(opt.style, 10)) {
        return getOptColors()
      }
      break
    }
    case FeedbackId.TransitionRate: {
      const me = getME(state, opt.mixeffect)
      if (me && me.transitionSettings) {
        const style = parseInt(opt.style, 10) as Enums.TransitionStyle
        const rate = parseInt(opt.rate, 10)
        switch (style) {
          case Enums.TransitionStyle.MIX:
            if (me.transitionSettings.mix.rate === rate) {
              return getOptColors()
            }
            break
          case Enums.TransitionStyle.DIP:
            if (me.transitionSettings.dip.rate === rate) {
              return getOptColors()
            }
            break
          case Enums.TransitionStyle.WIPE:
            if (me.transitionSettings.wipe.rate === rate) {
              return getOptColors()
            }
            break
          case Enums.TransitionStyle.DVE:
            if (me.transitionSettings.DVE.rate === rate) {
              return getOptColors()
            }
            break
          case Enums.TransitionStyle.STING:
            break
          default:
            assertUnreachable(style)
        }
      }
      break
    }
    default:
      assertUnreachable(feedbackType)
      instance.debug('Unknown action: ' + feedback.type)
  }

  return {}
}
