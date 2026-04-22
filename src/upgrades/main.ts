import type { CompanionStaticUpgradeScript } from '@companion-module/base'
import type { AtemConfig } from '../config.js'
import { UpgradeToExpressions, FixLegacyNumericFeedbackOptions } from './v4.0.0.js'
import { V3UpgradeScripts } from './v3.x.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<AtemConfig>[] = [
	...V3UpgradeScripts,
	UpgradeToExpressions,
	FixLegacyNumericFeedbackOptions,
]
