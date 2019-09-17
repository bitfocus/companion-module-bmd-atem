import { Atem, AtemState } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import {
  CompanionActionEvent,
  CompanionConfigField,
  CompanionFeedbackEvent,
  CompanionSystem
} from '../../../instance_skel_types'
import { ActionId, GetActionsList } from './actions'
import { AtemConfig, GetConfigFields } from './config'
import { FeedbackId, GetFeedbacksList, MacroFeedbackType } from './feedback'
import { GetAutoDetectModel, GetModelSpec, MODEL_AUTO_DETECT, ModelId, ModelSpec } from './models'
import { assertUnreachable } from './util'
import { InitVariables } from './variables'

// TODO - these should be exported more cleanly from atem-connection
type MixEffect = AtemState['video']['ME'][0]
type UpstreamKeyer = MixEffect['upstreamKeyers'][0]
type DownstreamKeyer = AtemState['video']['downstreamKeyers'][0]
type MultiViewer = AtemState['settings']['multiViewers'][0]

/**
 * Companion instance class for the Blackmagic ATEM Switchers.
 *
 * @extends InstanceSkel
 * @version 1.1.7
 * @since 1.0.0
 * @author Håkon Nessjøen <haakon@bitfocus.io>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class AtemInstance extends InstanceSkel<AtemConfig> {
  private model: ModelSpec
  private atem: Atem
  private atemState: AtemState
  private initDone: boolean

  /**
   * Create an instance of an ATEM module.
   *
   * @param {EventEmitter} system - the brains of the operation
   * @param {string} id - the instance ID
   * @param {Object} config - saved user configuration parameters
   * @since 1.0.0
   */
  constructor(system: CompanionSystem, id: string, config: AtemConfig) {
    super(system, id, config)

    const newModel = this.config.modelID ? GetModelSpec(this.config.modelID) : undefined
    this.model = newModel || GetAutoDetectModel()
    this.config.modelID = this.model.id

    this.atem = new Atem({}) // To ensure that there arent undefined bugs
    this.atemState = new AtemState()

    this.initDone = false

    // this.actions() // export actions
    // this.updateCompanionBits() // TODO - should this be done here ot is init ok?
  }

  // Override base types to make types stricter
  public checkFeedbacks(feedbackId?: FeedbackId, ignoreInitDone?: boolean) {
    if (ignoreInitDone || this.initDone) {
      super.checkFeedbacks(feedbackId)
    }
  }

  /**
   * Main initialization function called once the module
   * is OK to start doing things.
   *
   * @access public
   * @since 1.0.0
   */
  public init() {
    this.status(this.STATUS_UNKNOWN)

    // Unfortunately this is redundant if the switcher goes
    // online right away, but necessary for offline programming
    this.updateCompanionBits()

    this.setupAtemConnection()
  }

  /**
   * Process an updated configuration array.
   *
   * @param {Object} config - the new configuration
   * @access public
   * @since 1.0.0
   */
  public updateConfig(config: AtemConfig) {
    this.config = config

    // this.setupMvWindowChoices()
    this.setAtemModel(config.modelID || MODEL_AUTO_DETECT)

    if (this.config.host !== undefined) {
      // TODO - how better to check if connected?
      if (this.atem && (this.atem as any).socket && (this.atem as any).socket._socket) {
        try {
          this.atem.disconnect()
        } catch (e) {
          // Ignore
        }
      }

      this.atem.connect(this.config.host)
    }
  }

  public upgradeConfig() {
    // Nothing to do
  }

  /**
   * Executes the provided action.
   *
   * @param {Object} action - the action to be executed
   * @access public
   * @since 1.0.0
   */
  public action(action: CompanionActionEvent) {
    // let id = action.action
    // let cmd
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
          this.atem.changeProgramInput(getOptInt('input'), getOptInt('mixeffect'))
          break
        case ActionId.Preview:
          this.atem.changePreviewInput(getOptInt('input'), getOptInt('mixeffect'))
          break
        case ActionId.USKSource:
          this.atem.setUpstreamKeyerFillSource(getOptInt('fill'), getOptInt('mixeffect'), getOptInt('key'))
          this.atem.setUpstreamKeyerCutSource(getOptInt('cut'), getOptInt('mixeffect'), getOptInt('key'))
          break
        case ActionId.DSKSource:
          this.atem.setDownstreamKeyFillSource(getOptInt('fill'), getOptInt('key'))
          this.atem.setDownstreamKeyCutSource(getOptInt('cut'), getOptInt('key'))
          break
        case ActionId.Aux:
          this.atem.setAuxSource(getOptInt('input'), getOptInt('aux'))
          break
        case ActionId.Cut:
          this.atem.cut(getOptInt('mixeffect'))
          break
        case ActionId.USKOnAir: {
          const meIndex = getOptInt('mixeffect')
          const keyIndex = getOptInt('key')
          if (opt.onair === 'toggle') {
            const usk = this.getUSK(meIndex, keyIndex)
            this.atem.setUpstreamKeyerOnAir(!usk || !usk.onAir, meIndex, keyIndex)
          } else {
            this.atem.setUpstreamKeyerOnAir(opt.onair === 'true', meIndex, keyIndex)
          }
          break
        }
        case ActionId.DSKAuto:
          this.atem.autoDownstreamKey(getOptInt('downstreamKeyerId'))
          break
        case ActionId.DSKOnAir: {
          const keyIndex = getOptInt('key')
          if (opt.onair === 'toggle') {
            const dsk = this.getDSK(keyIndex)
            this.atem.setDownstreamKeyOnAir(!dsk || !dsk.onAir, keyIndex)
          } else {
            this.atem.setDownstreamKeyOnAir(opt.onair === 'true', keyIndex)
          }
          break
        }
        case ActionId.Auto:
          this.atem.autoTransition(getOptInt('mixeffect'))
          break
        case ActionId.MacroRun:
          const macroIndex = getOptInt('macro') - 1
          const { macroPlayer, macroRecorder } = this.atemState.macro
          if (opt.action === 'runContinue' && macroPlayer.isWaiting && macroPlayer.macroIndex === macroIndex) {
            this.atem.macroContinue()
          } else if (macroRecorder.isRecording && macroRecorder.macroIndex === macroIndex) {
            this.atem.macroStopRecord()
          } else {
            this.atem.macroRun(macroIndex)
          }
          break
        case ActionId.MacroContinue:
          this.atem.macroContinue()
          break
        case ActionId.MacroStop:
          this.atem.macroStop()
          break
        case ActionId.MultiviewerWindowSource:
          this.atem.setMultiViewerSource(
            {
              windowIndex: getOptInt('windowIndex'),
              source: getOptInt('source')
            },
            getOptInt('multiViewerId')
          )
          break
        case ActionId.SuperSourceBoxSource:
          this.atem.setSuperSourceBoxSettings(
            {
              source: getOptInt('source')
            },
            getOptInt('boxIndex')
          )
          break
        default:
          assertUnreachable(actionId)
          this.debug('Unknown action: ' + action.action)
      }
    } catch (e) {
      this.debug('Action failed: ' + e)
    }
  }

  /**
   * Creates the configuration fields for web config.
   *
   * @returns {Array} the config fields
   * @access public
   * @since 1.0.0
   */
  public config_fields(): CompanionConfigField[] {
    return GetConfigFields(this)
  }

  /**
   * Clean up the instance before it is destroyed.
   *
   * @access public
   * @since 1.0.0
   */
  public destroy() {
    if (this.atem) {
      this.atem.disconnect()
      delete this.atem
    }

    this.debug('destroy', this.id)
  }

  /**
   * Processes a feedback state.
   *
   * @param {Object} feedback - the feedback type to process
   * @param {Object} bank - the bank this feedback is associated with
   * @returns {Object} feedback information for the bank
   * @access public
   * @since 1.0.0
   */
  public feedback(feedback: CompanionFeedbackEvent) {
    const opt = feedback.options
    const getOptColors = () => ({ color: opt.fg, bgcolor: opt.bg })

    const feedbackType = feedback.type as FeedbackId
    switch (feedbackType) {
      case FeedbackId.PreviewBG: {
        const me = this.getME(opt.mixeffect)
        if (me && me.previewInput === parseInt(opt.input, 10)) {
          return getOptColors()
        }
        break
      }
      case FeedbackId.PreviewBG2: {
        const me1 = this.getME(opt.mixeffect1)
        const me2 = this.getME(opt.mixeffect2)
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
        const me1 = this.getME(opt.mixeffect1)
        const me2 = this.getME(opt.mixeffect2)
        const me3 = this.getME(opt.mixeffect3)
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
        const me1 = this.getME(opt.mixeffect1)
        const me2 = this.getME(opt.mixeffect2)
        const me3 = this.getME(opt.mixeffect3)
        const me4 = this.getME(opt.mixeffect4)
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
        const me = this.getME(opt.mixeffect)
        if (me && me.programInput === parseInt(opt.input, 10)) {
          return getOptColors()
        }
        break
      }
      case FeedbackId.ProgramBG2: {
        const me1 = this.getME(opt.mixeffect1)
        const me2 = this.getME(opt.mixeffect2)
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
        const me1 = this.getME(opt.mixeffect1)
        const me2 = this.getME(opt.mixeffect2)
        const me3 = this.getME(opt.mixeffect3)
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
        const me1 = this.getME(opt.mixeffect1)
        const me2 = this.getME(opt.mixeffect2)
        const me3 = this.getME(opt.mixeffect3)
        const me4 = this.getME(opt.mixeffect4)
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
        const auxSource = this.atemState.video.auxilliaries[opt.aux]
        if (auxSource === parseInt(opt.input, 10)) {
          return getOptColors()
        }
        break
      case FeedbackId.USKBG: {
        const usk = this.getUSK(opt.mixeffect, opt.key)
        if (usk && usk.onAir) {
          return getOptColors()
        }
        break
      }
      case FeedbackId.USKSource: {
        const usk = this.getUSK(opt.mixeffect, opt.key)
        if (usk && usk.fillSource === parseInt(opt.fill, 10)) {
          return getOptColors()
        }
        break
      }
      case FeedbackId.DSKBG: {
        const dsk = this.getDSK(opt.key)
        if (dsk && dsk.onAir) {
          return getOptColors()
        }
        break
      }
      case FeedbackId.DSKSource: {
        const dsk = this.getDSK(opt.key)
        if (dsk && dsk.sources.fillSource === parseInt(opt.fill, 10)) {
          return getOptColors()
        }
        break
      }
      case FeedbackId.Macro: {
        let macroIndex = parseInt(opt.macroIndex, 10)
        if (!isNaN(macroIndex)) {
          macroIndex -= 1
          const { macroPlayer, macroRecorder } = this.atemState.macro
          const type = opt.state as MacroFeedbackType

          let isActive = false
          switch (type) {
            case MacroFeedbackType.IsUsed:
              const macro = this.atemState.macro.macroProperties[macroIndex]
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
        const window = this.getMultiviewerWindow(opt.multiViewerId, opt.windowIndex)
        if (window && window.source === parseInt(opt.source, 10)) {
          return getOptColors()
        }
        break
      }
      case FeedbackId.SSrcBoxSource: {
        const box = this.getSuperSourceBox(opt.boxIndex, 0) // TODO - ssrcIndex
        if (box && box.source === parseInt(opt.source, 10)) {
          return getOptColors()
        }
        break
      }
      default:
        assertUnreachable(feedbackType)
      // TODO - log
    }

    return {}
  }

  private updateCompanionBits() {
    InitVariables(this, this.model, this.atemState)
    this.initPresets()

    this.setFeedbackDefinitions(GetFeedbacksList(this, this.model, this.atemState))
    this.setActions(GetActionsList(this.model, this.atemState))
  }

  private getME(meIndex: number | string): MixEffect | undefined {
    return this.atemState.video.ME[meIndex]
  }
  private getUSK(meIndex: number | string, keyIndex: number | string): UpstreamKeyer | undefined {
    const me = this.getME(meIndex)
    return me ? me.upstreamKeyers[keyIndex] : undefined
  }
  private getDSK(keyIndex: number | string): DownstreamKeyer | undefined {
    return this.atemState.video.downstreamKeyers[keyIndex]
  }
  private getSuperSourceBox(boxIndex: number | string, ssrcId?: number | string) {
    const ssrc = this.atemState.video.superSources[ssrcId || 0]
    return ssrc ? ssrc.boxes[boxIndex] : undefined
  }
  private getMultiviewer(index: number | string): MultiViewer | undefined {
    return this.atemState.settings.multiViewers[index]
  }
  private getMultiviewerWindow(mvIndex: number | string, windowIndex: number | string) {
    const mv = this.getMultiviewer(mvIndex)
    return mv ? mv.windows[windowIndex] : undefined
  }

  /**
   * INTERNAL: initialize presets.
   *
   * @access protected
   * @since 1.0.0
   */
  private initPresets() {
    const presets = []
    // let pstText = this.config.presets == 1 ? 'long_' : 'short_'
    // let pstSize = this.config.presets == 1 ? 'auto' : '18'

    // for (let me = 0; me < this.model.MEs; ++me) {
    //   for (let input in this.CHOICES_MESOURCES) {
    //     let key = this.CHOICES_MESOURCES[input].id

    //     presets.push({
    //       category: 'Preview (M/E ' + (me + 1) + ')',
    //       label: 'Preview button for ' + this.getSource(key).shortName,
    //       bank: {
    //         style: 'text',
    //         text: '$(attem:' + pstText + key + ')',
    //         size: pstSize,
    //         color: '16777215',
    //         bgcolor: 0
    //       },
    //       feedbacks: [
    //         {
    //           type: 'preview_bg',
    //           options: {
    //             bg: 65280,
    //             fg: 16777215,
    //             input: key,
    //             mixeffect: me
    //           }
    //         }
    //       ],
    //       actions: [
    //         {
    //           action: 'preview',
    //           options: {
    //             mixeffect: me,
    //             input: key
    //           }
    //         }
    //       ]
    //     })
    //     presets.push({
    //       category: 'Program (M/E ' + (me + 1) + ')',
    //       label: 'Program button for ' + this.getSource(key).shortName,
    //       bank: {
    //         style: 'text',
    //         text: '$(attem:' + pstText + key + ')',
    //         size: pstSize,
    //         color: '16777215',
    //         bgcolor: 0
    //       },
    //       feedbacks: [
    //         {
    //           type: 'program_bg',
    //           options: {
    //             bg: 16711680,
    //             fg: 16777215,
    //             input: key,
    //             mixeffect: me
    //           }
    //         }
    //       ],
    //       actions: [
    //         {
    //           action: 'program',
    //           options: {
    //             mixeffect: me,
    //             input: key
    //           }
    //         }
    //       ]
    //     })
    //   }
    // }

    // for (let i = 0; i < this.model.auxes; ++i) {
    //   for (let input in this.CHOICES_AUXSOURCES) {
    //     let key = this.CHOICES_AUXSOURCES[input].id

    //     presets.push({
    //       category: 'AUX ' + (i + 1),
    //       label: 'AUX' + (i + 1) + ' button for ' + this.getSource(key).shortName,
    //       bank: {
    //         style: 'text',
    //         text: '$(attem:' + pstText + key + ')',
    //         size: pstSize,
    //         color: '16777215',
    //         bgcolor: 0
    //       },
    //       feedbacks: [
    //         {
    //           type: 'aux_bg',
    //           options: {
    //             bg: 16776960,
    //             fg: 0,
    //             input: key,
    //             aux: i
    //           }
    //         }
    //       ],
    //       actions: [
    //         {
    //           action: 'aux',
    //           options: {
    //             aux: i,
    //             input: key
    //           }
    //         }
    //       ]
    //     })
    //   }
    // }

    // // Upstream keyers
    // for (let me = 0; me < this.model.MEs; ++me) {
    //   for (let i = 0; i < this.model.USKs; ++i) {
    //     presets.push({
    //       category: 'KEYs',
    //       label: 'Toggle upstream KEY' + (i + 1) + '(M/E ' + (me + 1) + ')',
    //       bank: {
    //         style: 'text',
    //         text: 'KEY ' + (i + 1),
    //         size: '24',
    //         color: this.rgb(255, 255, 255),
    //         bgcolor: 0
    //       },
    //       feedbacks: [
    //         {
    //           type: 'usk_bg',
    //           options: {
    //             bg: this.rgb(255, 0, 0),
    //             fg: this.rgb(255, 255, 255),
    //             key: i,
    //             mixeffect: me
    //           }
    //         }
    //       ],
    //       actions: [
    //         {
    //           action: 'usk',
    //           options: {
    //             onair: 'toggle',
    //             key: i,
    //             mixeffect: me
    //           }
    //         }
    //       ]
    //     })

    //     for (let input in this.CHOICES_MESOURCES) {
    //       let key = this.CHOICES_MESOURCES[input].id

    //       presets.push({
    //         category: 'M/E ' + (me + 1) + ' Key ' + (i + 1),
    //         label: 'M/E ' + (me + 1) + ' Key ' + (i + 1) + ' source',
    //         bank: {
    //           style: 'text',
    //           text: '$(attem:' + pstText + key + ')',
    //           size: pstSize,
    //           color: this.rgb(255, 255, 255),
    //           bgcolor: 0
    //         },
    //         feedbacks: [
    //           {
    //             type: 'usk_source',
    //             options: {
    //               bg: this.rgb(238, 238, 0),
    //               fg: this.rgb(0, 0, 0),
    //               fill: key,
    //               key: i,
    //               mixeffect: me
    //             }
    //           }
    //         ],
    //         actions: [
    //           {
    //             action: 'uskSource',
    //             options: {
    //               onair: 'toggle',
    //               fill: key,
    //               cut: key == 3010 || key == 3020 ? parseInt(key) + 1 : 0,
    //               key: i,
    //               mixeffect: me
    //             }
    //           }
    //         ]
    //       })
    //     }
    //   }
    // }

    // // Downstream keyers
    // for (let i = 0; i < this.model.DSKs; ++i) {
    //   presets.push({
    //     category: 'KEYs',
    //     label: 'Toggle downstream KEY' + (i + 1),
    //     bank: {
    //       style: 'text',
    //       text: 'DSK ' + (i + 1),
    //       size: '24',
    //       color: this.rgb(255, 255, 255),
    //       bgcolor: 0
    //     },
    //     feedbacks: [
    //       {
    //         type: 'dsk_bg',
    //         options: {
    //           bg: this.rgb(255, 0, 0),
    //           fg: this.rgb(255, 255, 255),
    //           key: i
    //         }
    //       }
    //     ],
    //     actions: [
    //       {
    //         action: 'dsk',
    //         options: {
    //           onair: 'toggle',
    //           key: i
    //         }
    //       }
    //     ]
    //   })

    //   for (let input in this.CHOICES_MESOURCES) {
    //     let key = this.CHOICES_MESOURCES[input].id

    //     presets.push({
    //       category: 'DSK ' + (i + 1),
    //       label: 'DSK ' + (i + 1) + ' source',
    //       bank: {
    //         style: 'text',
    //         text: '$(attem:' + pstText + key + ')',
    //         size: pstSize,
    //         color: this.rgb(255, 255, 255),
    //         bgcolor: 0
    //       },
    //       feedbacks: [
    //         {
    //           type: 'dsk_source',
    //           options: {
    //             bg: this.rgb(238, 238, 0),
    //             fg: this.rgb(0, 0, 0),
    //             fill: key,
    //             key: i
    //           }
    //         }
    //       ],
    //       actions: [
    //         {
    //           action: 'dskSource',
    //           options: {
    //             onair: 'toggle',
    //             fill: key,
    //             cut: key == 3010 || key == 3020 ? parseInt(key) + 1 : 0,
    //             key: i
    //           }
    //         }
    //       ]
    //     })
    //   }
    // }

    // // Macros
    // for (let i = 0; i < this.model.macros; i++) {
    //   presets.push({
    //     category: 'MACROS',
    //     label: 'Run button for macro ' + (i + 1),
    //     bank: {
    //       style: 'text',
    //       text: '$(attem:macro_' + (i + 1) + ')',
    //       size: 'auto',
    //       color: this.rgb(255, 255, 255),
    //       bgcolor: this.rgb(0, 0, 0)
    //     },
    //     feedbacks: [
    //       {
    //         type: 'macro',
    //         options: {
    //           bg: this.rgb(0, 0, 238),
    //           fg: this.rgb(255, 255, 255),
    //           macroIndex: i + 1,
    //           state: 'isUsed'
    //         }
    //       },
    //       {
    //         type: 'macro',
    //         options: {
    //           bg: this.rgb(0, 238, 0),
    //           fg: this.rgb(255, 255, 255),
    //           macroIndex: i + 1,
    //           state: 'isRunning'
    //         }
    //       },
    //       {
    //         type: 'macro',
    //         options: {
    //           bg: this.rgb(238, 238, 0),
    //           fg: this.rgb(255, 255, 255),
    //           macroIndex: i + 1,
    //           state: 'isWaiting'
    //         }
    //       },
    //       {
    //         type: 'macro',
    //         options: {
    //           bg: this.rgb(238, 0, 0),
    //           fg: this.rgb(255, 255, 255),
    //           macroIndex: i + 1,
    //           state: 'isRecording'
    //         }
    //       }
    //     ],
    //     actions: [
    //       {
    //         action: 'macrorun',
    //         options: {
    //           macro: i + 1,
    //           action: 'runContinue'
    //         }
    //       }
    //     ]
    //   })
    // }

    // for (let i = 0; i < this.model.MVs; i++) {
    //   for (let j = 2; j < 10; j++) {
    //     for (let k in this.CHOICES_MVSOURCES) {
    //       presets.push({
    //         category: 'MV ' + (i + 1) + ' Window ' + (j + 1),
    //         label:
    //           'Set multi viewer ' + (i + 1) + ', window ' + (j + 1) + ' to source ' + this.CHOICES_MVSOURCES[k].label,
    //         bank: {
    //           style: 'text',
    //           text: '$(attem:' + pstText + this.CHOICES_MVSOURCES[k].id + ')',
    //           size: pstSize,
    //           color: this.rgb(255, 255, 255),
    //           bgcolor: this.rgb(0, 0, 0)
    //         },
    //         feedbacks: [
    //           {
    //             type: 'mv_source',
    //             options: {
    //               bg: this.rgb(255, 255, 0),
    //               fg: this.rgb(0, 0, 0),
    //               multiViewerId: i,
    //               source: this.CHOICES_MVSOURCES[k].id,
    //               windowIndex: j
    //             }
    //           }
    //         ],
    //         actions: [
    //           {
    //             action: 'setMvSource',
    //             options: {
    //               multiViewerId: i,
    //               source: this.CHOICES_MVSOURCES[k].id,
    //               windowIndex: j
    //             }
    //           }
    //         ]
    //       })
    //     }
    //   }
    // }

    // //Future loop for multiple SSRC
    // for (let i = 0; i < 1; i++) {
    //   for (let j = 0; j < 4; j++) {
    //     for (let k in this.CHOICES_MESOURCES) {
    //       presets.push({
    //         category: 'SSrc ' + (i + 1) + ' Box ' + (j + 1),
    //         label: 'Set SuperSource ' + (i + 1) + ', box ' + (j + 1) + ' to source ' + this.CHOICES_MESOURCES[k].label,
    //         bank: {
    //           style: 'text',
    //           text: '$(attem:' + pstText + this.CHOICES_MESOURCES[k].id + ')',
    //           size: pstSize,
    //           color: this.rgb(255, 255, 255),
    //           bgcolor: this.rgb(0, 0, 0)
    //         },
    //         feedbacks: [
    //           {
    //             type: 'ssrc_box_source',
    //             options: {
    //               bg: this.rgb(255, 255, 0),
    //               fg: this.rgb(0, 0, 0),
    //               //ssrcId:    i,
    //               source: this.CHOICES_MESOURCES[k].id,
    //               boxIndex: j
    //             }
    //           }
    //         ],
    //         actions: [
    //           {
    //             action: 'setSsrcBoxSource',
    //             options: {
    //               //ssrcId:    i,
    //               source: this.CHOICES_MESOURCES[k].id,
    //               boxIndex: j
    //             }
    //           }
    //         ]
    //       })
    //     }
    //   }
    // }

    this.setPresetDefinitions(presets)
  }

  /**
   * INTERNAL: Callback for ATEM connection to state change responses.
   *
   * @param {?boolean} err - null if a normal result, true if there was an error
   * @param {Object} state - state details in object array
   * @access protected
   * @since 1.1.0
   */
  private processStateChange(newState: AtemState, path: string) {
    if (this.initDone) {
      this.atemState = newState
    }

    if (path.match(/video.auxilliaries/)) {
      this.checkFeedbacks(FeedbackId.AuxBG)
    }

    // switch (state.constructor.name) {
    //   case 'AuxSourceCommand': {
    //     // this.getAux(state.auxBus).auxSource = state.properties.source

    //     this.checkFeedbacks(FeedbackId.AuxBG)
    //     break
    //   }
    //   case 'DownstreamKeyPropertiesCommand': {
    //     this.updateDSK(state.downstreamKeyerId, state.properties)

    //     this.checkFeedbacks(FeedbackId.DSKBG)
    //     break
    //   }

    //   case 'DownstreamKeySourcesCommand': {
    //     this.updateDSK(state.downstreamKeyerId, state.properties)

    //     const id = state.properties.fillSource
    // updateDSKVariable(this, this.atemState, state.downstreamKeyerId)

    //     this.checkFeedbacks(FeedbackId.DSKSource)
    //     break
    //   }
    //   case 'DownstreamKeyStateCommand': {
    //     this.updateDSK(state.downstreamKeyerId, state.properties)

    //     this.checkFeedbacks(FeedbackId.DSKBG)
    //     break
    //   }

    //   case 'InitCompleteCommand': {
    //     this.debug('Init done')
    //     this.initDone = true
    //     this.atemState = state
    //     this.log('info', 'Connected to a ' + this.atemState.info.productIdentifier)

    //     this.setAtemModel(this.atemState.info.model, true)
    //     this.checkFeedbacks()
    //     break
    //   }

    //   case 'InputPropertiesCommand': {
    //     // this.updateSource(state.inputId, state.properties)
    //     // reset everything, since names of inputs might have changed
    //     this.updateCompanionBits()
    //     break
    //   }

    //   case 'MixEffectKeyOnAirCommand': {
    //     this.updateUSK(state.mixEffect, state.upstreamKeyerId, state.properties)

    //     this.checkFeedbacks(FeedbackId.USKBG)
    //     break
    //   }
    //   case 'MixEffectKeyPropertiesGetCommand': {
    //     this.updateUSK(state.mixEffect, state.properties.upstreamKeyerId, state.properties)

    //     const id = state.properties.fillSource
    // updateUSKVariable(this, this.atemState, state.mixEffect, state.upstreamKeyerId)

    //     this.checkFeedbacks(FeedbackId.USKSource)
    //     break
    //   }

    //   case 'MacroPropertiesCommand': {
    //     this.updateMacroVariable(state.properties.index) // TODO - check this

    //     this.checkFeedbacks(FeedbackId.Macro)
    //     break
    //   }
    //   case 'MacroRecordingStatusCommand': {
    //     this.checkFeedbacks(FeedbackId.Macro)
    //     break
    //   }
    //   case 'MacroRunStatusCommand': {
    //     this.checkFeedbacks(FeedbackId.Macro)
    //     break
    //   }

    //   case 'MultiViewerSourceCommand': {
    //     this.updateMvWindow(state.multiViewerId, state.properties.windowIndex, state.properties)

    //     this.checkFeedbacks(FeedbackId.MVSource)
    //     break
    //   }

    //   case 'ProgramInputCommand': {
    //     this.getME(state.mixEffect).programInput = state.properties.source

    //     const id = state.properties.source
    // this.updateMEProgramVariable(state.mixEffect)

    //     this.checkFeedbacks(FeedbackId.ProgramBG)
    //     this.checkFeedbacks(FeedbackId.ProgramBG2)
    //     this.checkFeedbacks(FeedbackId.ProgramBG3)
    //     this.checkFeedbacks(FeedbackId.ProgramBG4)
    //     break
    //   }

    //   case 'PreviewInputCommand': {
    //     this.getME(state.mixEffect).previewInput = state.properties.source

    //     const id = state.properties.source
    // this.updateMEPreviewVariable(state.mixEffect)

    //     this.checkFeedbacks(FeedbackId.PreviewBG)
    //     this.checkFeedbacks(FeedbackId.PreviewBG2)
    //     this.checkFeedbacks(FeedbackId.PreviewBG3)
    //     this.checkFeedbacks(FeedbackId.PreviewBG4)
    //     break
    //   }

    //   // case 'PreviewTransitionCommand': {
    //   //   this.getME(state.mixEffect).preview = state.properties.preview

    //   //     this.checkFeedbacks('trans_pvw')
    //   //   break
    //   // }
    //   case 'SuperSourceBoxPropertiesCommand': {
    //     this.updateSuperSourceBox(state.boxId, 0, state.properties)

    //     this.checkFeedbacks(FeedbackId.SSrcBoxSource)
    //     break
    //   }

    //   // case 'SuperSourcePropertiesCommand': {
    //   //   this.updateSuperSource(0, state.properties)

    //   //     //this.checkFeedbacks('ssrc_');
    //   //   break
    //   // }

    //   // case 'TransitionPositionCommand': {
    //   //   this.updateME(state.mixEffect, state.properties)

    //   //   let iconId = state.properties.handlePosition / 100
    //   //   iconId = iconId >= 90 ? 90 : iconId >= 70 ? 70 : iconId >= 50 ? 50 : iconId >= 30 ? 30 : iconId >= 10 ? 10 : 0
    //   //   let newIcon = 'trans' + iconId

    //   //   if (
    //   //     newIcon != this.getME(state.mixEffect).transIcon ||
    //   //     state.properties.inTransition != this.getME(state.mixEffect).inTransition
    //   //   ) {
    //   //     this.getME(state.mixEffect).transIcon = newIcon

    //   //       this.checkFeedbacks('trans_state')
    //   //   }
    //   //   break
    //   // }

    //   // case 'TransitionPropertiesCommand': {
    //   //   this.updateME(state.mixEffect, state.properties)

    //   //     this.checkFeedbacks('trans_mods')
    //   //   break
    //   // }
    // }
  }

  /**
   * INTERNAL: Fires a bunch of setup and cleanup when we switch models.
   * This is a tricky function because both Config and Atem use this.
   * Logic has to track who's who and make sure we don't init over a live switcher.
   *
   * @param {number} modelID - the new model
   * @param {boolean} [live] - optional, true if this is the live switcher model; defaults to false
   * @access protected
   * @since 1.1.0
   */
  private setAtemModel(modelID: ModelId, live?: boolean) {
    if (!live) {
      live = false
    }

    const newModel = GetModelSpec(modelID)
    if (newModel) {
      // Still not sure about this
      if (
        (live && this.config.modelID === MODEL_AUTO_DETECT) ||
        (!live && (this.atemState.info.model === MODEL_AUTO_DETECT || modelID !== MODEL_AUTO_DETECT))
      ) {
        this.model = newModel
        this.debug('ATEM Model: ' + this.model.id)
      }

      // This is a funky test, but necessary.  Can it somehow be an else if of the above ... or simply an else?
      if (
        (!live &&
          this.atemState.info.model !== MODEL_AUTO_DETECT &&
          modelID !== MODEL_AUTO_DETECT &&
          modelID !== this.atemState.info.model) ||
        (live &&
          this.config.modelID &&
          this.config.modelID !== MODEL_AUTO_DETECT &&
          this.atemState.info.model !== this.config.modelID)
      ) {
        this.log(
          'error',
          'Connected to a ' +
            this.atemState.info.productIdentifier +
            ', but instance is configured for ' +
            this.model.label +
            ".  Change instance to 'Auto Detect' or the appropriate model to ensure stability."
        )
      }

      this.updateCompanionBits()
    } else {
      this.debug('ATEM Model: ' + modelID + 'NOT FOUND')
    }
  }

  /**
   * INTERNAL: use setup data to initalize the atem-connection object.
   *
   * @access protected
   * @since 1.1.0
   */
  private setupAtemConnection() {
    this.atem = new Atem({ externalLog: this.debug.bind(this) })

    this.atem.on('connected', () => {
      this.status(this.STATUS_OK)
    })
    this.atem.on('error', e => {
      this.status(this.STATUS_ERROR, e.message)
    })
    this.atem.on('disconnected', () => {
      this.status(this.STATUS_UNKNOWN, 'Disconnected')
      this.initDone = false
      // TODO - clear cached state after some timeout
    })
    this.atem.on('stateChanged', this.processStateChange.bind(this))

    if (this.config.host) {
      this.atem.connect(this.config.host)
    }
  }
}

export = AtemInstance
