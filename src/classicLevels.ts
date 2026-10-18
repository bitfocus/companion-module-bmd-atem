import { Commands, type Atem } from 'atem-connection'

/*
 * Audio levels of the classic (non-Fairlight) audio mixer, as on the Production Studio 4K and the
 * 1 / 2 / 4 M/E Production Studios: atem-connection does not know these commands, so they are added
 * here. SALN asks the switcher to send levels; AMLv carries them:
 *   u16 source count, 2 pad, master L, R, peak L, peak R, monitor L, R, peak L, peak R (u32 each),
 *   the source ids (u16 each, padded to 4 bytes), then per source L, R, peak L, peak R (u32 each).
 * Levels are linear, full scale at 2^23.
 */

/** [left, right, peak left, peak right] in hundredths of a dB (-10000 = silence) */
export type ClassicLevels = [number, number, number, number]

export interface ClassicAudioLevelsProps {
	master: ClassicLevels
	monitor: ClassicLevels
	sources: Array<[id: number, levels: ClassicLevels]>
}

const FULL_SCALE = 8388608
function db100(raw: number): number {
	if (!raw) return -10000
	return Math.max(-10000, Math.round(2000 * Math.log10(raw / FULL_SCALE)))
}
const four = (b: Buffer, o: number): ClassicLevels => [
	db100(b.readUInt32BE(o)),
	db100(b.readUInt32BE(o + 4)),
	db100(b.readUInt32BE(o + 8)),
	db100(b.readUInt32BE(o + 12)),
]

export class ClassicAudioLevelsCommand extends Commands.DeserializedCommand<ClassicAudioLevelsProps> {
	static readonly rawName = 'AMLv'

	static deserialize(raw: Buffer): ClassicAudioLevelsCommand {
		const count = raw.readUInt16BE(0)
		const props: ClassicAudioLevelsProps = { master: four(raw, 4), monitor: four(raw, 20), sources: [] }
		const ids: number[] = []
		for (let i = 0; i < count; i++) ids.push(raw.readUInt16BE(36 + i * 2))
		let o = 36 + count * 2
		o += (4 - (o % 4)) % 4
		for (const id of ids) {
			if (o + 16 > raw.length) break
			props.sources.push([id, four(raw, o)])
			o += 16
		}
		return new ClassicAudioLevelsCommand(props)
	}

	applyToState(): string[] {
		return [] // levels are not state: they reach the module as received commands
	}
}

export class ClassicAudioSendLevelsCommand extends Commands.BasicWritableCommand<{ enable: boolean }> {
	static readonly rawName = 'SALN'

	serialize(): Buffer {
		const b = Buffer.alloc(4)
		b.writeUInt8(this.properties.enable ? 1 : 0, 0)
		return b
	}
}

/** teach this connection's command parser the classic levels command (it sits in atem-connection's private AtemWrapper; false when not found) */
export function installClassicLevels(atem: Atem): boolean {
	const parser = (atem as any).client?.socket?._commandParser
	if (!parser?.commands) return false
	parser.commands[ClassicAudioLevelsCommand.rawName] = [ClassicAudioLevelsCommand]
	return true
}
