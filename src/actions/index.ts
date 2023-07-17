import { type Atem } from 'atem-connection'
import type { AtemConfig } from '../config.js'
import type { ModelSpec } from '../models/index.js'
import { type InstanceBaseExt } from '../util.js'
import { AtemCommandBatching } from '../batching.js'
import { AtemTransitions } from '../transitions.js'
import type { CompanionActionDefinition } from '@companion-module/base'
import { createProgramPreviewActions } from './mixeffect/programPreview.js'
import { convertMyActionDefinitions } from './wrapper.js'
import { createTransitionActions } from './mixeffect/transition.js'
import { createDisplayClockActions } from './displayClock.js'
import { createMacroActions } from './macro.js'
import { createStreamingActions } from './streaming.js'
import { createRecordingActions } from './recording.js'
import { createDownstreamKeyerActions } from './dsk.js'
import { createAuxOutputActions } from './aux.js'
import { createMultiviewerActions } from './multiviewer.js'
import { createMediaPlayerActions } from './mediaPlayer.js'
import { createSettingsActions } from './settings.js'
import { createSuperSourceActions } from './superSource.js'
import { createUpstreamKeyerCommonActions } from './mixeffect/upstreamKeyerCommon.js'
import { createFadeToBlackActions } from './mixeffect/fadeToBlack.js'
import { createUpstreamKeyerDVEActions } from './mixeffect/upstreamKeyerDVE.js'
import { createClassicAudioActions } from './classicAudio.js'
import { createFairlightAudioActions } from './fairlightAudio.js'
import type { MyActionDefinition } from './types.js'
import { ActionId } from './ActionId.js'
import type { StateWrapper } from '../state.js'

type CompanionActionsExt = { [id in ActionId]: CompanionActionDefinition | undefined }

export function GetActionsList(
	instance: InstanceBaseExt<AtemConfig>,
	atem: Atem | undefined,
	model: ModelSpec,
	commandBatching: AtemCommandBatching,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionsExt {
	const actions: { [id in ActionId]: MyActionDefinition<any> | undefined } = {
		...createProgramPreviewActions(atem, model, transitions, state),
		...createTransitionActions(instance, atem, model, commandBatching, state),
		...createUpstreamKeyerCommonActions(atem, model, state),
		...createUpstreamKeyerDVEActions(atem, model, state),
		...createFadeToBlackActions(atem, model, state),

		...createDownstreamKeyerActions(atem, model, state),
		...createMacroActions(atem, model, state),
		...createSuperSourceActions(atem, model, state),
		...createStreamingActions(atem, model, state),
		...createRecordingActions(atem, model, state),

		...createClassicAudioActions(atem, model, transitions, state),
		...createFairlightAudioActions(atem, model, transitions, state),

		...createAuxOutputActions(atem, model, state),
		...createMultiviewerActions(atem, model, state),
		...createMediaPlayerActions(atem, model, state),
		...createSettingsActions(atem, model, state),

		...createDisplayClockActions(atem, model, state),
	}

	return convertMyActionDefinitions(actions)
}
