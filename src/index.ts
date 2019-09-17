import { Atem, AtemState } from 'atem-connection'
import { MacroPropertiesState } from 'atem-connection/dist/state/macro'
import InstanceSkel = require('../../../instance_skel')
import { CompanionConfigField, CompanionSystem, CompanionVariable } from '../../../instance_skel_types'
import { ActionId, GetActionsList } from './actions'
import { GetSourcesListForType } from './choices'
import { AtemConfig, GetConfigFields, PresetStyleName } from './config'
import { FeedbackId, GetFeedbacksList } from './feedback'
import { GetAutoDetectModel, GetModelSpec, MODEL_AUTO_DETECT, ModelId, ModelSpec } from './models'
import { assertUnreachable } from './util'

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

  private states: any
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

    this.atem = new Atem({ externalLog: this.debug.bind(this) })
    this.atemState = new AtemState()

    this.states = {}
    this.initDone = false

    this.actions() // export actions
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
    this.initVariables()
    this.initFeedbacks()
    this.initPresets()

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
   * Setup the actions.
   *
   * @param {EventEmitter} system - the brains of the operation
   * @access public
   * @since 1.0.0
   */
  public actions() {
    // TODO - should it be public?
    this.setActions(GetActionsList(this.model, this.atemState))
  }

  /**
   * Executes the provided action.
   *
   * @param {Object} action - the action to be executed
   * @access public
   * @since 1.0.0
   */
  public action(action) {
    // let id = action.action
    // let cmd
    const opt = action.options

    const actionId = action.action as ActionId
    switch (actionId) {
      case ActionId.Program:
        this.atem.changeProgramInput(parseInt(opt.input), parseInt(opt.mixeffect))
        break
      case ActionId.Preview:
        this.atem.changePreviewInput(parseInt(opt.input), parseInt(opt.mixeffect))
        break
      case ActionId.USKSource:
        this.atem.setUpstreamKeyerFillSource(parseInt(opt.fill), parseInt(opt.mixeffect), parseInt(opt.key))
        this.atem.setUpstreamKeyerCutSource(parseInt(opt.cut), parseInt(opt.mixeffect), parseInt(opt.key))
        break
      case ActionId.DSKSource:
        this.atem.setDownstreamKeyFillSource(parseInt(opt.fill), parseInt(opt.key))
        this.atem.setDownstreamKeyCutSource(parseInt(opt.cut), parseInt(opt.key))
        break
      case ActionId.Aux:
        this.atem.setAuxSource(parseInt(opt.input), parseInt(opt.aux))
        break
      case ActionId.Cut:
        this.atem.cut(parseInt(opt.mixeffect))
        break
      case ActionId.USKOnAir:
        if (opt.onair == 'toggle') {
          this.atem.setUpstreamKeyerOnAir(
            !this.getUSK(opt.mixeffect, opt.key).onAir,
            parseInt(opt.mixeffect),
            parseInt(opt.key)
          )
        } else {
          this.atem.setUpstreamKeyerOnAir(opt.onair == 'true', parseInt(opt.mixeffect), parseInt(opt.key))
        }
        break
      case ActionId.DSKAuto:
        this.atem.autoDownstreamKey(parseInt(opt.downstreamKeyerId))
        break
      case ActionId.DSKOnAir:
        if (opt.onair == 'toggle') {
          this.atem.setDownstreamKeyOnAir(!this.getDSK(opt.key).onAir, parseInt(opt.key))
        } else {
          this.atem.setDownstreamKeyOnAir(opt.onair == 'true', parseInt(opt.key))
        }
        break
      case ActionId.Auto:
        this.atem.autoTransition(parseInt(opt.mixeffect))
        break
      case ActionId.MacroRun:
        const macroIndex = parseInt(opt.macro, 10) - 1
        const { macroPlayer, macroRecorder } = this.atemState.macro
        if (opt.action == 'runContinue' && macroPlayer.isWaiting && macroPlayer.macroIndex === macroIndex) {
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
        this.atem.setMultiViewerSource({ windowIndex: opt.windowIndex, source: opt.source }, opt.multiViewerId)
        break
      case ActionId.SuperSourceBoxSource:
        const box = { ...this.getSuperSourceBox(opt.boxIndex, 0) }
        box.source = opt.source
        this.atem.setSuperSourceBoxSettings(box, opt.boxIndex)
        break
      default:
        assertUnreachable(actionId)
        this.debug('Unknown action: ' + action.action)
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
  public feedback(feedback, _bank) {
    let out = {}
    const opt = feedback.options

    const feedbackType = feedback.type as FeedbackId
    switch (feedbackType) {
      case FeedbackId.PreviewBG:
        if (this.getME(opt.mixeffect).pvwSrc == parseInt(opt.input)) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.PreviewBG2:
        if (
          this.getME(opt.mixeffect1).pvwSrc == parseInt(opt.input1) &&
          this.getME(opt.mixeffect2).pvwSrc == parseInt(opt.input2)
        ) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.PreviewBG3:
        if (
          this.getME(opt.mixeffect1).pvwSrc == parseInt(opt.input1) &&
          this.getME(opt.mixeffect2).pvwSrc == parseInt(opt.input2) &&
          this.getME(opt.mixeffect3).pvwSrc == parseInt(opt.input3)
        ) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.PreviewBG4:
        if (
          this.getME(opt.mixeffect1).pvwSrc == parseInt(opt.input1) &&
          this.getME(opt.mixeffect2).pvwSrc == parseInt(opt.input2) &&
          this.getME(opt.mixeffect3).pvwSrc == parseInt(opt.input3) &&
          this.getME(opt.mixeffect4).pvwSrc == parseInt(opt.input4)
        ) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.ProgramBG:
        if (this.getME(opt.mixeffect).pgmSrc == parseInt(opt.input)) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.ProgramBG2:
        if (
          this.getME(opt.mixeffect1).pgmSrc == parseInt(opt.input1) &&
          this.getME(opt.mixeffect2).pgmSrc == parseInt(opt.input2)
        ) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.ProgramBG3:
        if (
          this.getME(opt.mixeffect1).pgmSrc == parseInt(opt.input1) &&
          this.getME(opt.mixeffect2).pgmSrc == parseInt(opt.input2) &&
          this.getME(opt.mixeffect3).pgmSrc == parseInt(opt.input3)
        ) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.ProgramBG4:
        if (
          this.getME(opt.mixeffect1).pgmSrc == parseInt(opt.input1) &&
          this.getME(opt.mixeffect2).pgmSrc == parseInt(opt.input2) &&
          this.getME(opt.mixeffect3).pgmSrc == parseInt(opt.input3) &&
          this.getME(opt.mixeffect4).pgmSrc == parseInt(opt.input4)
        ) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.AuxBG:
        const auxSource = this.atemState.video.auxilliaries[opt.aux]
        if (auxSource === parseInt(opt.input, 10)) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.USKBG:
        if (this.getUSK(opt.mixeffect, opt.key).onAir) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.USKSource:
        if (this.getUSK(opt.mixeffect, opt.key).fillSource == parseInt(opt.fill)) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.DSKBG:
        if (this.getDSK(opt.key).onAir) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.DSKSource:
        if (this.getDSK(opt.key).fillSource == parseInt(opt.fill)) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.Macro:
        const macro = this.atemState.macro.macroProperties[opt.macroIndex - 1] as MacroPropertiesState | undefined
        // TODO - tighten up typings from opt.state
        if (macro && macro[opt.state]) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.MVSource:
        if (this.getMvWindow(opt.multiViewerId, opt.windowIndex).source == opt.source) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      case FeedbackId.SSrcBoxSource:
        if (this.getSuperSourceBox(opt.boxIndex, 0).source == opt.source) {
          out = { color: opt.fg, bgcolor: opt.bg }
        }
        break
      default:
        assertUnreachable(feedbackType)
      // TODO - log
    }

    return out
  }

  /**
   * INTERNAL: returns the desired DSK state object.
   *
   * @param {number} id - the DSK id to fetch
   * @returns {Object} the desired DSK object
   * @access protected
   * @since 1.1.0
   */
  private getDSK(id) {
    if (this.states['dsk_' + id] === undefined) {
      this.states['dsk_' + id] = {
        downstreamKeyerId: id,
        fillSource: 0,
        cutSource: 0,
        onAir: 0,
        tie: 0,
        rate: 30,
        inTransition: 0,
        transIcon: 'trans0',
        isAuto: 0,
        remaingFrames: 0
      }
    }

    return this.states['dsk_' + id]
  }

  /**
   * INTERNAL: returns the desired ME state object.
   *
   * @param {number} id - the ME to fetch
   * @returns {Object} the desired ME object
   * @access protected
   * @since 1.1.0
   */
  private getME(id) {
    if (this.states['me_' + id] === undefined) {
      this.states['me_' + id] = {
        mixEffect: id,
        handlePosition: 0,
        remainingFrames: 0,
        inTransition: 0,
        style: 0,
        transIcon: 'trans0',
        selection: 1,
        preview: 0,
        pgmSrc: 0,
        pvwSrc: 0
      }
    }

    return this.states['me_' + id]
  }

  /**
   * INTERNAL: returns the desired MV state object.
   *
   * @param {number} id - the MV to fetch
   * @returns {Object} the desired MV object
   * @access protected
   * @since 1.1.0
   */
  private getMV(id) {
    if (this.states['mv_' + id] === undefined) {
      this.states['mv_' + id] = {
        multiViewerId: id,
        windows: {
          window0: { windowIndex: 0, source: 0 },
          window1: { windowIndex: 1, source: 0 },
          window2: { windowIndex: 2, source: 0 },
          window3: { windowIndex: 3, source: 0 },
          window4: { windowIndex: 4, source: 0 },
          window5: { windowIndex: 5, source: 0 },
          window6: { windowIndex: 6, source: 0 },
          window7: { windowIndex: 7, source: 0 },
          window8: { windowIndex: 8, source: 0 },
          window9: { windowIndex: 9, source: 0 }
        }
      }
    }

    return this.states['mv_' + id]
  }

  /**
   * INTERNAL: returns the desired mv window state object.
   *
   * @param {number} mv - the MV of the window to fetch
   * @param {number} window - the index of the window to fetch
   * @returns {Object} the desired MV window object
   * @access protected
   * @since 1.1.0
   */
  private getMvWindow(mv, window) {
    return this.getMV(mv).windows['window' + window]
  }

  /**
   * INTERNAL: returns the desired SuperSource box object.
   *
   * @param {number} box - the ssrc box to fetch
   * @param {number} id - the ssrc id to fetch
   * @returns {Object} the desired ssrc object
   * @access protected
   * @since 1.1.7
   */
  private getSuperSourceBox(box, id = 0) {
    if (this.states['ssrc' + id + 'box' + box] === undefined) {
      this.states['ssrc' + id + 'box' + box] = {
        enabled: 0,
        source: 0,
        x: 0,
        y: 0,
        size: 0,
        cropped: 0,
        cropTop: 0,
        cropBottom: 0,
        cropLeft: 0,
        cropRight: 0
      }
    }

    return this.states['ssrc' + id + 'box' + box]
  }

  /**
   * INTERNAL: returns the desired USK state object.
   *
   * @param {number} me - the ME of the USK to fetch
   * @param {number} keyer - the ID of the USK to fetch
   * @returns {Object} the desired USK object
   * @access protected
   * @since 1.1.0
   */
  private getUSK(me, keyer) {
    if (this.states['usk_' + me + '_' + keyer] === undefined) {
      this.states['usk_' + me + '_' + keyer] = {
        mixEffect: me,
        upstreamKeyerId: keyer,
        mixEffectKeyType: 0,
        fillSource: 0,
        cutSource: 0,
        onAir: 0
      }
    }

    return this.states['usk_' + me + '_' + keyer]
  }

  /**
   * INTERNAL: initialize feedbacks.
   *
   * @access protected
   * @since 1.0.0
   */
  private initFeedbacks() {
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.model, this.atemState))
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

  private getSourcePresetName(id: number) {
    const input = this.atemState.inputs[id]
    if (input) {
      return this.config.presets === PresetStyleName.Long ? input.longName : input.shortName
    } else {
      return `Unknown (${id})`
    }
  }

  /**
   * INTERNAL: initialize variables.
   *
   * @access protected
   * @since 1.0.0
   */
  private initVariables() {
    // variable_set
    const variables: CompanionVariable[] = []

    // PGM/PV busses
    for (let i = 0; i < this.model.MEs; ++i) {
      variables.push({
        label: 'Label of input active on program bus (M/E ' + (i + 1) + ')',
        name: 'pgm' + (i + 1) + '_input'
      })

      {
        const id = this.getME(i).pgmSrc
        this.setVariable('pgm' + (i + 1) + '_input', this.getSourcePresetName(id))
      }
      variables.push({
        label: 'Label of input active on preview bus (M/E ' + (i + 1) + ')',
        name: 'pvw' + (i + 1) + '_input'
      })

      {
        const id = this.getME(i).pvwSrc
        this.setVariable('pvw' + (i + 1) + '_input', this.getSourcePresetName(id))
      }

      for (let k = 0; k < this.model.USKs; ++k) {
        variables.push({
          label: 'Label of input active on M/E ' + (i + 1) + ' Key ' + (k + 1),
          name: 'usk_' + (i + 1) + '_' + (k + 1) + '_input'
        })

        const id = this.getUSK(i, k).fillSource
        this.setVariable('usk_' + (i + 1) + '_' + (k + 1) + '_input', this.getSourcePresetName(id))
      }
    }

    // DSKs
    for (let k = 0; k < this.model.DSKs; ++k) {
      variables.push({
        label: 'Label of input active on DSK ' + (k + 1),
        name: 'dsk_' + (k + 1) + '_input'
      })

      const id = this.getDSK(k).fillSource
      this.setVariable('dsk_' + (k + 1) + '_input', this.getSourcePresetName(id))
    }

    // Input names
    for (const src of GetSourcesListForType(this.model, this.atemState)) {
      variables.push({
        label: 'Long name of input id ' + src.id,
        name: 'long_' + src.id
      })
      variables.push({
        label: 'Short name of input id ' + src.id,
        name: 'short_' + src.id
      })

      this.setVariable('long_' + src.id, src.longName)
      this.setVariable('short_' + src.id, src.shortName)
    }

    // Macros
    for (let i = 0; i < this.model.macros; i++) {
      variables.push({
        label: `Name of macro #${i + 1}`,
        name: `macro_${i + 1}`
      })

      this.updateMacroVariable(i)
    }

    this.setVariableDefinitions(variables)
  }

  private updateMacroVariable(id: number) {
    const macro = this.atemState.macro.macroProperties[id]
    this.setVariable(
      `macro_${id + 1}`,
      (macro && macro.description ? macro.description : macro.name) || `Macro ${id + 1}`
    )
  }

  /**
   * INTERNAL: Callback for ATEM connection to state change responses.
   *
   * @param {?boolean} err - null if a normal result, true if there was an error
   * @param {Object} state - state details in object array
   * @access protected
   * @since 1.1.0
   */
  private processStateChange(_err, state) {
    if (this.initDone) {
      this.atemState = state
    }

    switch (state.constructor.name) {
      case 'AuxSourceCommand': {
        // this.getAux(state.auxBus).auxSource = state.properties.source

        this.checkFeedbacks(FeedbackId.AuxBG)
        break
      }
      case 'DownstreamKeyPropertiesCommand': {
        this.updateDSK(state.downstreamKeyerId, state.properties)

        this.checkFeedbacks(FeedbackId.DSKBG)
        break
      }

      case 'DownstreamKeySourcesCommand': {
        this.updateDSK(state.downstreamKeyerId, state.properties)

        const id = state.properties.fillSource
        this.setVariable('dsk_' + (state.downstreamKeyerId + 1) + '_input', this.getSourcePresetName(id))

        this.checkFeedbacks(FeedbackId.DSKSource)
        break
      }
      case 'DownstreamKeyStateCommand': {
        this.updateDSK(state.downstreamKeyerId, state.properties)

        this.checkFeedbacks(FeedbackId.DSKBG)
        break
      }

      case 'InitCompleteCommand': {
        this.debug('Init done')
        this.initDone = true
        this.atemState = state
        this.log('info', 'Connected to a ' + this.atemState.info.productIdentifier)

        this.setAtemModel(this.atemState.info.model, true)
        this.checkFeedbacks()
        break
      }

      case 'InputPropertiesCommand': {
        // this.updateSource(state.inputId, state.properties)
        // reset everything, since names of inputs might have changed
        this.initVariables()
        this.initFeedbacks()
        this.actions()
        break
      }

      case 'MixEffectKeyOnAirCommand': {
        this.updateUSK(state.mixEffect, state.upstreamKeyerId, state.properties)

        this.checkFeedbacks(FeedbackId.USKBG)
        break
      }
      case 'MixEffectKeyPropertiesGetCommand': {
        this.updateUSK(state.mixEffect, state.properties.upstreamKeyerId, state.properties)

        const id = state.properties.fillSource
        this.setVariable(
          'usk_' + (state.mixEffect + 1) + '_' + (state.properties.upstreamKeyerId + 1) + '_input',
          this.getSourcePresetName(id)
        )

        this.checkFeedbacks(FeedbackId.USKSource)
        break
      }

      case 'MacroPropertiesCommand': {
        this.updateMacroVariable(state.properties.index) // TODO - check this

        this.checkFeedbacks(FeedbackId.Macro)
        break
      }
      case 'MacroRecordingStatusCommand': {
        this.checkFeedbacks(FeedbackId.Macro)
        break
      }
      case 'MacroRunStatusCommand': {
        this.checkFeedbacks(FeedbackId.Macro)
        break
      }

      case 'MultiViewerSourceCommand': {
        this.updateMvWindow(state.multiViewerId, state.properties.windowIndex, state.properties)

        this.checkFeedbacks(FeedbackId.MVSource)
        break
      }

      case 'ProgramInputCommand': {
        this.getME(state.mixEffect).pgmSrc = state.properties.source

        const id = state.properties.source
        this.setVariable('pgm' + (state.mixEffect + 1) + '_input', this.getSourcePresetName(id))

        this.checkFeedbacks(FeedbackId.ProgramBG)
        this.checkFeedbacks(FeedbackId.ProgramBG2)
        this.checkFeedbacks(FeedbackId.ProgramBG3)
        this.checkFeedbacks(FeedbackId.ProgramBG4)
        break
      }

      case 'PreviewInputCommand': {
        this.getME(state.mixEffect).pvwSrc = state.properties.source

        const id = state.properties.source
        this.setVariable('pvw' + (state.mixEffect + 1) + '_input', this.getSourcePresetName(id))

        this.checkFeedbacks(FeedbackId.PreviewBG)
        this.checkFeedbacks(FeedbackId.PreviewBG2)
        this.checkFeedbacks(FeedbackId.PreviewBG3)
        this.checkFeedbacks(FeedbackId.PreviewBG4)
        break
      }

      // case 'PreviewTransitionCommand': {
      //   this.getME(state.mixEffect).preview = state.properties.preview

      //     this.checkFeedbacks('trans_pvw')
      //   break
      // }
      case 'SuperSourceBoxPropertiesCommand': {
        this.updateSuperSourceBox(state.boxId, 0, state.properties)

        this.checkFeedbacks(FeedbackId.SSrcBoxSource)
        break
      }

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

      this.actions()
      this.initVariables()
      this.initFeedbacks()
      this.initPresets()
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

  /**
   * Update an array of properties for a DSK.
   *
   * @param {number} id - the source id
   * @param {Object} properties - the new properties
   * @access public
   * @since 1.1.0
   */
  private updateDSK(id, properties) {
    const dsk = this.getDSK(id)

    if (typeof properties === 'object') {
      for (const x in properties) {
        dsk[x] = properties[x]
      }
    }
  }

  /**
   * Update an array of properties for a MV window.
   *
   * @param {number} mv - the MV of the window
   * @param {number} window - the index of the window
   * @param {Object} properties - the new properties
   * @access public
   * @since 1.1.0
   */
  private updateMvWindow(mv, window, properties) {
    const index = this.getMvWindow(mv, window)

    if (typeof properties === 'object') {
      for (const x in properties) {
        index[x] = properties[x]
      }
    }
  }

  /**
   * Update an array of properties for a SuperSource.
   *
   * @param {number} box - the box id
   * @param {number} id - the SuperSource id
   * @param {Object} properties - the new properties
   * @access public
   * @since 1.1.7
   */
  private updateSuperSourceBox(boxId, id, properties) {
    const box = this.getSuperSourceBox(boxId, id)

    if (typeof properties === 'object') {
      for (const x in properties) {
        box[x] = properties[x]
      }
    }
  }

  /**
   * Update an array of properties for a USK.
   *
   * @param {number} me - the ME of the USK
   * @param {number} keyer - the ID of the USK
   * @param {Object} properties - the new properties
   * @access public
   * @since 1.1.0
   */
  private updateUSK(me, keyer, properties) {
    const usk = this.getUSK(me, keyer)

    if (typeof properties === 'object') {
      for (const x in properties) {
        usk[x] = properties[x]
      }
    }
  }
}

export = AtemInstance
