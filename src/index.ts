import { Atem, AtemState } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionConfigField, CompanionSystem, CompanionVariable } from '../../../instance_skel_types'
import { CHOICES_KEYTRANS, GetSourcesListForType } from './choices'
import { AtemConfig, GetConfigFields } from './config'
import { FeedbackId, GetFeedbacksList } from './feedback'
import { GetAutoDetectModel, GetModelSpec, MODEL_AUTO_DETECT, ModelId, ModelSpec } from './models'
import {
  AtemMEPicker,
  AtemUSKPicker,
  AtemDSKPicker,
  AtemAuxPicker,
  AtemMultiviewerPicker,
  AtemAuxSourcePicker,
  AtemMESourcePicker,
  AtemKeyFillSourcePicker,
  AtemKeyCutSourcePicker,
  AtemSuperSourceBoxPicker,
  AtemSuperSourceBoxSourcePicker,
  AtemMultiviewSourcePicker,
  AtemMultiviewWindowPicker
} from './input'

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
  private CHOICES_MACRORUN: Array<{ id: string; label: string }>

  // private CHOICES_MESOURCES: any
  // private CHOICES_MVWINDOW: any
  // private CHOICES_MVSOURCES: any

  private model: ModelSpec
  private atem: Atem
  private atemState: AtemState

  private states: any
  private macros: any
  private deviceName: any
  private deviceModel: any
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

    this.atemState = new AtemState()

    // this.model = {}
    this.states = {}
    // this.sources = []
    this.macros = []
    this.deviceName = ''
    this.deviceModel = 0
    this.initDone = false

    this.CHOICES_MACRORUN = [{ id: 'run', label: 'Run' }, { id: 'runContinue', label: 'Run/Continue' }]

    // this.setupMvWindowChoices()

    const newModel = this.config.modelID ? GetModelSpec(this.config.modelID) : undefined
    this.model = newModel || GetAutoDetectModel()
    this.config.modelID = this.model.id

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
  actions() {
    // this.setupSourceChoices()

    this.setActions({
      program: {
        label: 'Set input on Program',
        options: [AtemMEPicker(this.model, 0), AtemMESourcePicker(this.model, this.atemState, 0)]
      },
      preview: {
        label: 'Set input on Preview',
        options: [AtemMEPicker(this.model, 0), AtemMESourcePicker(this.model, this.atemState, 0)]
      },
      uskSource: {
        label: 'Set inputs on Upstream KEY',
        options: [
          AtemMEPicker(this.model, 0),
          AtemUSKPicker(this.model),
          AtemKeyFillSourcePicker(this.model, this.atemState),
          AtemKeyCutSourcePicker(this.model, this.atemState)
        ]
      },
      dskSource: {
        label: 'Set inputs on Downstream KEY',
        options: [
          AtemDSKPicker(this.model),
          AtemKeyFillSourcePicker(this.model, this.atemState),
          AtemKeyCutSourcePicker(this.model, this.atemState)
        ]
      },
      aux: {
        label: 'Set AUX bus',
        options: [AtemAuxPicker(this.model), AtemAuxSourcePicker(this.model, this.atemState)]
      },
      usk: {
        label: 'Set Upstream KEY OnAir',
        options: [
          {
            id: 'onair',
            type: 'dropdown',
            label: 'On Air',
            default: 'true',
            choices: CHOICES_KEYTRANS
          },
          AtemMEPicker(this.model, 0),
          AtemUSKPicker(this.model)
        ]
      },
      dskAuto: {
        label: 'AUTO DSK Transition',
        options: [AtemDSKPicker(this.model)]
      },
      dsk: {
        label: 'Set Downstream KEY OnAir',
        options: [
          {
            id: 'onair',
            type: 'dropdown',
            label: 'On Air',
            default: 'true',
            choices: CHOICES_KEYTRANS
          },
          AtemDSKPicker(this.model)
        ]
      },
      cut: {
        label: 'CUT operation',
        options: [AtemMEPicker(this.model, 0)]
      },
      auto: {
        label: 'AUTO transition operation',
        options: [AtemMEPicker(this.model, 0)]
      },
      macrorun: {
        label: 'Run MACRO',
        options: [
          {
            type: 'textinput',
            id: 'macro',
            label: 'Macro number',
            default: 1,
            regex: '/^([1-9]|[1-9][0-9]|100)$/'
          },
          {
            type: 'dropdown',
            id: 'action',
            label: 'Action',
            default: 'run',
            choices: this.CHOICES_MACRORUN
          }
        ]
      },
      macrocontinue: { label: 'Continue MACRO' },
      macrostop: { label: 'Stop MACROS' },
      setMvSource: {
        label: 'Change MV window source',
        options: [
          AtemMultiviewerPicker(this.model),
          AtemMultiviewWindowPicker(),
          AtemMultiviewSourcePicker(this.model, this.atemState)
        ]
      },
      setSsrcBoxSource: {
        label: 'Change SuperSource box source',
        options: [AtemSuperSourceBoxPicker(), AtemSuperSourceBoxSourcePicker(this.model, this.atemState)]
      }
    })
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
    let opt = action.options

    switch (action.action) {
      case 'program':
        this.atem.changeProgramInput(parseInt(opt.input), parseInt(opt.mixeffect))
        break
      case 'preview':
        this.atem.changePreviewInput(parseInt(opt.input), parseInt(opt.mixeffect))
        break
      case 'uskSource':
        this.atem.setUpstreamKeyerFillSource(parseInt(opt.fill), parseInt(opt.mixeffect), parseInt(opt.key))
        this.atem.setUpstreamKeyerCutSource(parseInt(opt.cut), parseInt(opt.mixeffect), parseInt(opt.key))
        break
      case 'dskSource':
        this.atem.setDownstreamKeyFillSource(parseInt(opt.fill), parseInt(opt.key))
        this.atem.setDownstreamKeyCutSource(parseInt(opt.cut), parseInt(opt.key))
        break
      case 'aux':
        this.atem.setAuxSource(parseInt(opt.input), parseInt(opt.aux))
        break
      case 'cut':
        this.atem.cut(parseInt(opt.mixeffect))
        break
      case 'usk':
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
      case 'dskAuto':
        this.atem.autoDownstreamKey(parseInt(opt.downstreamKeyerId))
        break
      case 'dsk':
        if (opt.onair == 'toggle') {
          this.atem.setDownstreamKeyOnAir(!this.getDSK(opt.key).onAir, parseInt(opt.key))
        } else {
          this.atem.setDownstreamKeyOnAir(opt.onair == 'true', parseInt(opt.key))
        }
        break
      case 'auto':
        this.atem.autoTransition(parseInt(opt.mixeffect))
        break
      case 'macrorun':
        if (opt.action == 'runContinue' && this.getMacro(parseInt(opt.macro) - 1).isWaiting == 1) {
          this.atem.macroContinue()
        } else if (this.getMacro(parseInt(opt.macro) - 1).isRecording == 1) {
          this.atem.macroStopRecord()
        } else {
          this.atem.macroRun(parseInt(opt.macro) - 1)
        }
        break
      case 'macrocontinue':
        this.atem.macroContinue()
        break
      case 'macrostop':
        this.atem.macroStop()
        break
      case 'setMvSource':
        this.atem.setMultiViewerSource({ windowIndex: opt.windowIndex, source: opt.source }, opt.multiViewerId)
        break
      case 'setSsrcBoxSource':
        let box = Object.assign({}, this.getSuperSourceBox(opt.boxIndex, 0))
        box.source = opt.source
        this.atem.setSuperSourceBoxSettings(box, opt.boxIndex)
        break
      default:
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
    let opt = feedback.options

    if (feedback.type == 'preview_bg') {
      if (this.getME(opt.mixeffect).pvwSrc == parseInt(opt.input)) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'preview_bg_2') {
      if (
        this.getME(opt.mixeffect1).pvwSrc == parseInt(opt.input1) &&
        this.getME(opt.mixeffect2).pvwSrc == parseInt(opt.input2)
      ) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'preview_bg_3') {
      if (
        this.getME(opt.mixeffect1).pvwSrc == parseInt(opt.input1) &&
        this.getME(opt.mixeffect2).pvwSrc == parseInt(opt.input2) &&
        this.getME(opt.mixeffect3).pvwSrc == parseInt(opt.input3)
      ) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'preview_bg_4') {
      if (
        this.getME(opt.mixeffect1).pvwSrc == parseInt(opt.input1) &&
        this.getME(opt.mixeffect2).pvwSrc == parseInt(opt.input2) &&
        this.getME(opt.mixeffect3).pvwSrc == parseInt(opt.input3) &&
        this.getME(opt.mixeffect4).pvwSrc == parseInt(opt.input4)
      ) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'program_bg') {
      if (this.getME(opt.mixeffect).pgmSrc == parseInt(opt.input)) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'program_bg_2') {
      if (
        this.getME(opt.mixeffect1).pgmSrc == parseInt(opt.input1) &&
        this.getME(opt.mixeffect2).pgmSrc == parseInt(opt.input2)
      ) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'program_bg_3') {
      if (
        this.getME(opt.mixeffect1).pgmSrc == parseInt(opt.input1) &&
        this.getME(opt.mixeffect2).pgmSrc == parseInt(opt.input2) &&
        this.getME(opt.mixeffect3).pgmSrc == parseInt(opt.input3)
      ) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'program_bg_4') {
      if (
        this.getME(opt.mixeffect1).pgmSrc == parseInt(opt.input1) &&
        this.getME(opt.mixeffect2).pgmSrc == parseInt(opt.input2) &&
        this.getME(opt.mixeffect3).pgmSrc == parseInt(opt.input3) &&
        this.getME(opt.mixeffect4).pgmSrc == parseInt(opt.input4)
      ) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type === 'aux_bg') {
      const auxSource = this.atemState.video.auxilliaries[opt.aux]
      if (auxSource === parseInt(opt.input, 10)) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'usk_bg') {
      if (this.getUSK(opt.mixeffect, opt.key).onAir) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'usk_source') {
      if (this.getUSK(opt.mixeffect, opt.key).fillSource == parseInt(opt.fill)) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'dsk_bg') {
      if (this.getDSK(opt.key).onAir) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'dsk_source') {
      if (this.getDSK(opt.key).fillSource == parseInt(opt.fill)) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'macro') {
      if (this.getMacro(opt.macroIndex - 1)[opt.state] == 1) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'mv_source') {
      if (this.getMvWindow(opt.multiViewerId, opt.windowIndex).source == opt.source) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    } else if (feedback.type == 'ssrc_box_source') {
      if (this.getSuperSourceBox(opt.boxIndex, 0).source == opt.source) {
        out = { color: opt.fg, bgcolor: opt.bg }
      }
    }

    return out
  }

  // /**
  //  * INTERNAL: returns the desired Aux state object.
  //  *
  //  * @param {number} id - the aux id to fetch
  //  * @returns {Object} the desired aux object
  //  * @access protected
  //  * @since 1.1.0
  //  */
  // private getAux(id) {
  //   return this.getSource(8000 + id + 1)
  // }

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
   * INTERNAL: returns the desired macro state object.
   * These are indexed -1 of the human value.
   *
   * @param {number} id - the macro id to fetch
   * @returns {Object} the desired macro object
   * @access protected
   * @since 1.1.0
   */
  private getMacro(id) {
    if (this.macros[id] === undefined) {
      this.macros[id] = {
        macroIndex: id,
        isRunning: 0,
        isWaiting: 0,
        isUsed: 0,
        isRecording: 0,
        loop: 0,
        label: 'Macro ' + (id + 1),
        name: 'Macro ' + (id + 1),
        description: ''
      }
    }

    return this.macros[id]
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

  // /**
  //  * INTERNAL: returns the desired source object.
  //  *
  //  * @param {number} id - the source to fetch
  //  * @returns {Object} the desired source object
  //  * @access protected
  //  * @since 1.1.0
  //  */
  // private getSource(id) {
  //   if (this.sources[id] === undefined) {
  //     this.sources[id] = {
  //       id,
  //       init: false,
  //       label: '',
  //       // shortLabel: '',
  //       useME: false,
  //       useAux: false,
  //       useMV: false,
  //       longName: '',
  //       shortName: ''
  //     }
  //   }

  //   return this.sources[id]
  // }

  // /**
  //  * INTERNAL: returns the desired SuperSource object.
  //  *
  //  * @param {number} id - the ssrc id to fetch
  //  * @returns {Object} the desired ssrc object
  //  * @access protected
  //  * @since 1.1.7
  //  */
  // private getSuperSource(id = 0) {
  //   if (this.states['ssrc' + id] === undefined) {
  //     this.states['ssrc' + id] = {
  //       artFillSource: 0,
  //       artCutSource: 0,
  //       artOption: 0,
  //       artPreMultiplied: 0,
  //       artClip: 0,
  //       artGain: 0,
  //       artInvertKey: 0,
  //       borderEnabled: 0,
  //       borderBevel: 0,
  //       borderOuterWidth: 0,
  //       borderInnerWidth: 0,
  //       borderOuterSoftness: 0,
  //       borderInnerSoftness: 0,
  //       borderBevelSoftness: 0,
  //       borderBevelPosition: 0,
  //       borderHue: 0,
  //       borderSaturation: 0,
  //       borderLuma: 0,
  //       borderLightSourceDirection: 0,
  //       borderLightSourceAltitude: 0
  //     }
  //   }

  //   return this.states['ssrc' + id]
  // }

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
      return this.config.presets == 1 ? input.longName : input.shortName
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
        let id = this.getME(i).pgmSrc
        this.setVariable('pgm' + (i + 1) + '_input', this.getSourcePresetName(id))
      }
      variables.push({
        label: 'Label of input active on preview bus (M/E ' + (i + 1) + ')',
        name: 'pvw' + (i + 1) + '_input'
      })

      {
        let id = this.getME(i).pvwSrc
        this.setVariable('pvw' + (i + 1) + '_input', this.getSourcePresetName(id))
      }

      for (let k = 0; k < this.model.USKs; ++k) {
        variables.push({
          label: 'Label of input active on M/E ' + (i + 1) + ' Key ' + (k + 1),
          name: 'usk_' + (i + 1) + '_' + (k + 1) + '_input'
        })

        let id = this.getUSK(i, k).fillSource
        this.setVariable('usk_' + (i + 1) + '_' + (k + 1) + '_input', this.getSourcePresetName(id))
      }
    }

    // DSKs
    for (let k = 0; k < this.model.DSKs; ++k) {
      variables.push({
        label: 'Label of input active on DSK ' + (k + 1),
        name: 'dsk_' + (k + 1) + '_input'
      })

      let id = this.getDSK(k).fillSource
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
        label: 'Name of macro id ' + (i + 1),
        name: 'macro_' + (i + 1)
      })

      this.setVariable(
        'macro_' + (i + 1),
        this.getMacro(i).description != '' ? this.getMacro(i).description : this.getMacro(i).label
      )
    }

    this.setVariableDefinitions(variables)
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

        let id = state.properties.fillSource
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
        this.log('info', 'Connected to a ' + this.deviceName)

        this.setAtemModel(this.deviceModel, true)
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

        let id = state.properties.fillSource
        this.setVariable(
          'usk_' + (state.mixEffect + 1) + '_' + (state.properties.upstreamKeyerId + 1) + '_input',
          this.getSourcePresetName(id)
        )

        this.checkFeedbacks(FeedbackId.USKSource)
        break
      }

      case 'MacroPropertiesCommand': {
        this.updateMacro(state.properties.macroIndex, state.properties)

        this.checkFeedbacks(FeedbackId.Macro)
        break
      }
      case 'MacroRecordingStatusCommand': {
        this.updateMacro(state.properties.macroIndex, state.properties)

        this.checkFeedbacks(FeedbackId.Macro)
        break
      }
      case 'MacroRunStatusCommand': {
        this.updateMacro(state.properties.macroIndex, state.properties)

        this.checkFeedbacks(FeedbackId.Macro)
        break
      }

      case 'MultiViewerSourceCommand': {
        this.updateMvWindow(state.multiViewerId, state.properties.windowIndex, state.properties)

        this.checkFeedbacks(FeedbackId.MVSource)
        break
      }

      case 'ProductIdentifierCommand': {
        this.deviceModel = state.properties.model
        this.deviceName = state.properties.deviceName
        break
      }

      case 'ProgramInputCommand': {
        this.getME(state.mixEffect).pgmSrc = state.properties.source

        let id = state.properties.source
        this.setVariable('pgm' + (state.mixEffect + 1) + '_input', this.getSourcePresetName(id))

        this.checkFeedbacks(FeedbackId.ProgramBG)
        this.checkFeedbacks(FeedbackId.ProgramBG2)
        this.checkFeedbacks(FeedbackId.ProgramBG3)
        this.checkFeedbacks(FeedbackId.ProgramBG4)
        break
      }

      case 'PreviewInputCommand': {
        this.getME(state.mixEffect).pvwSrc = state.properties.source

        let id = state.properties.source
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

  // /**
  //  * INTERNAL: Resets the init flag in the sources so that the now mode
  //  * can be processed without deleting the existing data.
  //  *
  //  * @access protected
  //  * @since 1.1.0
  //  */
  // private resetSources() {
  //   for (let x in this.sources) {
  //     this.sources[x].init = false
  //   }
  // }

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
      if ((live === true && this.config.modelID == 0) || (live == false && (this.deviceModel == 0 || modelID > 0))) {
        this.model = newModel
        this.debug('ATEM Model: ' + this.model.id)
      }

      // This is a funky test, but necessary.  Can it somehow be an else if of the above ... or simply an else?
      if (
        (live === false && this.deviceModel > 0 && modelID > 0 && modelID != this.deviceModel) ||
        (live === true && this.config.modelID && this.config.modelID > 0 && this.deviceModel != this.config.modelID)
      ) {
        this.log(
          'error',
          'Connected to a ' +
            this.deviceName +
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

  // /**
  //  * INTERNAL: populate base source data into its object.
  //  *
  //  * @param {number} id - the source id
  //  * @param {number} useME - number, but 0,1, if the source is available to MEs
  //  * @param {number} useAux - number, but 0,1, if the source is available to Auxes
  //  * @param {number} useMV - number, but 0,1, if the source is available to MVs
  //  * @param {String} shortLabel - the source's base short name
  //  * @param {String} label - the source's base long name
  //  * @access protected
  //  * @since 1.1.0
  //  */
  // private setSource(id: number, useME: boolean, useAux: boolean, useMV: boolean, shortLabel: string, label: string) {
  //   let source = this.getSource(id)

  //   // Use ATEM names if we got um
  //   if (source.longName != '') {
  //     source.label = source.longName
  //   } else {
  //     source.label = label
  //     source.longName = label
  //   }

  //   // if (source.shortName != '') {
  //   //   source.shortLabel = source.shortName
  //   // } else {
  //   //   source.shortLabel = shortLabel
  //   //   source.shortName = shortLabel
  //   // }

  //   source.id = id
  //   source.useME = useME
  //   source.useAux = useAux
  //   source.useMV = useMV
  //   source.init = true
  // }

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

    if (this.config.host !== undefined) {
      this.atem.connect(this.config.host)
    }
  }

  // /**
  //  * INTERNAL: use config data to define the choices for the MV Window dropdowns.
  //  *
  //  * @access protected
  //  * @since 1.1.0
  //  */
  // private setupMvWindowChoices() {
  //   this.CHOICES_MVWINDOW = []

  //   for (let i = 2; i < 10; i++) {
  //     this.CHOICES_MVWINDOW.push({ id: i, label: 'Window ' + (i + 1) })
  //   }
  // }

  // /**
  //  * INTERNAL: use model data to define the choices for the source dropdowns.
  //  *
  //  * @access protected
  //  * @since 1.1.0
  //  */
  // private setupSourceChoices() {
  //   this.resetSources()

  //   // this.setSource(0, true, true, true, 'Blck', 'Black')
  //   // this.setSource(1000, true, true, true, 'Bars', 'Bars')
  //   // this.setSource(2001, true, true, true, 'Col1', 'Color 1')
  //   // // this.setSource(2002, true, true, true, 'Col2', 'Color 2')
  //   // this.setSource(7001, false, true, true, 'Cln1', 'Clean Feed 1')
  //   // this.setSource(7002, false, true, true, 'Cln2', 'Clean Feed 2')

  //   // if (this.model.SSrc > 0) {
  //   //   this.setSource(6000, true, true, true, 'SSrc', 'Super Source')
  //   // }

  //   // for (let i = 1; i <= this.model.inputs; i++) {
  //   //   this.setSource(i, true, true, true, i < 10 ? 'In ' + i : 'In' + i, 'Input ' + i)
  //   // }

  //   // for (let i = 1; i <= this.model.MPs; i++) {
  //   //   this.setSource(3000 + i * 10, true, true, true, 'MP ' + i, 'Media Player ' + i)
  //   //   this.setSource(3000 + i * 10 + 1, true, true, true, 'MP' + i + 'K', 'Media Player ' + i + ' Key')
  //   // }

  //   // for (let i = 1; i <= this.model.MEs; i++) {
  //   //   // ME 1 can't be used as an ME source, hence i>1 for useME
  //   //   this.setSource(10000 + i * 10, i > 1, true, true, 'M' + i + 'PG', 'ME ' + i + ' Program')
  //   //   this.setSource(10000 + i * 10 + 1, i > 1, true, true, 'M' + i + 'PV', 'ME ' + i + ' Preview')
  //   // }

  //   // for (let i = 1; i <= this.model.auxes; i++) {
  //   //   this.setSource(8000 + i, false, false, true, 'Aux' + i, 'Auxilary ' + i)
  //   // }

  //   this.CHOICES_AUXSOURCES = []
  //   this.CHOICES_MESOURCES = []
  //   this.CHOICES_MVSOURCES = []

  //   for (let key in this.sources) {
  //     if (this.sources[key].init == true && this.sources[key].useAux === true) {
  //       this.CHOICES_AUXSOURCES.push({ id: key, label: this.sources[key].label })
  //     }

  //     if (this.sources[key].init == true && this.sources[key].useME === true) {
  //       this.CHOICES_MESOURCES.push({ id: key, label: this.sources[key].label })
  //     }

  //     if (this.sources[key].init == true && this.sources[key].useMV === true) {
  //       this.CHOICES_MVSOURCES.push({ id: key, label: this.sources[key].label })
  //     }
  //   }

  //   this.CHOICES_AUXSOURCES.sort(function(a, b) {
  //     return a.id - b.id
  //   })
  //   this.CHOICES_MESOURCES.sort(function(a, b) {
  //     return a.id - b.id
  //   })
  //   this.CHOICES_MVSOURCES.sort(function(a, b) {
  //     return a.id - b.id
  //   })
  // }

  /**
   * Update an array of properties for a DSK.
   *
   * @param {number} id - the source id
   * @param {Object} properties - the new properties
   * @access public
   * @since 1.1.0
   */
  private updateDSK(id, properties) {
    let dsk = this.getDSK(id)

    if (typeof properties === 'object') {
      for (let x in properties) {
        dsk[x] = properties[x]
      }
    }
  }

  /**
   * Update an array of properties for a macro.
   *
   * @param {number} id - the macro id
   * @param {Object} properties - the new properties
   * @access public
   * @since 1.1.0
   */
  private updateMacro(id, properties) {
    if (typeof properties === 'object') {
      if (id == 65535) {
        for (let x in properties) {
          if (properties[x] == 0) {
            for (let i in this.macros) {
              this.macros[i][x] = properties[x]
            }
          }
        }
      } else {
        let macro = this.getMacro(id)

        for (let x in properties) {
          macro[x] = properties[x]
        }

        this.setVariable('macro_' + (id + 1), macro.description != '' ? macro.description : macro.label)
      }
    }
  }

  // /**
  //  * Update an array of properties for a ME.
  //  *
  //  * @param {number} id - the ME id
  //  * @param {Object} properties - the new properties
  //  * @access public
  //  * @since 1.1.0
  //  */
  // private updateME(id, properties) {
  //   let me = this.getME(id)

  //   if (typeof properties === 'object') {
  //     for (let x in properties) {
  //       me[x] = properties[x]
  //     }
  //   }
  // }

  // /**
  //  * Update an array of properties for a MV.
  //  *
  //  * @param {number} id - the MV id
  //  * @param {Object} properties - the new properties
  //  * @access public
  //  * @since 1.1.0
  //  */
  // private updateMV(id, properties) {
  //   let mv = this.getMV(id)

  //   if (typeof properties === 'object') {
  //     for (let x in properties) {
  //       mv[x] = properties[x]
  //     }
  //   }
  // }

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
    let index = this.getMvWindow(mv, window)

    if (typeof properties === 'object') {
      for (let x in properties) {
        index[x] = properties[x]
      }
    }
  }

  // /**
  //  * Update an array of properties for a source.
  //  *
  //  * @param {number} id - the source id
  //  * @param {Object} properties - the new properties
  //  * @access public
  //  * @since 1.1.0
  //  */
  // private updateSource(id, properties) {
  //   let source = this.getSource(id)

  //   if (typeof properties === 'object') {
  //     for (let x in properties) {
  //       source[x] = properties[x]
  //     }
  //   }
  // }

  // /**
  //  * Update an array of properties for a SuperSource.
  //  *
  //  * @param {number} id - the SuperSource id
  //  * @param {Object} properties - the new properties
  //  * @access public
  //  * @since 1.1.7
  //  */
  // private updateSuperSource(id, properties) {
  //   let ssrc = this.getSuperSource(id)

  //   if (typeof properties === 'object') {
  //     for (let x in properties) {
  //       ssrc[x] = properties[x]
  //     }
  //   }
  // }

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
    let box = this.getSuperSourceBox(boxId, id)

    if (typeof properties === 'object') {
      for (let x in properties) {
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
    let usk = this.getUSK(me, keyer)

    if (typeof properties === 'object') {
      for (let x in properties) {
        usk[x] = properties[x]
      }
    }
  }
}

export = AtemInstance
