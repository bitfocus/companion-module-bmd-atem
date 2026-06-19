import { describe, expect, test } from 'vitest'
import { AtemStateUtil, Enums } from 'atem-connection'
import type { RecordingState } from 'atem-connection/dist/state/recording.js'
import { updateRecordingVariables } from '../lib.js'
import type { VariablesSchema } from '../schema.js'

// Unit tests for the recording disk variables added for #299. The ATEM only reports time-available
// and a volume name per disk (no bytes/capacity), so these cover the numeric seconds-remaining and
// the active working-set disk's volume name. The function is pure, so no instance mock is needed.

function makeRecording(overrides: Partial<RecordingState> = {}): RecordingState {
	return {
		status: { state: Enums.RecordingStatus.Recording, error: Enums.RecordingError.None, recordingTimeAvailable: 7200 },
		properties: { filename: 'clip', workingSet1DiskId: 3, workingSet2DiskId: 0, recordInAllCameras: false },
		disks: {
			3: { diskId: 3, volumeName: 'SSD A', recordingTimeAvailable: 7200, status: Enums.RecordingDiskStatus.Recording },
		},
		...overrides,
	}
}

describe('updateRecordingVariables', () => {
	test('exposes raw seconds remaining and the active disk volume name', () => {
		const state = AtemStateUtil.Create()
		state.recording = makeRecording()

		const values: Partial<VariablesSchema> = {}
		updateRecordingVariables(state, values)

		expect(values['record_remaining_seconds']).toBe(7200)
		expect(values['record_disk_volume']).toBe('SSD A')
	})

	test('volume name follows the active working set', () => {
		const state = AtemStateUtil.Create()
		state.recording = makeRecording({
			properties: { filename: 'clip', workingSet1DiskId: 5, workingSet2DiskId: 0, recordInAllCameras: false },
			disks: {
				3: { diskId: 3, volumeName: 'SSD A', recordingTimeAvailable: 100, status: Enums.RecordingDiskStatus.Idle },
				5: { diskId: 5, volumeName: 'USB B', recordingTimeAvailable: 200, status: Enums.RecordingDiskStatus.Active },
			},
		})

		const values: Partial<VariablesSchema> = {}
		updateRecordingVariables(state, values)

		expect(values['record_disk_volume']).toBe('USB B')
	})

	test('resolves to an empty volume when there is no recording state or no matching disk', () => {
		const noRecording: Partial<VariablesSchema> = {}
		updateRecordingVariables(AtemStateUtil.Create(), noRecording)
		expect(noRecording['record_disk_volume']).toBe('')
		expect(noRecording['record_remaining_seconds']).toBeUndefined()

		const state = AtemStateUtil.Create()
		state.recording = makeRecording({
			properties: { filename: 'clip', workingSet1DiskId: 9, workingSet2DiskId: 0, recordInAllCameras: false },
		})
		const missingDisk: Partial<VariablesSchema> = {}
		updateRecordingVariables(state, missingDisk)
		expect(missingDisk['record_disk_volume']).toBe('')
	})
})
