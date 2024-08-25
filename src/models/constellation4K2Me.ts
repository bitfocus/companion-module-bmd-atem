import type { ModelSpec } from './types.js'
// import { Enums } from 'atem-connection'
import { ModelSpecConstellationHD2ME } from './constellationHd2Me.js'

export const ModelSpecConstellation4K2ME: ModelSpec = {
	...ModelSpecConstellationHD2ME,
	id: 29 as any, // Enums.Model.Constellation4K2ME,
	label: '2 M/E Constellation 4K',
	fairlightAudio: {
		...ModelSpecConstellationHD2ME.fairlightAudio!,
		audioRouting: true,
	},
}
