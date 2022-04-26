import { AtemState, Enums } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionVariable } from '../../../instance_skel_types'
import { GetSourcesListForType, SourceInfo } from './choices'
import { AtemConfig, PresetStyleName } from './config'
import { ModelSpec } from './models'
import { getDSK, getMixEffect, getSuperSourceBox, getUSK } from './state'
import { pad } from './util'
import { Timecode } from 'atem-connection/dist/state/common'

function getSourcePresetName(instance: InstanceSkel<AtemConfig>, state: AtemState, id: number): string {
	const input = state.inputs[id]
	if (input) {
		return instance.config.presets === PresetStyleName.Long + '' ? input.longName : input.shortName
	} else if (id === 0) {
		return 'Black'
	} else if (id === undefined) {
		return 'Unknown'
	} else {
		return `Unknown input (${id})`
	}
}

export function updateMEProgramVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, meIndex: number): void {
	const input = getMixEffect(state, meIndex)?.programInput ?? 0
	instance.setVariable(`pgm${meIndex + 1}_input`, getSourcePresetName(instance, state, input))
}
export function updateMEPreviewVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, meIndex: number): void {
	const input = getMixEffect(state, meIndex)?.previewInput ?? 0
	instance.setVariable(`pvw${meIndex + 1}_input`, getSourcePresetName(instance, state, input))
}

export function updateUSKVariable(
	instance: InstanceSkel<AtemConfig>,
	state: AtemState,
	meIndex: number,
	keyIndex: number
): void {
	const input = getUSK(state, meIndex, keyIndex)?.fillSource ?? 0
	instance.setVariable(`usk_${meIndex + 1}_${keyIndex + 1}_input`, getSourcePresetName(instance, state, input))
}
export function updateDSKVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, keyIndex: number): void {
	const input = getDSK(state, keyIndex)?.sources?.fillSource ?? 0
	instance.setVariable(`dsk_${keyIndex + 1}_input`, getSourcePresetName(instance, state, input))
}

export function updateAuxVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, auxIndex: number): void {
	const input = state.video.auxilliaries[auxIndex] ?? 0
	instance.setVariable(`aux${auxIndex + 1}_input`, getSourcePresetName(instance, state, input))
}

export function updateMacroVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, id: number): void {
	const macro = state.macro.macroProperties[id]
	instance.setVariable(`macro_${id + 1}`, macro?.name || `Macro ${id + 1}`)
}

export function updateMediaStillVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, id: number): void {
	const still = state.media.stillPool[id]
	instance.setVariable(`still_${id + 1}`, still?.fileName || `Still ${id + 1}`)
}

export function updateMediaClipVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, id: number): void {
	const clip = state.media.clipPool[id]
	instance.setVariable(`clip_${id + 1}`, clip?.name || `Clip ${id + 1}`)
}

export function updateMediaPlayerVariables(instance: InstanceSkel<AtemConfig>, state: AtemState, id: number): void {
	const player = state.media.players[id]
	let indexStr = '-1'
	let sourceStr = 'Unknown'
	if (player) {
		if (player.sourceType === Enums.MediaSourceType.Clip) {
			const clip = state.media.clipPool[player.clipIndex]
			indexStr = `C${player.clipIndex + 1}`
			sourceStr = clip?.name || `Clip ${player.clipIndex + 1}`
		} else if (player.sourceType === Enums.MediaSourceType.Still) {
			const still = state.media.stillPool[player.stillIndex]
			indexStr = `S${player.stillIndex + 1}`
			sourceStr = still?.fileName || `Still ${player.stillIndex + 1}`
		}
	}
	instance.setVariable(`mp_index_${id + 1}`, indexStr)
	instance.setVariable(`mp_source_${id + 1}`, sourceStr)
}

function updateInputVariables(instance: InstanceSkel<AtemConfig>, src: SourceInfo): void {
	instance.setVariable(`long_${src.id}`, src.longName)
	instance.setVariable(`short_${src.id}`, src.shortName)
}

function formatDuration(durationObj: Timecode | undefined): { hms: string; hm: string; ms: string } {
	let durationHMS = '00:00:00'
	let durationHM = '00:00'
	let durationMS = '00:00'

	if (durationObj) {
		durationHM = `${pad(`${durationObj.hours}`, '0', 2)}:${pad(`${durationObj.minutes}`, '0', 2)}`
		durationHMS = `${durationHM}:${pad(`${durationObj.seconds}`, '0', 2)}`
		durationMS = `${durationObj.hours * 60 + durationObj.minutes}:${pad(`${durationObj.seconds}`, '0', 2)}`
	}

	return { hm: durationHM, hms: durationHMS, ms: durationMS }
}
function formatDurationSeconds(totalSeconds: number | undefined): { hms: string; hm: string; ms: string } {
	let timecode: Timecode | undefined

	if (totalSeconds) {
		timecode = {
			hours: 0,
			minutes: 0,
			seconds: 0,
			frames: 0,
			isDropFrame: false,
		}

		timecode.seconds = totalSeconds % 60
		totalSeconds = Math.floor(totalSeconds / 60)
		timecode.minutes = totalSeconds % 60
		totalSeconds = Math.floor(totalSeconds / 60)
		timecode.hours = totalSeconds
	}

	return formatDuration(timecode)
}

export function updateStreamingVariables(instance: InstanceSkel<AtemConfig>, state: AtemState): void {
	const bitrate = (state.streaming?.stats?.encodingBitrate ?? 0) / (1024 * 1024)
	const durations = formatDuration(state.streaming?.duration)

	instance.setVariable(`stream_bitrate`, bitrate.toFixed(2))
	instance.setVariable(`stream_duration_hm`, durations.hm)
	instance.setVariable(`stream_duration_hms`, durations.hms)
	instance.setVariable(`stream_duration_ms`, durations.ms)
}

export function updateRecordingVariables(instance: InstanceSkel<AtemConfig>, state: AtemState): void {
	const durations = formatDuration(state.recording?.duration)
	const remaining = formatDurationSeconds(state.recording?.status?.recordingTimeAvailable)

	instance.setVariables({
		record_duration_hm: durations.hm,
		record_duration_hms: durations.hms,
		record_duration_ms: durations.ms,
		record_remaining_hm: remaining.hm,
		record_remaining_hms: remaining.hms,
		record_remaining_ms: remaining.ms,
	})
}

export function updateSuperSourceVariables(instance: InstanceSkel<AtemConfig>, state: AtemState, i: number): void {
	for (let b = 0; b < 4; b++) {
		const input = getSuperSourceBox(state, b, i)?.source ?? 0
		instance.setVariable(`ssrc${i + 1}_box${b + 1}_source`, getSourcePresetName(instance, state, input))
	}
}

export function InitVariables(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState): void {
	const variables: CompanionVariable[] = []

	// PGM/PV busses
	for (let i = 0; i < model.MEs; ++i) {
		variables.push({
			label: `Label of input active on program bus (M/E ${i + 1})`,
			name: `pgm${i + 1}_input`,
		})
		updateMEProgramVariable(instance, state, i)

		variables.push({
			label: `Label of input active on preview bus (M/E ${i + 1})`,
			name: `pvw${i + 1}_input`,
		})
		updateMEPreviewVariable(instance, state, i)

		for (let k = 0; k < model.USKs; ++k) {
			variables.push({
				label: `Label of input active on M/E ${i + 1} Key ${k + 1}`,
				name: `usk_${i + 1}_${k + 1}_input`,
			})

			updateUSKVariable(instance, state, i, k)
		}
	}

	// Auxs
	for (let a = 0; a < model.auxes; ++a) {
		variables.push({
			label: `Label of input active on Aux ${a + 1}`,
			name: `aux${a + 1}_input`,
		})

		updateAuxVariable(instance, state, a)
	}

	// DSKs
	for (let k = 0; k < model.DSKs; ++k) {
		variables.push({
			label: `Label of input active on DSK ${k + 1}`,
			name: `dsk_${k + 1}_input`,
		})

		updateDSKVariable(instance, state, k)
	}

	// Source names
	for (const src of GetSourcesListForType(model, state)) {
		variables.push({
			label: `Long name of source id ${src.id}`,
			name: `long_${src.id}`,
		})
		variables.push({
			label: `Short name of source id ${src.id}`,
			name: `short_${src.id}`,
		})

		updateInputVariables(instance, src)
	}

	// Macros
	for (let i = 0; i < model.macros; i++) {
		variables.push({
			label: `Name of macro #${i + 1}`,
			name: `macro_${i + 1}`,
		})

		updateMacroVariable(instance, state, i)
	}

	// Media
	for (let i = 0; i < model.media.stills; i++) {
		variables.push({
			label: `Name of still #${i + 1}`,
			name: `still_${i + 1}`,
		})

		updateMediaStillVariable(instance, state, i)
	}
	for (let i = 0; i < model.media.clips; i++) {
		variables.push({
			label: `Name of clip #${i + 1}`,
			name: `clip_${i + 1}`,
		})

		updateMediaClipVariable(instance, state, i)
	}
	for (let i = 0; i < model.media.players; i++) {
		variables.push({
			label: `Name of media player source #${i + 1}`,
			name: `mp_source_${i + 1}`,
		})
		variables.push({
			label: `Name of media player index #${i + 1}`,
			name: `mp_index_${i + 1}`,
		})

		updateMediaPlayerVariables(instance, state, i)
	}

	if (model.streaming) {
		variables.push({
			label: 'Streaming bitrate in MB/s',
			name: 'stream_bitrate',
		})
		variables.push({
			label: 'Streaming duration (hh:mm)',
			name: 'stream_duration_hm',
		})
		variables.push({
			label: 'Streaming duration (hh:mm:ss)',
			name: 'stream_duration_hms',
		})
		variables.push({
			label: 'Streaming duration (mm:ss)',
			name: 'stream_duration_ms',
		})

		updateStreamingVariables(instance, state)
	}

	if (model.recording) {
		variables.push({
			label: 'Recording duration (hh:mm)',
			name: 'record_duration_hm',
		})
		variables.push({
			label: 'Recording duration (hh:mm:ss)',
			name: 'record_duration_hms',
		})
		variables.push({
			label: 'Recording duration (mm:ss)',
			name: 'record_duration_ms',
		})

		variables.push({
			label: 'Recording time remaining (hh:mm)',
			name: 'record_remaining_hm',
		})
		variables.push({
			label: 'Recording time remaining (hh:mm:ss)',
			name: 'record_remaining_hms',
		})
		variables.push({
			label: 'Recording time remaining (mm:ss)',
			name: 'record_remaining_ms',
		})

		updateRecordingVariables(instance, state)
	}

	// Supersource
	for (let i = 0; i < model.SSrc; i++) {
		for (let b = 0; b < 4; b++) {
			variables.push({
				label: `Supersource ${i + 1} Box ${b + 1} source`,
				name: `ssrc${i + 1}_box${b + 1}_source`,
			})
		}

		updateSuperSourceVariables(instance, state, i)
	}

	instance.setVariableDefinitions(variables)
}
