import type { CompanionGraphicsCompositeElementDefinitions } from '@companion-module/base'
import { type AtemAudioMeterCompositeElements, createAudioMeterCompositeElements } from './audioMeter.js'

export type CompositeElementTypes = AtemAudioMeterCompositeElements

export function GetCompositeElementsList(): CompanionGraphicsCompositeElementDefinitions<CompositeElementTypes> {
	return {
		...createAudioMeterCompositeElements(),
	}
}
