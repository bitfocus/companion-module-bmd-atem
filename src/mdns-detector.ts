import debug0 = require('debug')
import mDNS = require('multicast-dns')

const debug = debug0('bmd-atem/mdns')

export interface AtemInfo {
	modelName: string
	address: string
	lastSeen: number
}

const SERVICE_NAME = '_blackmagic._tcp.local'

export class AtemMdnsDetector {
	private static instance: AtemMdnsDetector | undefined

	private readonly subscribers = new Set<string>()
	private mdns: mDNS.MulticastDNS | undefined
	private knownAtems = new Map<string, AtemInfo>()
	private queryTimer: NodeJS.Timer | undefined

	private constructor() {
		// Just needs to be private
	}

	public static subscribe(instanceId: string): void {
		if (!AtemMdnsDetector.instance) {
			AtemMdnsDetector.instance = new AtemMdnsDetector()
		}

		const instance = AtemMdnsDetector.instance
		const startListening = instance.subscribers.size === 0

		instance.subscribers.add(instanceId)

		if (startListening) {
			instance.startListening()
		}
	}

	public static unsubscribe(instanceId: string): void {
		const instance = AtemMdnsDetector.instance
		if (instance) {
			if (instance.subscribers.delete(instanceId) && instance.subscribers.size === 0) {
				instance.stopListening()
			}
		}
	}

	public static listKnown(): AtemInfo[] {
		const data = AtemMdnsDetector.instance?.knownAtems
		if (data) {
			return Array.from(data.values()).sort((a, b) => a.modelName.localeCompare(b.modelName))
		} else {
			return []
		}
	}

	private startListening(): void {
		this.mdns = mDNS({
			multicast: true,
		})
		this.knownAtems.clear()

		this.mdns.on('response', (pkt) => {
			const allRecords = [...pkt.answers, ...pkt.additionals]
			const answer = allRecords.find((p) => p.type === 'PTR' && p.name === SERVICE_NAME)
			if (answer) {
				const aRec = allRecords.find((p) => p.type === 'A')
				if (aRec && typeof aRec.data === 'string') {
					let name = answer.data.toString()
					if (name.endsWith(SERVICE_NAME)) {
						name = name.substr(0, name.length - 1 - SERVICE_NAME.length)
					}

					debug(`Heard from ${name} (${aRec.data})`)
					this.knownAtems.set(aRec.data, {
						address: aRec.data,
						modelName: name,
						lastSeen: Date.now(),
					})
				}
			}

			// Prune out any not seen for over a minute
			for (const [id, data] of Array.from(this.knownAtems.entries())) {
				if (data.lastSeen < Date.now() - 60000) {
					this.knownAtems.delete(id)
					debug(`Lost ${data.modelName} (${data.address})`)
				}
			}
		})

		if (!this.queryTimer) {
			this.queryTimer = setInterval(() => this.sendQuery(), 25000)
		}

		this.sendQuery()
	}

	private stopListening(): void {
		this.mdns?.destroy()
		delete this.mdns
		this.knownAtems.clear()

		if (this.queryTimer) {
			clearInterval(this.queryTimer)
			delete this.queryTimer
		}
	}

	private sendQuery(): void {
		if (this.mdns) {
			debug('Sending query')

			this.mdns.query([
				{
					type: 'PTR',
					name: SERVICE_NAME,
				},
			])
		}
	}
}
