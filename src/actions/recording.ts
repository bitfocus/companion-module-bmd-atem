import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../choices.js'
import type { StateWrapper } from '../state.js'

export type AtemRecordingActions = {
	[ActionId.RecordStartStop]: {
		options: {
			record: TrueFalseToggle
		}
	}
	[ActionId.RecordSwitchDisk]: { options: Record<string, never> }
	[ActionId.RecordFilename]: {
		options: {
			filename: string
		}
	}
	[ActionId.RecordISO]: {
		options: {
			recordISO: TrueFalseToggle
		}
	}
}

export function createRecordingActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemRecordingActions> {
	if (!model.recording) {
		return {
			[ActionId.RecordStartStop]: undefined,
			[ActionId.RecordSwitchDisk]: undefined,
			[ActionId.RecordFilename]: undefined,
			[ActionId.RecordISO]: undefined,
		}
	}
	return {
		[ActionId.RecordStartStop]: {
			name: 'Recording: Start or Stop',
			options: {
				record: {
					id: 'record',
					type: 'dropdown',
					label: 'Record',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
			},
			callback: async ({ options }) => {
				let newState = options.record === 'true'
				if (options.record === 'toggle') {
					newState = state.state.recording?.status?.state === Enums.RecordingStatus.Idle
				}

				if (newState) {
					await atem?.startRecording()
				} else {
					await atem?.stopRecording()
				}
			},
			learn: ({ options }) => {
				if (state.state.recording?.status) {
					return {
						state: state.state.recording.status.state,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.RecordSwitchDisk]: {
			name: 'Recording: Switch disk',
			options: {},
			callback: async () => {
				await atem?.switchRecordingDisk()
			},
		},
		[ActionId.RecordFilename]: {
			name: 'Recording: Set filename',
			options: {
				filename: {
					id: 'filename',
					label: 'Filename',
					type: 'textinput',
					default: '',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const filename = await options.filename
				await atem?.setRecordingSettings({ filename })
			},
			learn: ({ options }) => {
				if (state.state.recording?.properties) {
					return {
						filename: state.state.recording?.properties.filename,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.RecordISO]: {
			name: 'Recording: Enable/Disable ISO',
			options: {
				recordISO: {
					id: 'recordISO',
					type: 'dropdown',
					label: 'Record ISO',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
			},
			callback: async ({ options }) => {
				let newState = options.recordISO === 'true'
				if (options.recordISO === 'toggle') {
					newState = !state.state.recording?.recordAllInputs
				}

				await atem?.setEnableISORecording(newState)
			},
			learn: ({ options }) => {
				if (state.state.recording?.recordAllInputs != undefined) {
					return {
						state: state.state.recording.recordAllInputs,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
