import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './index.js'
import type { MyActionDefinitions } from './types.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../choices.js'
import type { StateWrapper } from '../state.js'

export interface AtemRecordingActions {
	[ActionId.RecordStartStop]: {
		record: TrueFalseToggle
	}
	[ActionId.RecordSwitchDisk]: Record<string, never>
	[ActionId.RecordFilename]: {
		filename: string
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
				let newState = options.getPlainString('record') === 'true'
				if (options.getPlainString('record') === 'toggle') {
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
						...options.getJson(),
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
				},
			},
			callback: async ({ options }) => {
				const filename = await options.getParsedString('filename')
				await atem?.setRecordingSettings({ filename })
			},
			learn: ({ options }) => {
				if (state.state.recording?.properties) {
					return {
						...options.getJson(),
						filename: state.state.recording?.properties.filename,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
