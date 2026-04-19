import type { CompanionPresetGroup, CompanionButtonStyleProps } from '@companion-module/base'
import { ActionId } from '../actions/ActionId.js'
import { FeedbackId } from '../feedback/FeedbackId.js'
import type { PresetsBuilderContext } from './context.js'
import type { AtemSchema } from '../schema.js'
import { iterateTimes } from '../util.js'

export function createMediaPlayerPresets(
	context: PresetsBuilderContext,
	pstSize: CompanionButtonStyleProps['size'],
): void {
	const groups: CompanionPresetGroup<AtemSchema>[] = []
	context.sections.push({
		id: 'mediaPlayer',
		name: `Media Players`,
		definitions: groups,
	})

	for (let player = 0; player < context.model.media.players; player++) {
		if (context.model.media.clips > 0) {
			groups.push({
				id: `mediaplayer_clip_${player}`,
				name: `Mediaplayer ${player + 1} Clips`,
				type: 'template',
				presetId: 'mediaplayer_clip',
				templateVariableName: 'clip',
				templateValues: iterateTimes(context.model.media.clips, (clip) => ({
					name: `Set Mediaplayer ${player + 1} source to clip ${clip + 1}`,
					value: clip + 1,
				})),
				commonVariableValues: {
					player: player + 1,
				},
			})
		}

		groups.push({
			id: `mediaplayer_still_${player}`,
			name: `Mediaplayer ${player + 1} Stills`,
			type: 'template',
			presetId: 'mediaplayer_still',
			templateVariableName: 'still',
			templateValues: iterateTimes(context.model.media.stills, (still) => ({
				name: `Set Mediaplayer ${player + 1} source to still ${still + 1}`,
				value: still + 1,
			})),
			commonVariableValues: {
				player: player + 1,
			},
		})
	}

	context.definitions['mediaplayer_clip'] = {
		name: `Set Mediaplayer X source to clip X`,
		type: 'simple',
		style: {
			text: `MP $(local:player) Clip $(local:clip)`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.MediaPlayerSource,
				options: {
					mediaplayer: { isExpression: true, value: '$(local:player)' },
					source: { isExpression: true, value: `clip$(local:clip)` },
					defaultClip: true,
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
						actionId: ActionId.MediaPlayerSource,
						options: {
							mediaplayer: { isExpression: true, value: '$(local:player)' },
							source: { isExpression: true, value: `clip$(local:clip)` },
							defaultClip: true,
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'player',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'clip',
				startupValue: 0,
			},
		],
	}

	context.definitions['mediaplayer_still'] = {
		name: `Set Mediaplayer X source to still X`,
		type: 'simple',
		style: {
			text: `MP $(local:player) Still $(local:still)`,
			size: pstSize,
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: FeedbackId.MediaPlayerSource,
				options: {
					mediaplayer: { isExpression: true, value: '$(local:player)' },
					source: { isExpression: true, value: '$(local:still)' },
					defaultClip: false,
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
						actionId: ActionId.MediaPlayerSource,
						options: {
							mediaplayer: { isExpression: true, value: '$(local:player)' },
							source: { isExpression: true, value: '$(local:still)' },
							defaultClip: false,
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'player',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'still',
				startupValue: 0,
			},
		],
	}
}
