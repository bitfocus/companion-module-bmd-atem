import {
	CompanionCoreInstanceconfig,
	CompanionMigrationAction,
	CompanionMigrationFeedback,
	CompanionUpgradeContext,
	InputValue,
} from '../../../instance_skel_types'
import { ActionId } from './actions'
import { FeedbackId } from './feedback'

function scaleValue(obj: { [key: string]: InputValue | undefined }, key: string, scale: number): void {
	if (obj[key] !== undefined) {
		obj[key] = parseFloat(obj[key] as string) * scale
	}
}

export function upgradeV2x2x0(
	_context: CompanionUpgradeContext,
	_config: (CompanionCoreInstanceconfig & Record<string, any>) | null,
	actions: CompanionMigrationAction[],
	feedbacks: CompanionMigrationFeedback[]
): boolean {
	let changed = false

	for (const action of actions) {
		if (action.action === ActionId.SuperSourceBoxProperties) {
			scaleValue(action.options, 'size', 0.001)
			scaleValue(action.options, 'x', 0.01)
			scaleValue(action.options, 'y', 0.01)
			scaleValue(action.options, 'cropTop', 0.001)
			scaleValue(action.options, 'cropBottom', 0.001)
			scaleValue(action.options, 'cropLeft', 0.001)
			scaleValue(action.options, 'cropRight', 0.001)

			changed = true
		}
	}

	for (const feedback of feedbacks) {
		if (feedback.type === FeedbackId.SSrcBoxProperties) {
			scaleValue(feedback.options, 'size', 0.001)
			scaleValue(feedback.options, 'x', 0.01)
			scaleValue(feedback.options, 'y', 0.01)
			scaleValue(feedback.options, 'cropTop', 0.001)
			scaleValue(feedback.options, 'cropBottom', 0.001)
			scaleValue(feedback.options, 'cropLeft', 0.001)
			scaleValue(feedback.options, 'cropRight', 0.001)

			changed = true
		}
	}

	return changed
}

export const BooleanFeedbackUpgradeMap: {
	[id in FeedbackId]?: true
} = {
	[FeedbackId.PreviewBG]: true,
	[FeedbackId.PreviewBG2]: true,
	[FeedbackId.PreviewBG3]: true,
	[FeedbackId.PreviewBG4]: true,
	[FeedbackId.ProgramBG]: true,
	[FeedbackId.ProgramBG2]: true,
	[FeedbackId.ProgramBG3]: true,
	[FeedbackId.ProgramBG4]: true,
	[FeedbackId.AuxBG]: true,
	[FeedbackId.USKOnAir]: true,
	[FeedbackId.USKSource]: true,
	[FeedbackId.DSKOnAir]: true,
	[FeedbackId.DSKTie]: true,
	[FeedbackId.DSKSource]: true,
	[FeedbackId.Macro]: true,
	[FeedbackId.MVSource]: true,
	[FeedbackId.SSrcBoxOnAir]: true,
	[FeedbackId.SSrcBoxSource]: true,
	[FeedbackId.SSrcBoxProperties]: true,
	[FeedbackId.TransitionStyle]: true,
	[FeedbackId.TransitionSelection]: true,
	[FeedbackId.TransitionRate]: true,
	[FeedbackId.InTransition]: true,
	[FeedbackId.MediaPlayerSource]: true,
	[FeedbackId.FadeToBlackIsBlack]: true,
	[FeedbackId.FadeToBlackRate]: true,
	[FeedbackId.ProgramTally]: true,
	[FeedbackId.PreviewTally]: true,
	[FeedbackId.StreamStatus]: true,
	[FeedbackId.RecordStatus]: true,
	[FeedbackId.ClassicAudioGain]: true,
	[FeedbackId.ClassicAudioMixOption]: true,
	[FeedbackId.FairlightAudioFaderGain]: true,
	[FeedbackId.FairlightAudioInputGain]: true,
	[FeedbackId.FairlightAudioMixOption]: true,
}
