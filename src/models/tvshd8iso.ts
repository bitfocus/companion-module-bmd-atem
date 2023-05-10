import type { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'

import { ModelSpecTVSHD } from './tvshd.js'

export const ModelSpecTVSHD8ISO: ModelSpec = {
	...ModelSpecTVSHD,
	id: 27 as Enums.Model, // TODO
	label: 'Television Studio HD8 ISO',
	recordISO: true,
}
