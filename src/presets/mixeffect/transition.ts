import { combineRgb, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../../actions/ActionId.js'
import { FeedbackId } from '../../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from '../types.js'
import type { ActionTypes } from '../../actions/index.js'
import type { FeedbackTypes } from '../../feedback/index.js'
import type { ModelSpec } from '../../models/types.js'
import { GetTransitionStyleChoices } from '../../choices.js'
import { calculateTransitionSelection } from '../../util.js'

function getTransitionSelectionOptions(keyCount: number): boolean[][] {
	let res: boolean[][] = []
	res.push([true])
	res.push([false])

	for (let i = 0; i < keyCount; i++) {
		const tmp: boolean[][] = []
		for (const r of res) {
			tmp.push([...r, false])
			tmp.push([...r, true])
		}
		res = tmp
	}

	return res
}

export function createTransitionPresets(
	model: ModelSpec,
	pstSize: CompanionButtonStyleProps['size'],
	rateOptions: number[],
): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	const result: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] = []

	for (let me = 0; me < model.MEs; ++me) {
		const transitionCategory: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
			name: `Transitions (M/E ${me + 1})`,
			presets: {},
		}
		result.push(transitionCategory)

		transitionCategory.presets[`transition_preview_me_${me}`] = {
			name: `PREVIEW`,
			type: 'button',
			style: {
				text: 'PREV TRANS',
				size: pstSize,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.PreviewTransition,
					options: {
						mixeffect: me,
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: ActionId.PreviewTransition,
							options: {
								mixeffect: me + 1 + '',
								state: 'toggle',
							},
						},
					],
					up: [],
				},
			],
		}

		transitionCategory.presets[`transition_cut_me_${me}`] = {
			name: `CUT`,
			type: 'button',
			style: {
				text: 'CUT',
				size: pstSize,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.InTransition,
					options: {
						mixeffect: me,
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: ActionId.Cut,
							options: {
								mixeffect: me,
							},
						},
					],
					up: [],
				},
			],
		}

		transitionCategory.presets[`transition_auto_me_${me}`] = {
			name: `AUTO`,
			type: 'button',
			style: {
				text: 'AUTO',
				size: pstSize,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.InTransition,
					options: {
						mixeffect: me,
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: ActionId.Auto,
							options: {
								mixeffect: me,
							},
						},
					],
					up: [],
				},
			],
		}
		for (const opt of GetTransitionStyleChoices()) {
			transitionCategory.presets[`transition_style_me_${me}_${opt.id}`] = {
				name: `Transition style ${opt.label}`,
				type: 'button',
				style: {
					text: opt.label,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.TransitionStyle,
						options: {
							mixeffect: me,
							style: opt.id,
						},
						style: {
							bgcolor: combineRgb(255, 255, 0),
							color: combineRgb(0, 0, 0),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: ActionId.TransitionStyle,
								options: {
									mixeffect: me,
									style: opt.id,
								},
							},
						],
						up: [],
					},
				],
			}
		}
		for (const opt of GetTransitionStyleChoices(true)) {
			for (const rate of rateOptions) {
				transitionCategory.presets[`transition_rate_${me}_${opt.id}_${rate}`] = {
					name: `Transition ${opt.label} rate ${rate}`,
					type: 'button',
					style: {
						text: `${opt.label} ${rate}`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.TransitionRate,
							options: {
								mixeffect: me,
								style: opt.id,
								rate,
							},
							style: {
								bgcolor: combineRgb(255, 255, 0),
								color: combineRgb(0, 0, 0),
							},
						},
					],
					steps: [
						{
							down: [
								{
									actionId: ActionId.TransitionRate,
									options: {
										mixeffect: me,
										style: opt.id,
										rate,
									},
								},
							],
							up: [],
						},
					],
				}
			}
		}

		for (const opt of getTransitionSelectionOptions(model.USKs)) {
			const transitionStringParts = opt[0] ? ['BG'] : []
			const selectionProps = opt[0] ? ['background'] : []

			for (let i = 0; i < model.USKs; i++) {
				if (opt[i + 1]) {
					transitionStringParts.push(`K${i + 1}`)
					selectionProps.push(`key${i}`)
				}
			}

			if (calculateTransitionSelection(model.USKs, selectionProps).length === 0) {
				// The 0 case is not supported on the atem
				continue
			}

			const transitionString = transitionStringParts.join(' & ')

			transitionCategory.presets[`transition_selection_${me}_${transitionString.trim()}`] = {
				name: `Transition Selection ${transitionString.trim()}`,
				type: 'button',
				style: {
					text: transitionString.trim(),
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.TransitionSelection,
						options: {
							mixeffect: me,
							matchmethod: 'contains',
							selection: selectionProps,
						},
						style: {
							bgcolor: combineRgb(255, 255, 0),
							color: combineRgb(0, 0, 0),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: ActionId.TransitionSelection,
								options: {
									mixeffect: me,
									selection: selectionProps,
								},
							},
						],
						up: [],
					},
				],
			}
		}
	}

	return result
}
