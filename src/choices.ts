import type { CompanionInputFieldTextInput, DropdownChoice } from '@companion-module/base'
import { type AtemState, Enums } from 'atem-connection'
import type { ModelSpec } from './models/index.js'
import { iterateTimes, assertUnreachable } from './util.js'
import type { MyDropdownChoice } from './common.js'
import { AudioChannelPair } from 'atem-connection/dist/enums/index.js'
import { combineInputId } from './models/util/audioRouting.js'

export const CHOICES_SSRCBOXES: DropdownChoice[] = [
	{ id: 0, label: 'Box 1' },
	{ id: 1, label: 'Box 2' },
	{ id: 2, label: 'Box 3' },
	{ id: 3, label: 'Box 4' },
]

export const CHOICES_BORDER_BEVEL: DropdownChoice[] = [
	{ id: 0, label: 'None' },
	{ id: 1, label: 'InOut' },
	{ id: 2, label: 'In' },
	{ id: 3, label: 'Out' },
]

export type TrueFalseToggle = 'true' | 'false' | 'toggle'

export const CHOICES_ON_OFF_TOGGLE: MyDropdownChoice<TrueFalseToggle>[] = [
	{ id: 'true', label: 'On' },
	{ id: 'false', label: 'Off' },
	{ id: 'toggle', label: 'Toggle' },
]

export enum NextTransBackgroundChoices {
	NoChange = 'no-change',
	Include = 'include',
	Omit = 'omit',
	Toggle = 'toggle',
}

export const CHOICES_NEXTTRANS_BACKGROUND: MyDropdownChoice<NextTransBackgroundChoices>[] = [
	{ id: NextTransBackgroundChoices.NoChange, label: 'No change' },
	{ id: NextTransBackgroundChoices.Include, label: 'Include' },
	{ id: NextTransBackgroundChoices.Omit, label: 'Omit' },
	{ id: NextTransBackgroundChoices.Toggle, label: 'Toggle' },
]

export enum NextTransKeyChoices {
	NoChange = 'no-change',
	On = 'on',
	Off = 'off',
	Toggle = 'toggle',
	Include = 'include',
	Omit = 'omit',
}

export const CHOICES_NEXTTRANS_KEY: MyDropdownChoice<NextTransKeyChoices>[] = [
	{ id: NextTransKeyChoices.NoChange, label: 'No change' },
	{ id: NextTransKeyChoices.On, label: 'On' },
	{ id: NextTransKeyChoices.Off, label: 'Off' },
	{ id: NextTransKeyChoices.Toggle, label: 'Toggle' },
	{ id: NextTransKeyChoices.Include, label: 'Include' },
	{ id: NextTransKeyChoices.Omit, label: 'Omit' },
]

export const CHOICES_KEYTRANS: MyDropdownChoice<TrueFalseToggle>[] = [
	{ id: 'true', label: 'On Air' },
	{ id: 'false', label: 'Off' },
	{ id: 'toggle', label: 'Toggle' },
]

export const CHOICES_KEYFRAMES: MyDropdownChoice<
	Enums.FlyKeyKeyFrame.A | Enums.FlyKeyKeyFrame.B | Enums.FlyKeyKeyFrame.Full
>[] = [
	{ id: Enums.FlyKeyKeyFrame.A, label: 'A' },
	{ id: Enums.FlyKeyKeyFrame.B, label: 'B' },
	{ id: Enums.FlyKeyKeyFrame.Full, label: 'Full' },
]

export const CHOICES_KEYFRAMES_CONFIGURABLE: MyDropdownChoice<Enums.FlyKeyKeyFrame.A | Enums.FlyKeyKeyFrame.B>[] = [
	{ id: Enums.FlyKeyKeyFrame.A, label: 'A' },
	{ id: Enums.FlyKeyKeyFrame.B, label: 'B' },
]

export const CHOICES_CURRENTKEYFRAMES: MyDropdownChoice<
	Enums.IsAtKeyFrame.A | Enums.IsAtKeyFrame.B | Enums.IsAtKeyFrame.RunToInfinite
>[] = [
	{ id: Enums.IsAtKeyFrame.A, label: 'A' },
	{ id: Enums.IsAtKeyFrame.B, label: 'B' },
	{ id: Enums.IsAtKeyFrame.RunToInfinite, label: 'Full / Infinite' },
]

export const CHOICES_FLYDIRECTIONS: MyDropdownChoice<Enums.FlyKeyDirection>[] = [
	{ id: Enums.FlyKeyDirection.CentreOfKey, label: 'Centre of key' },
	{ id: Enums.FlyKeyDirection.TopLeft, label: 'Top left' },
	{ id: Enums.FlyKeyDirection.TopCentre, label: 'Top centre' },
	{ id: Enums.FlyKeyDirection.TopRight, label: 'Top right' },
	{ id: Enums.FlyKeyDirection.MiddleLeft, label: 'Middle left' },
	{ id: Enums.FlyKeyDirection.MiddleCentre, label: 'Middle centre' },
	{ id: Enums.FlyKeyDirection.MiddleRight, label: 'Middle right' },
	{ id: Enums.FlyKeyDirection.BottomLeft, label: 'Bottom left' },
	{ id: Enums.FlyKeyDirection.BottomCentre, label: 'Bottom centre' },
	{ id: Enums.FlyKeyDirection.BottomRight, label: 'Bottom right' },
]

export const CHOICES_CLASSIC_AUDIO_MIX_OPTION: MyDropdownChoice<Enums.AudioMixOption>[] = [
	{
		id: Enums.AudioMixOption.On,
		label: 'On',
	},
	{
		id: Enums.AudioMixOption.Off,
		label: 'Off',
	},
	{
		id: Enums.AudioMixOption.AudioFollowVideo,
		label: 'AFV',
	},
]

export const CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION: MyDropdownChoice<Enums.FairlightAudioMixOption>[] = [
	{
		id: Enums.FairlightAudioMixOption.On,
		label: 'On',
	},
	{
		id: Enums.FairlightAudioMixOption.Off,
		label: 'Off',
	},
	{
		id: Enums.FairlightAudioMixOption.AudioFollowVideo,
		label: 'AFV',
	},
]

export function GetTransitionStyleChoices(skipSting?: boolean): MyDropdownChoice<Enums.TransitionStyle>[] {
	const options = [
		{ id: Enums.TransitionStyle.MIX, label: 'Mix' },
		{ id: Enums.TransitionStyle.DIP, label: 'Dip' },
		{ id: Enums.TransitionStyle.WIPE, label: 'Wipe' },
		{ id: Enums.TransitionStyle.DVE, label: 'DVE' },
	]
	if (!skipSting) {
		options.push({ id: Enums.TransitionStyle.STING, label: 'Sting' })
	}
	return options
}
export function GetUpstreamKeyerTypeChoices(): MyDropdownChoice<Enums.MixEffectKeyType>[] {
	const options = [
		{ id: Enums.MixEffectKeyType.Luma, label: 'Luma' },
		{ id: Enums.MixEffectKeyType.Chroma, label: 'Chroma' },
		{ id: Enums.MixEffectKeyType.Pattern, label: 'Pattern' },
		{ id: Enums.MixEffectKeyType.DVE, label: 'DVE' },
	]
	return options
}

export function GetUpstreamKeyerPatternChoices(): MyDropdownChoice<Enums.Pattern>[] {
	const options = [
		{ id: Enums.Pattern.LeftToRightBar, label: 'Left To Right Bar' },
		{ id: Enums.Pattern.TopToBottomBar, label: 'Top To Bottom Bar' },
		{ id: Enums.Pattern.HorizontalBarnDoor, label: 'Horizontal Barn Door' },
		{ id: Enums.Pattern.VerticalBarnDoor, label: 'Vertical Barn Door' },
		{ id: Enums.Pattern.CornersInFourBox, label: 'Corners In Four Box' },
		{ id: Enums.Pattern.RectangleIris, label: 'Rectangle Iris' },
		{ id: Enums.Pattern.DiamondIris, label: 'Diamond Iris' },
		{ id: Enums.Pattern.CircleIris, label: 'Circle Iris' },
		{ id: Enums.Pattern.TopLeftBox, label: 'Top Left Box' },
		{ id: Enums.Pattern.TopRightBox, label: 'Top Right Box' },
		{ id: Enums.Pattern.BottomRightBox, label: 'Bottom Right Box' },
		{ id: Enums.Pattern.BottomLeftBox, label: 'Bottom Left Box' },
		{ id: Enums.Pattern.TopCentreBox, label: 'Top Centre Box' },
		{ id: Enums.Pattern.RightCentreBox, label: 'Right Centre Box' },
		{ id: Enums.Pattern.BottomCentreBox, label: 'Bottom Centre Box' },
		{ id: Enums.Pattern.LeftCentreBox, label: 'Left Centre Box' },
		{ id: Enums.Pattern.TopLeftDiagonal, label: 'Top Left Diagonal' },
		{ id: Enums.Pattern.TopRightDiagonal, label: 'Top Right Diagonal' },
	]
	return options
}

export function GetMEIdChoices(model: ModelSpec): DropdownChoice[] {
	return iterateTimes(model.MEs, (i) => ({
		id: i,
		label: `M/E ${i + 1}`,
	}))
}

export function GetAuxIdChoices(model: ModelSpec): DropdownChoice[] {
	return model.outputs.map((output) => ({
		id: output.id,
		label: output.name,
	}))
}

export function GetUSKIdChoices(model: ModelSpec): DropdownChoice[] {
	return iterateTimes(model.USKs, (i) => ({
		id: i,
		label: `${i + 1}`,
	}))
}

export function GetDSKIdChoices(model: ModelSpec): DropdownChoice[] {
	return iterateTimes(model.DSKs, (i) => ({
		id: i,
		label: `${i + 1}`,
	}))
}

export function GetMultiviewerIdChoices(model: ModelSpec): DropdownChoice[] {
	return iterateTimes(model.MVs, (i) => ({
		id: i,
		label: `MV ${i + 1}`,
	}))
}

export function GetSuperSourceIdChoices(model: ModelSpec): DropdownChoice[] {
	return iterateTimes(model.SSrc, (i) => ({
		id: i,
		label: `Super Source ${i + 1}`,
	}))
}

export function GetMacroChoices(model: ModelSpec, state: AtemState): DropdownChoice[] {
	return iterateTimes(model.macros, (i) => {
		const macro = state.macro.macroProperties[i]
		return {
			id: i + 1,
			label: (macro?.isUsed ? `${macro.name} (#${i + 1})` : undefined) || `Macro ${i + 1}`,
		}
	})
}
export function GetMediaPlayerChoices(model: ModelSpec): DropdownChoice[] {
	return iterateTimes(model.media.players, (i) => {
		return {
			id: i,
			label: `Media Player ${i + 1}`,
		}
	})
}

export interface MiniSourceInfo {
	id: number
	longName: string
}
export interface SourceInfo extends MiniSourceInfo {
	shortName: string
	portType: Enums.InternalPortType
}
export function GetSourcesListForType(
	model: ModelSpec,
	state: AtemState,
	subset?: 'me' | 'aux' | 'mv' | 'key' | 'ssrc-box' | 'ssrc-art' | 'tally',
): SourceInfo[] {
	const getSource = (id: number, portType: Enums.InternalPortType, defShort: string, defLong: string): SourceInfo => {
		const input = state.inputs[id]
		const shortName = input?.shortName || defShort
		const longName = input?.longName || defLong

		return {
			id,
			shortName,
			longName,
			portType,
		}
	}

	const sources: SourceInfo[] = []
	for (const input of model.inputs) {
		switch (subset) {
			case undefined:
				break
			case 'me':
				if (input.meAvailability === Enums.MeAvailability.None) continue
				break
			case 'aux':
				if ((input.sourceAvailability & Enums.SourceAvailability.Auxiliary) === 0) continue
				break
			case 'mv':
				if ((input.sourceAvailability & Enums.SourceAvailability.Multiviewer) === 0) continue
				break
			case 'key':
				if ((input.sourceAvailability & Enums.SourceAvailability.KeySource) === 0) continue
				break
			case 'ssrc-box':
				if ((input.sourceAvailability & Enums.SourceAvailability.SuperSourceBox) === 0) continue
				break
			case 'ssrc-art':
				if ((input.sourceAvailability & Enums.SourceAvailability.SuperSourceArt) === 0) continue
				break
			case 'tally':
				// if (input.portType === Enums.InternalPortType.Auxiliary) break // TODO: Future
				if (input.portType === Enums.InternalPortType.MEOutput && input.id > 8000) break
				continue
			default:
				assertUnreachable(subset)
				break
		}

		switch (input.portType) {
			case Enums.InternalPortType.External:
				sources.push(getSource(input.id, input.portType, `In ${input.id}`, `Input ${input.id}`))
				break
			case Enums.InternalPortType.ColorBars:
				sources.push(getSource(input.id, input.portType, 'Bars', 'Bars'))
				break
			case Enums.InternalPortType.ColorGenerator: {
				const colId = input.id - 2000
				sources.push(getSource(input.id, input.portType, `Col${colId}`, `Color ${colId}`))
				break
			}
			case Enums.InternalPortType.MediaPlayerFill: {
				const mpId = (input.id - 3000) / 10
				sources.push(getSource(input.id, input.portType, `MP ${mpId}`, `Media Player ${mpId}`))
				break
			}
			case Enums.InternalPortType.MediaPlayerKey: {
				const mpId = (input.id - 3000 - 1) / 10
				sources.push(getSource(input.id, input.portType, `MP${mpId}K`, `Media Player ${mpId} Key`))
				break
			}
			case Enums.InternalPortType.SuperSource: {
				const ssrcId = input.id - 6000 + 1
				sources.push(getSource(input.id, input.portType, `SSc${ssrcId}`, `Super Source ${ssrcId}`))
				break
			}
			case Enums.InternalPortType.ExternalDirect: {
				const inputId = input.id - 11000
				sources.push(getSource(input.id, input.portType, `In${inputId}D`, `Input ${inputId} - Direct`))
				break
			}
			case Enums.InternalPortType.MEOutput: {
				if (input.id < 8000) {
					const clnId = input.id - 7000
					sources.push(getSource(input.id, input.portType, `Cln${clnId}`, `Clean Feed ${clnId}`))
				} else if (input.id % 2 === 1) {
					const meId = (input.id - 10000 - 1) / 10
					sources.push(getSource(input.id, input.portType, `M${meId}PV`, `ME ${meId} Preview`))
				} else {
					const meId = (input.id - 10000) / 10
					sources.push(getSource(input.id, input.portType, `M${meId}PG`, `ME ${meId} Program`))
				}
				break
			}
			case Enums.InternalPortType.Auxiliary: {
				const auxId = input.id - 8000
				sources.push(getSource(input.id, input.portType, `Aux${auxId}`, `Auxiliary ${auxId}`))
				break
			}
			case Enums.InternalPortType.Mask: {
				// TODO
				// const maskId = input.id - 0
				// sources.push(getSource(input.id, `MK${maskId}`, `Key Mask ${maskId}`))
				break
			}
			case Enums.InternalPortType.MultiViewer: {
				const mvId = input.id - 9000
				sources.push(getSource(input.id, input.portType, `MV ${mvId}`, `MultiView ${mvId}`))
				break
			}
			case Enums.InternalPortType.Black:
				sources.push(getSource(input.id, input.portType, 'Blk', 'Black'))
				break
			default:
				assertUnreachable(input.portType)
				break
		}
	}

	sources.sort((a, b) => a.id - b.id)
	return sources
}

export type AudioInputSubset = 'delay' | 'routing'

export function GetAudioInputsList(model: ModelSpec, state: AtemState, subset?: AudioInputSubset): MiniSourceInfo[] {
	const getSource = (id: number, videoId: number | undefined, defLong: string): MiniSourceInfo => {
		const input = videoId !== undefined ? state.inputs[videoId] : undefined
		const longName = input?.longName || defLong

		return {
			id,
			longName,
		}
	}

	const sources: MiniSourceInfo[] = []
	for (const input of model.classicAudio?.inputs ?? model.fairlightAudio?.inputs ?? []) {
		if (subset === 'delay' && (!('maxDelay' in input) || !input.maxDelay)) continue
		if (subset !== 'routing' && 'routingOnly' in input && input.routingOnly) continue

		switch (input.portType) {
			case Enums.ExternalPortType.Unknown:
			case Enums.ExternalPortType.Component:
			case Enums.ExternalPortType.Composite:
			case Enums.ExternalPortType.SVideo:
				// No audio on these
				break
			case Enums.ExternalPortType.SDI:
			case Enums.ExternalPortType.HDMI:
				sources.push(getSource(input.id, input.id, `Input ${input.id}`))
				break
			case Enums.ExternalPortType.XLR:
				sources.push(getSource(input.id, undefined, `XLR`))
				break
			case Enums.ExternalPortType.AESEBU:
				sources.push(getSource(input.id, undefined, `AES/EBU`))
				break
			case Enums.ExternalPortType.RCA:
				sources.push(getSource(input.id, undefined, `RCA`))
				break
			case Enums.ExternalPortType.Internal: {
				const mpId = input.id - 2000
				sources.push(getSource(input.id, 3000 + mpId * 10, `Media Player ${mpId}`))
				break
			}
			case Enums.ExternalPortType.TSJack: {
				const micId = input.id - 1300
				sources.push(getSource(input.id, undefined, `Mic ${micId}`))
				break
			}
			case Enums.ExternalPortType.MADI: {
				const channelId = input.id - 1500
				sources.push(getSource(input.id, undefined, `MADI ${channelId}`))
				break
			}
			case Enums.ExternalPortType.TRSJack:
				sources.push(getSource(input.id, undefined, `TRS`))
				break
			case Enums.ExternalPortType.RJ45:
				sources.push(getSource(input.id, undefined, 'RJ45'))
				break
			default:
				assertUnreachable(input.portType)
				break
		}
	}

	sources.sort((a, b) => a.id - b.id)
	return sources
}

export function SourcesToChoices(sources: MiniSourceInfo[]): DropdownChoice[] {
	return sources.map((s) => ({
		id: s.id,
		label: s.longName,
	}))
}

export function CameraControlSourcePicker(): CompanionInputFieldTextInput {
	return {
		id: 'cameraId',
		type: 'textinput',
		useVariables: true,
		default: '1',
		label: 'Camera Id',
	}
}

export const AudioRoutingChannelsNames: { [key in AudioChannelPair]: string } = {
	[AudioChannelPair.Channel1_2]: `1/2`,
	[AudioChannelPair.Channel3_4]: `3/4`,
	[AudioChannelPair.Channel5_6]: `5/6`,
	[AudioChannelPair.Channel7_8]: `7/8`,
	[AudioChannelPair.Channel9_10]: `9/10`,
	[AudioChannelPair.Channel11_12]: `11/12`,
	[AudioChannelPair.Channel13_14]: `13/14`,
	[AudioChannelPair.Channel15_16]: `15/16`,
} as const

export function FairlightAudioRoutingSources(model: ModelSpec, state: AtemState): DropdownChoice[] {
	const sources: DropdownChoice[] = []

	const stateSources = state.fairlight?.audioRouting?.sources ?? {}
	for (const source of model.fairlightAudio?.audioRouting?.sources ?? []) {
		for (const pair of source.channelPairs) {
			const combinedId = combineInputId(source.inputId, pair)

			sources.push({
				id: combinedId,
				label: compileAudioName(source.sourceName, stateSources[combinedId]?.name, pair, source.channelPairs),
			})
		}
	}

	return sources
}

export function FairlightAudioRoutingDestinations(model: ModelSpec, state: AtemState): DropdownChoice[] {
	const sources: DropdownChoice[] = []

	const stateOutputs = state.fairlight?.audioRouting?.outputs ?? {}
	for (const output of model.fairlightAudio?.audioRouting?.outputs ?? []) {
		for (const pair of output.channelPairs) {
			const combinedId = combineInputId(output.outputId, pair)

			sources.push({
				id: combinedId,
				label: compileAudioName(output.outputName, stateOutputs[combinedId]?.name, pair, output.channelPairs),
			})
		}
	}

	return sources
}

function compileAudioName(
	defaultName: string,
	currentName: string | undefined,
	pair: Enums.AudioChannelPair,
	allPairs: Enums.AudioChannelPair[],
) {
	let name = currentName ?? defaultName

	if (allPairs.length !== 1 || pair !== Enums.AudioChannelPair.Channel1_2) {
		const pairName = AudioRoutingChannelsNames[pair]
		name = `${name} ${pairName}`
	}

	if (currentName && defaultName) {
		name = `${currentName} (${defaultName})`
	}

	return name
}
