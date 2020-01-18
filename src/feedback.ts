import { AtemState, Enums } from 'atem-connection'
import * as _ from 'underscore'
import InstanceSkel = require('../../../instance_skel')
import {
  CompanionFeedback,
  CompanionFeedbackEvent,
  CompanionInputFieldColor,
  InputValue
} from '../../../instance_skel_types'
import { GetMacroChoices } from './choices'
import { AtemConfig } from './config'
import {
  AtemAuxPicker,
  AtemAuxSourcePicker,
  AtemDSKPicker,
  AtemFadeToBlackStatePicker,
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
import { getDSK, getMixEffect, getMultiviewerWindow, getSuperSourceBox, getUSK, TallyBySource } from './state'
import { assertUnreachable, calculateTransitionSelection, literal, MEDIA_PLAYER_SOURCE_CLIP_OFFSET } from './util'

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
  USKOnAir = 'usk_bg',
  USKSource = 'usk_source',
  DSKOnAir = 'dsk_bg',
  DSKSource = 'dsk_source',
  Macro = 'macro',
  MVSource = 'mv_source',
  SSrcBoxOnAir = 'ssrc_box_enable',
  SSrcBoxSource = 'ssrc_box_source',
  SSrcBoxProperties = 'ssrc_box_properties',
  TransitionStyle = 'transitionStyle',
  TransitionSelection = 'transitionSelection',
  TransitionRate = 'transitionRate',
  MediaPlayerSource = 'mediaPlayerSource',
  FadeToBlackIsBlack = 'fadeToBlackIsBlack',
  FadeToBlackRate = 'fadeToBlackRate',
  ProgramTally = 'program_tally',
  PreviewTally = 'preview_tally'
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

function getOptColors(evt: CompanionFeedbackEvent) {
  return {
    color: Number(evt.options.fg),
    bgcolor: Number(evt.options.bg)
  }
}

function tallyFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState, tally: TallyBySource) {
  return {
    [FeedbackId.ProgramTally]: literal<Required<CompanionFeedback>>({
      label: 'Change colors from mixer program tally',
      description: 'If the input specified has an active progam tally light, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(255, 0, 0)),
        AtemMESourcePicker(model, state, 0)
      ],
      callback: evt => {
        const source = tally[Number(evt.options.input)]
        if (source && source.program) {
          return getOptColors(evt)
        }
        return {}
      }
    }),
    [FeedbackId.PreviewTally]: literal<Required<CompanionFeedback>>({
      label: 'Change colors from mixer preview tally',
      description: 'If the input specified has an active preview tally light, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(0, 255, 0)),
        AtemMESourcePicker(model, state, 0)
      ],
      callback: evt => {
        const source = tally[Number(evt.options.input)]
        if (source && source.preview) {
          return getOptColors(evt)
        }
        return {}
      }
    })
  }
}

function previewFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
  return {
    [FeedbackId.PreviewBG]: literal<Required<CompanionFeedback>>({
      label: 'Change colors from one ME preview source',
      description: 'If the input specified is in use by preview on the M/E stage specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(0, 255, 0)),
        AtemMESourcePicker(model, state, 0),
        AtemMEPicker(model, 0)
      ],
      callback: evt => {
        const me = getMixEffect(state, evt.options.mixeffect)
        if (me && me.previewInput === Number(evt.options.input)) {
          return getOptColors(evt)
        }
        return {}
      }
    }),
    [FeedbackId.PreviewBG2]:
      model.MEs >= 2
        ? literal<Required<CompanionFeedback>>({
            label: 'Change colors from two ME preview sources',
            description:
              'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
            options: [
              ForegroundPicker(instance.rgb(0, 0, 0)),
              BackgroundPicker(instance.rgb(0, 255, 0)),
              AtemMESourcePicker(model, state, 1),
              AtemMEPicker(model, 1),
              AtemMESourcePicker(model, state, 2),
              AtemMEPicker(model, 2)
            ],
            callback: evt => {
              const me1 = getMixEffect(state, evt.options.mixeffect1)
              const me2 = getMixEffect(state, evt.options.mixeffect2)
              if (
                me1 &&
                me1.previewInput === Number(evt.options.input1) &&
                me2 &&
                me2.previewInput === Number(evt.options.input2)
              ) {
                return getOptColors(evt)
              }
              return {}
            }
          })
        : undefined,
    [FeedbackId.PreviewBG3]:
      model.MEs >= 2
        ? literal<Required<CompanionFeedback>>({
            label: 'Change colors from three ME preview sources',
            description:
              'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
            options: [
              ForegroundPicker(instance.rgb(0, 0, 0)),
              BackgroundPicker(instance.rgb(0, 255, 0)),
              AtemMESourcePicker(model, state, 1),
              AtemMEPicker(model, 1),
              AtemMESourcePicker(model, state, 2),
              AtemMEPicker(model, 2),
              AtemMESourcePicker(model, state, 3),
              AtemMEPicker(model, 3)
            ],
            callback: evt => {
              const me1 = getMixEffect(state, evt.options.mixeffect1)
              const me2 = getMixEffect(state, evt.options.mixeffect2)
              const me3 = getMixEffect(state, evt.options.mixeffect3)
              if (
                me1 &&
                me1.previewInput === Number(evt.options.input1) &&
                me2 &&
                me2.previewInput === Number(evt.options.input2) &&
                me3 &&
                me3.previewInput === Number(evt.options.input3)
              ) {
                return getOptColors(evt)
              }
              return {}
            }
          })
        : undefined,
    [FeedbackId.PreviewBG4]:
      model.MEs >= 2
        ? literal<Required<CompanionFeedback>>({
            label: 'Change colors from four ME preview sources',
            description:
              'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
            options: [
              ForegroundPicker(instance.rgb(0, 0, 0)),
              BackgroundPicker(instance.rgb(0, 255, 0)),
              AtemMESourcePicker(model, state, 1),
              AtemMEPicker(model, 1),
              AtemMESourcePicker(model, state, 2),
              AtemMEPicker(model, 2),
              AtemMESourcePicker(model, state, 3),
              AtemMEPicker(model, 3),
              AtemMESourcePicker(model, state, 4),
              AtemMEPicker(model, 4)
            ],
            callback: evt => {
              const me1 = getMixEffect(state, evt.options.mixeffect1)
              const me2 = getMixEffect(state, evt.options.mixeffect2)
              const me3 = getMixEffect(state, evt.options.mixeffect3)
              const me4 = getMixEffect(state, evt.options.mixeffect4)
              if (
                me1 &&
                me1.previewInput === Number(evt.options.input1) &&
                me2 &&
                me2.previewInput === Number(evt.options.input2) &&
                me3 &&
                me3.previewInput === Number(evt.options.input3) &&
                me4 &&
                me4.previewInput === Number(evt.options.input4)
              ) {
                return getOptColors(evt)
              }
              return {}
            }
          })
        : undefined
  }
}

function programFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
  return {
    [FeedbackId.ProgramBG]: literal<Required<CompanionFeedback>>({
      label: 'Change colors from one ME program source',
      description: 'If the input specified is in use by program on the M/E stage specified, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(255, 0, 0)),
        AtemMESourcePicker(model, state, 0),
        AtemMEPicker(model, 0)
      ],
      callback: evt => {
        const me = getMixEffect(state, evt.options.mixeffect)
        if (me && me.programInput === Number(evt.options.input)) {
          return getOptColors(evt)
        }
        return {}
      }
    }),
    [FeedbackId.ProgramBG2]:
      model.MEs >= 2
        ? literal<Required<CompanionFeedback>>({
            label: 'Change colors from two ME program sources',
            description:
              'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
            options: [
              ForegroundPicker(instance.rgb(255, 255, 255)),
              BackgroundPicker(instance.rgb(255, 0, 0)),
              AtemMESourcePicker(model, state, 1),
              AtemMEPicker(model, 1),
              AtemMESourcePicker(model, state, 2),
              AtemMEPicker(model, 2)
            ],
            callback: evt => {
              const me1 = getMixEffect(state, evt.options.mixeffect1)
              const me2 = getMixEffect(state, evt.options.mixeffect2)
              if (
                me1 &&
                me1.programInput === Number(evt.options.input1) &&
                me2 &&
                me2.programInput === Number(evt.options.input2)
              ) {
                return getOptColors(evt)
              }
              return {}
            }
          })
        : undefined,
    [FeedbackId.ProgramBG3]:
      model.MEs >= 2
        ? literal<Required<CompanionFeedback>>({
            label: 'Change colors from three ME program sources',
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
            ],
            callback: evt => {
              const me1 = getMixEffect(state, evt.options.mixeffect1)
              const me2 = getMixEffect(state, evt.options.mixeffect2)
              const me3 = getMixEffect(state, evt.options.mixeffect3)
              if (
                me1 &&
                me1.programInput === Number(evt.options.input1) &&
                me2 &&
                me2.programInput === Number(evt.options.input2) &&
                me3 &&
                me3.programInput === Number(evt.options.input3)
              ) {
                return getOptColors(evt)
              }
              return {}
            }
          })
        : undefined,
    [FeedbackId.ProgramBG4]:
      model.MEs >= 2
        ? literal<Required<CompanionFeedback>>({
            label: 'Change colors from four ME program sources',
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
            ],
            callback: evt => {
              const me1 = getMixEffect(state, evt.options.mixeffect1)
              const me2 = getMixEffect(state, evt.options.mixeffect2)
              const me3 = getMixEffect(state, evt.options.mixeffect3)
              const me4 = getMixEffect(state, evt.options.mixeffect4)
              if (
                me1 &&
                me1.programInput === Number(evt.options.input1) &&
                me2 &&
                me2.programInput === Number(evt.options.input2) &&
                me3 &&
                me3.programInput === Number(evt.options.input3) &&
                me4 &&
                me4.programInput === Number(evt.options.input4)
              ) {
                return getOptColors(evt)
              }
              return {}
            }
          })
        : undefined
  }
}

function uskFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
  return {
    [FeedbackId.USKOnAir]: model.USKs
      ? literal<Required<CompanionFeedback>>({
          label: 'Change colors from upstream keyer state',
          description: 'If the specified upstream keyer is active, change color of the bank',
          options: [
            ForegroundPicker(instance.rgb(255, 255, 255)),
            BackgroundPicker(instance.rgb(255, 0, 0)),
            AtemMEPicker(model, 0),
            AtemUSKPicker(model)
          ],
          callback: evt => {
            const usk = getUSK(state, evt.options.mixeffect, evt.options.key)
            if (usk && usk.onAir) {
              return getOptColors(evt)
            }
            return {}
          }
        })
      : undefined,
    [FeedbackId.USKSource]: model.USKs
      ? literal<Required<CompanionFeedback>>({
          label: 'Change colors from upstream keyer fill source',
          description: 'If the input specified is in use by the USK specified, change colors of the bank',
          options: [
            ForegroundPicker(instance.rgb(0, 0, 0)),
            BackgroundPicker(instance.rgb(238, 238, 0)),
            AtemMEPicker(model, 0),
            AtemUSKPicker(model),
            AtemKeyFillSourcePicker(model, state)
          ],
          callback: evt => {
            const usk = getUSK(state, evt.options.mixeffect, evt.options.key)
            if (usk && usk.fillSource === Number(evt.options.fill)) {
              return getOptColors(evt)
            }
            return {}
          }
        })
      : undefined
  }
}

function transitionFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
  return {
    [FeedbackId.TransitionStyle]: literal<Required<CompanionFeedback>>({
      label: 'Change colors from transition style',
      description: 'If the specified transition style is active, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(255, 255, 0)),
        AtemMEPicker(model, 0),
        AtemTransitionStylePicker(model.media.clips === 0)
      ],
      callback: evt => {
        const me = getMixEffect(state, evt.options.mixeffect)
        if (me && me.transitionProperties.style === Number(evt.options.style)) {
          return getOptColors(evt)
        }
        return {}
      }
    }),
    [FeedbackId.TransitionSelection]: literal<Required<CompanionFeedback>>({
      label: 'Change colors from transition selection',
      description: 'If the specified tansition selection is active, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(255, 255, 0)),
        AtemMEPicker(model, 0),
        ...AtemTransitionSelectionPickers(model)
      ],
      callback: evt => {
        const me = getMixEffect(state, evt.options.mixeffect)
        const expectedSelection = calculateTransitionSelection(model.USKs, evt.options)
        if (me && me.transitionProperties.selection === expectedSelection) {
          return getOptColors(evt)
        }
        return {}
      }
    }),
    [FeedbackId.TransitionRate]: literal<Required<CompanionFeedback>>({
      label: 'Change colors from transition rate',
      description: 'If the specified transition rate is active, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(255, 255, 0)),
        AtemMEPicker(model, 0),
        AtemTransitionStylePicker(true),
        AtemRatePicker('Transition Rate')
      ],
      callback: evt => {
        const me = getMixEffect(state, evt.options.mixeffect)
        if (me && me.transitionSettings) {
          const style = Number(evt.options.style) as Enums.TransitionStyle
          const rate = Number(evt.options.rate)
          switch (style) {
            case Enums.TransitionStyle.MIX:
              if (me.transitionSettings.mix?.rate === rate) {
                return getOptColors(evt)
              }
              break
            case Enums.TransitionStyle.DIP:
              if (me.transitionSettings.dip?.rate === rate) {
                return getOptColors(evt)
              }
              break
            case Enums.TransitionStyle.WIPE:
              if (me.transitionSettings.wipe?.rate === rate) {
                return getOptColors(evt)
              }
              break
            case Enums.TransitionStyle.DVE:
              if (me.transitionSettings.DVE?.rate === rate) {
                return getOptColors(evt)
              }
              break
            case Enums.TransitionStyle.STING:
              break
            default:
              assertUnreachable(style)
          }
        }
        return {}
      }
    })
  }
}

function fadeToBlackFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
  return {
    [FeedbackId.FadeToBlackIsBlack]: literal<Required<CompanionFeedback>>({
      label: 'Change colors from fade to black status',
      description: 'If the specified fade to black is active, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(255, 255, 0)),
        AtemMEPicker(model, 0),
        AtemFadeToBlackStatePicker()
      ],
      callback: evt => {
        const me = getMixEffect(state, evt.options.mixeffect)
        if (me && me.fadeToBlack) {
          switch (evt.options.state) {
            case 'off':
              if (!me.fadeToBlack.isFullyBlack && !me.fadeToBlack.inTransition) {
                return getOptColors(evt)
              }
              break
            case 'fading':
              if (me.fadeToBlack.inTransition) {
                return getOptColors(evt)
              }
              break
            default:
              // on
              if (!me.fadeToBlack.inTransition && me.fadeToBlack.isFullyBlack) {
                return getOptColors(evt)
              }
              break
          }
        }
        return {}
      }
    }),
    [FeedbackId.FadeToBlackRate]: literal<Required<CompanionFeedback>>({
      label: 'Change colors from fade to black rate',
      description: 'If the specified fade to black rate matches, change color of the bank',
      options: [
        ForegroundPicker(instance.rgb(0, 0, 0)),
        BackgroundPicker(instance.rgb(255, 255, 0)),
        AtemMEPicker(model, 0),
        AtemRatePicker('Rate')
      ],
      callback: evt => {
        const me = getMixEffect(state, evt.options.mixeffect)
        const rate = Number(evt.options.rate)
        if (me && me.fadeToBlack && me.fadeToBlack.rate === rate) {
          return getOptColors(evt)
        }
        return {}
      }
    })
  }
}

function compareAsInt(
  targetStr: InputValue | undefined,
  actual: number,
  targetScale: number,
  actualRounding: number = 1
) {
  if (targetStr === undefined) {
    return false
  }

  const targetVal = Number(targetStr) * targetScale
  if (actualRounding) {
    actual = actualRounding * Math.round(actual / actualRounding)
  }
  return targetVal === actual
}

function ssrcFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
  return {
    [FeedbackId.SSrcBoxSource]: model.SSrc
      ? literal<Required<CompanionFeedback>>({
          label: 'Change colors from SuperSorce box source',
          description: 'If the specified SuperSource box is set to the specified source, change color of the bank',
          options: _.compact([
            ForegroundPicker(instance.rgb(0, 0, 0)),
            BackgroundPicker(instance.rgb(255, 255, 0)),
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker(),
            AtemSuperSourceBoxSourcePicker(model, state)
          ]),
          callback: evt => {
            const box = getSuperSourceBox(state, evt.options.boxIndex, evt.options.ssrcId || 0)
            if (box && box.source === Number(evt.options.source)) {
              return getOptColors(evt)
            }
            return {}
          }
        })
      : undefined,
    [FeedbackId.SSrcBoxOnAir]: model.SSrc
      ? literal<Required<CompanionFeedback>>({
          label: 'Change colors from SuperSorce box state',
          description: 'If the specified SuperSource box is enabled, change color of the bank',
          options: _.compact([
            ForegroundPicker(instance.rgb(0, 0, 0)),
            BackgroundPicker(instance.rgb(255, 255, 0)),
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker()
          ]),
          callback: evt => {
            const box = getSuperSourceBox(state, evt.options.boxIndex, evt.options.ssrcId || 0)
            if (box && box.enabled) {
              return getOptColors(evt)
            }
            return {}
          }
        })
      : undefined,
    [FeedbackId.SSrcBoxProperties]: model.SSrc
      ? literal<Required<CompanionFeedback>>({
          label: 'Change colors from SuperSorce box properties',
          description: 'If the specified SuperSource box properties match, change color of the bank',
          options: _.compact([
            ForegroundPicker(instance.rgb(0, 0, 0)),
            BackgroundPicker(instance.rgb(255, 255, 0)),
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker(),
            ...AtemSuperSourcePropertiesPickers()
          ]),
          callback: evt => {
            const box = getSuperSourceBox(state, evt.options.boxIndex, evt.options.ssrcId || 0)
            const boxCroppingMatches =
              box &&
              (!box.cropped ||
                (compareAsInt(evt.options.cropTop, box.cropTop, 1000, 10) &&
                  compareAsInt(evt.options.cropBottom, box.cropBottom, 1000, 10) &&
                  compareAsInt(evt.options.cropLeft, box.cropLeft, 1000, 10) &&
                  compareAsInt(evt.options.cropRight, box.cropRight, 1000, 10)))

            if (
              box &&
              compareAsInt(evt.options.size, box.size, 1000, 10) &&
              compareAsInt(evt.options.x, box.x, 100) &&
              compareAsInt(evt.options.y, box.y, 100) &&
              box.cropped === !!evt.options.cropEnable &&
              boxCroppingMatches
            ) {
              return getOptColors(evt)
            }
            return {}
          }
        })
      : undefined
  }
}

function dskFeedbacks(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
  return {
    [FeedbackId.DSKOnAir]: model.DSKs
      ? literal<Required<CompanionFeedback>>({
          label: 'Change colors from downstream keyer state',
          description: 'If the specified downstream keyer is active, change color of the bank',
          options: [
            ForegroundPicker(instance.rgb(255, 255, 255)),
            BackgroundPicker(instance.rgb(255, 0, 0)),
            AtemDSKPicker(model)
          ],
          callback: evt => {
            const dsk = getDSK(state, evt.options.key)
            if (dsk && dsk.onAir) {
              return getOptColors(evt)
            }
            return {}
          }
        })
      : undefined,
    [FeedbackId.DSKSource]: model.DSKs
      ? literal<Required<CompanionFeedback>>({
          label: 'Change colors from downstream keyer fill source',
          description: 'If the input specified is in use by the DSK specified, change colors of the bank',
          options: [
            ForegroundPicker(instance.rgb(0, 0, 0)),
            BackgroundPicker(instance.rgb(238, 238, 0)),
            AtemDSKPicker(model),
            AtemKeyFillSourcePicker(model, state)
          ],
          callback: evt => {
            const dsk = getDSK(state, evt.options.key)
            if (dsk && dsk.sources?.fillSource === Number(evt.options.fill)) {
              return getOptColors(evt)
            }
            return {}
          }
        })
      : undefined
  }
}

export function GetFeedbacksList(
  instance: InstanceSkel<AtemConfig>,
  model: ModelSpec,
  state: AtemState,
  tally: TallyBySource
) {
  const feedbacks: { [id in FeedbackId]: Required<CompanionFeedback> | undefined } = {
    ...tallyFeedbacks(instance, model, state, tally),
    ...previewFeedbacks(instance, model, state),
    ...programFeedbacks(instance, model, state),
    ...uskFeedbacks(instance, model, state),
    ...dskFeedbacks(instance, model, state),
    ...ssrcFeedbacks(instance, model, state),
    ...transitionFeedbacks(instance, model, state),
    ...fadeToBlackFeedbacks(instance, model, state),
    [FeedbackId.AuxBG]: model.auxes
      ? {
          label: 'Change colors from AUX bus',
          description: 'If the input specified is in use by the aux bus specified, change colors of the bank',
          options: [
            ForegroundPicker(instance.rgb(0, 0, 0)),
            BackgroundPicker(instance.rgb(255, 255, 0)),
            AtemAuxPicker(model),
            AtemAuxSourcePicker(model, state)
          ],
          callback: evt => {
            const auxSource = state.video.auxilliaries[Number(evt.options.aux)]
            if (auxSource === Number(evt.options.input)) {
              return getOptColors(evt)
            }
            return {}
          }
        }
      : undefined,
    [FeedbackId.Macro]: model.macros
      ? {
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
          ],
          callback: evt => {
            let macroIndex = Number(evt.options.macroIndex)
            if (!isNaN(macroIndex)) {
              macroIndex -= 1
              const { macroPlayer, macroRecorder } = state.macro
              const type = evt.options.state as MacroFeedbackType

              let isActive = false
              switch (type) {
                case MacroFeedbackType.IsUsed:
                  const macro = state.macro.macroProperties[macroIndex]
                  isActive = !!macro?.isUsed
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
                return getOptColors(evt)
              }
            }
            return {}
          }
        }
      : undefined,
    [FeedbackId.MVSource]: model.MVs
      ? {
          label: 'Change colors from MV window',
          description: 'If the specified MV window is set to the specified source, change color of the bank',
          options: [
            ForegroundPicker(instance.rgb(0, 0, 0)),
            BackgroundPicker(instance.rgb(255, 255, 0)),
            AtemMultiviewerPicker(model),
            AtemMultiviewWindowPicker(model),
            AtemMultiviewSourcePicker(model, state)
          ],
          callback: evt => {
            const window = getMultiviewerWindow(state, evt.options.multiViewerId, evt.options.windowIndex)
            if (window && window.source === Number(evt.options.source)) {
              return getOptColors(evt)
            }
            return {}
          }
        }
      : undefined,
    [FeedbackId.MediaPlayerSource]: model.media.players
      ? {
          label: 'Change colors from media player source',
          description: 'If the specified media player has the specified source, change color of the bank',
          options: [
            ForegroundPicker(instance.rgb(0, 0, 0)),
            BackgroundPicker(instance.rgb(255, 255, 0)),
            AtemMediaPlayerPicker(model),
            AtemMediaPlayerSourcePicker(model, state)
          ],
          callback: evt => {
            const player = state.media.players[Number(evt.options.mediaplayer)]
            if (
              player &&
              player.sourceType === Enums.MediaSourceType.Still &&
              player.stillIndex === Number(evt.options.source)
            ) {
              return getOptColors(evt)
            } else if (
              player &&
              player.sourceType === Enums.MediaSourceType.Clip &&
              player.clipIndex + MEDIA_PLAYER_SOURCE_CLIP_OFFSET === Number(evt.options.source)
            ) {
              return getOptColors(evt)
            }
            return {}
          }
        }
      : undefined
  }

  return feedbacks
}
