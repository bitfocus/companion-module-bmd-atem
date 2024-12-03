import { type Atem } from 'atem-connection'
import type { AtemConfig } from '../config.js'
import type { ModelSpec } from '../models/index.js'
import { type InstanceBaseExt } from '../util.js'
import { AtemCommandBatching } from '../batching.js'
import { AtemTransitions } from '../transitions.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { createProgramPreviewActions, type AtemProgramPreviewActions } from './mixeffect/programPreview.js'
import { convertMyActionDefinitions } from './wrapper.js'
import { createTransitionActions, type AtemTransitionActions } from './mixeffect/transition.js'
import { createDisplayClockActions, type AtemDisplayClockActions } from './displayClock.js'
import { createMacroActions, type AtemMacroActions } from './macro.js'
import { createStreamingActions, type AtemStreamingActions } from './streaming.js'
import { createRecordingActions, type AtemRecordingActions } from './recording.js'
import { createDownstreamKeyerActions, type AtemDownstreamKeyerActions } from './dsk.js'
import { createAuxOutputActions, type AtemAuxOutputActions } from './aux-outputs.js'
import { createMultiviewerActions, type AtemMultiviewerActions } from './multiviewer.js'
import { createMediaPlayerActions, type AtemMediaPlayerActions } from './mediaPlayer.js'
import { createSettingsActions, type AtemSettingsActions } from './settings.js'
import { createSuperSourceActions, type AtemSuperSourceActions } from './superSource.js'
import {
	createUpstreamKeyerCommonActions,
	type AtemUpstreamKeyerCommonActions,
} from './mixeffect/upstreamKeyerCommon.js'
import { createFadeToBlackActions, type AtemFadeToBlackActions } from './mixeffect/fadeToBlack.js'
import { createUpstreamKeyerDVEActions, type AtemUpstreamKeyerDVEActions } from './mixeffect/upstreamKeyerDVE.js'
import { createClassicAudioActions, type AtemClassicAudioActions } from './classicAudio.js'
import { createFairlightAudioActions, type AtemFairlightAudioActions } from './fairlightAudio.js'
import type { MyActionDefinition } from './types.js'
import { ActionId } from './ActionId.js'
import type { StateWrapper } from '../state.js'
import { createCameraControlLensActions, type AtemCameraControlLensActions } from './cameraControl/lens.js'
import { createCameraControlDisplayActions, type AtemCameraControlDisplayActions } from './cameraControl/display.js'
import { createCameraControlVideoActions, type AtemCameraControlVideoActions } from './cameraControl/video.js'
import { createCameraControlColorActions, type AtemCameraControlColorActions } from './cameraControl/color.js'
import { createTimecodeActions, type AtemTimecodeActions } from './timecode.js'
import { createCameraControlMediaActions } from './cameraControl/media.js'

export type ActionTypes = AtemProgramPreviewActions &
	AtemTransitionActions &
	AtemUpstreamKeyerCommonActions &
	AtemUpstreamKeyerDVEActions &
	AtemFadeToBlackActions &
	AtemDownstreamKeyerActions &
	AtemMacroActions &
	AtemSuperSourceActions &
	AtemStreamingActions &
	AtemRecordingActions &
	AtemClassicAudioActions &
	AtemFairlightAudioActions &
	AtemAuxOutputActions &
	AtemMultiviewerActions &
	AtemMediaPlayerActions &
	AtemSettingsActions &
	AtemDisplayClockActions &
	AtemCameraControlLensActions &
	AtemCameraControlDisplayActions &
	AtemCameraControlVideoActions &
	AtemCameraControlColorActions &
	AtemTimecodeActions

export function GetActionsList(
	instance: InstanceBaseExt<AtemConfig>,
	atem: Atem | undefined,
	model: ModelSpec,
	commandBatching: AtemCommandBatching,
	transitions: AtemTransitions,
	state: StateWrapper,
): CompanionActionDefinitions {
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

		...createCameraControlLensActions(instance.config, atem, state),
		...createCameraControlDisplayActions(instance.config, atem, state),
		...createCameraControlMediaActions(instance.config, model, atem, state),
		...createCameraControlVideoActions(instance.config, atem, state),
		...createCameraControlColorActions(instance.config, atem, state),

		...createTimecodeActions(instance, atem, state),
	}

	return convertMyActionDefinitions(actions)
}
