import type { ModelSpec } from './types.js'
// import { Enums } from 'atem-connection'
import { ModelSpecConstellationHD2ME } from './constellationHd2Me.js'
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

export const ModelSpecConstellation4K2ME: ModelSpec = {
	...ModelSpecConstellationHD2ME,
	id: 29 as any, // Enums.Model.Constellation4K2ME,
	label: '2 M/E Constellation 4K',
	fairlightAudio: {
		...ModelSpecConstellationHD2ME.fairlightAudio!,
		audioRouting: {
			// TODO: this is a guess based on the 8k
			sources: [
				AUDIO_ROUTING_SOURCE_NO_AUDIO,
				...generateInputRoutingSources(20),
				AUDIO_ROUTING_SOURCE_MICROPHONE,
				AUDIO_ROUTING_SOURCE_TRS,
				...generateMediaPlayerRoutingSources(2),
				...generateTalkbackRoutingSources(true, false),
				AUDIO_ROUTING_SOURCE_PROGRAM,
				...generateMixMinusRoutingSources(12),
			],
			outputs: [
				//
				...generateAuxRoutingOutputs(12),
			],
		},
	},
}
