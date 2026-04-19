import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../options/util.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle, resolveTrueFalseToggle } from '../options/common.js'
import type { StateWrapper } from '../state.js'
import { sanitizeFilename } from '../util.js'

export type AtemRecordingActions = {
	['recordStartStop']: {
		options: {
			record: TrueFalseToggle
		}
	}
	['recordSwitchDisk']: {
		options: Record<string, never>
	}
	['recordFilename']: {
		options: {
			filename: string
		}
	}
	['recordISO']: {
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
			['recordStartStop']: undefined,
			['recordSwitchDisk']: undefined,
			['recordFilename']: undefined,
			['recordISO']: undefined,
		}
	}
	return {
		['recordStartStop']: {
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
		['recordSwitchDisk']: {
			name: 'Recording: Switch disk',
			options: convertOptionsFields({}),
			callback: async () => {
				await atem?.switchRecordingDisk()
			},
		},
		['recordFilename']: {
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
					filename: sanitizeFilename(options.filename),
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
		['recordISO']: {
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
