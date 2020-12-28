import { AtemState, Enums } from 'atem-connection'
import { DropdownChoice } from '../../../instance_skel_types'
import { ModelSpec } from './models'
import { iterateTimes, literal, assertUnreachable } from './util'

export const CHOICES_SSRCBOXES: DropdownChoice[] = [
	{ id: 0, label: 'Box 1' },
	{ id: 1, label: 'Box 2' },
	{ id: 2, label: 'Box 3' },
	{ id: 3, label: 'Box 4' },
]

export const CHOICES_ON_OFF_TOGGLE: DropdownChoice[] = [
	{ id: 'true', label: 'On' },
	{ id: 'false', label: 'Off' },
	{ id: 'toggle', label: 'Toggle' },
]

export const CHOICES_KEYTRANS: DropdownChoice[] = [
	{ id: 'true', label: 'On Air' },
	{ id: 'false', label: 'Off' },
	{ id: 'toggle', label: 'Toggle' },
]

export const CHOICES_CLASSIC_AUDIO_MIX_OPTION: DropdownChoice[] = [
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

export const CHOICES_FAIRLIGHT_AUDIO_MIX_OPTION: DropdownChoice[] = [
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

export function GetTransitionStyleChoices(skipSting?: boolean): DropdownChoice[] {
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

export function GetMEIdChoices(model: ModelSpec): DropdownChoice[] {
	return iterateTimes(model.MEs, (i) => ({
		id: i,
		label: `M/E ${i + 1}`,
	}))
}

export function GetAuxIdChoices(model: ModelSpec): DropdownChoice[] {
	return iterateTimes(model.auxes, (i) => ({
		id: i,
		label: `${i + 1}`,
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
}
export function GetSourcesListForType(
	model: ModelSpec,
	state: AtemState,
	subset?: 'me' | 'aux' | 'mv' | 'key' | 'ssrc-box' | 'ssrc-art'
): SourceInfo[] {
	const getSource = (id: number, defShort: string, defLong: string): SourceInfo => {
		const input = state.inputs[id]
		const shortName = input?.shortName || defShort
		const longName = input?.longName || defLong

		return literal<SourceInfo>({
			id,
			shortName,
			longName,
		})
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
			default:
				assertUnreachable(subset)
				break
		}

		switch (input.portType) {
			case Enums.InternalPortType.External:
				sources.push(getSource(input.id, `In ${input.id}`, `Input ${input.id}`))
				break
			case Enums.InternalPortType.ColorBars:
				sources.push(getSource(input.id, 'Bars', 'Bars'))
				break
			case Enums.InternalPortType.ColorGenerator: {
				const colId = input.id - 2000
				sources.push(getSource(input.id, `Col${colId}`, `Color ${colId}`))
				break
			}
			case Enums.InternalPortType.MediaPlayerFill: {
				const mpId = (input.id - 3000) / 10
				sources.push(getSource(input.id, `MP ${mpId}`, `Media Player ${mpId}`))
				break
			}
			case Enums.InternalPortType.MediaPlayerKey: {
				const mpId = (input.id - 3000 - 1) / 10
				sources.push(getSource(input.id, `MP${mpId}K`, `Media Player ${mpId} Key`))
				break
			}
			case Enums.InternalPortType.SuperSource: {
				const ssrcId = input.id - 6000 + 1
				sources.push(getSource(input.id, `SSc${ssrcId}`, `Super Source ${ssrcId}`))
				break
			}
			case Enums.InternalPortType.ExternalDirect: {
				const inputId = input.id - 11000
				sources.push(getSource(input.id, `In${inputId}D`, `Input ${inputId} - Direct`))
				break
			}
			case Enums.InternalPortType.MEOutput: {
				if (input.id < 8000) {
					const clnId = input.id - 7000
					sources.push(getSource(input.id, `Cln${clnId}`, `Clean Feed ${clnId}`))
				} else if (input.id % 2 === 1) {
					const meId = (input.id - 10000 - 1) / 10
					sources.push(getSource(input.id, `M${meId}PV`, `ME ${meId} Preview`))
				} else {
					const meId = (input.id - 10000) / 10
					sources.push(getSource(input.id, `M${meId}PG`, `ME ${meId} Program`))
				}
				break
			}
			case Enums.InternalPortType.Auxiliary: {
				const auxId = input.id - 8000
				sources.push(getSource(input.id, `Aux${auxId}`, `Auxiliary ${auxId}`))
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
				sources.push(getSource(input.id, `MV ${mvId}`, `MultiView ${mvId}`))
				break
			}
			case Enums.InternalPortType.Black:
				sources.push(getSource(input.id, 'Blk', 'Black'))
				break
			default:
				assertUnreachable(input.portType)
				break
		}
	}

	sources.sort((a, b) => a.id - b.id)
	return sources
}

export function GetAudioInputsList(model: ModelSpec, state: AtemState): MiniSourceInfo[] {
	const getSource = (id: number, videoId: number | undefined, defLong: string): MiniSourceInfo => {
		const input = videoId !== undefined ? state.inputs[videoId] : undefined
		const longName = input?.longName || defLong

		return literal<MiniSourceInfo>({
			id,
			longName,
		})
	}

	const sources: MiniSourceInfo[] = []
	for (const input of model.classicAudio?.inputs ?? model.fairlightAudio?.inputs ?? []) {
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
			case Enums.ExternalPortType.MADI:
				break
			case Enums.ExternalPortType.TRSJack:
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
