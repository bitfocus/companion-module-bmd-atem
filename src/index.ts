import { Atem, AtemState, AtemStateUtil, Commands } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionActionEvent, CompanionConfigField, CompanionSystem } from '../../../instance_skel_types'
import { GetActionsList, HandleAction } from './actions'
import { AtemConfig, GetConfigFields } from './config'
import { FeedbackId, GetFeedbacksList } from './feedback'
import { UpgradeV2_2_0 } from './migrations'
import { GetAutoDetectModel, GetModelSpec, GetParsedModelSpec, MODEL_AUTO_DETECT, ModelSpec } from './models'
import { GetPresetsList } from './presets'
import { TallyBySource } from './state'
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
  private atemTally: TallyBySource

  /**
   * Create an instance of an ATEM module.
   */
  constructor(system: CompanionSystem, id: string, config: AtemConfig) {
    super(system, id, config)

    this.atemState = AtemStateUtil.Create()
    this.atemTally = {}

    this.model = GetModelSpec(this.getBestModelId() || MODEL_AUTO_DETECT) || GetAutoDetectModel()
    this.config.modelID = this.model.id + ''

    this.atem = new Atem({}) // To ensure that there arent undefined bugs

    this.addUpgradeScript(UpgradeV2_2_0)
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

    this.model = GetModelSpec(this.getBestModelId() || MODEL_AUTO_DETECT) || GetAutoDetectModel()
    this.debug('ATEM changed model: ' + this.model.id)

    // Force clear the cached state
    this.atemState = AtemStateUtil.Create()
    this.updateCompanionBits()

    if (this.config.host !== undefined) {
      // TODO - needs a better way to check if connected?
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

  /**
   * Executes the provided action.
   */
  public action(action: CompanionActionEvent) {
    HandleAction(this, this.atem, this.model, this.atemState, action)
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

  private updateCompanionBits() {
    InitVariables(this, this.model, this.atemState)
    this.setPresetDefinitions(GetPresetsList(this, this.model, this.atemState))
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.model, this.atemState, this.atemTally))
    this.setActions(GetActionsList(this.model, this.atemState))
    this.checkFeedbacks()
  }

  /**
   * Handle tally packets
   */
  private processReceivedCommands(commands: Commands.IDeserializedCommand[]) {
    commands.forEach(command => {
      if (command instanceof Commands.TallyBySourceCommand) {
        // The feedback holds a reference to the old object, so we need
        // to update it in place
        Object.assign(this.atemTally, command.properties)
        this.checkFeedbacks(FeedbackId.ProgramTally)
        this.checkFeedbacks(FeedbackId.PreviewTally)
      }
    })
  }
  /**
   * Handle ATEM state changes
   */
  private processStateChange(newState: AtemState, paths: string[]) {
    // TODO - do we need to clone this object?
    this.atemState = newState

    // TODO - should this batch changes?
    paths.forEach(path => {
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
      if (path.match(/media.players.(\d+)/)) {
        this.checkFeedbacks(FeedbackId.MediaPlayerSource)
      }

      if (path.match(/media.clipPool/) || path.match(/media.stillPool/)) {
        // reset everything, since names of media might have changed
        this.updateCompanionBits()
        return
      }
    })
  }

  private setupAtemConnection() {
    this.atem = new Atem()

    this.atem.on('connected', () => {
      if (this.atem.state) {
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
      }
    })
    this.atem.on('info', this.debug.bind(this))
    this.atem.on('error', (e: any) => {
      this.log('error', e.message)
      this.status(this.STATUS_ERROR, e.message)
    })
    this.atem.on('disconnected', () => {
      this.status(this.STATUS_UNKNOWN, 'Disconnected')
      // TODO - clear cached state after some timeout
    })
    this.atem.on('stateChanged', this.processStateChange.bind(this))
    this.atem.on('receivedCommands', this.processReceivedCommands.bind(this))

    if (this.config.host) {
      this.atem.connect(this.config.host)
    }
  }
}

export = AtemInstance
