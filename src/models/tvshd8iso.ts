import type { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'

import { ModelSpecTVSHD8 } from './tvshd8.js'

export const ModelSpecTVSHD8ISO: ModelSpec = {
	...ModelSpecTVSHD8,
	id: Enums.Model.TelevisionStudioHD8ISO,
	label: 'Television Studio HD8 ISO',
	recordISO: true,
}
