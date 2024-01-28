import { assertNever, combineRgb, type CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../../actions/ActionId.js'
import { FeedbackId } from '../../feedback/FeedbackId.js'
import type { MyPresetDefinitionCategory } from '../types.js'
import type { ActionTypes } from '../../actions/index.js'
import type { FeedbackTypes } from '../../feedback/index.js'
import type { ModelSpec } from '../../models/types.js'
import { CHOICES_KEYFRAMES, type SourceInfo } from '../../choices.js'
import { Enums } from 'atem-connection'

export function createUpstreamKeyerPresets(
	model: ModelSpec,
	pstSize: CompanionButtonStyleProps['size'],
	pstText: string,
	meSources: SourceInfo[],
): MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] {
	const result: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes>[] = []

	const onAirCategory: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
		name: 'KEYs OnAir',
		presets: {},
	}
	const nextCategory: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
		name: 'KEYs Next',
		presets: {},
	}
	const flyCategory: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
		name: 'KEYs Fly',
		presets: {},
	}
	result.push(onAirCategory, nextCategory, flyCategory)

	// Upstream keyers
	for (let me = 0; me < model.MEs; ++me) {
		for (let key = 0; key < model.USKs; ++key) {
			onAirCategory.presets[`keys_onair_me_${me}_${key}`] = {
				name: `Toggle upstream M/E ${me + 1} KEY ${key + 1} OnAir`,
				type: 'button',
				style: {
					text: 'KEY ' + (key + 1),
					size: '24',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.USKOnAir,
						options: {
							key,
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
								actionId: ActionId.USKOnAir,
								options: {
									onair: 'toggle',
									key,
									mixeffect: me,
								},
							},
						],
						up: [],
					},
				],
			}

			nextCategory.presets[`keys_next_me_${me}_${key}`] = {
				name: `Toggle upstream M/E ${me + 1} KEY ${key + 1} Next`,
				type: 'button',
				style: {
					text: 'KEY ' + (key + 1),
					size: '24',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.TransitionSelection,
						options: {
							mixeffect: me,
							matchmethod: 'contains',
							selection: ['key' + key],
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
									mixeffect: me,
									component: key + 1,
									mode: 'toggle',
								},
							},
						],
						up: [],
					},
				],
			}

			const sourcesCategory: MyPresetDefinitionCategory<ActionTypes, FeedbackTypes> = {
				name: `M/E ${me + 1} Key ${key + 1}`,
				presets: {},
			}
			result.push(sourcesCategory)

			for (const src of meSources) {
				sourcesCategory.presets[`key_src_${me}_${key}_${src.id}`] = {
					name: `M/E ${me + 1} KEY ${key + 1} source ${src.shortName}`,
					type: 'button',
					style: {
						text: `$(atem:${pstText}${src.id})`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.USKSource,
							options: {
								fill: src.id,
								key,
								mixeffect: me,
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
										fill: src.id,
										cut: src.id + 1,
										key,
										mixeffect: me,
									},
								},
							],
							up: [],
						},
					],
				}
			}

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

				flyCategory.presets[`key_fly_me_${me}_${key}_${flydirection.id}`] = {
					name: `Fly M/E ${me + 1} KEY ${key + 1} to ${flydirection.label}`,
					type: 'button',
					style: {
						text: `Fly to ${flydirection.label}`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.USKKeyFrame,
							options: {
								mixeffect: me,
								key,
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
										mixeffect: me,
										key,
										keyframe: flydirection.id,
									},
								},
							],
							up: [],
						},
					],
				}
			}
		}
	}

	return result
}
