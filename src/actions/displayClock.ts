import { Enums, type Atem, type DisplayClock } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import {
	AtemDisplayClockPropertiesPickers,
	AtemDisplayClockTimeOffsetPickers,
	AtemDisplayClockTimePickers,
} from '../options/displayClock.js'
import type { ModelSpec } from '../models/index.js'
import type { StateWrapper } from '../state.js'

export type AtemDisplayClockActions = {
	['displayClockState']: {
		options: {
			state: 'toggle' | Enums.DisplayClockClockState
		}
	}
	['displayClockConfigure']: {
		options: {
			properties: Array<'enabled' | 'size' | 'opacity' | 'x' | 'y' | 'autoHide' | 'clockMode'>

			enabled: boolean
			size: number
			opacity: number
			x: number
			y: number
			autoHide: boolean
			clockMode: Enums.DisplayClockClockMode
		}
	}
	['displayClockStartTime']: {
		options: {
			hours: number
			minutes: number
			seconds: number
		}
	}
	['displayClockOffsetStartTime']: {
		options: {
			hours: number
			minutes: number
			seconds: number
		}
	}
}

export function createDisplayClockActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemDisplayClockActions> {
	if (!model.displayClock) {
		return {
			['displayClockState']: undefined,
			['displayClockConfigure']: undefined,
			['displayClockStartTime']: undefined,
			['displayClockOffsetStartTime']: undefined,
		}
	}
	return {
		['displayClockState']: {
			name: 'Display Clock: Start/Stop',
			options: convertOptionsFields({
				state: {
					id: 'state',
					label: 'State',
					type: 'dropdown',
					default: 'toggle',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: Enums.DisplayClockClockState.Running, label: 'Start' },
						{ id: Enums.DisplayClockClockState.Stopped, label: 'Stop' },
						{ id: Enums.DisplayClockClockState.Reset, label: 'Reset' },
					],
					disableAutoExpression: true,
				},
			}),
			callback: async ({ options }) => {
				let newState: Enums.DisplayClockClockState | undefined
				const rawState = options.state
				switch (rawState) {
					case 'toggle':
						newState =
							state.state.displayClock?.properties?.clockState === Enums.DisplayClockClockState.Running
								? Enums.DisplayClockClockState.Stopped
								: Enums.DisplayClockClockState.Running
						break
					case Enums.DisplayClockClockState.Running:
					case Enums.DisplayClockClockState.Stopped:
					case Enums.DisplayClockClockState.Reset:
						newState = rawState
						break
				}

				if (newState !== undefined) {
					await atem?.setDisplayClockState(newState)
				}
			},
		},
		['displayClockConfigure']: {
			name: 'Display Clock: Configure',
			options: convertOptionsFields({
				...AtemDisplayClockPropertiesPickers(),
			}),
			callback: async ({ options }) => {
				const newProps: Partial<DisplayClock.DisplayClockProperties> = {}

				const props = options.properties
				if (props && Array.isArray(props)) {
					if (props.includes('enabled')) newProps.enabled = options.enabled

					if (props.includes('size')) newProps.size = options.size * 100
					if (props.includes('opacity')) newProps.opacity = options.opacity * 100
					if (props.includes('x')) newProps.positionX = options.x * 1000
					if (props.includes('y')) newProps.positionY = options.y * 1000

					if (props.includes('autoHide')) newProps.autoHide = options.autoHide

					if (props.includes('clockMode')) newProps.clockMode = options.clockMode
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setDisplayClockProperties(newProps)
			},
			learn: () => {
				const displayClockConfig = state.state.displayClock?.properties
				if (displayClockConfig) {
					return {
						enabled: displayClockConfig.enabled,
						size: displayClockConfig.size / 100,
						opacity: displayClockConfig.opacity / 100,
						x: displayClockConfig.positionX / 1000,
						y: displayClockConfig.positionY / 1000,
						autoHide: displayClockConfig.autoHide,
						clockMode: displayClockConfig.clockMode,
					}
				} else {
					return undefined
				}
			},
		},
		['displayClockStartTime']: {
			name: 'Display Clock: Set Start Time',
			options: convertOptionsFields({ ...AtemDisplayClockTimePickers() }),
			callback: async ({ options }) => {
				const time: DisplayClock.DisplayClockTime = {
					hours: options.hours,
					minutes: options.minutes,
					seconds: options.seconds,
					frames: 0,
				}

				await atem?.setDisplayClockProperties({
					startFrom: time,
				})
			},
			learn: () => {
				const displayClockConfig = state.state.displayClock?.properties
				if (displayClockConfig) {
					return {
						hours: displayClockConfig.startFrom.hours,
						minutes: displayClockConfig.startFrom.minutes,
						seconds: displayClockConfig.startFrom.seconds,
					}
				} else {
					return undefined
				}
			},
		},
		['displayClockOffsetStartTime']: {
			name: 'Display Clock: Offset Start Time',
			options: convertOptionsFields({ ...AtemDisplayClockTimeOffsetPickers() }),
			callback: async ({ options }) => {
				const clockState = state.state.displayClock?.properties?.startFrom
				const currentTime = clockState ? clockState.hours * 3600 + clockState.minutes * 60 + clockState.seconds : 0

				const offset = options.hours * 3600 + options.minutes * 60 + options.seconds

				let newTime = currentTime + offset

				const oneDay = 24 * 3600
				newTime = newTime % oneDay
				if (newTime < 0) newTime += oneDay

				const time: DisplayClock.DisplayClockTime = {
					hours: Math.floor(newTime / 3600),
					minutes: Math.floor((newTime % 3600) / 60),
					seconds: newTime % 60,
					frames: 0,
				}

				await atem?.setDisplayClockProperties({
					startFrom: time,
				})
			},
		},
	}
}
