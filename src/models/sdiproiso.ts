import type { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'

import { ModelSpecSDI } from './sdi.js'

export const ModelSpecSDIProISO: ModelSpec = {
	...ModelSpecSDI,
	id: Enums.Model.SDIProISO,
	label: 'SDI Pro ISO',
	MVs: 1,
	streaming: true,
	recording: true,
	recordISO: true,
	inputs: [
		...ModelSpecSDI.inputs,
		{
			id: 9001,
			portType: Enums.InternalPortType.MultiViewer,
			sourceAvailability: Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
	],
}
