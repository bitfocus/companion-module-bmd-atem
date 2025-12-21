import { Enums } from 'atem-connection'
import type { AudioFairlightInputInfo } from '../types'

export const AUDIO_FAIRLIGHT_INPUT_XLR: AudioFairlightInputInfo = {
	id: 1001,
	portType: Enums.ExternalPortType.XLR,
}
export const AUDIO_FAIRLIGHT_INPUT_XLR2: AudioFairlightInputInfo = {
	id: 1002,
	portType: Enums.ExternalPortType.XLR,
}
export const AUDIO_FAIRLIGHT_INPUT_RCA: AudioFairlightInputInfo = {
	id: 1201,
	portType: Enums.ExternalPortType.RCA,
}
export const AUDIO_FAIRLIGHT_INPUT_TS_JACK: AudioFairlightInputInfo = {
	id: 1301,
	portType: Enums.ExternalPortType.TSJack,
}
export const AUDIO_FAIRLIGHT_INPUT_TRS_JACK: AudioFairlightInputInfo = {
	id: 1401,
	portType: Enums.ExternalPortType.TRSJack,
}

export const AUDIO_FAIRLIGHT_INPUT_MINI_TS_JACKS: AudioFairlightInputInfo[] = [
	{
		id: 1301,
		portType: Enums.ExternalPortType.TSJack,
		maxDelay: 8,
	},
	{
		id: 1302,
		portType: Enums.ExternalPortType.TSJack,
		maxDelay: 8,
	},
]

export function generateFairlightInputMadi(inputCount: number, maxDelay?: number): AudioFairlightInputInfo[] {
	return generateFairlightInputsOfType(1501, inputCount, Enums.ExternalPortType.MADI, maxDelay)
}

export function generateFairlightInputMediaPlayer(inputCount: number, maxDelay?: number): AudioFairlightInputInfo[] {
	return generateFairlightInputsOfType(2001, inputCount, Enums.ExternalPortType.Internal, maxDelay)
}
export function generateFairlightInputThunderbolt(inputCount: 1, maxDelay?: number): AudioFairlightInputInfo[] {
	return generateFairlightInputsOfType(2051, inputCount, Enums.ExternalPortType.Internal, maxDelay)
}

export function generateFairlightInputsOfType(
	firstIndex: number,
	count: number,
	type: Enums.ExternalPortType,
	maxDelay?: number,
): AudioFairlightInputInfo[] {
	const sources: Array<AudioFairlightInputInfo> = []
	for (let i = firstIndex; i < firstIndex + count; i++) {
		const src: AudioFairlightInputInfo = { id: i, portType: type }
		if (maxDelay !== undefined) src.maxDelay = maxDelay

		sources.push(src)
	}
	return sources
}
