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
import { GetPresetsList } from './presets'
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
 */
class AtemInstance extends InstanceSkel<AtemConfig> {
  private model: ModelSpec
  private atem: Atem
  private atemState: AtemState
  private initDone: boolean

  /**
   * Create an instance of an ATEM module.
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
   */
  public updateConfig(config: AtemConfig) {
    this.config = config

    this.initDone = false
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
   */
  public action(action: CompanionActionEvent) {
    HandleAction(this, this.atem, this.atemState, action)
  }

  /**
   * Creates the configuration fields for web config.
   */
  public config_fields(): CompanionConfigField[] {
    return GetConfigFields(this)
  }

  /**
   * Clean up the instance before it is destroyed.
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
   */
  public feedback(feedback: CompanionFeedbackEvent) {
    return ExecuteFeedback(this.atemState, feedback)
  }

  private updateCompanionBits() {
    InitVariables(this, this.model, this.atemState)
    this.setPresetDefinitions(GetPresetsList(this, this.model, this.atemState))
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.model, this.atemState))
    this.setActions(GetActionsList(this.model, this.atemState))
    this.checkFeedbacks()
  }

  /**
   * Handle ATEM state changes
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
   * Do some setup and cleanup when we switch models.
   * This is a tricky function because both Config and Atem use this.
   * Logic has to track who's who and make sure we don't init over a live switcher.
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
