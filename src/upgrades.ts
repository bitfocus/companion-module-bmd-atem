import {
	CreateConvertToBooleanFeedbackUpgradeScript,
	type CompanionStaticUpgradeProps,
	type CompanionStaticUpgradeResult,
	type CompanionUpgradeContext,
	type InputValue,
	type CompanionStaticUpgradeScript,
	CreateUseBuiltinInvertForFeedbacksUpgradeScript,
} from '@companion-module/base'
import { ActionId } from './actions.js'
import type { AtemConfig } from './config.js'
import { FeedbackId } from './feedback.js'

function scaleValue(obj: { [key: string]: InputValue | undefined }, key: string, scale: number): void {
	if (obj[key] !== undefined) {
		obj[key] = parseFloat(obj[key] as string) * scale
	}
}

function upgradeV2x2x0(
	_context: CompanionUpgradeContext<AtemConfig>,
	props: CompanionStaticUpgradeProps<AtemConfig>
): CompanionStaticUpgradeResult<AtemConfig> {
	const result: CompanionStaticUpgradeResult<AtemConfig> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (action.actionId === ActionId.SuperSourceBoxProperties) {
			scaleValue(action.options, 'size', 0.001)
			scaleValue(action.options, 'x', 0.01)
			scaleValue(action.options, 'y', 0.01)
			scaleValue(action.options, 'cropTop', 0.001)
			scaleValue(action.options, 'cropBottom', 0.001)
			scaleValue(action.options, 'cropLeft', 0.001)
			scaleValue(action.options, 'cropRight', 0.001)

			result.updatedActions.push(action)
		}
	}

	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === FeedbackId.SSrcBoxProperties) {
			scaleValue(feedback.options, 'size', 0.001)
			scaleValue(feedback.options, 'x', 0.01)
			scaleValue(feedback.options, 'y', 0.01)
			scaleValue(feedback.options, 'cropTop', 0.001)
			scaleValue(feedback.options, 'cropBottom', 0.001)
			scaleValue(feedback.options, 'cropLeft', 0.001)
			scaleValue(feedback.options, 'cropRight', 0.001)

			result.updatedFeedbacks.push(feedback)
		}
	}

	return result
}

const BooleanFeedbackUpgradeMap: {
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

function upgradeAddSSrcPropertiesPicker(
	_context: CompanionUpgradeContext<AtemConfig>,
	props: CompanionStaticUpgradeProps<AtemConfig>
): CompanionStaticUpgradeResult<AtemConfig> {
	const result: CompanionStaticUpgradeResult<AtemConfig> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (action.actionId === ActionId.SuperSourceBoxProperties && !action.options.properties) {
			action.options.properties = ['size', 'x', 'y', 'cropEnable', 'cropTop', 'cropLeft', 'cropRight', 'cropBottom']
			result.updatedActions.push(action)
		} else if (action.actionId === ActionId.SuperSourceArt && !action.options.properties) {
			action.options.properties = ['fill', 'key', 'artOption']
			result.updatedActions.push(action)
		}
	}

	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === FeedbackId.SSrcBoxProperties && !feedback.options.properties) {
			feedback.options.properties = ['size', 'x', 'y', 'cropEnable', 'cropTop', 'cropLeft', 'cropRight', 'cropBottom']
			result.updatedFeedbacks.push(feedback)
		}
	}

	return result
}

function fixUsingFairlightAudioFaderGainInsteadOfFairlightAudioMonitorFaderGain(
	_context: CompanionUpgradeContext<AtemConfig>,
	props: CompanionStaticUpgradeProps<AtemConfig>
): CompanionStaticUpgradeResult<AtemConfig> {
	const result: CompanionStaticUpgradeResult<AtemConfig> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === FeedbackId.FairlightAudioFaderGain && feedback.options['input'] === undefined) {
			feedback.feedbackId = FeedbackId.FairlightAudioMonitorFaderGain
			result.updatedFeedbacks.push(feedback)
		}
	}

	return result
}

const InvertableFeedbackUpgradeMap: {
	[id in FeedbackId]?: string
} = {
	[FeedbackId.ProgramTally]: 'invert',
	[FeedbackId.PreviewTally]: 'invert',
	[FeedbackId.DSKOnAir]: 'invert',
	[FeedbackId.DSKTie]: 'invert',
	[FeedbackId.USKOnAir]: 'invert',
}

export const UpgradeScripts: CompanionStaticUpgradeScript<AtemConfig>[] = [
	upgradeV2x2x0,
	CreateConvertToBooleanFeedbackUpgradeScript(BooleanFeedbackUpgradeMap),
	upgradeAddSSrcPropertiesPicker,
	fixUsingFairlightAudioFaderGainInsteadOfFairlightAudioMonitorFaderGain,
	CreateUseBuiltinInvertForFeedbacksUpgradeScript(InvertableFeedbackUpgradeMap),
]
