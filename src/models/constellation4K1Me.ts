import type { ModelSpec } from './types.js'
// import { Enums } from 'atem-connection'
import { ModelSpecConstellationHD1ME } from './constellationHd1Me.js'
import {
	AUDIO_ROUTING_SOURCE_NO_AUDIO,
	generateInputRoutingSources,
	AUDIO_ROUTING_SOURCE_MICROPHONE,
	AUDIO_ROUTING_SOURCE_TRS,
	generateMediaPlayerRoutingSources,
	generateTalkbackRoutingSources,
	AUDIO_ROUTING_SOURCE_PROGRAM,
	generateMixMinusRoutingSources,
	generateAuxRoutingOutputs,
} from './util/audioRouting.js'

export const ModelSpecConstellation4K1ME: ModelSpec = {
	...ModelSpecConstellationHD1ME,
	id: 28 as any, // Enums.Model.Constellation4K1ME,
	label: '1 M/E Constellation 4K',
	fairlightAudio: {
		...ModelSpecConstellationHD1ME.fairlightAudio!,
		audioRouting: {
			// TODO: this is a guess based on the 8k
			sources: [
				AUDIO_ROUTING_SOURCE_NO_AUDIO,
				...generateInputRoutingSources(10),
				AUDIO_ROUTING_SOURCE_MICROPHONE,
				AUDIO_ROUTING_SOURCE_TRS,
				...generateMediaPlayerRoutingSources(2),
				...generateTalkbackRoutingSources(true, false),
				AUDIO_ROUTING_SOURCE_PROGRAM,
				...generateMixMinusRoutingSources(6),
			],
			outputs: [
				//
				...generateAuxRoutingOutputs(6),
			],
		},
	},
}
