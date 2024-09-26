import { Enums } from 'atem-connection'
import type { AudioRoutingOutputInfo, AudioRoutingSourceInfo } from '../types'

const ALL_CHANNEL_PAIRS: Enums.AudioChannelPair[] = [
	Enums.AudioChannelPair.Channel1_2,
	Enums.AudioChannelPair.Channel3_4,
	Enums.AudioChannelPair.Channel5_6,
	Enums.AudioChannelPair.Channel7_8,
	Enums.AudioChannelPair.Channel9_10,
	Enums.AudioChannelPair.Channel11_12,
	Enums.AudioChannelPair.Channel13_14,
	Enums.AudioChannelPair.Channel15_16,
]

export const AUDIO_ROUTING_SOURCE_NO_AUDIO: AudioRoutingSourceInfo = {
	inputId: 0,
	sourceName: 'No Audio',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}

export const AUDIO_ROUTING_SOURCE_XLR: AudioRoutingSourceInfo = {
	inputId: 1001,
	sourceName: 'XLR',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}
export const AUDIO_ROUTING_SOURCE_RCA: AudioRoutingSourceInfo = {
	inputId: 1201,
	sourceName: 'RCA',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}
export const AUDIO_ROUTING_SOURCE_MICROPHONE: AudioRoutingSourceInfo = {
	inputId: 1301,
	sourceName: 'Microphone',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}
export const AUDIO_ROUTING_SOURCE_TRS: AudioRoutingSourceInfo = {
	inputId: 1401,
	sourceName: 'TRS',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}

export const AUDIO_ROUTING_SOURCE_PROGRAM: AudioRoutingSourceInfo = {
	inputId: 2301,
	sourceName: 'Program',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}
export const AUDIO_ROUTING_SOURCE_MONITOR: AudioRoutingSourceInfo = {
	inputId: 2201,
	sourceName: 'Monitor',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}
export const AUDIO_ROUTING_SOURCE_CONTROL: AudioRoutingSourceInfo = {
	inputId: 2501,
	sourceName: 'Control',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}
export const AUDIO_ROUTING_SOURCE_STUDIO: AudioRoutingSourceInfo = {
	inputId: 2601,
	sourceName: 'Studio',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}
export const AUDIO_ROUTING_SOURCE_HEADPHONES: AudioRoutingSourceInfo = {
	inputId: 2701,
	sourceName: 'Headphones',
	channelPairs: [Enums.AudioChannelPair.Channel1_2],
}

export const AUDIO_ROUTING_OUTPUT_MULTIVIEWER: AudioRoutingOutputInfo = {
	outputId: 3001,
	outputName: 'MV',
	channelPairs: ALL_CHANNEL_PAIRS,
}
export const AUDIO_ROUTING_OUTPUT_PROGRAM: AudioRoutingOutputInfo = {
	outputId: 4001,
	outputName: 'Program',
	channelPairs: ALL_CHANNEL_PAIRS,
}
export const AUDIO_ROUTING_OUTPUT_RETURN: AudioRoutingOutputInfo = {
	outputId: 5001,
	outputName: 'Return',
	channelPairs: ALL_CHANNEL_PAIRS,
}

export function generateInputRoutingSources(inputCount: number, includeComms: boolean): AudioRoutingSourceInfo[] {
	const sources: Array<AudioRoutingSourceInfo> = []
	for (let i = 1; i <= inputCount; i++) {
		sources.push({
			inputId: i,
			sourceName: `Input ${i} 1/2`,
			channelPairs: includeComms
				? [
						Enums.AudioChannelPair.Channel1_2,
						Enums.AudioChannelPair.Channel3_4,
						Enums.AudioChannelPair.Channel13_14,
						Enums.AudioChannelPair.Channel15_16,
					]
				: [Enums.AudioChannelPair.Channel1_2, Enums.AudioChannelPair.Channel3_4],
		})
	}
	return sources
}

export function generateMadiRoutingSources(inputCount: number): AudioRoutingSourceInfo[] {
	const sources: Array<AudioRoutingSourceInfo> = []
	for (let i = 1; i <= inputCount; i++) {
		sources.push({
			inputId: 1500 + i,
			sourceName: `MADI ${i}`,
			channelPairs: [Enums.AudioChannelPair.Channel1_2],
		})
	}
	return sources
}

export function generateMediaPlayerRoutingSources(inputCount: number): AudioRoutingSourceInfo[] {
	const sources: Array<AudioRoutingSourceInfo> = []
	for (let i = 1; i <= inputCount; i++) {
		sources.push({
			inputId: 2000 + i,
			sourceName: `Media Player ${i}`,
			channelPairs: [Enums.AudioChannelPair.Channel1_2],
		})
	}
	return sources
}

export function generateTalkbackRoutingSources(hasExternal: boolean, hasGeneric: boolean): AudioRoutingSourceInfo[] {
	const sources: Array<AudioRoutingSourceInfo> = [
		{
			inputId: 2101,
			sourceName: 'Production Talkback',
			channelPairs: [Enums.AudioChannelPair.Channel1_2],
		},
		{
			inputId: 2102,
			sourceName: 'Engineering Talkback',
			channelPairs: [Enums.AudioChannelPair.Channel1_2],
		},
	]

	if (hasExternal) {
		sources.push({
			inputId: 2103,
			sourceName: 'External Talkback',
			channelPairs: [Enums.AudioChannelPair.Channel1_2],
		})
	}

	if (hasGeneric) {
		sources.push({
			inputId: 2104,
			sourceName: 'Talkback',
			channelPairs: [Enums.AudioChannelPair.Channel1_2],
		})
	}

	return sources
}

export function generateMixMinusRoutingSources(inputCount: number): AudioRoutingSourceInfo[] {
	const sources: Array<AudioRoutingSourceInfo> = []
	for (let i = 1; i <= inputCount; i++) {
		sources.push({
			inputId: 2800 + i,
			sourceName: `Mix Minus ${i}`,
			channelPairs: [Enums.AudioChannelPair.Channel1_2],
		})
	}
	return sources
}

export function generateAuxRoutingSources(inputCount: number): AudioRoutingSourceInfo[] {
	const sources: Array<AudioRoutingSourceInfo> = []
	for (let i = 1; i <= inputCount; i++) {
		sources.push({
			inputId: 3000 + i,
			sourceName: `Aux ${i}`,
			channelPairs: [Enums.AudioChannelPair.Channel1_2],
		})
	}
	return sources
}

export function combineInputId(sourceId: number, audioPair: Enums.AudioChannelPair): number {
	return (sourceId << 16) + audioPair
}

export function generateMadiRoutingOutputs(inputCount: number): AudioRoutingOutputInfo[] {
	const sources: Array<AudioRoutingOutputInfo> = []
	for (let i = 1; i <= inputCount; i++) {
		sources.push({
			outputId: 1000 + i,
			outputName: `MADI ${i}`,
			channelPairs: [Enums.AudioChannelPair.Channel1_2],
		})
	}
	return sources
}
export function generateAuxRoutingOutputs(auxCount: number): AudioRoutingOutputInfo[] {
	const sources: Array<AudioRoutingOutputInfo> = []
	for (let i = 1; i <= auxCount; i++) {
		sources.push({
			outputId: 2000 + i,
			outputName: `Aux ${i}`,
			channelPairs: ALL_CHANNEL_PAIRS,
		})
	}
	return sources
}
