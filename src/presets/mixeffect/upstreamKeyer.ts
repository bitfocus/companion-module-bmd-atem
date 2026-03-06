import { assertNever, combineRgb, CompanionPresetGroup, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../../actions/ActionId.js'
import { FeedbackId } from '../../feedback/FeedbackId.js'
import { CHOICES_KEYFRAMES, GetUpstreamKeyerTypeChoices, type SourceInfo } from '../../choices.js'
import { Enums } from 'atem-connection'
import type { PresetsBuilderContext } from '../context.js'
import type { AtemSchema } from '../../schema.js'
import { iterateTimes } from '../../util.js'

export function createUpstreamKeyerPresets(
	context: PresetsBuilderContext,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
	meSources: SourceInfo[],
): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'upstreamKeyer',
		name: `Upstream Keyers`,
		definitions: groups,
	})

	// Pre-process fly directions: compute action keyframes and create definitions up-front
	const flyDirections: Array<{ choice: (typeof CHOICES_KEYFRAMES)[number]; actionKeyframe: Enums.IsAtKeyFrame }> = []
	for (const flydirection of CHOICES_KEYFRAMES) {
		let actionKeyframe: Enums.IsAtKeyFrame
		switch (flydirection.id) {
			case Enums.FlyKeyKeyFrame.A:
				actionKeyframe = Enums.IsAtKeyFrame.A
				break
			case Enums.FlyKeyKeyFrame.B:
				actionKeyframe = Enums.IsAtKeyFrame.B
				break
			case Enums.FlyKeyKeyFrame.Full:
				actionKeyframe = Enums.IsAtKeyFrame.RunToInfinite
				break
			default:
				assertNever(flydirection.id)
				continue
		}
		flyDirections.push({ choice: flydirection, actionKeyframe })
	}

	const keyTypes = GetUpstreamKeyerTypeChoices()

	context.definitions['usk_onair'] = {
		name: `Toggle upstream KEY X OnAir`,
		type: 'simple',
		style: {
			text: `KEY $(local:key)`,
			size: '24',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.USKOnAir,
				options: {
					key: { isExpression: true, value: '$(local:key)' },
					mixeffect: { isExpression: true, value: '$(local:me)' },
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
						actionId: ActionId.USKOnAir,
						options: {
							onair: 'toggle',
							key: { isExpression: true, value: '$(local:key)' },
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
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'key',
				startupValue: 0,
			},
		],
	}

	context.definitions['usk_next'] = {
		name: `Toggle upstream KEY X Next`,
		type: 'simple',
		style: {
			text: `KEY $(local:key)`,
			size: '24',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.TransitionSelection,
				options: {
					mixeffect: { isExpression: true, value: '$(local:me)' },
					matchmethod: 'contains',
					selection: { isExpression: true, value: "'key' + ($(local:key) - 1)" },
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
						actionId: ActionId.TransitionSelectionComponent,
						options: {
							mixeffect: { isExpression: true, value: '$(local:me)' },
							component: { isExpression: true, value: '$(local:key)' },
							mode: 'toggle',
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
				variableName: 'key',
				startupValue: 0,
			},
		],
	}

	context.definitions['usk_src'] = {
		name: `KEY X source X`,
		type: 'simple',
		style: {
			text: `$(atem:${pstText}$(local:input))`,
			size: pstSize,
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.USKSource,
				options: {
					fill: { isExpression: true, value: '$(local:input)' },
					key: { isExpression: true, value: '$(local:key)' },
					mixeffect: { isExpression: true, value: '$(local:me)' },
				},
				style: {
					bgcolor: combineRgb(238, 238, 0),
					color: combineRgb(0, 0, 0),
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: ActionId.USKSource,
						options: {
							fill: { isExpression: true, value: '$(local:input)' },
							cut: { isExpression: true, value: '$(local:input) + 1' },
							key: { isExpression: true, value: '$(local:key)' },
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
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'key',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
		],
	}

	// All groups organized by ME (keyer-first order)
	for (let me = 0; me < context.model.MEs; ++me) {
		groups.push(
			{
				id: `usk_onair_${me}`,
				name: `KEYs OnAir (M/E ${me + 1})`,
				type: 'template',
				presetId: 'usk_onair',
				templateVariableName: 'key',
				templateValues: iterateTimes(context.model.USKs, (key) => ({
					name: `Toggle upstream M/E ${me + 1} KEY ${key + 1} OnAir`,
					value: key + 1,
				})),
				commonVariableValues: {
					me: me + 1,
				},
			},
			{
				id: `usk_next_${me}`,
				name: `KEYs Next (M/E ${me + 1})`,
				type: 'template',
				presetId: 'usk_next',
				templateVariableName: 'key',
				templateValues: iterateTimes(context.model.USKs, (key) => ({
					name: `Toggle upstream M/E ${me + 1} KEY ${key + 1} Next`,
					value: key + 1,
				})),
				commonVariableValues: {
					me: me + 1,
				},
			},
		)

		for (let key = 0; key < context.model.USKs; ++key) {
			const keyNum = key + 1
			groups.push({
				id: `usk_src_${me}_${key}`,
				name: `M/E ${me + 1} Key ${keyNum} Source`,
				type: 'template',
				presetId: 'usk_src',
				templateVariableName: 'input',
				templateValues: meSources.map((src) => ({
					name: `M/E ${me + 1} KEY ${keyNum} source ${src.shortName}`,
					value: src.id,
				})),
				commonVariableValues: {
					me: me + 1,
					key: keyNum,
				},
			})

			const flyPresetIds: string[] = []
			for (const { choice: flydirection, actionKeyframe } of flyDirections) {
				const defId = `usk_fly_${flydirection.id}_${me}_${key}`
				flyPresetIds.push(defId)
				context.definitions[defId] = {
					name: `Fly M/E ${me + 1} KEY ${keyNum} to ${flydirection.label}`,
					type: 'simple',
					style: {
						text: `Fly to\n${flydirection.label}`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.USKKeyFrame,
							options: {
								mixeffect: { isExpression: true, value: '$(local:me)' },
								key: { isExpression: true, value: '$(local:key)' },
								keyframe: actionKeyframe,
							},
							style: {
								bgcolor: combineRgb(238, 238, 0),
								color: combineRgb(0, 0, 0),
							},
						},
					],
					steps: [
						{
							down: [
								{
									actionId: ActionId.USKFly,
									options: {
										mixeffect: { isExpression: true, value: '$(local:me)' },
										key: { isExpression: true, value: '$(local:key)' },
										keyframe: flydirection.id,
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
							startupValue: me + 1,
						},
						{
							variableType: 'simple',
							variableName: 'key',
							startupValue: keyNum,
						},
					],
				}
			}
			groups.push({
				id: `usk_fly_${me}_${key}`,
				name: `M/E ${me + 1} KEY ${keyNum} Fly`,
				type: 'simple',
				presets: flyPresetIds,
			})

			const typePresetIds: string[] = []
			for (const keyType of keyTypes) {
				const defId = `usk_type_${keyType.id}_${me}_${key}`
				typePresetIds.push(defId)
				context.definitions[defId] = {
					name: `M/E ${me + 1} KEY ${keyNum} type ${keyType.label}`,
					type: 'simple',
					style: {
						text: `${keyType.label}`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.USKType,
							options: {
								mixeffect: { isExpression: true, value: '$(local:me)' },
								key: { isExpression: true, value: '$(local:key)' },
								type: keyType.id,
							},
							style: {
								bgcolor: combineRgb(238, 238, 0),
								color: combineRgb(0, 0, 0),
							},
						},
					],
					steps: [
						{
							down: [
								{
									actionId: ActionId.USKType,
									options: {
										mixeffect: { isExpression: true, value: '$(local:me)' },
										key: { isExpression: true, value: '$(local:key)' },
										type: keyType.id,
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
							startupValue: me + 1,
						},
						{
							variableType: 'simple',
							variableName: 'key',
							startupValue: keyNum,
						},
					],
				}
			}
			groups.push({
				id: `usk_type_${me}_${key}`,
				name: `M/E ${me + 1} KEY ${keyNum} Type`,
				type: 'simple',
				presets: typePresetIds,
			})
		}
	}
}
