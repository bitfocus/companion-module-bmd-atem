import { Atem, AtemState, Commands } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionActionEvent, CompanionConfigField, CompanionSystem } from '../../../instance_skel_types'
import { GetActionsList, HandleAction } from './actions'
import { AtemConfig, GetConfigFields } from './config'
import { FeedbackId, GetFeedbacksList } from './feedback'
import { upgradeV2x2x0 } from './migrations'
import { GetAutoDetectModel, GetModelSpec, GetParsedModelSpec, MODEL_AUTO_DETECT, ModelSpec } from './models'
import { GetPresetsList } from './presets'
import { TallyBySource } from './state'
import {
  InitVariables,
  updateDSKVariable,
  updateMacroVariable,
  updateMediaPlayerVariables,
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
  private atemTally: TallyBySource
  private initDone: boolean
  private isActive: boolean

  /**
   * Create an instance of an ATEM module.
   */
  constructor(system: CompanionSystem, id: string, config: AtemConfig) {
    super(system, id, config)

    this.atemState = new AtemState()
    this.atemTally = {}

    this.model = GetModelSpec(this.getBestModelId() || MODEL_AUTO_DETECT) || GetAutoDetectModel()
    this.config.modelID = this.model.id + ''

    this.atem = new Atem({}) // To ensure that there arent undefined bugs

    this.initDone = false
    this.isActive = false

    this.addUpgradeScript(upgradeV2x2x0)
  }

  // Override base types to make types stricter
  public checkFeedbacks(feedbackId?: FeedbackId, ignoreInitDone?: boolean): void {
    if (ignoreInitDone || this.initDone) {
      super.checkFeedbacks(feedbackId)
    }
  }

  /**
   * Main initialization function called once the module
   * is OK to start doing things.
   */
  public init(): void {
    this.isActive = true
    this.status(this.STATUS_UNKNOWN)

    // Unfortunately this is redundant if the switcher goes
    // online right away, but necessary for offline programming
    this.updateCompanionBits()

    this.setupAtemConnection()
  }

  /**
   * Process an updated configuration array.
   */
  public updateConfig(config: AtemConfig): void {
    this.config = config

    this.model = GetModelSpec(this.getBestModelId() || MODEL_AUTO_DETECT) || GetAutoDetectModel()
    this.debug('ATEM changed model: ' + this.model.id)

    // Force clear the cached state
    this.initDone = false
    this.atemState = new AtemState()
    this.updateCompanionBits()

    if (this.config.host !== undefined) {
      // TODO - needs a better way to check if connected?
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (this.atem && (this.atem as any).socket && (this.atem as any).socket._socket) {
        try {
          this.atem.disconnect()
        } catch (e) {
          // Ignore
        }
      }

      this.status(this.STATUS_WARNING, 'Connecting')
      this.atem.connect(this.config.host)
    }
  }

  /**
   * Executes the provided action.
   */
  public action(action: CompanionActionEvent): void {
    HandleAction(this, this.atem, this.model, this.atemState, action)
  }

  /**
   * Creates the configuration fields for web config.
   */
  // eslint-disable-next-line @typescript-eslint/camelcase
  public config_fields(): CompanionConfigField[] {
    return GetConfigFields(this)
  }

  /**
   * Clean up the instance before it is destroyed.
   */
  public destroy(): void {
    this.isActive = false

    if (this.atem) {
      this.atem.disconnect()
      delete this.atem
    }

    this.debug('destroy', this.id)
  }

  private getBestModelId(): number | undefined {
    const configModel = this.config.modelID ? parseInt(this.config.modelID, 10) : undefined
    if (configModel) {
      return configModel
    } else {
      const info = this.atemState.info
      if (info && info.model) {
        return info.model
      } else {
        return undefined
      }
    }
  }

  private updateCompanionBits(): void {
    InitVariables(this, this.model, this.atemState)
    this.setPresetDefinitions(GetPresetsList(this, this.model, this.atemState))
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.model, this.atemState, this.atemTally))
    this.setActions(GetActionsList(this.model, this.atemState))
    this.checkFeedbacks()
  }

  /**
   * Handle tally packets
   */
  private processReceivedCommand(command: Commands.AbstractCommand): void {
    if (command instanceof Commands.TallyBySourceCommand) {
      // The feedback holds a reference to the old object, so we need
      // to update it in place
      Object.assign(this.atemTally, command.properties)
      this.checkFeedbacks(FeedbackId.ProgramTally)
      this.checkFeedbacks(FeedbackId.PreviewTally)
    }
  }
  /**
   * Handle ATEM state changes
   */
  private processStateChange(newState: AtemState, path: string): void {
    if (!this.initDone) {
      // Only run after initDone, otherwise we spam with updates
      return
    }

    // TODO - do we need to clone this object?
    this.atemState = newState

    if (path.match(/video.auxilliaries/)) {
      this.checkFeedbacks(FeedbackId.AuxBG)
      return
    }

    const dskMatch = path.match(/video.downstreamKeyers.(\d+)/)
    if (dskMatch) {
      updateDSKVariable(this, this.atemState, parseInt(dskMatch[1], 10))
      this.checkFeedbacks(FeedbackId.DSKOnAir)
      this.checkFeedbacks(FeedbackId.DSKSource)
      return
    }

    if (path.match(/inputs/)) {
      // reset everything, since names of inputs might have changed
      this.updateCompanionBits()
      return
    }

    if (path.match(/video.ME.(\d+).upstreamKeyers.(\d+).onAir/)) {
      this.checkFeedbacks(FeedbackId.USKOnAir)
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
      this.checkFeedbacks(FeedbackId.SSrcBoxOnAir)
      this.checkFeedbacks(FeedbackId.SSrcBoxProperties)
      return
    }

    if (path.match(/video.ME.(\d+).transitionProperties/)) {
      this.checkFeedbacks(FeedbackId.TransitionStyle)
      this.checkFeedbacks(FeedbackId.TransitionSelection)
    }
    if (path.match(/video.ME.(\d+).transitionSettings/)) {
      this.checkFeedbacks(FeedbackId.TransitionRate)
    }
    if (path.match(/video.ME.(\d+).fadeToBlack/)) {
      this.checkFeedbacks(FeedbackId.FadeToBlackRate)
      this.checkFeedbacks(FeedbackId.FadeToBlackIsBlack)
    }

    const mediaPlayerMatch = path.match(/media.players.(\d+)/)
    if (mediaPlayerMatch) {
      const mediaPlayer = parseInt(mediaPlayerMatch[1], 10)
      updateMediaPlayerVariables(this, this.atemState, mediaPlayer)
      this.checkFeedbacks(FeedbackId.MediaPlayerSource)
    }

    if (path.match(/media.clipPool/) || path.match(/media.stillPool/)) {
      // reset everything, since names of media might have changed
      this.updateCompanionBits()
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
  }

  private setupAtemConnection(): void {
    this.atem = new Atem({ externalLog: this.debug.bind(this) })

    this.atem.on('connected', () => {
      this.initDone = true
      this.atemState = this.atem.state

      const atemInfo = this.atemState.info
      this.log('info', 'Connected to a ' + atemInfo.productIdentifier)
      this.status(this.STATUS_OK)

      const newBestModelId = this.getBestModelId()
      const newModelSpec = newBestModelId ? GetModelSpec(newBestModelId) : undefined
      if (newModelSpec) {
        this.model = newModelSpec
      } else {
        this.model = GetParsedModelSpec(this.atemState)
        this.status(this.STATUS_WARNING, `Unknown model: ${atemInfo.productIdentifier}. Some bits may be missing`)
      }

      // Log if the config mismatches the device
      const configModelId = this.config.modelID ? parseInt(this.config.modelID, 10) : undefined
      if (configModelId !== MODEL_AUTO_DETECT && configModelId !== undefined && configModelId !== this.model.id) {
        this.log(
          'error',
          'Connected to a ' +
            atemInfo.productIdentifier +
            ', but instance is configured for ' +
            this.model.label +
            ".  Change instance to 'Auto Detect' or the appropriate model to ensure stability."
        )
      }

      this.updateCompanionBits()
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.atem.on('error', (e: any) => {
      this.log('error', e.message)
      this.status(this.STATUS_ERROR, e.message)
    })
    this.atem.on('disconnected', () => {
      if (this.isActive) {
        this.status(this.STATUS_WARNING, 'Reconnecting')
      }
      this.log('info', 'Lost connection')
      this.initDone = false
      // TODO - clear cached state after some timeout
    })
    this.atem.on('stateChanged', this.processStateChange.bind(this))
    this.atem.on('receivedCommand', this.processReceivedCommand.bind(this))

    if (this.config.host) {
      this.atem.connect(this.config.host)
      this.status(this.STATUS_WARNING, 'Connecting')
    }
  }
}

export = AtemInstance
