import { AtemState } from 'atem-connection'
import { DropdownChoice } from '../../../../instance_skel_types'
import { compact } from '../util'

import { ModelSpecAuto } from './auto'
import { ModelSpecTVS } from './tvs'
import { ModelSpecOneME } from './1me'
import { ModelSpecTwoME } from './2me'
import { ModelSpecPS4K } from './ps4k'
import { ModelSpecTwoME4K } from './2me4k'
import { ModelSpecOneME4K } from './1me4k'
import { ModelSpecFourME4K } from './4me4k'
import { ModelSpecTVSHD } from './tvshd'
import { ModelSpecTVSProHD } from './tvsprohd'
import { ModelSpecTVSPro4K } from './tvspro4k'
import { ModelSpecConstellation } from './constellation'
import { ModelSpecConstellation8K } from './constellation8k'
import { ModelSpecMini } from './mini'
import { ModelSpecMiniPro } from './minipro'
import { ModelSpecMiniProISO } from './miniproiso'
import { ModelId, ModelSpec, MODEL_AUTO_DETECT } from './types'

export * from './types'

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
	ModelSpecConstellation,
	ModelSpecConstellation8K,
	ModelSpecMini,
	ModelSpecMiniPro,
	ModelSpecMiniProISO,
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
		auxes: info.capabilities?.auxilliaries ?? defaults.auxes,
		MEs: info.capabilities?.mixEffects ?? defaults.MEs,
		USKs: info.mixEffects[0]?.keyCount ?? defaults.USKs,
		DSKs: info.capabilities?.downstreamKeyers ?? defaults.DSKs,
		MVs: settings.multiViewers.length,
		multiviewerFullGrid: false, // TODO
		SSrc: info.capabilities?.superSources ?? defaults.SSrc,
		macros: info.macroPool?.macroCount ?? defaults.macros,
		media: {
			players: info.capabilities?.mediaPlayers ?? defaults.media.players,
			stills: info.mediaPool?.stillCount ?? defaults.media.stills,
			clips: info.mediaPool?.clipCount ?? defaults.media.clips,
		},
		streaming: streaming != undefined,
		recording: recording != undefined,
		recordISO: false,
		classicAudio: audio
			? {
					inputs: compact(
						Object.entries(audio.channels).map(([id, ch]) => {
							if (!ch?.portType) return undefined
							return {
								id: Number(id),
								portType: ch.portType,
							}
						})
					),
			  }
			: undefined,
		fairlightAudio: fairlight
			? {
					inputs: compact(
						Object.entries(fairlight.inputs).map(([id, ch]) => {
							if (!ch?.properties) return undefined
							return {
								id: Number(id),
								portType: ch.properties.externalPortType,
								// supportedConfigurations: ch.properties.supportedConfigurations,
							}
						})
					),
			  }
			: undefined,
	}
}

// }
