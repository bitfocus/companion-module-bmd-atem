import { Bonjour, Browser } from 'bonjour-service'

export interface AtemInfo {
	modelName: string
	address: string
}

export interface AtemMdnsDetector {
	subscribe(instanceId: string): void
	unsubscribe(instanceId: string): void
	listKnown(): AtemInfo[]
}

/*
 * TODO - this needs some rethinking as it will no longer be a singleton.
 * Is there another way we can make a singleton without making a mess?
 */
class AtemMdnsDetectorImpl implements AtemMdnsDetector {
	private readonly subscribers = new Set<string>()
	private bonjour: Bonjour | undefined
	private browser: Browser | undefined

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
		const devices: AtemInfo[] = []

		if (this.browser?.services) {
			for (const svc of this.browser.services) {
				if (svc.txt.class === 'AtemSwitcher') {
					for (const address of svc.addresses) {
						devices.push({
							modelName: svc.name,
							address: address,
						})
					}
				}
			}
		}

		return devices
	}

	private startListening(): void {
		this.bonjour = new Bonjour()
		this.browser = this.bonjour.find({
			type: 'blackmagic',
			protocol: 'tcp',
			// subtypes?: Array<string>;
			// txt?: any;
		})
		this.browser.start()
	}

	private stopListening(): void {
		this.browser?.stop?.()
		delete this.browser

		this.bonjour?.destroy?.()
		delete this.bonjour
	}
}

export const AtemMdnsDetectorInstance: AtemMdnsDetector = new AtemMdnsDetectorImpl()
