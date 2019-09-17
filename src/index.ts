import { Atem, AtemState } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import {
  CompanionActionEvent,
  CompanionConfigField,
  CompanionFeedbackEvent,
  CompanionSystem
} from '../../../instance_skel_types'
import { GetActionsList, HandleAction } from './actions'
import { AtemConfig, GetConfigFields } from './config'
import { ExecuteFeedback, FeedbackId, GetFeedbacksList } from './feedback'
import { GetAutoDetectModel, GetModelSpec, MODEL_AUTO_DETECT, ModelId, ModelSpec } from './models'
import {
  InitVariables,
  updateDSKVariable,
  updateMacroVariable,
  updateMEPreviewVariable,
  updateMEProgramVariable,
  updateUSKVariable
} from './variables'

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

    this.setAtemModel(config.modelID || MODEL_AUTO_DETECT)

    // Force clear the cached state
    this.atemState = new AtemState()
    this.updateCompanionBits()

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
    HandleAction(this, this.atem, this.atemState, action)
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
    return ExecuteFeedback(this.atemState, feedback)
  }

  private updateCompanionBits() {
    InitVariables(this, this.model, this.atemState)
    this.initPresets()

    this.setFeedbackDefinitions(GetFeedbacksList(this, this.model, this.atemState))
    this.setActions(GetActionsList(this.model, this.atemState))
    this.checkFeedbacks()
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
      // Only update the used state after initDone, so that cached data can be used while reconnecting
      this.atemState = newState
      // TODO - do we need to clone this object?
    }

    // TODO - verify this doesnt get spammed during init

    if (path.match(/video.auxilliaries/)) {
      this.checkFeedbacks(FeedbackId.AuxBG)
      return
    }

    // TODO - refine this with some atem-connection changes
    const dskMatch = path.match(/video.downstreamKeyers.(\d+)/)
    if (dskMatch) {
      updateDSKVariable(this, this.atemState, parseInt(dskMatch[1], 10))
      this.checkFeedbacks(FeedbackId.DSKBG)
      return
    }

    if (path.match(/inputs/)) {
      // reset everything, since names of inputs might have changed
      this.updateCompanionBits()
      return
    }

    if (path.match(/video.ME.(\d+).upstreamKeyers.(\d+).onAir/)) {
      this.checkFeedbacks(FeedbackId.USKBG)
      return
    }

    const uskSourceMatch = path.match(/video.ME.(\d+).upstreamKeyers.(\d+)/)
    if (uskSourceMatch) {
      const meIndex = parseInt(uskSourceMatch[1], 10)
      const keyIndex = parseInt(uskSourceMatch[2], 10)

      updateUSKVariable(this, this.atemState, meIndex, keyIndex)
      this.checkFeedbacks(FeedbackId.USKSource)
      return
    }

    const macroPropertiesMatch = path.match(/macro.macroProperties.(\d+)/)
    if (macroPropertiesMatch) {
      const macroIndex = parseInt(macroPropertiesMatch[1], 10)
      updateMacroVariable(this, this.atemState, macroIndex)

      this.checkFeedbacks(FeedbackId.Macro)
      return
    }

    if (path.match(/macro.macroRecorder/) || path.match(/macro.macroPlayer/)) {
      this.checkFeedbacks(FeedbackId.Macro)
      return
    }

    if (path.match(/settings.multiViewers.(\d+).windows.(\d+)/)) {
      this.checkFeedbacks(FeedbackId.MVSource)
      return
    }

    const meProgramMatch = path.match(/video.ME.(\d+).programInput/)
    if (meProgramMatch) {
      const meIndex = parseInt(meProgramMatch[1], 10)
      updateMEProgramVariable(this, this.atemState, meIndex)

      this.checkFeedbacks(FeedbackId.ProgramBG)
      this.checkFeedbacks(FeedbackId.ProgramBG2)
      this.checkFeedbacks(FeedbackId.ProgramBG3)
      this.checkFeedbacks(FeedbackId.ProgramBG4)
      return
    }

    const mePreviewMatch = path.match(/video.ME.(\d+).previewInput/)
    if (mePreviewMatch) {
      const meIndex = parseInt(mePreviewMatch[1], 10)
      updateMEPreviewVariable(this, this.atemState, meIndex)

      this.checkFeedbacks(FeedbackId.PreviewBG)
      this.checkFeedbacks(FeedbackId.PreviewBG2)
      this.checkFeedbacks(FeedbackId.PreviewBG3)
      this.checkFeedbacks(FeedbackId.PreviewBG4)
      return
    }

    if (path.match(/video.superSources.(\d+).boxes.(\d+)/)) {
      this.checkFeedbacks(FeedbackId.SSrcBoxSource)
      return
    }

    /**
     * Old unused cases below
     * TODO - implement or trash them
     */
    // case 'PreviewTransitionCommand': {
    //   this.getME(state.mixEffect).preview = state.properties.preview

    //     this.checkFeedbacks('trans_pvw')
    //   break
    // }

    // case 'SuperSourcePropertiesCommand': {
    //   this.updateSuperSource(0, state.properties)

    //     //this.checkFeedbacks('ssrc_');
    //   break
    // }

    // case 'TransitionPositionCommand': {
    //   this.updateME(state.mixEffect, state.properties)

    //   let iconId = state.properties.handlePosition / 100
    //   iconId = iconId >= 90 ? 90 : iconId >= 70 ? 70 : iconId >= 50 ? 50 : iconId >= 30 ? 30 : iconId >= 10 ? 10 : 0
    //   let newIcon = 'trans' + iconId

    //   if (
    //     newIcon != this.getME(state.mixEffect).transIcon ||
    //     state.properties.inTransition != this.getME(state.mixEffect).inTransition
    //   ) {
    //     this.getME(state.mixEffect).transIcon = newIcon

    //       this.checkFeedbacks('trans_state')
    //   }
    //   break
    // }

    // case 'TransitionPropertiesCommand': {
    //   this.updateME(state.mixEffect, state.properties)

    //     this.checkFeedbacks('trans_mods')
    //   break
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
      this.initDone = true
      this.atemState = this.atem.state

      this.log('info', 'Connected to a ' + this.atemState.info.productIdentifier)
      this.status(this.STATUS_OK)

      // TODO - is this ok to do here?
      this.setAtemModel(this.atemState.info.model, true)
      this.updateCompanionBits()
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
