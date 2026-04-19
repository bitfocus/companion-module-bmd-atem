import type { AtemState } from 'atem-connection'
import type { ModelSpec } from '../models/types.js'
import type { CompanionInputFieldDropdown } from '@companion-module/base'
import { iterateTimes } from '../util.js'

export function AtemMacroPicker<TId extends string>(
	model: ModelSpec,
	state: AtemState,
	key: TId,
): CompanionInputFieldDropdown<TId> {
	return {
		type: 'dropdown',
		id: key,
		label: 'Macro',
		default: 1,
		choices: iterateTimes(model.macros, (i) => {
			const macro = state.macro.macroProperties[i]
			return {
				id: i + 1,
				label: (macro?.isUsed ? `${macro.name} (#${i + 1})` : undefined) || `Macro ${i + 1}`,
			}
		}),
	}
}
