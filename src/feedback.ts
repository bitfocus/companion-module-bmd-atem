import InstanceSkel = require('../../../instance_skel')
import { CompanionFeedbacks, CompanionInputFieldColor } from '../../../instance_skel_types'
import { AtemConfig } from './config'
import {
  AtemMEPicker,
  AtemMESourcePicker,
  AtemUSKPicker,
  AtemDSKPicker,
  AtemAuxPicker,
  AtemMultiviewerPicker,
  AtemKeyFillSourcePicker,
  AtemAuxSourcePicker,
  AtemSuperSourceBoxPicker,
  AtemSuperSourceBoxSourcePicker,
  AtemMultiviewSourcePicker,
  AtemMultiviewWindowPicker
} from './input'
import { ModelSpec } from './models'
import { AtemState } from 'atem-connection'

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
  SSrcBoxSource = 'ssrc_box_source'
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
          type: 'textinput',
          label: 'Macro Number (1-100)',
          id: 'macroIndex',
          default: '1',
          regex: '/^([1-9]|[1-9][0-9]|100)$/'
        },
        {
          type: 'dropdown',
          label: 'State',
          id: 'state',
          default: 'isWaiting',
          choices: [
            { id: 'isRunning', label: 'Is Running' },
            { id: 'isWaiting', label: 'Is Waiting' },
            { id: 'isRecording', label: 'Is Recording' },
            { id: 'isUsed', label: 'Is Used' }
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
        AtemMultiviewWindowPicker(),
        AtemMultiviewSourcePicker(model, state)
      ]
    }
  }

  if (model.SSrc) {
    feedbacks[FeedbackId.SSrcBoxSource] = {
      label: 'Change colors from SuperSorce box source',
      description: 'If the specified SuperSource box is set to the specified source, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(255, 255, 0)),
        AtemSuperSourceBoxPicker(),
        AtemSuperSourceBoxSourcePicker(model, state)
      ]
    }
  }

  return feedbacks
}
