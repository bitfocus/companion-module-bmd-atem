import {
	FixupNumericOrVariablesValueToExpressions,
	type CompanionStaticUpgradeResult,
	type CompanionStaticUpgradeScript,
} from '@companion-module/base'
import type { AtemConfig } from '../config.js'
import { Enums } from 'atem-connection'
import type { SSrcArtOption } from '../input.js'
import type { FairlightMixOption2 } from '../choices.js'

type ActionFixupRule = {
	newType?: string
	options: Record<string, OptionFixupRule>
}

type OptionFixupRule = {
	newName?: string
	transform?:
		| {
				type: 'default'
				value: any
		  }
		| {
				type: 'lookup'
				lookup: Record<any, any>
		  }
		| {
				type: 'number'
				zeroBased: boolean
				variables: boolean
		  }
}

const timeOfDayModeValueMap: Record<Enums.TimeMode, string> = {
	[Enums.TimeMode.FreeRun]: 'freerun',
	[Enums.TimeMode.TimeOfDay]: 'timeofday',
}
const ssrcArtOptionValueMap: Record<any, SSrcArtOption> = {
	[undefined as any]: 'unchanged',
	[Enums.SuperSourceArtOption.Foreground]: 'foreground',
	[Enums.SuperSourceArtOption.Background]: 'background',
}
const fairlightMixOptionValueMap: Record<any, FairlightMixOption2> = {
	[Enums.FairlightAudioMixOption.On]: 'on',
	[Enums.FairlightAudioMixOption.Off]: 'off',
	[Enums.FairlightAudioMixOption.AudioFollowVideo]: 'afv',
}

const actionFixupRules: Record<string, ActionFixupRule> = {
	timecodeMode: {
		options: {
			mode: { transform: { type: 'lookup', lookup: timeOfDayModeValueMap } },
		},
	},
	ssrcArt: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			fill: { transform: { type: 'number', zeroBased: false, variables: false } },
			key: { transform: { type: 'number', zeroBased: false, variables: false } },
			artOption: { transform: { type: 'lookup', lookup: ssrcArtOptionValueMap } },
		},
	},
	ssrcArtVariables: {
		newType: 'ssrcArt',
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: true } },
			fill: { transform: { type: 'number', zeroBased: false, variables: true } },
			key: { transform: { type: 'number', zeroBased: false, variables: true } },
			// Fill in the missing ones:
			artOption: { transform: { type: 'default', value: 'unchanged' } },
			artPreMultiplied: { transform: { type: 'default', value: false } },
			artClip: { transform: { type: 'default', value: 50 } },
			artGain: { transform: { type: 'default', value: 50 } },
			artInvertKey: { transform: { type: 'default', value: false } },
		},
	},
	setSsrcBoxSource: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setSsrcBoxSourceVariables: {
		newType: 'setSsrcBoxSource',
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: true } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: true } },
			source: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	setSsrcBoxEnable: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setSsrcBoxProperties: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setSsrcBoxPropertiesDelta: {
		options: {
			ssrcId: { transform: { type: 'number', zeroBased: true, variables: false } },
			boxIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
		},
	},
	setMvSource: {
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: true, variables: false } },
			windowIndex: { transform: { type: 'number', zeroBased: true, variables: false } },
			source: { transform: { type: 'number', zeroBased: false, variables: false } },
		},
	},
	setMvSourceVariables: {
		newType: 'setMvSource',
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: true, variables: true } },
			windowIndex: { transform: { type: 'number', zeroBased: true, variables: true } },
			source: { transform: { type: 'number', zeroBased: false, variables: true } },
		},
	},
	multiviewerLayout: {
		options: {
			multiViewerId: { transform: { type: 'number', zeroBased: true, variables: true } },
		},
	},
	mediaPlayerSource: {
		options: {
			mediaplayer: { transform: { type: 'number', zeroBased: true, variables: false } },
			// TODO: translate source!!
		},
	},
	mediaPlayerSourceVariables2: {
		options: {
			// TODO - me!
		},
	},
	mediaDeleteStill: {
		options: {
			slot: { transform: { type: 'number', zeroBased: true, variables: true } },
		},
	},
	fairlightAudioMixOption: {
		options: {
			option: { transform: { type: 'lookup', lookup: fairlightMixOptionValueMap } },
		},
	},
}

export const UpgradeToExpressions: CompanionStaticUpgradeScript<AtemConfig, undefined> = (_context, props) => {
	const result: CompanionStaticUpgradeResult<AtemConfig, undefined> = {
		updatedConfig: null,
		updatedSecrets: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		const rule = actionFixupRules[action.actionId]
		if (!rule) continue

		result.updatedActions.push(action)
		if (rule.newType) action.actionId = rule.newType

		for (const [optionKey, optionRule] of Object.entries(rule.options)) {
			if (!action.options[optionKey]) continue

			if (optionRule.transform) {
				const oldValue = action.options[optionKey]?.value as any
				if (optionRule.transform.type === 'lookup' && oldValue in optionRule.transform.lookup) {
					// Basic object lookup to transform
					const newValue = optionRule.transform.lookup[oldValue]
					action.options[optionKey] = { isExpression: false, value: newValue }
				} else if (optionRule.transform.type === 'number') {
					// Convert number from 0-based (e.g. for indexes), optionally considering if there are variables
					action.options[optionKey] = FixupNumericOrVariablesValueToExpressions(oldValue)
					if (action.options[optionKey] && optionRule.transform.zeroBased) {
						// Attempt to offset by 1
						if (typeof action.options[optionKey].value === 'number') {
							action.options[optionKey].value += 1
						} else if (typeof action.options[optionKey].value === 'string') {
							action.options[optionKey].value += ' + 1'
						}
					}
				} else if (optionRule.transform.type === 'default') {
					// Fill in value if missing
					if (!action.options[optionKey]) {
						action.options[optionKey] = { isExpression: false, value: optionRule.transform.value }
					}
				}
			}

			if (optionRule.newName) {
				action.options[optionRule.newName] = action.options[optionKey]
				delete action.options[optionKey]
			}
		}

		// TODO
	}

	return result
}
