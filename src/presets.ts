import { combineRgb, type CompanionPresetDefinitions } from '@companion-module/base'
import { type AtemState, Enums } from 'atem-connection'
import { ActionId } from './actions.js'
import { CHOICES_KEYFRAMES, GetSourcesListForType, GetTransitionStyleChoices } from './choices.js'
import { type AtemConfig, PresetStyleName } from './config.js'
import { FeedbackId, MacroFeedbackType } from './feedback.js'
import type { ModelSpec } from './models/index.js'
import { calculateTransitionSelection, type InstanceBaseExt, MEDIA_PLAYER_SOURCE_CLIP_OFFSET } from './util.js'

const rateOptions = [12, 15, 25, 30, 37, 45, 50, 60]

// interface CompanionPresetExt extends CompanionPressButtonPresetDefinition {
// 	feedbacks: Array<
// 		{
// 			feedbackId: FeedbackId
// 		} & SetRequired<CompanionPresetFeedback, 'style'>
// 	>
// 	steps:[{
// 		down: Array<
// 			{
// 				actionId: ActionId
// 			} & CompanionPresetAction
// 		>
// 		up: Array<
// 			{
// 				actionId: ActionId
// 			} & CompanionPresetAction
// 		>
// 	}
// }

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

export function GetPresetsList(
	instance: InstanceBaseExt<AtemConfig>,
	model: ModelSpec,
	state: AtemState
): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {}

	const pstText = instance.config.presets === PresetStyleName.Long + '' ? 'long_' : 'short_'
	const pstSize = instance.config.presets === PresetStyleName.Long + '' ? 'auto' : '18'

	const meSources = GetSourcesListForType(model, state, 'me')

	for (let me = 0; me < model.MEs; ++me) {
		for (const src of meSources) {
			presets[`preview_me_${me}_${src.id}`] = {
				category: `Preview (M/E ${me + 1})`,
				name: `Preview button for ${src.shortName}`,
				type: 'button',
				style: {
					text: `$(atem:${pstText}${src.id})`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.PreviewBG,
						options: {
							input: src.id,
							mixeffect: me,
						},
						style: {
							bgcolor: combineRgb(0, 255, 0),
							color: combineRgb(255, 255, 255),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: ActionId.Preview,
								options: {
									mixeffect: me,
									input: src.id,
								},
							},
						],
						up: [],
					},
				],
			}

			presets[`program_me_${me}_${src.id}`] = {
				category: `Program (M/E ${me + 1})`,
				name: `Program button for ${src.shortName}`,
				type: 'button',
				style: {
					text: `$(atem:${pstText}${src.id})`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.ProgramBG,
						style: {
							bgcolor: combineRgb(255, 0, 0),
							color: combineRgb(255, 255, 255),
						},
						options: {
							input: src.id,
							mixeffect: me,
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: ActionId.Program,
								options: {
									mixeffect: me,
									input: src.id,
								},
							},
						],
						up: [],
					},
				],
			}
		}
	}

	for (let me = 0; me < model.MEs; ++me) {
		presets[`transition_auto_me_${me}`] = {
			category: `Transitions (M/E ${me + 1})`,
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
			presets[`transition_style_me_${me}_${opt.id}`] = {
				category: `Transitions (M/E ${me + 1})`,
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
				presets[`transition_rate_${me}_${opt.id}_${rate}`] = {
					category: `Transitions (M/E ${me + 1})`,
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
			const selectionProps: { [key: string]: boolean } = {
				background: opt[0],
			}
			for (let i = 0; i < model.USKs; i++) {
				if (opt[i + 1]) {
					transitionStringParts.push(`K${i + 1}`)
				}
				selectionProps[`key${i}`] = opt[i + 1]
			}

			if (calculateTransitionSelection(model.USKs, selectionProps).length === 0) {
				// The 0 case is not supported on the atem
				continue
			}

			const transitionString = transitionStringParts.join(' & ')

			presets[`transition_selection_${me}_${transitionString.trim()}`] = {
				category: `Transitions (M/E ${me + 1})`,
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
							...selectionProps,
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
									...selectionProps,
								},
							},
						],
						up: [],
					},
				],
			}
		}
	}

	for (let aux = 0; aux < model.auxes; ++aux) {
		for (const src of GetSourcesListForType(model, state, 'aux')) {
			presets[`aux_${aux}_${src.id}`] = {
				category: `AUX ${aux + 1}`,
				name: `AUX ${aux + 1} button for ${src.shortName}`,
				type: 'button',
				style: {
					text: `$(atem:${pstText}${src.id})`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.AuxBG,
						options: {
							input: src.id,
							aux,
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
								actionId: ActionId.Aux,
								options: {
									aux,
									input: src.id,
								},
							},
						],
						up: [],
					},
				],
			}
		}
	}

	// Upstream keyers
	for (let me = 0; me < model.MEs; ++me) {
		for (let key = 0; key < model.USKs; ++key) {
			presets[`keys_onair_me_${me}_${key}`] = {
				category: 'KEYs OnAir',
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

			presets[`keys_next_me_${me}_${key}`] = {
				category: 'KEYs Next',
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
							background: false,
							['key' + key]: true,
							mixeffect: me,
							matchmethod: 'contains',
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

			for (const src of meSources) {
				presets[`key_src_${me}_${key}_${src.id}`] = {
					category: `M/E ${me + 1} Key ${key + 1}`,
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
				presets[`key_fly_me_${me}_${key}_${flydirection.id}`] = {
					category: `KEYs Fly`,
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
								keyframe: flydirection.id,
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
									actionId: ActionId.USKFly,
									options: {
										keyframe: flydirection.id,
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
		}
	}

	// Downstream keyers
	for (let dsk = 0; dsk < model.DSKs; ++dsk) {
		presets[`dsk_onair_${dsk}`] = {
			category: 'KEYs OnAir',
			name: `Toggle downstream KEY ${dsk + 1} OnAir`,
			type: 'button',
			style: {
				text: `DSK ${dsk + 1}`,
				size: '24',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.DSKOnAir,
					options: {
						key: dsk,
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
							actionId: ActionId.DSKOnAir,
							options: {
								onair: 'toggle',
								key: dsk,
							},
						},
					],
					up: [],
				},
			],
		}

		presets[`dsk_next_${dsk}`] = {
			category: 'KEYs Next',
			name: `Toggle downstream KEY ${dsk + 1} Next`,
			type: 'button',
			style: {
				text: `DSK ${dsk + 1}`,
				size: '24',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.DSKTie,
					options: {
						key: dsk,
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
							actionId: ActionId.DSKTie,
							options: {
								state: 'toggle',
								key: dsk,
							},
						},
					],
					up: [],
				},
			],
		}

		for (const src of meSources) {
			presets[`dsk_src_${dsk}_${src.id}`] = {
				category: `DSK ${dsk + 1}`,
				name: `DSK ${dsk + 1} source ${src.shortName}`,
				type: 'button',
				style: {
					text: `$(atem:${pstText}${src.id})`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.DSKSource,
						options: {
							fill: src.id,
							key: dsk,
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
								actionId: ActionId.DSKSource,
								options: {
									fill: src.id,
									cut: src.id + 1,
									key: dsk,
								},
							},
						],
						up: [],
					},
				],
			}
		}
	}

	// Macros
	for (let macro = 0; macro < model.macros; macro++) {
		presets[`macro_run_${macro}`] = {
			category: 'MACROS',
			name: `Run button for macro ${macro + 1}`,
			type: 'button',
			style: {
				text: `$(atem:macro_${macro + 1})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.Macro,
					options: {
						macroIndex: macro + 1,
						state: MacroFeedbackType.IsUsed,
					},
					style: {
						bgcolor: combineRgb(0, 0, 238),
						color: combineRgb(255, 255, 255),
					},
				},
				{
					feedbackId: FeedbackId.Macro,
					options: {
						macroIndex: macro + 1,
						state: MacroFeedbackType.IsRunning,
					},
					style: {
						bgcolor: combineRgb(0, 238, 0),
						color: combineRgb(255, 255, 255),
					},
				},
				{
					feedbackId: FeedbackId.Macro,
					options: {
						macroIndex: macro + 1,
						state: MacroFeedbackType.IsWaiting,
					},
					style: {
						bgcolor: combineRgb(238, 238, 0),
						color: combineRgb(255, 255, 255),
					},
				},
				{
					feedbackId: FeedbackId.Macro,
					options: {
						macroIndex: macro + 1,
						state: MacroFeedbackType.IsRecording,
					},
					style: {
						bgcolor: combineRgb(238, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: ActionId.MacroRun,
							options: {
								macro: macro + 1,
								action: 'runContinue',
							},
						},
					],
					up: [],
				},
			],
		}
	}

	for (let mv = 0; mv < model.MVs; mv++) {
		const firstWindow = model.multiviewerFullGrid ? 0 : 2
		const windowCount = model.multiviewerFullGrid ? 16 : 10
		for (let window = firstWindow; window < windowCount; window++) {
			for (const src of GetSourcesListForType(model, state, 'mv')) {
				presets[`mv_win_src_${mv}_${window}_${src.id}`] = {
					category: `MV ${mv + 1} Window ${window + 1}`,
					name: `Set MV ${mv + 1} Window ${window + 1} to source ${src.shortName}`,
					type: 'button',
					style: {
						text: `$(atem:${pstText}${src.id})`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.MVSource,
							options: {
								multiViewerId: mv,
								source: src.id,
								windowIndex: window,
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
									actionId: ActionId.MultiviewerWindowSource,
									options: {
										multiViewerId: mv,
										source: src.id,
										windowIndex: window,
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

	for (let ssrc = 0; ssrc < model.SSrc; ssrc++) {
		for (let box = 0; box < 4; box++) {
			presets[`ssrc_box_onair_${ssrc}_${box}`] = {
				category: `SSrc ${ssrc + 1} Boxes`,
				name: `Toggle SuperSource ${ssrc + 1} Box ${box + 1} visibility`,
				type: 'button',
				style: {
					text: `Box ${box + 1}`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.SSrcBoxOnAir,
						options: {
							ssrcId: ssrc,
							boxIndex: box,
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
								actionId: ActionId.SuperSourceBoxOnAir,
								options: {
									ssrcId: ssrc,
									onair: 'toggle',
									boxIndex: box,
								},
							},
						],
						up: [],
					},
				],
			}

			for (const src of meSources) {
				presets[`ssrc_box_src_${ssrc}_${box}_${src.id}`] = {
					category: `SSrc ${ssrc + 1} Box ${box + 1}`,
					name: `Set SuperSource ${ssrc + 1} Box ${box + 1} to source ${src.shortName}`,
					type: 'button',
					style: {
						text: `$(atem:${pstText}${src.id})`,
						size: pstSize,
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: FeedbackId.SSrcBoxSource,
							options: {
								ssrcId: ssrc,
								source: src.id,
								boxIndex: box,
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
									actionId: ActionId.SuperSourceBoxSource,
									options: {
										ssrcId: ssrc,
										source: src.id,
										boxIndex: box,
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

	for (let player = 0; player < model.media.players; player++) {
		for (let clip = 0; clip < model.media.clips; clip++) {
			presets[`mediaplayer_clip_${player}_${clip}`] = {
				category: `Mediaplayer ${player + 1}`,
				name: `Set Mediaplayer ${player + 1} source to clip ${clip + 1}`,
				type: 'button',
				style: {
					text: `MP ${player + 1} Clip ${clip + 1}`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.MediaPlayerSource,
						options: {
							mediaplayer: player,
							source: clip + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
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
								actionId: ActionId.MediaPlayerSource,
								options: {
									mediaplayer: player,
									source: clip + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
								},
							},
						],
						up: [],
					},
				],
			}
		}

		for (let still = 0; still < model.media.stills; still++) {
			presets[`mediaplayer_still_${player}_${still}`] = {
				category: `Mediaplayer ${player + 1}`,
				name: `Set Mediaplayer ${player + 1} source to still ${still + 1}`,
				type: 'button',
				style: {
					text: `MP ${player + 1} Still ${still + 1}`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.MediaPlayerSource,
						options: {
							mediaplayer: player,
							source: still,
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
								actionId: ActionId.MediaPlayerSource,
								options: {
									mediaplayer: player,
									source: still,
								},
							},
						],
						up: [],
					},
				],
			}
		}
	}

	for (let me = 0; me < model.MEs; ++me) {
		presets[`ftb_auto_${me}`] = {
			category: `Fade to black (M/E ${me + 1})`,
			name: `Auto fade`,
			type: 'button',
			style: {
				text: `FTB Auto`,
				size: pstSize,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.FadeToBlackIsBlack,
					options: {
						mixeffect: me,
						state: 'off',
					},
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(255, 255, 255),
					},
				},
				{
					feedbackId: FeedbackId.FadeToBlackIsBlack,
					options: {
						mixeffect: me,
						state: 'on',
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
				{
					feedbackId: FeedbackId.FadeToBlackIsBlack,
					options: {
						mixeffect: me,
						state: 'fading',
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
							actionId: ActionId.FadeToBlackAuto,
							options: {
								mixeffect: me,
							},
						},
					],
					up: [],
				},
			],
		}
		for (const rate of rateOptions) {
			presets[`ftb_rate_${me}_${rate}`] = {
				category: `Fade to black (M/E ${me + 1})`,
				name: `Rate ${rate}`,
				type: 'button',
				style: {
					text: `Rate ${rate}`,
					size: pstSize,
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: FeedbackId.FadeToBlackRate,
						options: {
							mixeffect: me,
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
								actionId: ActionId.FadeToBlackRate,
								options: {
									mixeffect: me,
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

	if (model.streaming) {
		presets[`streaming_toggle`] = {
			category: 'Streaming & Recording',
			name: 'Stream',
			type: 'button',
			style: {
				text: 'Stream\\n$(atem:stream_duration_hm)',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.StreamStatus,
					options: {
						state: Enums.StreamingStatus.Streaming,
					},
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(0, 0, 0),
					},
				},
				{
					feedbackId: FeedbackId.StreamStatus,
					options: {
						state: Enums.StreamingStatus.Stopping,
					},
					style: {
						bgcolor: combineRgb(238, 238, 0),
						color: combineRgb(0, 0, 0),
					},
				},
				{
					feedbackId: FeedbackId.StreamStatus,
					options: {
						state: Enums.StreamingStatus.Connecting,
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
							actionId: ActionId.StreamStartStop,
							options: {
								stream: 'toggle',
							},
						},
					],
					up: [],
				},
			],
		}
	}

	if (model.recording) {
		presets[`recording_toggle`] = {
			category: 'Streaming & Recording',
			name: 'Record',
			type: 'button',
			style: {
				text: 'Record\\n$(atem:record_duration_hm)',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.RecordStatus,
					options: {
						state: Enums.RecordingStatus.Recording,
					},
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(0, 0, 0),
					},
				},
				{
					feedbackId: FeedbackId.RecordStatus,
					options: {
						state: Enums.RecordingStatus.Stopping,
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
							actionId: ActionId.RecordStartStop,
							options: {
								record: 'toggle',
							},
						},
					],
					up: [],
				},
			],
		}
	}

	return presets
}
