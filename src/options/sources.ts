import type { CompanionInputFieldDropdown } from '@companion-module/base'
import { Enums, type AtemState } from 'atem-connection'
import type { ModelSpec } from '../models/types.js'
import { SourcesToChoices } from './util.js'
import { assertUnreachable } from '../util.js'

export function AtemAllSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'source'> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state)),
	}
}

export interface MiniSourceInfo {
	id: number
	longName: string
}
export interface SourceInfo extends MiniSourceInfo {
	shortName: string
	portType: Enums.InternalPortType
}
export function GetSourcesListForType(
	model: ModelSpec,
	state: AtemState,
	subset?: 'me' | 'aux' | 'mv' | 'key' | 'ssrc-box' | 'ssrc-art' | 'tally',
): SourceInfo[] {
	const getSource = (id: number, portType: Enums.InternalPortType, defShort: string, defLong: string): SourceInfo => {
		const input = state.inputs[id]
		const shortName = input?.shortName || defShort
		const longName = input?.longName || defLong

		return {
			id,
			shortName,
			longName,
			portType,
		}
	}

	const sources: SourceInfo[] = []
	for (const input of model.inputs) {
		switch (subset) {
			case undefined:
				break
			case 'me':
				if (input.meAvailability === Enums.MeAvailability.None) continue
				break
			case 'aux':
				if ((input.sourceAvailability & Enums.SourceAvailability.Auxiliary) === 0) continue
				break
			case 'mv':
				if ((input.sourceAvailability & Enums.SourceAvailability.Multiviewer) === 0) continue
				break
			case 'key':
				if ((input.sourceAvailability & Enums.SourceAvailability.KeySource) === 0) continue
				break
			case 'ssrc-box':
				if ((input.sourceAvailability & Enums.SourceAvailability.SuperSourceBox) === 0) continue
				break
			case 'ssrc-art':
				if ((input.sourceAvailability & Enums.SourceAvailability.SuperSourceArt) === 0) continue
				break
			case 'tally':
				// if (input.portType === Enums.InternalPortType.Auxiliary) break // TODO: Future
				if (input.portType === Enums.InternalPortType.MEOutput && input.id > 8000) break
				continue
			default:
				assertUnreachable(subset)
				break
		}

		switch (input.portType) {
			case Enums.InternalPortType.External:
				sources.push(getSource(input.id, input.portType, `In ${input.id}`, `Input ${input.id}`))
				break
			case Enums.InternalPortType.ColorBars:
				sources.push(getSource(input.id, input.portType, 'Bars', 'Bars'))
				break
			case Enums.InternalPortType.ColorGenerator: {
				const colId = input.id - 2000
				sources.push(getSource(input.id, input.portType, `Col${colId}`, `Color ${colId}`))
				break
			}
			case Enums.InternalPortType.MediaPlayerFill: {
				const mpId = (input.id - 3000) / 10
				sources.push(getSource(input.id, input.portType, `MP ${mpId}`, `Media Player ${mpId}`))
				break
			}
			case Enums.InternalPortType.MediaPlayerKey: {
				const mpId = (input.id - 3000 - 1) / 10
				sources.push(getSource(input.id, input.portType, `MP${mpId}K`, `Media Player ${mpId} Key`))
				break
			}
			case Enums.InternalPortType.SuperSource: {
				const ssrcId = input.id - 6000 + 1
				sources.push(getSource(input.id, input.portType, `SSc${ssrcId}`, `Super Source ${ssrcId}`))
				break
			}
			case Enums.InternalPortType.ExternalDirect: {
				const inputId = input.id - 11000
				sources.push(getSource(input.id, input.portType, `In${inputId}D`, `Input ${inputId} - Direct`))
				break
			}
			case Enums.InternalPortType.MEOutput: {
				if (input.id < 8000) {
					const clnId = input.id - 7000
					sources.push(getSource(input.id, input.portType, `Cln${clnId}`, `Clean Feed ${clnId}`))
				} else if (input.id % 2 === 1) {
					const meId = (input.id - 10000 - 1) / 10
					sources.push(getSource(input.id, input.portType, `M${meId}PV`, `ME ${meId} Preview`))
				} else {
					const meId = (input.id - 10000) / 10
					sources.push(getSource(input.id, input.portType, `M${meId}PG`, `ME ${meId} Program`))
				}
				break
			}
			case Enums.InternalPortType.Auxiliary: {
				const auxId = input.id - 8000
				sources.push(getSource(input.id, input.portType, `Aux${auxId}`, `Auxiliary ${auxId}`))
				break
			}
			case Enums.InternalPortType.Mask: {
				// TODO
				// const maskId = input.id - 0
				// sources.push(getSource(input.id, `MK${maskId}`, `Key Mask ${maskId}`))
				break
			}
			case Enums.InternalPortType.MultiViewer: {
				const mvId = input.id - 9000
				sources.push(getSource(input.id, input.portType, `MV ${mvId}`, `MultiView ${mvId}`))
				break
			}
			case Enums.InternalPortType.AudioMonitor:
				sources.push(getSource(input.id, input.portType, 'Aud', 'Audio Monitor'))
				break
			case Enums.InternalPortType.Black:
				sources.push(getSource(input.id, input.portType, 'Blk', 'Black'))
				break
			default:
				assertUnreachable(input.portType)
				break
		}
	}

	sources.sort((a, b) => a.id - b.id)
	return sources
}
