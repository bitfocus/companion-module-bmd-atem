import { Commands, type Atem } from 'atem-connection'
import type { CompanionActionDefinitions, SomeCompanionActionInputField } from '@companion-module/base'
import type { AtemConfig } from '../../config.js'
import { CCU_PARAMS, type CcuField, type CcuParam, type CcuType } from './protocol.js'

/*
 * Every camera control (CCU) parameter of the Blackmagic camera control protocol as an action
 * ("CCU: <group>: <name>"), plus "CCU: Raw command" for anything else. Cameras are addressed by
 * the ATEM input they are on (255 = all cameras). Values that can be nudged have a Set / Offset
 * choice: an offset is added by the camera to its current value.
 */

const DATA_TYPE: Record<Exclude<CcuType, 'void'>, Commands.CameraControlDataType> = {
	bool: Commands.CameraControlDataType.BOOL,
	i8: Commands.CameraControlDataType.SINT8,
	i16: Commands.CameraControlDataType.SINT16,
	i32: Commands.CameraControlDataType.SINT32,
	i64: Commands.CameraControlDataType.SINT64,
	fixed: Commands.CameraControlDataType.FLOAT,
	string: Commands.CameraControlDataType.STRING,
}

const INT_RANGE: Partial<Record<CcuType, [number, number]>> = {
	i8: [-128, 127],
	i16: [-32768, 32767],
	i32: [-2147483648, 2147483647],
	fixed: [-16, 15.9995],
}

function cameraField(): SomeCompanionActionInputField {
	return {
		type: 'number',
		id: 'cameraId',
		label: 'Camera (ATEM input, 255 = all)',
		default: 1,
		min: 1,
		max: 255,
		asInteger: true,
		clampValues: true,
	}
}

function toInput(p: CcuParam, f: CcuField): SomeCompanionActionInputField {
	const base = { id: f.id, label: f.label, description: f.description }
	switch (f.kind) {
		case 'dropdown':
			return { ...base, type: 'dropdown', default: f.default as number, choices: f.choices ?? [] }
		case 'flags':
			return {
				...base,
				type: 'multidropdown',
				default: f.default as number[],
				choices: f.choices ?? [],
				disableAutoExpression: true,
			}
		case 'bool':
			return { ...base, type: 'checkbox', default: !!f.default }
		case 'text':
			return { ...base, type: 'textinput', default: String(f.default), useVariables: true }
		default: {
			let min = f.min ?? -1e9
			let max = f.max ?? 1e9
			if (p.offset) {
				// an offset may go either way across the whole range
				const span = max - min
				min = Math.min(min, -span)
				max = Math.max(max, span)
			}
			return {
				...base,
				type: 'number',
				default: f.default as number,
				min,
				max,
				step: p.type === 'fixed' ? 0.01 : 1,
				asInteger: p.type !== 'fixed',
				clampValues: true,
			}
		}
	}
}

/** the values to send, in the order of the fields */
function fieldValues(p: CcuParam, o: Record<string, any>, relative: boolean): Array<number | bigint> {
	if (p.encode) return p.encode(o)
	return p.fields.map((f) => {
		const v = o[f.id]
		if (f.kind === 'flags') return (Array.isArray(v) ? v : []).reduce((a: number, b) => a | Number(b), 0)
		if (f.kind === 'bool') return v ? 1 : 0
		let n = Number(v)
		if (!Number.isFinite(n)) n = Number(f.default) || 0
		if (!relative && f.min !== undefined && f.max !== undefined) n = Math.min(f.max, Math.max(f.min, n))
		return p.type === 'fixed' ? n : Math.round(n)
	})
}

export function ccuCommand(
	cameraId: number,
	category: number,
	parameter: number,
	type: CcuType,
	values: Array<number | bigint | string | boolean>,
	relative = false,
): Commands.CameraControlCommand {
	const props: Commands.CameraControlPacket = {
		type: type === 'void' ? Commands.CameraControlDataType.BOOL : DATA_TYPE[type],
		boolData: [],
		numberData: [],
		bigintData: [],
		stringData: '',
		relative,
	}
	if (type === 'bool') props.boolData = values.map((v) => !!Number(v) || v === true)
	else if (type === 'string') props.stringData = values.map(String).join('')
	else if (type === 'i64')
		props.bigintData = values.map((v) => (typeof v === 'bigint' ? v : BigInt(Math.round(Number(v)))))
	else if (type !== 'void') {
		const [lo, hi] = INT_RANGE[type] ?? [-Infinity, Infinity]
		props.numberData = values.map((v) => Math.min(hi, Math.max(lo, Number(v) || 0)))
	}
	return new Commands.CameraControlCommand(cameraId, category, parameter, props)
}

export function createCameraControlAllActions(
	config: AtemConfig,
	atem: Atem | undefined,
): CompanionActionDefinitions<Record<string, { options: Record<string, any> }>> {
	const out: CompanionActionDefinitions<Record<string, { options: Record<string, any> }>> = {}
	if (!config.enableCameraControl) {
		for (const p of CCU_PARAMS) out[p.id] = undefined
		out['ccuRaw'] = undefined
		return out
	}
	const send = async (cmd: Commands.CameraControlCommand) => {
		await atem?.sendCommand(cmd)
	}

	for (const p of CCU_PARAMS) {
		const options: SomeCompanionActionInputField[] = [cameraField()]
		if (p.offset)
			options.push({
				type: 'dropdown',
				id: 'mode',
				label: 'Change',
				default: 'set',
				choices: [
					{ id: 'set', label: 'Set to' },
					{ id: 'offset', label: 'Offset by' },
				],
				disableAutoExpression: true,
			})
		for (const f of p.fields) options.push(toInput(p, f))
		out[p.id] = {
			name: `CCU: ${p.group}: ${p.name}`,
			description: p.description,
			options: options,
			callback: async ({ options: o }) => {
				const relative = !!p.offset && o.mode === 'offset'
				const values =
					p.type === 'void' ? [] : p.type === 'string' ? [String(o.value ?? '')] : fieldValues(p, o, relative)
				await send(ccuCommand(Math.round(Number(o.cameraId)) || 1, p.category, p.parameter, p.type, values, relative))
			},
		}
	}

	out['ccuRaw'] = {
		name: 'CCU: Raw command',
		description: 'Any camera control command: category, parameter, data type and the values, comma separated',
		options: [
			cameraField(),
			{ type: 'number', id: 'category', label: 'Category', default: 0, min: 0, max: 255, asInteger: true },
			{ type: 'number', id: 'parameter', label: 'Parameter', default: 0, min: 0, max: 255, asInteger: true },
			{
				type: 'dropdown',
				id: 'type',
				label: 'Data type',
				default: 'fixed',
				choices: [
					{ id: 'void', label: 'void' },
					{ id: 'bool', label: 'boolean' },
					{ id: 'i8', label: 'int8' },
					{ id: 'i16', label: 'int16' },
					{ id: 'i32', label: 'int32' },
					{ id: 'i64', label: 'int64' },
					{ id: 'fixed', label: 'fixed16 (5.11)' },
					{ id: 'string', label: 'string' },
				],
				disableAutoExpression: true,
			},
			{ type: 'checkbox', id: 'relative', label: 'Offset (add to the current value)', default: false },
			{
				type: 'textinput',
				id: 'values',
				label: 'Values (comma separated, or the text)',
				default: '0',
				useVariables: true,
			},
		] as any,
		callback: async ({ options: o }) => {
			const type = String(o.type) as CcuType
			const raw = String(o.values ?? '')
			const values =
				type === 'string'
					? [raw]
					: type === 'void'
						? []
						: raw
								.split(',')
								.map((s) => s.trim())
								.filter((s) => s !== '')
			const parsed =
				type === 'i64' ? values.map((v) => BigInt(v)) : values.map((v) => (type === 'string' ? v : Number(v)))
			await send(
				ccuCommand(
					Math.round(Number(o.cameraId)) || 1,
					Math.round(Number(o.category)) & 255,
					Math.round(Number(o.parameter)) & 255,
					type,
					parsed,
					!!o.relative,
				),
			)
		},
	}
	return out
}
