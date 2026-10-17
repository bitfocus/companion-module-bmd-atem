import { Commands, type Atem } from 'atem-connection'

/*
 * Experimental: CCU data padding packets.
 * The Blackmagic 3G-SDI Arduino Shield drops the last byte of every camera control packet it
 * receives. Packets are padded to 32 bits with zeros, so most only lose padding; but a packet whose
 * data ends exactly on the 32-bit boundary (eg 4 x fixed16 colour values, an int32, a void trigger)
 * loses real data and the shield misreads it. When a packet is followed straight away by another
 * one, the first gets through whole: so each such packet is followed by a padding packet, a
 * harmless change of +0 to the camera's display brightness (itself zero padded).
 */

export type CcuPaddingMode = 'off' | 'needed' | 'always'

const BYTES: Record<number, number> = {
	[Commands.CameraControlDataType.BOOL]: 1,
	[Commands.CameraControlDataType.SINT8]: 1,
	[Commands.CameraControlDataType.SINT16]: 2,
	[Commands.CameraControlDataType.SINT32]: 4,
	[Commands.CameraControlDataType.SINT64]: 8,
	[Commands.CameraControlDataType.FLOAT]: 2,
}

/** the packet's data ends on the 32-bit boundary: no zero padding after it */
export function ccuPacketUnpadded(cmd: Commands.CameraControlCommand): boolean {
	const p = cmd.properties
	let len: number
	if (p.type === Commands.CameraControlDataType.STRING) len = Buffer.byteLength(p.stringData)
	else if (p.type === Commands.CameraControlDataType.BOOL) len = p.boolData.length
	else if (p.type === Commands.CameraControlDataType.SINT64) len = p.bigintData.length * 8
	else len = p.numberData.length * (BYTES[p.type] ?? 1)
	return len % 4 === 0
}

export function ccuPaddingPacket(cameraId: number): Commands.CameraControlCommand {
	return new Commands.CameraControlCommand(cameraId, 4, 0, {
		type: Commands.CameraControlDataType.FLOAT,
		boolData: [],
		numberData: [0],
		bigintData: [],
		stringData: '',
		relative: true,
	})
}

export function addCcuPadding<T>(commands: T[], mode: CcuPaddingMode): T[] {
	if (mode === 'off') return commands
	const out: T[] = []
	for (const c of commands) {
		out.push(c)
		if (c instanceof Commands.CameraControlCommand && (mode === 'always' || ccuPacketUnpadded(c)))
			out.push(ccuPaddingPacket(c.source) as T)
	}
	return out
}

/** every camera control command the module sends goes through here (actions, batches, presets) */
export function installCcuPadding(atem: Atem, mode: () => CcuPaddingMode): void {
	const sendCommands = atem.sendCommands.bind(atem)
	atem.sendCommands = async (commands) => sendCommands(addCcuPadding(commands, mode()))
	atem.sendCommand = async (command) => sendCommands(addCcuPadding([command], mode()))
}
