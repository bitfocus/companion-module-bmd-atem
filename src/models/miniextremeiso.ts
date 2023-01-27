import type { ModelSpec } from './types.js'
import { ModelSpecMiniExtreme } from './miniextreme.js'
import { Enums } from 'atem-connection'

export const ModelSpecMiniExtremeISO: ModelSpec = {
	...ModelSpecMiniExtreme,
	id: Enums.Model.MiniExtremeISO,
	label: 'Mini Extreme ISO',
	recordISO: true,
}
