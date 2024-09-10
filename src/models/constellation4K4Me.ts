import type { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import { ModelSpecConstellationHD4ME } from './constellationHd4Me.js'
import {
	AUDIO_ROUTING_SOURCE_MICROPHONE,
	AUDIO_ROUTING_SOURCE_NO_AUDIO,
	AUDIO_ROUTING_SOURCE_PROGRAM,
	AUDIO_ROUTING_SOURCE_TRS,
	generateAuxRoutingOutputs,
	generateInputRoutingSources,
	generateMadiRoutingOutputs,
	generateMadiRoutingSources,
	generateMediaPlayerRoutingSources,
	generateMixMinusRoutingSources,
	generateTalkbackRoutingSources,
} from './util/audioRouting.js'

export const ModelSpecConstellation4K4ME: ModelSpec = {
	...ModelSpecConstellationHD4ME,
	id: Enums.Model.Constellation4K4ME,
	label: '4 M/E Constellation 4K',
	media: {
		players: 4,
		stills: 64,
		clips: 4,
		captureStills: true,
	},
	fairlightAudio: {
		...ModelSpecConstellationHD4ME.fairlightAudio!,
		audioRouting: {
			// TODO: this is a guess based on the 8k
			sources: [
				AUDIO_ROUTING_SOURCE_NO_AUDIO,
				...generateInputRoutingSources(40),
				AUDIO_ROUTING_SOURCE_MICROPHONE,
				AUDIO_ROUTING_SOURCE_TRS,
				...generateMadiRoutingSources(32),
				...generateMediaPlayerRoutingSources(4),
				...generateTalkbackRoutingSources(true, false),
				AUDIO_ROUTING_SOURCE_PROGRAM,
				...generateMixMinusRoutingSources(24),
			],
			outputs: [
				//
				...generateMadiRoutingOutputs(32),
				...generateAuxRoutingOutputs(24),
			],
		},
	},
}
