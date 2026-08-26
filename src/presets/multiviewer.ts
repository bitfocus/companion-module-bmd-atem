import type { CompanionPresetGroup, CompanionButtonStyleProps } from '@companion-module/base'
import { GetSourcesListForType } from '../options/sources.js'
import type { AtemState } from 'atem-connection'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'
import { iterateTimes } from '../util.js'

export function createMultiviewerWindowPresets(
	context: PresetsBuilderContext,
	state: AtemState,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
): void {
	// Some models have a multiviewer whose windows cannot be re-sourced, leaving no sources
	const mvWindowSources = GetSourcesListForType(context.model, state, 'mv')
	if (mvWindowSources.length === 0) return

	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'multiviewer_window',
		name: `Multiviewer Windows`,
		definitions: groups,
	})

	context.definitions[`multiviewer_window`] = {
		name: `Set MV X Window X to source X`,
		type: 'simple',
		style: {
			text: `$(atem:${pstText}$(local:input))`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: 'mv_source',
				options: {
					multiViewerId: { isExpression: true, value: '$(local:multiviewer)' },
					source: { isExpression: true, value: '$(local:input)' },
					windowIndex: { isExpression: true, value: '$(local:window)' },
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
						actionId: 'setMvSource',
						options: {
							multiViewerId: { isExpression: true, value: '$(local:multiviewer)' },
							source: { isExpression: true, value: '$(local:input)' },
							windowIndex: { isExpression: true, value: '$(local:window)' },
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'multiviewer',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'window',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
		],
	}

	for (let mv = 0; mv < context.model.MVs; mv++) {
		const firstWindow = context.model.multiviewerFullGrid ? 0 : 2
		const windowCount = context.model.multiviewerFullGrid ? 16 : 10
		for (let window = firstWindow; window < windowCount; window++) {
			groups.push({
				id: `mv_${mv}_w_${window}`,
				name: `MV ${mv + 1} Window ${window + 1}`,
				type: 'template',
				presetId: 'multiviewer_window',
				templateVariableName: 'input',
				templateValues: mvWindowSources.map((src) => ({
					name: `Set MV ${mv + 1} Window ${window + 1} to source ${src.shortName}`,
					value: src.id,
				})),
				commonVariableValues: {
					multiviewer: mv + 1,
					window: window + 1,
				},
			})
		}
	}
}

export function createMultiviewerOverlayPresets(context: PresetsBuilderContext): void {
	// Only some models (Constellation HD/4K/8K and newer) support the window label/border overlays and border colour
	if (!context.model.MVs || !context.model.multiviewerOverlay) return

	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'multiviewer_overlay',
		name: `Multiviewer Overlay`,
		definitions: groups,
	})

	const firstWindow = context.model.multiviewerFullGrid ? 0 : 2
	const windowCount = context.model.multiviewerFullGrid ? 16 : 10

	// Window label and border toggles, one group of window buttons per multiviewer
	for (let mv = 0; mv < context.model.MVs; mv++) {
		groups.push(
			{
				id: `mv_${mv}_labels`,
				name: `MV ${mv + 1} window labels`,
				type: 'template',
				presetId: 'multiviewer_window_label',
				templateVariableName: 'window',
				templateValues: iterateTimes(windowCount - firstWindow, (i) => ({
					name: `Toggle MV ${mv + 1} Window ${i + firstWindow + 1} label`,
					value: i + firstWindow + 1,
				})),
				commonVariableValues: {
					multiviewer: mv + 1,
				},
			},
			{
				id: `mv_${mv}_borders`,
				name: `MV ${mv + 1} window borders`,
				type: 'template',
				presetId: 'multiviewer_window_border',
				templateVariableName: 'window',
				templateValues: iterateTimes(windowCount - firstWindow, (i) => ({
					name: `Toggle MV ${mv + 1} Window ${i + firstWindow + 1} border`,
					value: i + firstWindow + 1,
				})),
				commonVariableValues: {
					multiviewer: mv + 1,
				},
			},
		)
	}

	context.definitions[`multiviewer_window_label`] = {
		name: `Toggle MV window label`,
		type: 'simple',
		style: {
			text: `W$(local:window)\\nLabel`,
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: 'multiviewerWindowLabel',
				options: {
					multiViewerId: { isExpression: true, value: '$(local:multiviewer)' },
					windowIndex: { isExpression: true, value: '$(local:window)' },
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
						actionId: 'multiviewerWindowLabel',
						options: {
							multiViewerId: { isExpression: true, value: '$(local:multiviewer)' },
							windowIndex: { isExpression: true, value: '$(local:window)' },
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
				variableName: 'multiviewer',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'window',
				startupValue: 0,
			},
		],
	}

	context.definitions[`multiviewer_window_border`] = {
		name: `Toggle MV window border`,
		type: 'simple',
		style: {
			text: `W$(local:window)\\nBorder`,
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: 'multiviewerWindowBorder',
				options: {
					multiViewerId: { isExpression: true, value: '$(local:multiviewer)' },
					windowIndex: { isExpression: true, value: '$(local:window)' },
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
						actionId: 'multiviewerWindowBorder',
						options: {
							multiViewerId: { isExpression: true, value: '$(local:multiviewer)' },
							windowIndex: { isExpression: true, value: '$(local:window)' },
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
				variableName: 'multiviewer',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'window',
				startupValue: 0,
			},
		],
	}

	// Border colour, one button per multiviewer for each of the common colours
	const borderColors = [
		{ id: 'black', label: 'Black', value: 0x000000, fg: 0xffffff },
		{ id: 'grey', label: 'Grey', value: 0x808080, fg: 0xffffff },
		{ id: 'white', label: 'White', value: 0xffffff, fg: 0x000000 },
	]
	for (const color of borderColors) {
		const presetId = `multiviewer_border_${color.id}`
		groups.push({
			id: presetId,
			name: `Border colour: ${color.label}`,
			type: 'template',
			presetId,
			templateVariableName: 'multiviewer',
			templateValues: iterateTimes(context.model.MVs, (mv) => ({
				name: `Set MV ${mv + 1} border colour ${color.label}`,
				value: mv + 1,
			})),
		})

		context.definitions[presetId] = {
			name: `Set MV border colour ${color.label}`,
			type: 'simple',
			style: {
				text: `MV$(local:multiviewer)\\nBorder\\n${color.label}`,
				size: '14',
				color: color.fg,
				bgcolor: color.value,
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: 'multiviewerBorderColor',
							options: {
								multiViewerId: { isExpression: true, value: '$(local:multiviewer)' },
								color: color.value,
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'multiviewer',
					startupValue: 0,
				},
			],
		}
	}
}
