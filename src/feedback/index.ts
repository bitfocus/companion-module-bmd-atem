import { type CompanionFeedbackDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { type StateWrapper } from '../state.js'
import { createTallyFeedbacks, type AtemTallyFeedbacks } from './mixeffect/tally.js'
import { createProgramPreviewFeedbacks, type AtemProgramPreviewFeedbacks } from './mixeffect/programPreview.js'
import { createFadeToBlackFeedbacks, type AtemFadeToBlackFeedbacks } from './mixeffect/fadeToBlack.js'
import { createMediaPlayerFeedbacks, type AtemMediaPlayerFeedbacks } from './mediaPlayer.js'
import { createMultiviewerFeedbacks, type AtemMultiviewerFeedbacks } from './multiviewer.js'
import { createMacroFeedbacks, type AtemMacroFeedbacks } from './macro.js'
import { createAuxOutputFeedbacks, type AtemAuxOutputFeedbacks } from './aux-outputs.js'
import { createRecordingFeedbacks, type AtemRecordingFeedbacks } from './recording.js'
import { createStreamingFeedbacks, type AtemStreamingFeedbacks } from './streaming.js'
import { createDownstreamKeyerFeedbacks, type AtemDownstreamKeyerFeedbacks } from './downstreamKeyer.js'
import { createUpstreamKeyerFeedbacks, type AtemUpstreamKeyerFeedbacks } from './mixeffect/upstreamKeyer.js'
import { createTransitionFeedbacks, type AtemTransitionFeedbacks } from './mixeffect/transition.js'
import { createSuperSourceFeedbacks, type AtemSuperSourceFeedbacks } from './superSource.js'
import { createClassicAudioFeedbacks, type AtemClassicAudioFeedbacks } from './classicAudio.js'
import { createFairlightAudioFeedbacks, type AtemFairlightAudioFeedbacks } from './fairlightAudio.js'
import { createTimecodeFeedbacks, type AtemTimecodeFeedbacks } from './timecode.js'
import type { AtemConfig } from '../config.js'
import { createMediaPoolFeedbacks, type AtemMediaPoolFeedbacks } from './mediaPool.js'

export type FeedbackTypes = AtemTallyFeedbacks &
	AtemProgramPreviewFeedbacks &
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
): CompanionFeedbackDefinitions<FeedbackTypes> {
	return {
		...createTallyFeedbacks(model, state),
		...createProgramPreviewFeedbacks(model, state),
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
}
