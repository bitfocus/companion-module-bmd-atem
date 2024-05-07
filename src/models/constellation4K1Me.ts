/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ModelSpec } from './types.js'
// import { Enums } from 'atem-connection'
import { ModelSpecConstellationHD1ME } from './constellationHd1Me.js'

export const ModelSpecConstellation4K1ME: ModelSpec = {
	...ModelSpecConstellationHD1ME,
	id: 28 as any, // Enums.Model.Constellation4K1ME,
	label: '1 M/E Constellation 4K',
	fairlightAudio: {
		...ModelSpecConstellationHD1ME.fairlightAudio!,
		audioRouting: true,
	},
}
