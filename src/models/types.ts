import type { Enums } from 'atem-connection'

export const MODEL_AUTO_DETECT = 0
export type ModelId = 0 | Enums.Model

export interface ModelSpec {
	id: ModelId
	label: string
	outputs: Array<{ id: number; name: string }>
	MEs: number
	USKs: number
	DSKs: number
	MVs: number
	DVEs: number
	multiviewerFullGrid: boolean
	SSrc: number
	macros: number
	displayClock: number
	media: { players: number; stills: number; clips: number; captureStills: boolean }
	streaming: boolean
	recording: boolean
	recordISO: boolean
	inputs: VideoInputInfo[]
	classicAudio?: {
		inputs: Array<{
			id: number
			portType: Enums.ExternalPortType
			// type: 'video' | 'audio' | 'internal'
		}>
	}
	fairlightAudio?: {
		monitor: 'combined' | 'split' | null
		audioRouting?: { sources: AudioRoutingSourceInfo[]; outputs: AudioRoutingOutputInfo[] }
		inputs: AudioFairlightInputInfo[]
	}
}

export interface VideoInputInfo {
	id: number
	portType: Enums.InternalPortType
	sourceAvailability: Enums.SourceAvailability
	meAvailability: Enums.MeAvailability
}

export interface AudioFairlightInputInfo {
	id: number
	portType: Enums.ExternalPortType
	// supportedConfigurations: Enums.FairlightInputConfiguration[]
	// portType: 'video' | 'audio' | 'internal'
	maxDelay?: number
}

export interface AudioRoutingSourceInfo {
	sourceName: string
	inputId: number
	channelPairs: Enums.AudioChannelPair[]
}
export interface AudioRoutingOutputInfo {
	outputName: string
	outputId: number
	channelPairs: Enums.AudioChannelPair[]
}

export function generateOutputs(prefix: string, count: number): ModelSpec['outputs'] {
	const outputs: ModelSpec['outputs'] = []
	for (let i = 0; i < count; i++) {
		outputs.push({ id: i, name: `${prefix} ${i + 1}` })
	}
	return outputs
}
