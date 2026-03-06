import { Enums, type Atem } from 'atem-connection'
import { convertOptionsFields } from '../common.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModelSpec } from '../models/index.js'
import { ActionId } from './ActionId.js'
import { CHOICES_ON_OFF_TOGGLE, type TrueFalseToggle } from '../choices.js'
import type { StateWrapper } from '../state.js'

export type AtemStreamingActions = {
	[ActionId.StreamStartStop]: {
		options: {
			stream: TrueFalseToggle
		}
	}
	[ActionId.StreamService]: {
		options: {
			service: string
			url: string
			key: string
		}
	}
}

export function createStreamingActions(
	atem: Atem | undefined,
	model: ModelSpec,
	state: StateWrapper,
): CompanionActionDefinitions<AtemStreamingActions> {
	if (!model.streaming) {
		return {
			[ActionId.StreamStartStop]: undefined,
			[ActionId.StreamService]: undefined,
		}
	}
	return {
		[ActionId.StreamStartStop]: {
			name: 'Stream: Start or Stop',
			options: convertOptionsFields({
				stream: {
					id: 'stream',
					type: 'dropdown',
					label: 'Stream',
					default: 'toggle',
					choices: CHOICES_ON_OFF_TOGGLE,
				},
			}),
			callback: async ({ options }) => {
				let newState = options.stream === 'true'
				if (options.stream === 'toggle') {
					newState = state.state.streaming?.status?.state === Enums.StreamingStatus.Idle
				}

				if (newState) {
					await atem?.startStreaming()
				} else {
					await atem?.stopStreaming()
				}
			},
		},
		[ActionId.StreamService]: {
			name: 'Stream: Set service',
			options: convertOptionsFields({
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
			}),
			callback: async ({ options }) => {
				await atem?.setStreamingService({
					serviceName: options.service,
					url: options.url,
					key: options.key,
				})
			},
			learn: () => {
				if (state.state.streaming?.service) {
					return {
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
