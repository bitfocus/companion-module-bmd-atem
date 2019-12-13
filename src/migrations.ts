import * as _ from 'underscore'
import {
  CompanionCoreInstanceconfig,
  CompanionMigrationAction,
  CompanionMigrationFeedback
} from '../../../instance_skel_types'
import { ActionId } from './actions'
import { AtemConfig } from './config'
import { FeedbackId } from './feedback'

function scaleValue(obj: any, key: string, scale: number) {
  if (obj[key] !== undefined) {
    obj[key] = parseFloat(obj[key]) * scale
  }
}

export function UpgradeV2_2_0(
  _config: CompanionCoreInstanceconfig & AtemConfig,
  actions: CompanionMigrationAction[],
  releaseActions: CompanionMigrationAction[],
  feedbacks: CompanionMigrationFeedback[]
) {
  let changed = false

  const allActions = [...actions, ...releaseActions]
  _.each(allActions, action => {
    if (action.action === ActionId.SuperSourceBoxProperties) {
      scaleValue(action.options, 'size', 0.001)
      scaleValue(action.options, 'x', 0.01)
      scaleValue(action.options, 'y', 0.01)
      scaleValue(action.options, 'cropTop', 0.001)
      scaleValue(action.options, 'cropBottom', 0.001)
      scaleValue(action.options, 'cropLeft', 0.001)
      scaleValue(action.options, 'cropRight', 0.001)

      changed = true
    }
  })

  _.each(feedbacks, feedback => {
    if (feedback.type === FeedbackId.SSrcBoxProperties) {
      scaleValue(feedback.options, 'size', 0.001)
      scaleValue(feedback.options, 'x', 0.01)
      scaleValue(feedback.options, 'y', 0.01)
      scaleValue(feedback.options, 'cropTop', 0.001)
      scaleValue(feedback.options, 'cropBottom', 0.001)
      scaleValue(feedback.options, 'cropLeft', 0.001)
      scaleValue(feedback.options, 'cropRight', 0.001)

      changed = true
    }
  })

  return changed
}
