import type { CompanionInputFieldDropdown, JsonValue } from '@companion-module/base'
import { Enums, type AtemState } from 'atem-connection'
import type { ModelSpec } from '../models/types.js'
import { SourcesToChoices } from './util.js'
import { assertUnreachable, stringifyValueAlways } from '../util.js'

/** Largest source id we will forward to the switcher (max signed int16). */
const MAX_SOURCE_ID = 32767

/**
 * Parse a raw video-source picker value into a validated source id.
 *
 * Because the source pickers use `allowInvalidValues`, the value may be any expression result
 * (a number, or a string) and is not guaranteed to be one of the listed choices. We accept any
 * non-negative integer within safe bounds so that valid-but-unlisted source ids (e.g. mask
 * sources) still work, while rejecting anything that would produce a malformed packet.
 *
 * @returns the parsed source id, or null when the value is not a usable source number. Callers
 * that must produce a value (e.g. action callbacks) should use {@link parseSourceIdRequired}
 * instead; feedbacks can treat null as "no match".
 */
export function parseSourceId(rawValue: JsonValue | undefined): number | null {
	const str = stringifyValueAlways(rawValue).trim()
	if (!str) return null // Number('') === 0, so guard the empty string first

	const value = Number(str)
	if (!Number.isInteger(value)) return null // rejects NaN, floats and Infinity
	if (value < 0 || value >= MAX_SOURCE_ID) return null

	return value
}

/**
 * Parse a raw video-source picker value into a validated source id, throwing a descriptive error
 * naming the offending value when it cannot be parsed. Use this from action callbacks so that a
 * bad value surfaces to the user instead of silently doing nothing.
 */
export function parseSourceIdRequired(rawValue: JsonValue | undefined): number {
	const value = parseSourceId(rawValue)
	if (value === null) {
		throw new Error(
			`Invalid source value "${stringifyValueAlways(rawValue)}": expected a whole number between 0 and ${MAX_SOURCE_ID - 1}`,
		)
	}
	return value
}

export function AtemAllSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown<'source'> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state)),
		expressionDescription: 'Should return a source number, eg 1, 3010, 4010',
		allowInvalidValues: true,
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
	subset?: 'me' | 'aux' | 'mv' | 'key' | 'ssrc-box' | 'ssrc-art' | 'ssrc-art-key' | 'tally',
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
			case 'ssrc-art-key':
				// Cutting the art also requires being usable as a key source, which rules out eg the colours
				if (
					(input.sourceAvailability &
						(Enums.SourceAvailability.SuperSourceArt | Enums.SourceAvailability.KeySource)) !==
					(Enums.SourceAvailability.SuperSourceArt | Enums.SourceAvailability.KeySource)
				)
					continue
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
