import debug0 = require('debug')
import mDNS = require('multicast-dns')

const debug = debug0('bmd-atem/mdns')

export interface AtemInfo {
	modelName: string
	address: string
	lastSeen: number
}

const SERVICE_NAME = '_blackmagic._tcp.local'

export interface AtemMdnsDetector {
	subscribe(instanceId: string): void
	unsubscribe(instanceId: string): void
	listKnown(): AtemInfo[]
}

class AtemMdnsDetectorImpl implements AtemMdnsDetector {
	private readonly subscribers = new Set<string>()
	private mdns: mDNS.MulticastDNS | undefined
	private knownAtems = new Map<string, AtemInfo>()
	private queryTimer: NodeJS.Timer | undefined

	public subscribe(instanceId: string): void {
		const startListening = this.subscribers.size === 0

		this.subscribers.add(instanceId)

		if (startListening) {
			this.startListening()
		}
	}

	public unsubscribe(instanceId: string): void {
		if (this.subscribers.delete(instanceId) && this.subscribers.size === 0) {
			this.stopListening()
		}
	}

	public listKnown(): AtemInfo[] {
		return Array.from(this.knownAtems.values()).sort((a, b) => a.modelName.localeCompare(b.modelName))
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
				const txtRec = allRecords.find((p) => p.type === 'TXT')
				if (aRec && txtRec && typeof aRec.data === 'string' && Array.isArray(txtRec.data)) {
					const lines = txtRec.data.map((r) => r.toString())
					if (lines.find((l) => l === 'class=AtemSwitcher')) {
						const nameLine = lines.find((l) => l.startsWith('name='))
						let name: string
						if (nameLine) {
							name = nameLine.substr(5)
						} else {
							name = answer.data.toString()
							if (name.endsWith(SERVICE_NAME)) {
								name = name.substr(0, name.length - 1 - SERVICE_NAME.length)
							}
						}

						debug(`Heard from ${name} (${aRec.data})`)
						this.knownAtems.set(aRec.data, {
							address: aRec.data,
							modelName: name,
							lastSeen: Date.now(),
						})
					}
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

export const AtemMdnsDetectorInstance: AtemMdnsDetector = new AtemMdnsDetectorImpl()
