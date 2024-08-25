import { Enums, type Atem } from 'atem-connection'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import type { MyActionDefinitions } from './types.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../choices.js'
import type { StateWrapper } from '../state.js'

export interface AtemStreamingActions {
	[ActionId.StreamStartStop]: {
		stream: TrueFalseToggle
	}
	[ActionId.StreamService]: {
		service: string
		url: string
		key: string
	}
}

export function createStreamingActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): MyActionDefinitions<AtemStreamingActions> {
	if (!model.streaming) {
		return {
			[ActionId.StreamStartStop]: undefined,
			[ActionId.StreamService]: undefined,
		}
	}
	return {
		[ActionId.StreamStartStop]: {
			name: 'Stream: Start or Stop',
			options: {
				stream: {
					id: 'stream',
					type: 'dropdown',
					label: 'Stream',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
			},
			callback: async ({ options }) => {
				let newState = options.getPlainString('stream') === 'true'
				if (options.getPlainString('stream') === 'toggle') {
					newState = state.state.streaming?.status?.state === Enums.StreamingStatus.Idle
				}

				if (newState) {
					await atem?.startStreaming()
				} else {
					await atem?.stopStreaming()
				}
			},
			learn: ({ options }) => {
				if (state.state.streaming?.status) {
					return {
						...options.getJson(),
						state: state.state.streaming.status.state,
					}
				} else {
					return undefined
				}
			},
		},
		[ActionId.StreamService]: {
			name: 'Stream: Set service',
			options: {
				service: {
					id: 'service',
					label: 'Service',
					type: 'textinput',
					default: '',
					useVariables: true,
				},
				url: {
					id: 'url',
					label: 'URL',
					type: 'textinput',
					default: '',
					useVariables: true,
				},
				key: {
					id: 'key',
					label: 'Key',
					type: 'textinput',
					default: '',
					useVariables: true,
				},
			},
			callback: async ({ options }) => {
				const [serviceName, url, key] = await Promise.all([
					options.getParsedString('service'),
					options.getParsedString('url'),
					options.getParsedString('key'),
				])

				await atem?.setStreamingService({ serviceName, url, key })
			},
			learn: ({ options }) => {
				if (state.state.streaming?.service) {
					return {
						...options.getJson(),
						service: state.state.streaming.service.serviceName,
						url: state.state.streaming.service.url,
						key: state.state.streaming.service.key,
					}
				} else {
					return undefined
				}
			},
		},
	}
}
