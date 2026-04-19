import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle, resolveTrueFalseToggle } from '../options/common.js'
import type { StateWrapper } from '../state.js'

export type AtemRecordingActions = {
	[ActionId.RecordStartStop]: {
		options: {
			record: TrueFalseToggle
		}
	}
	[ActionId.RecordSwitchDisk]: {
		options: Record<string, never>
	}
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
): CompanionActionDefinitions<AtemRecordingActions> {
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
			options: convertOptionsFields({
				record: {
					id: 'record',
					type: 'dropdown',
					label: 'Record',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				const newState = resolveTrueFalseToggle(
					options.record,
					state.state.recording?.status?.state !== Enums.RecordingStatus.Idle,
				)

				if (newState) {
					await atem?.startRecording()
				} else {
					await atem?.stopRecording()
				}
			},
		},
		[ActionId.RecordSwitchDisk]: {
			name: 'Recording: Switch disk',
			options: convertOptionsFields({}),
			callback: async () => {
				await atem?.switchRecordingDisk()
			},
		},
		[ActionId.RecordFilename]: {
			name: 'Recording: Set filename',
			options: convertOptionsFields({
				filename: {
					id: 'filename',
					label: 'Filename',
					type: 'textinput',
					default: '',
					useVariables: true,
				},
			}),
			callback: async ({ options }) => {
				await atem?.setRecordingSettings({
					filename: options.filename,
				})
			},
			learn: () => {
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
			options: convertOptionsFields({
				recordISO: {
					id: 'recordISO',
					type: 'dropdown',
					label: 'Record ISO',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
					disableAutoExpression: true, // TODO: Until the options are simplified
				},
			}),
			callback: async ({ options }) => {
				const newState = resolveTrueFalseToggle(options.recordISO, state.state.recording?.recordAllInputs)

				await atem?.setEnableISORecording(newState)
			},
			learn: () => {
				if (state.state.recording?.recordAllInputs != undefined) {
					return {
						recordISO: state.state.recording.recordAllInputs ? 'true' : 'false',
					}
				} else {
					return undefined
				}
			},
		},
	}
}
