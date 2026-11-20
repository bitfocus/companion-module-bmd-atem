import { describe, expect, test } from 'vitest'
import { ClassicAudioLevelsCommand, ClassicAudioSendLevelsCommand } from '../classicLevels.js'

const FS = 8388608

function amlv(sources: Array<[number, number[]]>, master: number[], monitor: number[]): Buffer {
	const n = sources.length
	let idEnd = 36 + n * 2
	idEnd += (4 - (idEnd % 4)) % 4
	const b = Buffer.alloc(idEnd + n * 16)
	b.writeUInt16BE(n, 0)
	master.forEach((v, i) => b.writeUInt32BE(v, 4 + i * 4))
	monitor.forEach((v, i) => b.writeUInt32BE(v, 20 + i * 4))
	sources.forEach(([id, l], i) => {
		b.writeUInt16BE(id, 36 + i * 2)
		l.forEach((v, j) => b.writeUInt32BE(v, idEnd + i * 16 + j * 4))
	})
	return b
}

describe('ClassicAudioLevelsCommand', () => {
	test('reads master, monitor and every source (odd count, padded ids)', () => {
		const half = Math.round(FS / 2) // -6.02 dB
		const cmd = ClassicAudioLevelsCommand.deserialize(
			amlv(
				[
					[1, [FS, half, FS, FS]],
					[2, [0, 0, 0, 0]],
					[1301, [half, half, half, half]],
				],
				[half, FS, FS, FS],
				[0, 0, 0, 0],
			),
		)
		expect(cmd.properties.master).toEqual([-602, 0, 0, 0])
		expect(cmd.properties.monitor).toEqual([-10000, -10000, -10000, -10000])
		expect(cmd.properties.sources).toEqual([
			[1, [0, -602, 0, 0]],
			[2, [-10000, -10000, -10000, -10000]],
			[1301, [-602, -602, -602, -602]],
		])
	})
	test('asks for levels with SALN', () => {
		expect(new ClassicAudioSendLevelsCommand({ enable: true }).serialize()).toEqual(Buffer.from([1, 0, 0, 0]))
	})
})
