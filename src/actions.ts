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
  AtemUSKPicker,
  AtemTransitionSelectionComponentPicker
} from './input'
import { ModelSpec } from './models'
import { getDSK, getSuperSourceBox, getUSK, getTransitionProperties } from './state'
import {
  assertUnreachable,
  calculateTransitionSelection,
  literal,
  MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
  compact
} from './util'
import { AtemCommandBatching, CommandBatching } from './batching'

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
  TransitionSelectionComponent = 'transitionSelectionComponent',
  TransitionRate = 'transitionRate',
  MediaPlayerSource = 'mediaPlayerSource',
  FadeToBlackAuto = 'fadeToBlackAuto',
  FadeToBlackRate = 'fadeToBlackRate'
}

type CompanionActionExt = CompanionAction & Required<Pick<CompanionAction, 'callback'>>
type CompanionActionsExt = { [id in ActionId]: CompanionActionExt | undefined }

function executePromise(instance: InstanceSkel<AtemConfig>, prom: Promise<unknown>): void {
  try {
    prom.catch(e => {
      instance.debug('Action execution error: ' + e)
    })
  } catch (e) {
    instance.debug('Action failed: ' + e)
  }
}
function getOptNumber(action: CompanionActionEvent, key: string): number {
  const val = Number(action.options[key])
  if (isNaN(val)) {
    throw new Error(`Invalid option '${key}'`)
  }
  return val
}
function getOptBool(action: CompanionActionEvent, key: string): boolean {
  return Boolean(action.options[key])
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function meActions(
  instance: InstanceSkel<AtemConfig>,
  atem: Atem,
  model: ModelSpec,
  commandBatching: AtemCommandBatching,
  state: AtemState
) {
  return {
    [ActionId.Program]: literal<CompanionActionExt>({
      label: 'Set input on Program',
      options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
      callback: (action): void => {
        executePromise(
          instance,
          atem.changeProgramInput(getOptNumber(action, 'input'), getOptNumber(action, 'mixeffect'))
        )
      }
    }),
    [ActionId.Preview]: literal<CompanionActionExt>({
      label: 'Set input on Preview',
      options: [AtemMEPicker(model, 0), AtemMESourcePicker(model, state, 0)],
      callback: (action): void => {
        executePromise(
          instance,
          atem.changePreviewInput(getOptNumber(action, 'input'), getOptNumber(action, 'mixeffect'))
        )
      }
    }),
    [ActionId.Cut]: literal<CompanionActionExt>({
      label: 'CUT operation',
      options: [AtemMEPicker(model, 0)],
      callback: (action): void => {
        executePromise(instance, atem.cut(getOptNumber(action, 'mixeffect')))
      }
    }),
    [ActionId.Auto]: literal<CompanionActionExt>({
      label: 'AUTO transition operation',
      options: [AtemMEPicker(model, 0)],
      callback: (action): void => {
        executePromise(instance, atem.autoTransition(getOptNumber(action, 'mixeffect')))
      }
    }),

    [ActionId.USKSource]: model.USKs
      ? literal<CompanionActionExt>({
          label: 'Set inputs on Upstream KEY',
          options: [
            AtemMEPicker(model, 0),
            AtemUSKPicker(model),
            AtemKeyFillSourcePicker(model, state),
            AtemKeyCutSourcePicker(model, state)
          ],
          callback: (action): void => {
            executePromise(
              instance,
              Promise.all([
                atem.setUpstreamKeyerFillSource(
                  getOptNumber(action, 'fill'),
                  getOptNumber(action, 'mixeffect'),
                  getOptNumber(action, 'key')
                ),
                atem.setUpstreamKeyerCutSource(
                  getOptNumber(action, 'cut'),
                  getOptNumber(action, 'mixeffect'),
                  getOptNumber(action, 'key')
                )
              ])
            )
          }
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
          ],
          callback: (action): void => {
            const meIndex = getOptNumber(action, 'mixeffect')
            const keyIndex = getOptNumber(action, 'key')
            if (action.options.onair === 'toggle') {
              const usk = getUSK(state, meIndex, keyIndex)
              executePromise(instance, atem.setUpstreamKeyerOnAir(!usk || !usk.onAir, meIndex, keyIndex))
            } else {
              executePromise(instance, atem.setUpstreamKeyerOnAir(action.options.onair === 'true', meIndex, keyIndex))
            }
          }
        })
      : undefined,
    [ActionId.TransitionStyle]: literal<CompanionActionExt>({
      label: 'Change transition style',
      options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(model.media.clips === 0)],
      callback: (action): void => {
        executePromise(
          instance,
          atem.setTransitionStyle(
            {
              style: getOptNumber(action, 'style')
            },
            getOptNumber(action, 'mixeffect')
          )
        )
      }
    }),
    [ActionId.TransitionRate]: literal<CompanionActionExt>({
      label: 'Change transition rate',
      options: [AtemMEPicker(model, 0), AtemTransitionStylePicker(true), AtemRatePicker('Transition Rate')],
      callback: (action): void => {
        const style = getOptNumber(action, 'style') as Enums.TransitionStyle
        switch (style) {
          case Enums.TransitionStyle.MIX:
            executePromise(
              instance,
              atem.setMixTransitionSettings(
                {
                  rate: getOptNumber(action, 'rate')
                },
                getOptNumber(action, 'mixeffect')
              )
            )
            break
          case Enums.TransitionStyle.DIP:
            executePromise(
              instance,
              atem.setDipTransitionSettings(
                {
                  rate: getOptNumber(action, 'rate')
                },
                getOptNumber(action, 'mixeffect')
              )
            )
            break
          case Enums.TransitionStyle.WIPE:
            executePromise(
              instance,
              atem.setWipeTransitionSettings(
                {
                  rate: getOptNumber(action, 'rate')
                },
                getOptNumber(action, 'mixeffect')
              )
            )
            break
          case Enums.TransitionStyle.DVE:
            executePromise(
              instance,
              atem.setDVETransitionSettings(
                {
                  rate: getOptNumber(action, 'rate')
                },
                getOptNumber(action, 'mixeffect')
              )
            )
            break
          case Enums.TransitionStyle.STING:
            // Not supported
            break
          default:
            assertUnreachable(style)
            instance.debug('Unknown transition style: ' + style)
        }
      }
    }),
    [ActionId.TransitionSelection]: literal<CompanionActionExt>({
      label: 'Change transition selection',
      options: [AtemMEPicker(model, 0), ...AtemTransitionSelectionPickers(model)],
      callback: (action): void => {
        executePromise(
          instance,
          atem.setTransitionStyle(
            {
              selection: calculateTransitionSelection(model.USKs, action.options)
            },
            getOptNumber(action, 'mixeffect')
          )
        )
      }
    }),
    [ActionId.TransitionSelectionComponent]: literal<CompanionActionExt>({
      label: 'Change transition selection component',
      options: [
        AtemMEPicker(model, 0),
        AtemTransitionSelectionComponentPicker(model),
        {
          type: 'dropdown',
          id: 'mode',
          label: 'State',
          choices: CHOICES_KEYTRANS,
          default: CHOICES_KEYTRANS[0].id
        }
      ],
      callback: (action): void => {
        const me = getOptNumber(action, 'mixeffect')
        const tp = getTransitionProperties(state, me)
        if (tp) {
          let batch = commandBatching.meTransitionSelection.get(me)
          if (!batch) {
            batch = new CommandBatching(
              newVal =>
                atem.setTransitionStyle(
                  {
                    selection: newVal
                  },
                  me
                ),
              {
                delayStep: 100,
                maxBatch: 5
              }
            )
            commandBatching.meTransitionSelection.set(me, batch)
          }

          const mode = action.options.mode
          const component = 1 << Number(action.options.component)
          batch.queueChange(tp.nextSelection, oldVal => {
            let mode2 = mode
            if (mode === 'toggle') {
              if ((oldVal & component) > 0) {
                mode2 = 'false'
              } else {
                mode2 = 'true'
              }
            }

            if (mode2 === 'true') {
              return oldVal | component
            } else {
              return oldVal & ~component
            }
          })
        }
      }
    }),
    [ActionId.FadeToBlackAuto]: literal<CompanionActionExt>({
      label: 'AUTO fade to black',
      options: [AtemMEPicker(model, 0)],
      callback: (action): void => {
        executePromise(instance, atem.fadeToBlack(getOptNumber(action, 'mixeffect')))
      }
    }),
    [ActionId.FadeToBlackRate]: literal<CompanionActionExt>({
      label: 'Change fade to black rate',
      options: [AtemMEPicker(model, 0), AtemRatePicker('Rate')],
      callback: (action): void => {
        executePromise(
          instance,
          atem.setFadeToBlackRate(getOptNumber(action, 'rate'), getOptNumber(action, 'mixeffect'))
        )
      }
    })
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function dskActions(instance: InstanceSkel<AtemConfig>, atem: Atem, model: ModelSpec, state: AtemState) {
  return {
    [ActionId.DSKSource]: model.DSKs
      ? literal<CompanionActionExt>({
          label: 'Set inputs on Downstream KEY',
          options: [AtemDSKPicker(model), AtemKeyFillSourcePicker(model, state), AtemKeyCutSourcePicker(model, state)],
          callback: (action): void => {
            executePromise(
              instance,
              Promise.all([
                atem.setUpstreamKeyerFillSource(getOptNumber(action, 'fill'), getOptNumber(action, 'key')),
                atem.setUpstreamKeyerCutSource(getOptNumber(action, 'cut'), getOptNumber(action, 'key'))
              ])
            )
          }
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
          ],
          callback: (action): void => {
            executePromise(instance, atem.autoDownstreamKey(getOptNumber(action, 'downstreamKeyerId')))
          }
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
          ],
          callback: (action): void => {
            const keyIndex = getOptNumber(action, 'key')
            if (action.options.onair === 'toggle') {
              const dsk = getDSK(state, keyIndex)
              executePromise(instance, atem.setDownstreamKeyOnAir(!dsk || !dsk.onAir, keyIndex))
            } else {
              executePromise(instance, atem.setDownstreamKeyOnAir(action.options.onair === 'true', keyIndex))
            }
          }
        })
      : undefined
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function macroActions(instance: InstanceSkel<AtemConfig>, atem: Atem, model: ModelSpec, state: AtemState) {
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
          ],
          callback: (action): void => {
            const macroIndex = getOptNumber(action, 'macro') - 1
            const { macroPlayer, macroRecorder } = state.macro
            if (
              action.options.action === 'runContinue' &&
              macroPlayer.isWaiting &&
              macroPlayer.macroIndex === macroIndex
            ) {
              executePromise(instance, atem.macroContinue())
            } else if (macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex) {
              executePromise(instance, atem.macroStopRecord())
            } else {
              executePromise(instance, atem.macroRun(macroIndex))
            }
          }
        })
      : undefined,
    [ActionId.MacroContinue]: model.macros
      ? literal<CompanionActionExt>({
          label: 'Continue MACRO',
          options: [],
          callback: (): void => {
            executePromise(instance, atem.macroContinue())
          }
        })
      : undefined,
    [ActionId.MacroStop]: model.macros
      ? literal<CompanionActionExt>({
          label: 'Stop MACROS',
          options: [],
          callback: (): void => {
            executePromise(instance, atem.macroStop())
          }
        })
      : undefined
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ssrcActions(instance: InstanceSkel<AtemConfig>, atem: Atem, model: ModelSpec, state: AtemState) {
  return {
    [ActionId.SuperSourceBoxSource]: model.SSrc
      ? literal<CompanionActionExt>({
          label: 'Change SuperSource box source',
          options: compact([
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker(),
            AtemSuperSourceBoxSourcePicker(model, state)
          ]),
          callback: (action): void => {
            executePromise(
              instance,
              atem.setSuperSourceBoxSettings(
                {
                  source: getOptNumber(action, 'source')
                },
                getOptNumber(action, 'boxIndex'),
                action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
              )
            )
          }
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
          ]),
          callback: (action): void => {
            const ssrcId = action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
            const boxIndex = getOptNumber(action, 'boxIndex')

            if (action.options.onair === 'toggle') {
              const box = getSuperSourceBox(state, boxIndex, ssrcId)
              executePromise(
                instance,
                atem.setSuperSourceBoxSettings(
                  {
                    enabled: !box || !box.enabled
                  },
                  boxIndex,
                  ssrcId
                )
              )
            } else {
              executePromise(
                instance,
                atem.setSuperSourceBoxSettings(
                  {
                    enabled: action.options.onair === 'true'
                  },
                  boxIndex,
                  ssrcId
                )
              )
            }
          }
        })
      : undefined,
    [ActionId.SuperSourceBoxProperties]: model.SSrc
      ? literal<CompanionActionExt>({
          label: 'Change SuperSource box properties',
          options: compact([
            AtemSuperSourceIdPicker(model),
            AtemSuperSourceBoxPicker(),
            ...AtemSuperSourcePropertiesPickers()
          ]),
          callback: (action): void => {
            executePromise(
              instance,
              atem.setSuperSourceBoxSettings(
                {
                  size: getOptNumber(action, 'size') * 1000,
                  x: getOptNumber(action, 'x') * 100,
                  y: getOptNumber(action, 'y') * 100,
                  cropped: getOptBool(action, 'cropEnable'),
                  cropTop: getOptNumber(action, 'cropTop') * 1000,
                  cropBottom: getOptNumber(action, 'cropBottom') * 1000,
                  cropLeft: getOptNumber(action, 'cropLeft') * 1000,
                  cropRight: getOptNumber(action, 'cropRight') * 1000
                },
                getOptNumber(action, 'boxIndex'),
                action.options.ssrcId && model.SSrc > 1 ? Number(action.options.ssrcId) : 0
              )
            )
          }
        })
      : undefined
  }
}

export function GetActionsList(
  instance: InstanceSkel<AtemConfig>,
  atem: Atem,
  model: ModelSpec,
  commandBatching: AtemCommandBatching,
  state: AtemState
): CompanionActions {
  const actions: CompanionActionsExt = {
    ...meActions(instance, atem, model, commandBatching, state),
    ...dskActions(instance, atem, model, state),
    ...macroActions(instance, atem, model, state),
    ...ssrcActions(instance, atem, model, state),
    [ActionId.Aux]: model.auxes
      ? literal<CompanionActionExt>({
          label: 'Set AUX bus',
          options: [AtemAuxPicker(model), AtemAuxSourcePicker(model, state)],
          callback: (action): void => {
            executePromise(instance, atem.setAuxSource(getOptNumber(action, 'input'), getOptNumber(action, 'aux')))
          }
        })
      : undefined,
    [ActionId.MultiviewerWindowSource]: model.MVs
      ? literal<CompanionActionExt>({
          label: 'Change MV window source',
          options: [
            AtemMultiviewerPicker(model),
            AtemMultiviewWindowPicker(model),
            AtemMultiviewSourcePicker(model, state)
          ],
          callback: (action): void => {
            executePromise(
              instance,
              atem.setMultiViewerSource(
                {
                  windowIndex: getOptNumber(action, 'windowIndex'),
                  source: getOptNumber(action, 'source')
                },
                getOptNumber(action, 'multiViewerId')
              )
            )
          }
        })
      : undefined,
    [ActionId.MediaPlayerSource]: model.media.players
      ? literal<CompanionActionExt>({
          label: 'Change media player source',
          options: [AtemMediaPlayerPicker(model), AtemMediaPlayerSourcePicker(model, state)],
          callback: (action): void => {
            const source = getOptNumber(action, 'source')
            if (source >= MEDIA_PLAYER_SOURCE_CLIP_OFFSET) {
              executePromise(
                instance,
                atem.setMediaPlayerSource(
                  {
                    sourceType: Enums.MediaSourceType.Clip,
                    clipIndex: source - MEDIA_PLAYER_SOURCE_CLIP_OFFSET
                  },
                  getOptNumber(action, 'mediaplayer')
                )
              )
            } else {
              executePromise(
                instance,
                atem.setMediaPlayerSource(
                  {
                    sourceType: Enums.MediaSourceType.Still,
                    stillIndex: source
                  },
                  getOptNumber(action, 'mediaplayer')
                )
              )
            }
          }
        })
      : undefined
  }

  return actions
}
