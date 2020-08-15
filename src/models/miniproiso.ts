import { ModelSpec } from '.'
import { Enums } from 'atem-connection'

import { ModelSpecMiniPro } from './minipro'

export const ModelSpecMiniProISO: ModelSpec = {
  ...ModelSpecMiniPro,
  id: Enums.Model.MiniProISO,
  label: 'Mini Pro ISO',
  recordISO: true
}
