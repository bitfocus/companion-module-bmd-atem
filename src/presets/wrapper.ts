import type {
	CompanionButtonPresetDefinition,
	CompanionButtonStepActions,
	CompanionPresetAction,
	CompanionPresetActionsWithOptions,
	CompanionPresetDefinitions,
	CompanionPresetFeedback,
} from '@companion-module/base'
import type {
	MyButtonPresetDefinition,
	MyButtonStepActions,
	MyPresetAction,
	MyPresetDefinitionCategory,
} from './types.js'
import type { Complete } from '@companion-module/base/dist/util.js'

function wrapAction(action: MyPresetAction<any>): CompanionPresetAction {
	return {
		actionId: String(action.actionId),
		options: action.options,
		delay: action.delay,
	} satisfies Complete<CompanionPresetAction>
}

function wrapStep(step: MyButtonStepActions<any>): CompanionButtonStepActions {
	const res: CompanionButtonStepActions = {
		up: step.up.map(wrapAction),
		down: step.up.map(wrapAction),
		rotate_left: step.rotate_left?.map(wrapAction),
		rotate_right: step.rotate_right?.map(wrapAction),
	} satisfies Complete<CompanionButtonStepActions>

	const keys = Object.keys(step)
		.map((k) => Number(k))
		.filter((k) => !isNaN(k))
	for (const delay of keys) {
		const src = step[delay]
		if (!src) continue
		res[delay] = Array.isArray(src)
			? src.map(wrapAction)
			: ({
					options: src.options,
					actions: src.actions.map(wrapAction),
				} satisfies Complete<CompanionPresetActionsWithOptions>)
	}

	return res
}

function convertMyPresetToCompanionPreset(
	rawPreset: MyButtonPresetDefinition<any, any>,
	category: MyPresetDefinitionCategory<any, any>,
): CompanionButtonPresetDefinition {
	return {
		type: rawPreset.type,
		name: rawPreset.name,
		category: category.name,
		style: rawPreset.style,
		previewStyle: rawPreset.previewStyle,
		options: rawPreset.options,
		feedbacks: rawPreset.feedbacks.map(
			(feedback) =>
				({
					feedbackId: String(feedback.feedbackId),
					options: feedback.options,
					style: feedback.style,
					isInverted: feedback.isInverted,
				}) satisfies Complete<CompanionPresetFeedback>,
		),
		steps: rawPreset.steps.map(wrapStep),
	} satisfies Complete<CompanionButtonPresetDefinition>
}

export function convertMyPresetDefinitions<TActions, TFeedbacks>(
	presets: (MyPresetDefinitionCategory<TActions, TFeedbacks> | undefined)[],
): CompanionPresetDefinitions {
	const res: CompanionPresetDefinitions = {}

	for (const category of presets) {
		if (!category) continue

		for (const [id, preset] of Object.entries(category.presets)) {
			if (!preset) continue

			res[id] = convertMyPresetToCompanionPreset(preset, category)
		}
	}

	return res
}
