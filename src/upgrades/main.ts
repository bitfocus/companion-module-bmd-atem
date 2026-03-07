import {
	CreateConvertToBooleanFeedbackUpgradeScript,
	type CompanionStaticUpgradeProps,
	type CompanionStaticUpgradeResult,
	type CompanionUpgradeContext,
	type CompanionStaticUpgradeScript,
	CreateUseBuiltinInvertForFeedbacksUpgradeScript,
	type CompanionOptionValues,
	type JsonValue,
} from '@companion-module/base'
import type { AtemConfig } from '../config.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import { OffsetNumericExpressionOrValueByX } from './util.js'
import { UpgradeToExpressions } from './api2.0.js'

function scaleValue(obj: { [key: string]: JsonValue | undefined }, key: string, scale: number): void {
	if (obj[key] !== undefined) {
		obj[key] = parseFloat(obj[key] as string) * scale
	}
}

function upgradeV2x2x0(
	_context: CompanionUpgradeContext<AtemConfig>,
	props: CompanionStaticUpgradeProps<AtemConfig, undefined>,
): CompanionStaticUpgradeResult<AtemConfig, undefined> {
	const result: CompanionStaticUpgradeResult<AtemConfig, undefined> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (action.actionId === 'setSsrcBoxProperties') {
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
		if (feedback.feedbackId === 'ssrc_box_properties') {
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
	[id in string]?: true
} = {
	preview_bg: true,
	preview_bg_2: true,
	preview_bg_3: true,
	preview_bg_4: true,
	program_bg: true,
	program_bg_2: true,
	program_bg_3: true,
	program_bg_4: true,
	aux_bg: true,
	usk_bg: true,
	usk_source: true,
	dsk_bg: true,
	dskTie: true,
	dsk_source: true,
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
	props: CompanionStaticUpgradeProps<AtemConfig, undefined>,
): CompanionStaticUpgradeResult<AtemConfig, undefined> {
	const result: CompanionStaticUpgradeResult<AtemConfig, undefined> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (action.actionId === 'setSsrcBoxProperties' && !action.options.properties) {
			action.options.properties = {
				isExpression: false,
				value: ['size', 'x', 'y', 'cropEnable', 'cropTop', 'cropLeft', 'cropRight', 'cropBottom'],
			}
			result.updatedActions.push(action)
		} else if (action.actionId === 'ssrcArt' && !action.options.properties) {
			action.options.properties = {
				isExpression: false,
				value: ['fill', 'key', 'artOption'],
			}
			result.updatedActions.push(action)
		}
	}

	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === 'ssrc_box_properties' && !feedback.options.properties) {
			feedback.options.properties = {
				isExpression: false,
				value: ['size', 'x', 'y', 'cropEnable', 'cropTop', 'cropLeft', 'cropRight', 'cropBottom'],
			}
			result.updatedFeedbacks.push(feedback)
		}
	}

	return result
}

function fixUsingFairlightAudioFaderGainInsteadOfFairlightAudioMonitorFaderGain(
	_context: CompanionUpgradeContext<AtemConfig>,
	props: CompanionStaticUpgradeProps<AtemConfig, undefined>,
): CompanionStaticUpgradeResult<AtemConfig, undefined> {
	const result: CompanionStaticUpgradeResult<AtemConfig, undefined> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === 'fairlightAudioFaderGain' && feedback.options['input'] === undefined) {
			feedback.feedbackId = 'fairlightAudioMonitorFaderGain'
			result.updatedFeedbacks.push(feedback)
		}
	}

	return result
}

const InvertableFeedbackUpgradeMap: Record<string, string> = {
	program_tally: 'invert',
	preview_tally: 'invert',
	dsk_bg: 'invert',
	dskTie: 'invert',
	usk_bg: 'invert',
}

function combineTransitionSelectionToDropdown(
	_context: CompanionUpgradeContext<AtemConfig>,
	props: CompanionStaticUpgradeProps<AtemConfig, undefined>,
): CompanionStaticUpgradeResult<AtemConfig, undefined> {
	const result: CompanionStaticUpgradeResult<AtemConfig, undefined> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	const convertSelection = (options: CompanionOptionValues) => {
		options.selection = []

		if (options.background) options.selection.push('background')
		delete options.background

		for (const key of Object.keys(options)) {
			if (key.startsWith('key')) {
				if (options[key]) options.selection.push(key)
				delete options[key]
			}
		}
	}

	for (const action of props.actions) {
		if (action.actionId === 'transitionSelection' && action.options['selection'] === undefined) {
			convertSelection(action.options)

			result.updatedActions.push(action)
		}
	}

	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === 'transitionSelection' && feedback.options['selection'] === undefined) {
			convertSelection(feedback.options)

			result.updatedFeedbacks.push(feedback)
		}
	}

	return result
}

function ChangeMediaPlayerSourceVariablesDropdownToText(
	_context: CompanionUpgradeContext<AtemConfig>,
	props: CompanionStaticUpgradeProps<AtemConfig, undefined>,
): CompanionStaticUpgradeResult<AtemConfig, undefined> {
	const result: CompanionStaticUpgradeResult<AtemConfig, undefined> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (action.actionId === 'mediaPlayerSourceVariables') {
			action.actionId = 'mediaPlayerSourceVariables2'
			action.options.mediaplayer = OffsetNumericExpressionOrValueByX(action.options.mediaplayer, 1)

			result.updatedActions.push(action)
		}
	}

	return result
}

export const UpgradeScripts: CompanionStaticUpgradeScript<AtemConfig>[] = [
	upgradeV2x2x0,
	CreateConvertToBooleanFeedbackUpgradeScript(BooleanFeedbackUpgradeMap),
	upgradeAddSSrcPropertiesPicker,
	fixUsingFairlightAudioFaderGainInsteadOfFairlightAudioMonitorFaderGain,
	CreateUseBuiltinInvertForFeedbacksUpgradeScript(InvertableFeedbackUpgradeMap),
	combineTransitionSelectionToDropdown,
	ChangeMediaPlayerSourceVariablesDropdownToText,
	UpgradeToExpressions,
]
