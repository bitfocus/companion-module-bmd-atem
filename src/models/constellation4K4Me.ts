import type { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import { ModelSpecConstellationHD4ME } from './constellationHd4Me.js'

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
}
