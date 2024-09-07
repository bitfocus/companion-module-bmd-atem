import { Enums, type Atem } from 'atem-connection'
import { getMixEffect } from 'atem-connection/dist/state/util.js'
import {
	AtemMEPicker,
	AtemRatePicker,
	AtemTransitionSelectComponentsPickers,
	AtemTransitionSelectionComponentPicker,
	AtemTransitionSelectionPicker,
	AtemTransitionStylePicker,
} from '../../input.js'
import type { ModelSpec } from '../../models/index.js'
import { ActionId } from '../ActionId.js'
import type { MyActionDefinitions } from './../types.js'
import { AtemCommandBatching, CommandBatching } from '../../batching.js'
import {
	CHOICES_KEYTRANS,
	CHOICES_ON_OFF_TOGGLE,
	NextTransBackgroundChoices,
	NextTransKeyChoices,
	type TrueFalseToggle,
} from '../../choices.js'
import type { AtemConfig } from '../../config.js'
import { getTransitionProperties, getUSK, type StateWrapper } from '../../state.js'
import { type InstanceBaseExt, assertUnreachable, calculateTransitionSelection } from '../../util.js'
import type { InputValue } from '@companion-module/base'

export interface AtemTransitionActions {
	[ActionId.PreviewTransition]: {
		mixeffect: string
		state: TrueFalseToggle
	}
	[ActionId.TransitionStyle]: {
		mixeffect: number
		style: Enums.TransitionStyle
	}
	[ActionId.TransitionRate]: {
		mixeffect: number
		style: Enums.TransitionStyle
		rate: number
	}
	[ActionId.TransitionSelection]: {
		mixeffect: number
		selection: ('background' | string)[]
	}
	[ActionId.TransitionSelectComponents]: {
		mixeffect: number
		background: NextTransBackgroundChoices
		[id: `key${string}`]: NextTransKeyChoices
	}
	[ActionId.TransitionSelectionComponent]: {
		mixeffect: number
		component: number
		mode: TrueFalseToggle
	}
}

export function createTransitionActions(
	instance: InstanceBaseExt<AtemConfig>,
	atem: Atem | undefined,
	model: ModelSpec,
	commandBatching: AtemCommandBatching,
	state: StateWrapper,
): MyActionDefinitions<AtemTransitionActions> {
	return {
		[ActionId.PreviewTransition]: {
			name: 'Transition: Preview',
			options: {
				mixeffect: {
					type: 'textinput',
					id: 'mixeffect',
					label: 'M/E',
					default: '1',
					useVariables: true,
				},
				state: {
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
			},
			callback: async ({ options }) => {
				const mixeffect = await options.getParsedNumber('mixeffect')

				let target: boolean
				if (options.getPlainString('state') === 'toggle') {
					const meState = getMixEffect(state.state, mixeffect - 1)
					target = !meState.transitionPreview
				} else {
					target = options.getPlainString('state') === 'true'
				}

				console.log('previewTransition', target, mixeffect)

				if (!isNaN(mixeffect)) {
					await atem?.previewTransition(target, mixeffect - 1)
				}
			},
		},
		[ActionId.TransitionStyle]: {
			name: 'Transition: Set style/pattern',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				style: AtemTransitionStylePicker(model.media.clips === 0),
			},
			callback: async ({ options }) => {
				await atem?.setTransitionStyle(
					{
						nextStyle: options.getPlainNumber('style'),
					},
					options.getPlainNumber('mixeffect'),
				)
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))

				if (me) {
					return {
						...options.getJson(),
						style: me.transitionProperties.nextStyle,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.TransitionRate]: {
			name: 'Transition: Change rate',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				style: AtemTransitionStylePicker(true),
				rate: AtemRatePicker('Transition Rate'),
			},
			callback: async ({ options }) => {
				const style = options.getPlainNumber('style')
				switch (style) {
					case Enums.TransitionStyle.MIX:
						await atem?.setMixTransitionSettings(
							{
								rate: options.getPlainNumber('rate'),
							},
							options.getPlainNumber('mixeffect'),
						)
						break
					case Enums.TransitionStyle.DIP:
						await atem?.setDipTransitionSettings(
							{
								rate: options.getPlainNumber('rate'),
							},
							options.getPlainNumber('mixeffect'),
						)

						break
					case Enums.TransitionStyle.WIPE:
						await atem?.setWipeTransitionSettings(
							{
								rate: options.getPlainNumber('rate'),
							},
							options.getPlainNumber('mixeffect'),
						)

						break
					case Enums.TransitionStyle.DVE:
						await atem?.setDVETransitionSettings(
							{
								rate: options.getPlainNumber('rate'),
							},
							options.getPlainNumber('mixeffect'),
						)
						break
					case Enums.TransitionStyle.STING:
						// Not supported
						break
					default:
						assertUnreachable(style)
						instance.log('debug', 'Unknown transition style: ' + style)
				}
			},
			learn: ({ options }) => {
				const me = getMixEffect(state.state, options.getPlainNumber('mixeffect'))

				if (me?.transitionSettings) {
					const style = options.getPlainNumber('style')
					switch (style) {
						case Enums.TransitionStyle.MIX:
							if (!me.transitionSettings.mix) return undefined
							return {
								...options.getJson(),
								rate: me.transitionSettings.mix.rate,
							}
						case Enums.TransitionStyle.DIP:
							if (!me.transitionSettings.dip) return undefined
							return {
								...options.getJson(),
								rate: me.transitionSettings.dip.rate,
							}
						case Enums.TransitionStyle.WIPE:
							if (!me.transitionSettings.wipe) return undefined
							return {
								...options.getJson(),
								rate: me.transitionSettings.wipe.rate,
							}
						case Enums.TransitionStyle.DVE:
							if (!me.transitionSettings.DVE) return undefined
							return {
								...options.getJson(),
								rate: me.transitionSettings.DVE.rate,
							}
						case Enums.TransitionStyle.STING:
							return undefined
						default:
							assertUnreachable(style)
							return undefined
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.TransitionSelection]: {
			name: 'Transition: Change selection',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				selection: AtemTransitionSelectionPicker(model),
			},
			callback: async ({ options }) => {
				await atem?.setTransitionStyle(
					{
						nextSelection: calculateTransitionSelection(model.USKs, options.getRaw('selection')),
					},
					options.getPlainNumber('mixeffect'),
				)
			},
		},
		[ActionId.TransitionSelectComponents]: {
			name: 'Transition: Select components in transition',
			options: {
				mixeffect: AtemMEPicker(model, 0),
				...AtemTransitionSelectComponentsPickers(model),
			},
			callback: async ({ options }) => {
				const mixeffect = options.getPlainNumber('mixeffect')
				const tp = getTransitionProperties(state.state, mixeffect)
				if (!atem || !tp) return

				const currentNextSelection = tp.nextSelection
				const nextSelection: Enums.TransitionSelection[] = []

				{
					const inNextSelection = currentNextSelection.includes(Enums.TransitionSelection.Background)

					let include
					const mode = options.getPlainString('background')
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

						const mode = options.getPlainString(`key${key}`)
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
				const me = options.getPlainNumber('mixeffect')
				const mixeffect = getMixEffect(state.state, me)
				const tp = getTransitionProperties(state.state, me)
				if (mixeffect && tp) {
					const currentNextSelection = tp.nextSelection

					const background = currentNextSelection.includes(Enums.TransitionSelection.Background)
						? NextTransBackgroundChoices.Include
						: NextTransBackgroundChoices.Omit

					const keys: { [key: string]: InputValue } = {}
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
						...options.getJson(),
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
			options: {
				mixeffect: AtemMEPicker(model, 0),
				component: AtemTransitionSelectionComponentPicker(model),
				mode: {
					type: 'dropdown',
					id: 'mode',
					label: 'State',
					choices: CHOICES_KEYTRANS,
					default: CHOICES_KEYTRANS[0].id,
				},
			},
			callback: async ({ options }) => {
				const me = options.getPlainNumber('mixeffect')
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

					const mode = options.getPlainString('mode')
					const component = 1 << options.getPlainNumber('component')
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
