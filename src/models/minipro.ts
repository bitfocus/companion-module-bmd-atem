import { ModelSpec } from '.'
import { Enums } from 'atem-connection'
import { ModelSpecMini } from './mini'

export const ModelSpecMiniPro: ModelSpec = {
  ...ModelSpecMini,
  id: Enums.Model.MiniPro,
  label: 'Mini Pro',
  MVs: 1,
  inputs: [
    ...ModelSpecMini.inputs,
    {
      id: 9001,
      portType: Enums.InternalPortType.MultiViewer,
      sourceAvailability: Enums.SourceAvailability.Auxiliary,
      meAvailability: Enums.MeAvailability.None
    }
  ]
}
