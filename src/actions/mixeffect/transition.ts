import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../../options/util.js'
import type { CompanionActionDefinitions, JsonValue } from '@companion-module/base'
import { getMixEffect } from 'atem-connection/dist/state/util.js'
import {
	AtemTransitionSelectComponentsPickers,
	AtemTransitionSelectionComponentPicker,
	AtemTransitionSelectionPicker,
	calculateTransitionSelection,
	NextTransBackgroundChoices,
	NextTransKeyChoices,
	type TransitionSelectionComponent,
} from '../../options/transition.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../ActionId.js'
import { AtemCommandBatching, CommandBatching } from '../../batching.js'
import { CHOICES_KEYTRANS, CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../../choices.js'
import { getTransitionProperties, getUSK, type StateWrapper } from '../../state.js'
import { type InstanceBaseExt, assertUnreachable } from '../../util.js'
import {
	AtemMEPicker,
	AtemTransitionStylePicker,
	transitionStyleEnumToString,
	type TransitionStyleString,
	transitionStyleStringToEnum,
} from '../../options/mixEffect.js'
import { AtemRatePicker } from '../../options/common.js'

export type AtemTransitionActions = {
	[ActionId.PreviewTransition]: {
		options: {
			mixeffect: number
			state: TrueFalseToggle
		}
	}
	[ActionId.TransitionStyle]: {
		options: {
			mixeffect: number
			style: TransitionStyleString | JsonValue | undefined
		}
	}
	[ActionId.TransitionRate]: {
		options: {
			mixeffect: number
			style: TransitionStyleString | JsonValue | undefined
			rate: number
		}
	}
	[ActionId.TransitionSelection]: {
		options: {
			mixeffect: number
			selection: TransitionSelectionComponent[]
		}
	}
	[ActionId.TransitionSelectComponents]: {
		options: {
			mixeffect: number
			background: NextTransBackgroundChoices
			[id: `key${string}`]: NextTransKeyChoices
		}
	}
	[ActionId.TransitionSelectionComponent]: {
		options: {
			mixeffect: number
			component: number
			mode: TrueFalseToggle
		}
	}
}

export function createTransitionActions(
	instance: InstanceBaseExt,
	atem: Atem | undefined,
	model: ModelSpec,
	commandBatching: AtemCommandBatching,
	state: StateWrapper,
): CompanionActionDefinitions<AtemTransitionActions> {
	return {
		[ActionId.PreviewTransition]: {
			name: 'Transition: Preview',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				state: {
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				let target: boolean
				if (options.state === 'toggle') {
					const meState = getMixEffect(state.state, options.mixeffect - 1)
					target = !meState.transitionPreview
				} else {
					target = options.state === 'true'
				}

				await atem?.previewTransition(target, options.mixeffect - 1)
			},
		},
		[ActionId.TransitionStyle]: {
			name: 'Transition: Set style/pattern',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				style: AtemTransitionStylePicker(model.media.clips === 0),
			}),
			callback: async ({ options }) => {
				const parsedStyle = transitionStyleStringToEnum(options.style)
				if (parsedStyle === null) return // Not valid

				await atem?.setTransitionStyle(
					{
						nextStyle: parsedStyle,
					},
					options.mixeffect - 1,
				)
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.mixeffect - 1)

				if (me) {
					return {
						style: transitionStyleEnumToString(me.transitionProperties.nextStyle),
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.TransitionRate]: {
			name: 'Transition: Change rate',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				style: AtemTransitionStylePicker(true),
				rate: AtemRatePicker('Transition Rate'),
			}),
			callback: async ({ options }) => {
				const parsedStyle = transitionStyleStringToEnum(options.style)
				if (parsedStyle === null) return // Not valid

				switch (parsedStyle) {
					case Enums.TransitionStyle.MIX:
						await atem?.setMixTransitionSettings(
							{
								rate: options.rate,
							},
							options.mixeffect - 1,
						)
						break
					case Enums.TransitionStyle.DIP:
						await atem?.setDipTransitionSettings(
							{
								rate: options.rate,
							},
							options.mixeffect - 1,
						)

						break
					case Enums.TransitionStyle.WIPE:
						await atem?.setWipeTransitionSettings(
							{
								rate: options.rate,
							},
							options.mixeffect - 1,
						)

						break
					case Enums.TransitionStyle.DVE:
						await atem?.setDVETransitionSettings(
							{
								rate: options.rate,
							},
							options.mixeffect - 1,
						)
						break
					case Enums.TransitionStyle.STING:
						// Not supported
						break
					default:
						assertUnreachable(parsedStyle)
						instance.log('debug', 'Unknown transition style: ' + parsedStyle)
				}
			},
			learn: ({ options }) => {
				const parsedStyle = transitionStyleStringToEnum(options.style)
				if (parsedStyle === null) return // Not valid

				const me = getMixEffect(state.state, options.mixeffect - 1)

				if (me?.transitionSettings) {
					switch (parsedStyle) {
						case Enums.TransitionStyle.MIX:
							if (!me.transitionSettings.mix) return undefined
							return {
								rate: me.transitionSettings.mix.rate,
							}
						case Enums.TransitionStyle.DIP:
							if (!me.transitionSettings.dip) return undefined
							return {
								rate: me.transitionSettings.dip.rate,
							}
						case Enums.TransitionStyle.WIPE:
							if (!me.transitionSettings.wipe) return undefined
							return {
								rate: me.transitionSettings.wipe.rate,
							}
						case Enums.TransitionStyle.DVE:
							if (!me.transitionSettings.DVE) return undefined
							return {
								rate: me.transitionSettings.DVE.rate,
							}
						case Enums.TransitionStyle.STING:
							return undefined
						default:
							assertUnreachable(parsedStyle)
							return undefined
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.TransitionSelection]: {
			name: 'Transition: Change selection',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				selection: AtemTransitionSelectionPicker(model),
			}),
			callback: async ({ options }) => {
				await atem?.setTransitionStyle(
					{
						nextSelection: calculateTransitionSelection(model.USKs, options.selection),
					},
					options.mixeffect - 1,
				)
			},
		},
		[ActionId.TransitionSelectComponents]: {
			name: 'Transition: Select components in transition',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				...AtemTransitionSelectComponentsPickers(model),
			}),
			callback: async ({ options }) => {
				const mixeffect = options.mixeffect - 1
				const tp = getTransitionProperties(state.state, mixeffect)
				if (!atem || !tp) return

				const currentNextSelection = tp.nextSelection
				const nextSelection: Enums.TransitionSelection[] = []

				{
					const inNextSelection = currentNextSelection.includes(Enums.TransitionSelection.Background)

					let include
					const mode = options.background
					switch (mode) {
						case NextTransBackgroundChoices.NoChange:
							include = inNextSelection
							break
						case NextTransBackgroundChoices.Include:
							include = true
							break
						case NextTransBackgroundChoices.Omit:
							include = false
							break
						case NextTransBackgroundChoices.Toggle:
							include = !inNextSelection
							break
						default:
							assertUnreachable(mode)
							instance.log('debug', 'Unknown background mode: ' + mode)
							include = inNextSelection
							break
					}

					if (include) nextSelection.push(Enums.TransitionSelection.Background)
				}

				for (let key = 0; key < model.USKs; key++) {
					const usk = getUSK(state.state, mixeffect, key)
					if (usk) {
						const component = 1 << (key + 1)
						const inNextSelection = currentNextSelection.includes(component)

						const mode = options[`key${key}`]
						let include
						switch (mode) {
							case NextTransKeyChoices.NoChange:
								include = inNextSelection
								break
							case NextTransKeyChoices.On:
							case NextTransKeyChoices.Off:
								include = usk.onAir === (mode === NextTransKeyChoices.Off)
								break
							case NextTransKeyChoices.Toggle:
								include = !inNextSelection
								break
							case NextTransKeyChoices.Include:
								include = true
								break
							case NextTransKeyChoices.Omit:
								include = false
								break
							default:
								assertUnreachable(mode)
								instance.log('debug', 'Unknown mode: ' + mode)
								include = inNextSelection
								break
						}

						if (include) nextSelection.push(component)
					}
				}

				if (nextSelection.length > 0) {
					// If no components are selected, do nothing.
					await atem.setTransitionStyle({ nextSelection }, mixeffect)
				}
			},
			learn: ({ options }) => {
				const me = options.mixeffect - 1
				const mixeffect = getMixEffect(state.state, me)
				const tp = getTransitionProperties(state.state, me)
				if (mixeffect && tp) {
					const currentNextSelection = tp.nextSelection

					const background = currentNextSelection.includes(Enums.TransitionSelection.Background)
						? NextTransBackgroundChoices.Include
						: NextTransBackgroundChoices.Omit

					const keys: { [key: string]: NextTransKeyChoices } = {}
					for (let key = 0; key < model.USKs; key++) {
						const usk = getUSK(state.state, me, key)

						let choice
						if (usk) {
							const component = 1 << (key + 1)
							const inNextSelection = currentNextSelection.includes(component)

							choice = usk.onAir != inNextSelection ? NextTransKeyChoices.On : NextTransKeyChoices.Off
						} else {
							// This doesn't seem possible given the in-range
							// test above, but let's play it safe.
							choice = NextTransKeyChoices.Omit
						}

						keys[`key${key}`] = choice
					}

					return {
						background,
						...keys,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.TransitionSelectionComponent]: {
			name: 'Transition: Change selection component',
			options: convertOptionsFields({
				mixeffect: AtemMEPicker(model),
				component: AtemTransitionSelectionComponentPicker(model),
				mode: {
					type: 'dropdown',
					id: 'mode',
					label: 'State',
					choices: CHOICES_KEYTRANS,
					default: CHOICES_KEYTRANS[0].id,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				const me = options.mixeffect - 1
				const tp = getTransitionProperties(state.state, me)
				if (tp && atem) {
					let batch = commandBatching.meTransitionSelection.get(me)
					if (!batch) {
						batch = new CommandBatching(
							async (newVal) =>
								atem.setTransitionStyle(
									{
										nextSelection: newVal,
									},
									me,
								),
							{
								delayStep: 100,
								maxBatch: 5,
							},
						)
						commandBatching.meTransitionSelection.set(me, batch)
					}

					const mode = options.mode
					const component = 1 << options.component
					batch.queueChange(tp.nextSelection, (oldVal) => {
						let mode2 = mode
						if (mode === 'toggle') {
							if (oldVal.includes(component)) {
								mode2 = 'false'
							} else {
								mode2 = 'true'
							}
						}

						if (mode2 === 'true') {
							return [...oldVal, component]
						} else {
							return oldVal.filter((v) => v !== component)
						}
					})
				}
			},
		},
	}
}
