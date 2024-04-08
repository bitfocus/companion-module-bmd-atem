import type { Timecode } from 'atem-connection/dist/state/common.js'
import { pad } from '../util.js'

export function formatDuration(durationObj: Timecode | undefined): { hms: string; hm: string; ms: string } {
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
export function formatDurationSeconds(totalSeconds: number | undefined): { hms: string; hm: string; ms: string } {
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
