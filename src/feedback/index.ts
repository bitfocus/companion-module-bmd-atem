import { type CompanionFeedbackDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { type StateWrapper } from '../state.js'
import { createTallyFeedbacks } from './mixeffect/tally.js'
import { convertMyFeedbackDefinitions } from './wrapper.js'
import { createPreviewFeedbacks } from './mixeffect/preview.js'
import { createProgramFeedbacks } from './mixeffect/program.js'
import { createFadeToBlackFeedbacks } from './mixeffect/fadeToBlack.js'
import { createMediaPlayerFeedbacks } from './mediaPlayer.js'
import type { MyFeedbackDefinition } from './types.js'
import { createMultiviewerFeedbacks } from './multiviewer.js'
import { createMacroFeedbacks } from './macro.js'
import { createAuxOutputFeedbacks } from './aux.js'
import { createRecordingFeedbacks } from './recording.js'
import { createStreamingFeedbacks } from './streaming.js'
import { createDownstreamKeyerFeedbacks } from './dsk.js'
import { createUpstreamKeyerFeedbacks } from './mixeffect/usk.js'
import { createTransitionFeedbacks } from './mixeffect/transition.js'
import { createSuperSourceFeedbacks } from './superSource.js'
import { createClassicAudioFeedbacks } from './classicAudio.js'
import { createFairlightAudioFeedbacks } from './fairlightAudio.js'
import { FeedbackId } from './FeedbackId.js'

export function GetFeedbacksList(model: ModelSpec, state: StateWrapper): CompanionFeedbackDefinitions {
	const feedbacks: { [id in FeedbackId]: MyFeedbackDefinition<any> | undefined } = {
		...createTallyFeedbacks(model, state),
		...createPreviewFeedbacks(model, state),
		...createProgramFeedbacks(model, state),
		...createUpstreamKeyerFeedbacks(model, state),
		...createDownstreamKeyerFeedbacks(model, state),
		...createSuperSourceFeedbacks(model, state),
		...createFadeToBlackFeedbacks(model, state),
		...createTransitionFeedbacks(model, state),
		...createStreamingFeedbacks(model, state),
		...createRecordingFeedbacks(model, state),
		...createClassicAudioFeedbacks(model, state),
		...createFairlightAudioFeedbacks(model, state),
		...createAuxOutputFeedbacks(model, state),
		...createMacroFeedbacks(model, state),
		...createMultiviewerFeedbacks(model, state),
		...createMediaPlayerFeedbacks(model, state),
	}

	return convertMyFeedbackDefinitions(feedbacks)
}
