import { ModelSpec } from './types.js'
import { Enums } from 'atem-connection'
import { ModelSpecMini } from './mini.js'

export const ModelSpecMiniPro: ModelSpec = {
	...ModelSpecMini,
	id: Enums.Model.MiniPro,
	label: 'Mini Pro',
	MVs: 1,
	streaming: true,
	recording: true,
	inputs: [
		...ModelSpecMini.inputs,
		{
			id: 9001,
			portType: Enums.InternalPortType.MultiViewer,
			sourceAvailability: Enums.SourceAvailability.Auxiliary,
			meAvailability: Enums.MeAvailability.None,
		},
	],
}
