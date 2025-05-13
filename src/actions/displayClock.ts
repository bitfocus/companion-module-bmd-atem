import { Enums, type Atem, type DisplayClock } from 'atem-connection'
import {
	AtemDisplayClockPropertiesPickers,
	AtemDisplayClockTimeOffsetPickers,
	AtemDisplayClockTimePickers,
} from '../input.js'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import type { StateWrapper } from '../state.js'

export interface AtemDisplayClockActions {
	[ActionId.DisplayClockState]: {
		state: 'toggle' | Enums.DisplayClockClockState
	}
	[ActionId.DisplayClockConfigure]: {
		properties: Array<'enabled' | 'size' | 'opacity' | 'x' | 'y' | 'autoHide' | 'clockMode'>

		enabled: boolean
		size: number
		opacity: number
		x: number
		y: number
		autoHide: boolean
		clockMode: Enums.DisplayClockClockMode
	}
	[ActionId.DisplayClockStartTime]: {
		hours: number
		minutes: number
		seconds: number
	}
	[ActionId.DisplayClockOffsetStartTime]: {
		hours: number
		minutes: number
		seconds: number
	}
}

export function createDisplayClockActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemDisplayClockActions> {
	if (!model.displayClock) {
		return {
			[ActionId.DisplayClockState]: undefined,
			[ActionId.DisplayClockConfigure]: undefined,
			[ActionId.DisplayClockStartTime]: undefined,
			[ActionId.DisplayClockOffsetStartTime]: undefined,
		}
	}
	return {
		[ActionId.DisplayClockState]: {
			name: 'Display Clock: Start/Stop',
			options: {
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
				},
			},
			callback: async ({ options }) => {
				let newState: Enums.DisplayClockClockState | undefined
				const rawState = options.getRaw('state')
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
		[ActionId.DisplayClockConfigure]: {
			name: 'Display Clock: Configure',
			options: { ...AtemDisplayClockPropertiesPickers() },
			callback: async ({ options }) => {
				const newProps: Partial<DisplayClock.DisplayClockProperties> = {}

				const props = options.getRaw('properties')
				if (props && Array.isArray(props)) {
					if (props.includes('enabled')) newProps.enabled = options.getPlainBoolean('enabled')

					if (props.includes('size')) newProps.size = options.getPlainNumber('size') * 100
					if (props.includes('opacity')) newProps.opacity = options.getPlainNumber('opacity') * 100
					if (props.includes('x')) newProps.positionX = options.getPlainNumber('x') * 1000
					if (props.includes('y')) newProps.positionY = options.getPlainNumber('y') * 1000

					if (props.includes('autoHide')) newProps.autoHide = options.getPlainBoolean('autoHide')

					if (props.includes('clockMode')) newProps.clockMode = options.getPlainNumber('clockMode')
				}

				if (Object.keys(newProps).length === 0) return

				await atem?.setDisplayClockProperties(newProps)
			},
			learn: ({ options }) => {
				const displayClockConfig = state.state.displayClock?.properties
				if (displayClockConfig) {
					return {
						...options.getJson(),
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
		[ActionId.DisplayClockStartTime]: {
			name: 'Display Clock: Set Start Time',
			options: { ...AtemDisplayClockTimePickers() },
			callback: async ({ options }) => {
				const time: DisplayClock.DisplayClockTime = {
					hours: options.getPlainNumber('hours'),
					minutes: options.getPlainNumber('minutes'),
					seconds: options.getPlainNumber('seconds'),
					frames: 0,
				}

				await atem?.setDisplayClockProperties({
					startFrom: time,
				})
			},
			learn: ({ options }) => {
				const displayClockConfig = state.state.displayClock?.properties
				if (displayClockConfig) {
					return {
						...options.getJson(),
						hours: displayClockConfig.startFrom.hours,
						minutes: displayClockConfig.startFrom.minutes,
						seconds: displayClockConfig.startFrom.seconds,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.DisplayClockOffsetStartTime]: {
			name: 'Display Clock: Offset Start Time',
			options: { ...AtemDisplayClockTimeOffsetPickers() },
			callback: async ({ options }) => {
				const hourOffset = options.getPlainNumber('hours')
				const minuteOffset = options.getPlainNumber('minutes')
				const secondOffset = options.getPlainNumber('seconds')

				const offset = Number(hourOffset) * 3600 + Number(minuteOffset) * 60 + Number(secondOffset)

				let currentTime = 0

				const displayClockConfig = state.state.displayClock?.properties

				if (displayClockConfig) {
					currentTime =
						displayClockConfig.startFrom.hours * 3600 +
						displayClockConfig.startFrom.minutes * 60 +
						displayClockConfig.startFrom.seconds
				}

				let newTime = currentTime + offset

				if (newTime < 0) newTime = 0

				const hours = Math.floor(newTime / 3600)
				const minutes = Math.floor((newTime % 3600) / 60)
				const seconds = newTime % 60

				const time: DisplayClock.DisplayClockTime = {
					hours,
					minutes,
					seconds,
					frames: 0,
				}

				await atem?.setDisplayClockProperties({
					startFrom: time,
				})
			},
		},
	}
}
