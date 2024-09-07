import type { DropdownChoice } from '@companion-module/base'
import type { AtemState } from 'atem-connection'
import { compact } from '../util.js'

import { ModelSpecAuto } from './auto.js'
import { ModelSpecTVS } from './tvs.js'
import { ModelSpecOneME } from './1me.js'
import { ModelSpecTwoME } from './2me.js'
import { ModelSpecPS4K } from './ps4k.js'
import { ModelSpecTwoME4K } from './2me4k.js'
import { ModelSpecOneME4K } from './1me4k.js'
import { ModelSpecFourME4K } from './4me4k.js'
import { ModelSpecTVSHD } from './tvshd.js'
import { ModelSpecTVSProHD } from './tvsprohd.js'
import { ModelSpecTVSPro4K } from './tvspro4k.js'
import { ModelSpecConstellationAsHDOr4K } from './constellation8kAsHdOr4k.js'
import { ModelSpecConstellation8KAs8K } from './constellation8kas8k.js'
import { ModelSpecMini } from './mini.js'
import { ModelSpecMiniPro } from './minipro.js'
import { ModelSpecMiniProISO } from './miniproiso.js'
import { type ModelId, type ModelSpec, MODEL_AUTO_DETECT, generateOutputs } from './types.js'
import { ModelSpecMiniExtreme } from './miniextreme.js'
import { ModelSpecMiniExtremeISO } from './miniextremeiso.js'
import { ModelSpecConstellationHD1ME } from './constellationHd1Me.js'
import { ModelSpecConstellationHD2ME } from './constellationHd2Me.js'
import { ModelSpecConstellationHD4ME } from './constellationHd4Me.js'
import { ModelSpecSDI } from './sdi.js'
import { ModelSpecSDIProISO } from './sdiproiso.js'
import { ModelSpecSDIExtremeISO } from './sdiextremeiso.js'
import { Model } from 'atem-connection/dist/enums/index.js'
import { ModelSpecTVSHD8 } from './tvshd8.js'
import { ModelSpecTVSHD8ISO } from './tvshd8iso.js'
import { ModelSpecConstellation4K1ME } from './constellation4K1Me.js'
import { ModelSpecConstellation4K2ME } from './constellation4K2Me.js'
import { ModelSpecConstellation4K4ME } from './constellation4K4Me.js'
import { ModelSpecTVS4K8 } from './tvs4k8.js'

export * from './types.js'

export const ALL_MODELS: ModelSpec[] = [
	ModelSpecAuto,
	ModelSpecTVS,
	ModelSpecOneME,
	ModelSpecTwoME,
	ModelSpecPS4K,
	ModelSpecOneME4K,
	ModelSpecTwoME4K,
	ModelSpecFourME4K,
	ModelSpecTVSHD,
	ModelSpecTVSProHD,
	ModelSpecTVSPro4K,
	ModelSpecConstellationAsHDOr4K,
	ModelSpecConstellation8KAs8K,
	ModelSpecMini,
	ModelSpecMiniPro,
	ModelSpecMiniProISO,
	ModelSpecMiniExtreme,
	ModelSpecMiniExtremeISO,
	ModelSpecConstellationHD1ME,
	ModelSpecConstellationHD2ME,
	ModelSpecConstellationHD4ME,
	ModelSpecSDI,
	ModelSpecSDIProISO,
	ModelSpecSDIExtremeISO,
	ModelSpecTVSHD8,
	ModelSpecTVSHD8ISO,
	ModelSpecConstellation4K1ME,
	ModelSpecConstellation4K2ME,
	ModelSpecConstellation4K4ME,
	ModelSpecTVS4K8,
]

export const ALL_MODEL_CHOICES: DropdownChoice[] = ALL_MODELS.map(({ id, label }) => ({ id, label }))
ALL_MODEL_CHOICES.sort((a, b) => {
	if (a.id === MODEL_AUTO_DETECT) {
		return -1
	}
	if (b.id === MODEL_AUTO_DETECT) {
		return 1
	}

	return (b.id as number) - (a.id as number)
})

export function GetModelSpec(id: ModelId): ModelSpec | undefined {
	return ALL_MODELS.find((m) => m.id === id)
}

export function GetAutoDetectModel(): ModelSpec {
	return ModelSpecAuto
}

export function GetParsedModelSpec({
	info,
	inputs,
	settings,
	streaming,
	recording,
	audio,
	fairlight,
	displayClock,
}: AtemState): ModelSpec {
	const defaults = GetAutoDetectModel()
	const simpleInputs = compact(Object.values(inputs)).map((inp) => ({
		id: inp.inputId,
		portType: inp.internalPortType,
		sourceAvailability: inp.sourceAvailability,
		meAvailability: inp.meAvailability,
	}))
	return {
		id: info.model,
		label: info.productIdentifier ?? 'Blackmagic ATEM',
		inputs: simpleInputs,
		outputs: info.capabilities ? generateOutputs('Aux/Output', info.capabilities.auxilliaries) : defaults.outputs,
		MEs: info.capabilities?.mixEffects ?? defaults.MEs,
		USKs: info.mixEffects[0]?.keyCount ?? defaults.USKs,
		DSKs: info.capabilities?.downstreamKeyers ?? defaults.DSKs,
		MVs: settings.multiViewers.length,
		multiviewerFullGrid: (settings.multiViewers?.[0]?.windows.length || 0) > 10, // TODO verify this
		DVEs: info.capabilities?.DVEs ?? defaults.DVEs,
		SSrc: info.capabilities?.superSources ?? defaults.SSrc,
		macros: info.macroPool?.macroCount ?? defaults.macros,
		displayClock: displayClock ? 1 : 0,
		media: {
			players: info.capabilities?.mediaPlayers ?? defaults.media.players,
			stills: info.mediaPool?.stillCount ?? defaults.media.stills,
			clips: info.mediaPool?.clipCount ?? defaults.media.clips,
			captureStills: !!info.mediaPool?.stillCount && info.model >= Model.Mini,
		},
		streaming: streaming != undefined,
		recording: recording != undefined,
		recordISO: recording?.recordAllInputs != undefined,
		classicAudio: audio
			? {
					inputs: compact(
						Object.entries(audio.channels).map(([id, ch]) => {
							if (!ch?.portType) return undefined
							return {
								id: Number(id),
								portType: ch.portType,
							}
						}),
					),
				}
			: undefined,
		fairlightAudio: fairlight
			? {
					monitor: fairlight.monitor ? 'split' : null,
					audioRouting: !!fairlight.audioRouting,
					inputs: compact(
						Object.entries(fairlight.inputs).map(([id, ch]) => {
							if (!ch?.properties) return undefined
							return {
								id: Number(id),
								portType: ch.properties.externalPortType,
								maxDelay: Math.max(...Object.values(ch.sources).map((s) => s?.properties?.maxFramesDelay ?? 0)),
								// supportedConfigurations: ch.properties.supportedConfigurations,
							}
						}),
					),
				}
			: undefined,
	}
}

// }
