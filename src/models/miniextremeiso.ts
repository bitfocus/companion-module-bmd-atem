import { ModelSpec } from './types'
import { ModelSpecMiniExtreme } from './miniextreme'
import { Enums } from 'atem-connection'

export const ModelSpecMiniExtremeISO: ModelSpec = {
	...ModelSpecMiniExtreme,
	id: Enums.Model.MiniExtremeISO,
	label: 'Mini Extreme ISO',
	recordISO: true,
}
