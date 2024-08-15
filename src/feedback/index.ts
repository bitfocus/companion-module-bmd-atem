import { type CompanionFeedbackDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { type StateWrapper } from '../state.js'
import { createTallyFeedbacks, type AtemTallyFeedbacks } from './mixeffect/tally.js'
import { convertMyFeedbackDefinitions } from './wrapper.js'
import { createPreviewFeedbacks, type AtemPreviewFeedbacks } from './mixeffect/preview.js'
import { createProgramFeedbacks, type AtemProgramFeedbacks } from './mixeffect/program.js'
import { createFadeToBlackFeedbacks, type AtemFadeToBlackFeedbacks } from './mixeffect/fadeToBlack.js'
import { createMediaPlayerFeedbacks, type AtemMediaPlayerFeedbacks } from './mediaPlayer.js'
import type { MyFeedbackDefinition } from './types.js'
import { createMultiviewerFeedbacks, type AtemMultiviewerFeedbacks } from './multiviewer.js'
import { createMacroFeedbacks, type AtemMacroFeedbacks } from './macro.js'
import { createAuxOutputFeedbacks, type AtemAuxOutputFeedbacks } from './aux-outputs.js'
import { createRecordingFeedbacks, type AtemRecordingFeedbacks } from './recording.js'
import { createStreamingFeedbacks, type AtemStreamingFeedbacks } from './streaming.js'
import { createDownstreamKeyerFeedbacks, type AtemDownstreamKeyerFeedbacks } from './dsk.js'
import { createUpstreamKeyerFeedbacks, type AtemUpstreamKeyerFeedbacks } from './mixeffect/usk.js'
import { createTransitionFeedbacks, type AtemTransitionFeedbacks } from './mixeffect/transition.js'
import { createSuperSourceFeedbacks, type AtemSuperSourceFeedbacks } from './superSource.js'
import { createClassicAudioFeedbacks, type AtemClassicAudioFeedbacks } from './classicAudio.js'
import { createFairlightAudioFeedbacks, type AtemFairlightAudioFeedbacks } from './fairlightAudio.js'
import { FeedbackId } from './FeedbackId.js'
import { createTimecodeFeedbacks, type AtemTimecodeFeedbacks } from './timecode.js'
import type { AtemConfig } from '../config.js'
import { createMediaPoolFeedbacks, type AtemMediaPoolFeedbacks } from './mediaPool.js'

export type FeedbackTypes = AtemTallyFeedbacks &
	AtemPreviewFeedbacks &
	AtemProgramFeedbacks &
	AtemUpstreamKeyerFeedbacks &
	AtemDownstreamKeyerFeedbacks &
	AtemSuperSourceFeedbacks &
	AtemFadeToBlackFeedbacks &
	AtemTransitionFeedbacks &
	AtemStreamingFeedbacks &
	AtemRecordingFeedbacks &
	AtemClassicAudioFeedbacks &
	AtemFairlightAudioFeedbacks &
	AtemAuxOutputFeedbacks &
	AtemMacroFeedbacks &
	AtemMultiviewerFeedbacks &
	AtemMediaPlayerFeedbacks &
	AtemMediaPoolFeedbacks &
	AtemTimecodeFeedbacks

export function GetFeedbacksList(
	config: AtemConfig,
	model: ModelSpec,
	state: StateWrapper,
): CompanionFeedbackDefinitions {
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
		...createMediaPoolFeedbacks(model, state),
		...createTimecodeFeedbacks(config, model, state),
	}

	return convertMyFeedbackDefinitions(feedbacks)
}
