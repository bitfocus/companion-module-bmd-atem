import type { CompanionInputFieldDropdown, DropdownChoice, JsonValue } from '@companion-module/base'
import { Enums, type AtemState } from 'atem-connection'
import type { ModelSpec } from '../models/types.js'
import { assertUnreachable, stringifyValueAlways } from '../util.js'

export function externalPortTypeLabel(portType: Enums.ExternalPortType): string {
	switch (portType) {
		case Enums.ExternalPortType.Unknown:
			return 'Unknown'
		case Enums.ExternalPortType.SDI:
			return 'SDI'
		case Enums.ExternalPortType.HDMI:
			return 'HDMI'
		case Enums.ExternalPortType.Component:
			return 'Component'
		case Enums.ExternalPortType.Composite:
			return 'Composite'
		case Enums.ExternalPortType.SVideo:
			return 'S-Video'
		case Enums.ExternalPortType.XLR:
			return 'XLR'
		case Enums.ExternalPortType.AESEBU:
			return 'AES/EBU'
		case Enums.ExternalPortType.RCA:
			return 'RCA'
		case Enums.ExternalPortType.Internal:
			return 'Internal'
		case Enums.ExternalPortType.TSJack:
			return 'TS Jack'
		case Enums.ExternalPortType.MADI:
			return 'MADI'
		case Enums.ExternalPortType.TRSJack:
			return 'TRS Jack'
		case Enums.ExternalPortType.RJ45:
			return 'RJ45'
		default:
			assertUnreachable(portType)
			return `Unknown (${portType})`
	}
}

/**
 * A stable, human-friendly id for a connector, used as the dropdown choice value and accepted
 * from expressions. Eg 'sdi', 'rj45', 'svideo'. This is the lowercased enum key.
 */
export function externalPortTypeToId(portType: Enums.ExternalPortType): string {
	return Enums.ExternalPortType[portType]?.toLowerCase() ?? String(portType)
}

/** Normalise a string for lookup, so 'S-Video', 'svideo' and 'S Video' all match. */
function normalizePortTypeName(str: string): string {
	return str.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Map of normalised connector names to their {@link Enums.ExternalPortType}, built from enum keys and labels. */
const EXTERNAL_PORT_TYPE_BY_NAME = new Map<string, Enums.ExternalPortType>()
for (const portType of Object.values(Enums.ExternalPortType)) {
	if (typeof portType !== 'number') continue
	EXTERNAL_PORT_TYPE_BY_NAME.set(normalizePortTypeName(Enums.ExternalPortType[portType]), portType)
	EXTERNAL_PORT_TYPE_BY_NAME.set(normalizePortTypeName(externalPortTypeLabel(portType)), portType)
}

export interface SwitchableInputInfo {
	id: number
	longName: string
	externalPorts: Enums.ExternalPortType[]
}

/** The inputs which have more than one physical connector, and so can be switched between them. */
export function GetSwitchableInputs(model: ModelSpec, state: AtemState): SwitchableInputInfo[] {
	const inputs: SwitchableInputInfo[] = []
	for (const input of model.inputs) {
		if ((input.externalPorts?.length ?? 0) < 2) continue

		inputs.push({
			id: input.id,
			longName: state.inputs[input.id]?.longName || `Input ${input.id}`,
			externalPorts: input.externalPorts ?? [],
		})
	}
	return inputs.sort((a, b) => a.id - b.id)
}

export function AtemSwitchableInputPicker(inputs: SwitchableInputInfo[]): CompanionInputFieldDropdown<'input'> {
	return {
		type: 'dropdown',
		id: 'input',
		label: 'Input',
		default: inputs[0]?.id ?? 0,
		choices: inputs.map((input) => ({ id: input.id, label: input.longName })),
		expressionDescription: 'Should return an input number, eg 1, 2',
		allowInvalidValues: true,
	}
}

/**
 * The connectors available across all switchable inputs. Which of these is valid depends on the
 * input chosen alongside it, so the value is checked against that input when used.
 */
export function AtemExternalPortTypePicker(inputs: SwitchableInputInfo[]): CompanionInputFieldDropdown<'portType'> {
	const portTypes = new Set<Enums.ExternalPortType>()
	for (const input of inputs) {
		for (const port of input.externalPorts) portTypes.add(port)
	}

	const choices: DropdownChoice<string>[] = Array.from(portTypes)
		.sort((a, b) => a - b)
		.map((portType) => ({ id: externalPortTypeToId(portType), label: externalPortTypeLabel(portType) }))

	return {
		type: 'dropdown',
		id: 'portType',
		label: 'Connector',
		default: choices[0]?.id ?? externalPortTypeToId(Enums.ExternalPortType.SDI),
		choices,
		expressionDescription: `Should return a connector name: ${choices.map((c) => `'${c.id}' (${c.label})`).join(', ')}`,
		allowInvalidValues: true,
	}
}

/**
 * Parse a raw connector picker value into a known {@link Enums.ExternalPortType}, or null when it is
 * not one. Accepts a connector name in any format (eg 'RJ45', 'rj45', 'S-Video') as well as the raw
 * numeric enum value (for backwards compatibility with older saved configs). This does not check
 * whether a given input offers the connector.
 */
export function parseExternalPortType(rawValue: JsonValue | undefined): Enums.ExternalPortType | null {
	const str = stringifyValueAlways(rawValue).trim()
	if (!str) return null

	const byName = EXTERNAL_PORT_TYPE_BY_NAME.get(normalizePortTypeName(str))
	if (byName !== undefined) return byName

	const value = Number(str)
	if (Number.isInteger(value) && Enums.ExternalPortType[value] !== undefined) return value

	return null
}
