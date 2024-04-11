import type { Enums } from 'atem-connection'

export const MODEL_AUTO_DETECT = 0
export type ModelId = 0 | Enums.Model

export interface ModelSpec {
	id: ModelId
	label: string
	auxes: number
	MEs: number
	USKs: number
	DSKs: number
	MVs: number
	DVEs: number
	multiviewerFullGrid: boolean
	SSrc: number
	macros: number
	displayClock: number
	media: {
		players: number
		stills: number
		clips: number
		captureStills: boolean
	}
	streaming: boolean
	recording: boolean
	recordISO: boolean
	inputs: Array<{
		id: number
		portType: Enums.InternalPortType
		sourceAvailability: Enums.SourceAvailability
		meAvailability: Enums.MeAvailability
	}>
	classicAudio?: {
		inputs: Array<{
			id: number
			portType: Enums.ExternalPortType
			// type: 'video' | 'audio' | 'internal'
		}>
	}
	fairlightAudio?: {
		monitor: boolean
		inputs: Array<{
			id: number
			portType: Enums.ExternalPortType
			// supportedConfigurations: Enums.FairlightInputConfiguration[]
			// portType: 'video' | 'audio' | 'internal'
			maxDelay?: number
		}>
	}
}
