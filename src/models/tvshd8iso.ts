import type { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'

import { ModelSpecTVSHD } from './tvshd.js'

export const ModelSpecTVSHD8ISO: ModelSpec = {
	...ModelSpecTVSHD,
	id: Enums.Model.TelevisionStudioHD8ISO,
	label: 'Television Studio HD8 ISO',
	recordISO: true,
}
