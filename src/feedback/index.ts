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

export enum FeedbackId {
	PreviewBG = 'preview_bg',
	PreviewVariables = 'previewVariables',
	PreviewBG2 = 'preview_bg_2',
	PreviewBG3 = 'preview_bg_3',
	PreviewBG4 = 'preview_bg_4',
	ProgramBG = 'program_bg',
	ProgramVariables = 'programVariables',
	ProgramBG2 = 'program_bg_2',
	ProgramBG3 = 'program_bg_3',
	ProgramBG4 = 'program_bg_4',
	AuxBG = 'aux_bg',
	AuxVariables = 'auxVariables',
	USKOnAir = 'usk_bg',
	USKSource = 'usk_source',
	USKSourceVariables = 'usk_source_variables',
	USKKeyFrame = 'usk_keyframe',
	DSKOnAir = 'dsk_bg',
	DSKTie = 'dskTie',
	DSKSource = 'dsk_source',
	DSKSourceVariables = 'dsk_source_variables',
	Macro = 'macro',
	MacroLoop = 'macroloop',
	MVSource = 'mv_source',
	MVSourceVariables = 'mv_source_variables',
	SSrcArtProperties = 'ssrc_art_properties',
	SSrcArtSource = 'ssrc_art_source',
	SSrcArtOption = 'ssrc_art_option',
	SSrcBoxOnAir = 'ssrc_box_enable',
	SSrcBoxSource = 'ssrc_box_source',
	SSrcBoxSourceVariables = 'ssrc_box_source_variables',
	SSrcBoxProperties = 'ssrc_box_properties',
	TransitionStyle = 'transitionStyle',
	TransitionSelection = 'transitionSelection',
	TransitionRate = 'transitionRate',
	InTransition = 'inTransition',
	MediaPlayerSource = 'mediaPlayerSource',
	FadeToBlackIsBlack = 'fadeToBlackIsBlack',
	FadeToBlackRate = 'fadeToBlackRate',
	ProgramTally = 'program_tally',
	PreviewTally = 'preview_tally',
	AdvancedTally = 'advanced_tally',
	StreamStatus = 'streamStatus',
	RecordStatus = 'recordStatus',
	ClassicAudioGain = 'classicAudioGain',
	ClassicAudioMixOption = 'classicAudioMixOption',
	ClassicAudioMasterGain = 'classicAudioMasterGain',
	FairlightAudioFaderGain = 'fairlightAudioFaderGain',
	FairlightAudioInputGain = 'fairlightAudioInputGain',
	FairlightAudioMixOption = 'fairlightAudioMixOption',
	FairlightAudioMasterGain = 'fairlightAudioMasterGain',
	FairlightAudioMonitorMasterMuted = 'fairlightAudioMonitorMasterMuted',
	FairlightAudioMonitorFaderGain = 'fairlightAudioMonitorFaderGain',
}

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
