import { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'

import { ModelSpecMiniPro } from './minipro.js'

export const ModelSpecMiniProISO: ModelSpec = {
	...ModelSpecMiniPro,
	id: Enums.Model.MiniProISO,
	label: 'Mini Pro ISO',
	recordISO: true,
}
