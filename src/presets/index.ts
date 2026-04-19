import type { CompanionPresetSection, CompanionPresetDefinitions } from '@companion-module/base'
import { type AtemState } from 'atem-connection'
import { GetSourcesListForType } from '../choices.js'
import { PresetStyleName } from '../config.js'
import type { ModelSpec } from '../models/index.js'
import { type InstanceBaseExt } from '../util.js'
import { createStreamingPresets } from './streaming.js'
import { createRecordingPresets } from './recording.js'
import { createFadeToBlackPresets } from './fadeToBlack.js'
import { createMediaPlayerPresets } from './mediaPlayer.js'
import { createSuperSourcePresets } from './superSource.js'
import { createMultiviewerWindowPresets } from './multiviewer.js'
import { createMacroPresets } from './macro.js'
import { createProgramPreviewPresets } from './mixeffect/programPreview.js'
import { createTransitionPresets } from './mixeffect/transition.js'
import { createAuxOutputPresets } from './aux-outputs.js'
import { createUpstreamKeyerPresets } from './mixeffect/upstreamKeyer.js'
import { createDownstreamKeyerPresets } from './downstreamKeyer.js'
import type { AtemSchema } from '../schema.js'
import type { PresetsBuilderContext } from './context.js'

const rateOptions = [12, 15, 25, 30, 37, 45, 50, 60]

export function GetPresetsList(
	instance: InstanceBaseExt,
	model: ModelSpec,
	state: AtemState,
): [CompanionPresetSection<AtemSchema>[], CompanionPresetDefinitions<AtemSchema>] {
	const pstText = Number(instance.config.presets) === PresetStyleName.Long ? 'long_' : 'short_'
	const pstSize = Number(instance.config.presets) === PresetStyleName.Long ? 'auto' : '18'

	const context: PresetsBuilderContext = {
		model,
		sections: [],
		definitions: {},
	}

	const meSources = GetSourcesListForType(model, state, 'me')

	createProgramPreviewPresets(context, pstSize, pstText, meSources)
	createTransitionPresets(context, pstSize, rateOptions)
	createAuxOutputPresets(context, state, pstSize, pstText)
	createUpstreamKeyerPresets(context, pstSize, pstText, meSources)
	createDownstreamKeyerPresets(context, pstSize, pstText, meSources)
	createMacroPresets(context)
	createMultiviewerWindowPresets(context, state, pstSize, pstText)
	createSuperSourcePresets(context, pstSize, pstText, meSources)
	createMediaPlayerPresets(context, pstSize)
	createFadeToBlackPresets(context, pstSize, rateOptions)
	createStreamingPresets(context)
	createRecordingPresets(context)

	return [context.sections, context.definitions]
}
