import type { CompanionPresetGroup, CompanionButtonStyleProps } from '@companion-module/base'
import { FeedbackId } from '../../feedback/FeedbackId.js'
import { GetTransitionStyleChoices } from '../../options/mixEffect.js'
import type { PresetsBuilderContext } from '../context.js'
import type { AtemSchema } from '../../schema.js'
import { calculateTransitionSelection, type TransitionSelectionComponent } from '../../options/transition.js'

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
	context: PresetsBuilderContext,
	pstSize: CompanionButtonStyleProps['size'],
	rateOptions: number[],
): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'transitions',
		name: `Transitions`,
		definitions: groups,
	})

	// Pre-compute valid selection options (shared across all MEs)
	const validSelections: Array<{
		transitionString: string
		selectionId: string
		selectionProps: TransitionSelectionComponent[]
	}> = []
	for (const opt of getTransitionSelectionOptions(context.model.USKs)) {
		const transitionStringParts = opt[0] ? ['BG'] : []
		const selectionProps: TransitionSelectionComponent[] = opt[0] ? ['background'] : []
		for (let i = 0; i < context.model.USKs; i++) {
			if (opt[i + 1]) {
				transitionStringParts.push(`K${i + 1}`)
				selectionProps.push(`key${i}`)
			}
		}
		if (calculateTransitionSelection(context.model.USKs, selectionProps).length === 0) continue
		validSelections.push({
			transitionString: transitionStringParts.join(' & '),
			selectionId: transitionStringParts.join('_'),
			selectionProps,
		})
	}

	// Rate definitions are shared templates (ME injected via commonVariableValues at group level)
	for (const opt of GetTransitionStyleChoices(true)) {
		context.definitions[`transition_rate_${opt.id}`] = {
			name: `Transition ${opt.label} rate X`,
			type: 'simple',
			style: {
				text: `${opt.label} $(local:rate)`,
				size: pstSize,
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.TransitionRate,
					options: {
						mixeffect: { isExpression: true, value: '$(local:me)' },
						style: opt.id,
						rate: { isExpression: true, value: '$(local:rate)' },
					},
					style: {
						bgcolor: 0xffff00,
						color: 0x000000,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'transitionRate',
							options: {
								mixeffect: { isExpression: true, value: '$(local:me)' },
								style: opt.id,
								rate: { isExpression: true, value: '$(local:rate)' },
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'me',
					startupValue: 0,
				},
				{
					variableType: 'simple',
					variableName: 'rate',
					startupValue: 0,
				},
			],
		}
	}

	// Per-ME groups: controls (preview/cut/auto + styles) + selection + rates
	for (let me = 0; me < context.model.MEs; ++me) {
		const meNum = me + 1

		// Per-ME control preset definitions
		context.definitions[`transition_preview_me${meNum}`] = {
			name: `Preview transition`,
			type: 'simple',
			style: {
				text: 'PREV TRANS',
				size: pstSize,
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.PreviewTransition,
					options: {
						mixeffect: { isExpression: true, value: '$(local:me)' },
					},
					style: {
						bgcolor: 0xff0000,
						color: 0xffffff,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'previewTransition',
							options: {
								mixeffect: { isExpression: true, value: '$(local:me)' },
								state: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'me',
					startupValue: meNum,
				},
			],
		}

		context.definitions[`transition_cut_me${meNum}`] = {
			name: `CUT`,
			type: 'simple',
			style: {
				text: 'CUT',
				size: pstSize,
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.InTransition,
					options: {
						mixeffect: { isExpression: true, value: '$(local:me)' },
					},
					style: {
						bgcolor: 0xff0000,
						color: 0xffffff,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'cut',
							options: {
								mixeffect: { isExpression: true, value: '$(local:me)' },
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'me',
					startupValue: meNum,
				},
			],
		}

		context.definitions[`transition_auto_me${meNum}`] = {
			name: `AUTO`,
			type: 'simple',
			style: {
				text: 'AUTO',
				size: pstSize,
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.InTransition,
					options: {
						mixeffect: { isExpression: true, value: '$(local:me)' },
					},
					style: {
						bgcolor: 0xff0000,
						color: 0xffffff,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'auto',
							options: {
								mixeffect: { isExpression: true, value: '$(local:me)' },
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'me',
					startupValue: meNum,
				},
			],
		}

		const controlPresets: string[] = [
			`transition_preview_me${meNum}`,
			`transition_cut_me${meNum}`,
			`transition_auto_me${meNum}`,
		]

		for (const opt of GetTransitionStyleChoices()) {
			context.definitions[`transition_style_${opt.id}_me${meNum}`] = {
				name: `Transition style ${opt.label}`,
				type: 'simple',
				style: {
					text: opt.label,
					size: pstSize,
					color: 0xffffff,
					bgcolor: 0x000000,
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.TransitionStyle,
						options: {
							mixeffect: { isExpression: true, value: '$(local:me)' },
							style: opt.id,
						},
						style: {
							bgcolor: 0xffff00,
							color: 0x000000,
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: 'transitionStyle',
								options: {
									mixeffect: { isExpression: true, value: '$(local:me)' },
									style: opt.id,
								},
							},
						],
						up: [],
					},
				],
				localVariables: [
					{
						variableType: 'simple',
						variableName: 'me',
						startupValue: meNum,
					},
				],
			}
			controlPresets.push(`transition_style_${opt.id}_me${meNum}`)
		}

		groups.push({
			id: `transition_controls_${me}`,
			name: `M/E ${meNum} - Controls`,
			type: 'simple',
			presets: controlPresets,
		})

		// Per-ME selection group
		const selectionPresets: string[] = []
		for (const { transitionString, selectionId, selectionProps } of validSelections) {
			context.definitions[`transition_selection_${selectionId}_me${meNum}`] = {
				name: `Transition Selection ${transitionString}`,
				type: 'simple',
				style: {
					text: transitionString,
					size: pstSize,
					color: 0xffffff,
					bgcolor: 0x000000,
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.TransitionSelection,
						options: {
							mixeffect: { isExpression: true, value: '$(local:me)' },
							matchmethod: 'contains',
							selection: selectionProps,
						},
						style: {
							bgcolor: 0xffff00,
							color: 0x000000,
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: 'transitionSelection',
								options: {
									mixeffect: { isExpression: true, value: '$(local:me)' },
									selection: selectionProps,
								},
							},
						],
						up: [],
					},
				],
				localVariables: [
					{
						variableType: 'simple',
						variableName: 'me',
						startupValue: meNum,
					},
				],
			}
			selectionPresets.push(`transition_selection_${selectionId}_me${meNum}`)
		}

		groups.push({
			id: `transition_selection_${me}`,
			name: `M/E ${meNum} - Selection`,
			type: 'simple',
			presets: selectionPresets,
		})

		// Rate groups for this ME (one per style)
		for (const opt of GetTransitionStyleChoices(true)) {
			groups.push({
				id: `transition_rate_${opt.id}_${me}`,
				name: `${opt.label} Rate (M/E ${meNum})`,
				type: 'template',
				presetId: `transition_rate_${opt.id}`,
				templateVariableName: 'rate',
				templateValues: rateOptions.map((rate) => ({
					name: `Transition ${opt.label} rate ${rate}`,
					value: rate,
				})),
				commonVariableValues: {
					me: meNum,
				},
			})
		}
	}
}
