import type {
	AtemState,
	Commands,
	SettingsState,
	VideoState,
	MediaState,
	Fairlight,
	ClassicAudio,
} from 'atem-connection'
import type { SuperSource, TransitionProperties } from 'atem-connection/dist/state/video/index.js'
import type { InputValue } from '@companion-module/base'

export type TallyBySource = Commands.TallyBySourceCommand['properties']

export type TallyCache = Map<
	number, // InputId of the mix/output
	{
		lastVisibleInputs: number[]
		referencedFeedbackIds: Set<string>
	}
>

export function getMixEffect(state: AtemState, meIndex: InputValue | undefined): VideoState.MixEffect | undefined {
	return state.video.mixEffects[Number(meIndex)]
}
export function getTransitionProperties(
	state: AtemState,
	meIndex: InputValue | undefined
): TransitionProperties | undefined {
	const me = getMixEffect(state, meIndex)
	return me ? me.transitionProperties : undefined
}
export function getUSK(
	state: AtemState,
	meIndex: InputValue | undefined,
	keyIndex: InputValue | undefined
): VideoState.USK.UpstreamKeyer | undefined {
	const me = getMixEffect(state, meIndex)
	return me ? me.upstreamKeyers[Number(keyIndex)] : undefined
}
export function getDSK(state: AtemState, keyIndex: InputValue | undefined): VideoState.DSK.DownstreamKeyer | undefined {
	return state.video.downstreamKeyers[Number(keyIndex)]
}
export function getSuperSourceBox(
	state: AtemState,
	boxIndex: InputValue | undefined,
	ssrcId?: InputValue | undefined
): SuperSource.SuperSourceBox | undefined {
	const ssrc = state.video.superSources[Number(ssrcId ?? 0)]
	return ssrc ? ssrc.boxes[Number(boxIndex)] : undefined
}
export function getMultiviewer(state: AtemState, index: InputValue | undefined): SettingsState.MultiViewer | undefined {
	return state.settings.multiViewers[Number(index)]
}
export function getMultiviewerWindow(
	state: AtemState,
	mvIndex: InputValue | undefined,
	windowIndex: InputValue | undefined
): SettingsState.MultiViewerWindowState | undefined {
	const mv = getMultiviewer(state, mvIndex)
	return mv ? mv.windows[Number(windowIndex)] : undefined
}
export function getMediaPlayer(state: AtemState, index: number): MediaState.MediaPlayerState | undefined {
	return state.media.players[index]
}

export function getFairlightAudioInput(state: AtemState, index: number): Fairlight.FairlightAudioInput | undefined {
	return state.fairlight?.inputs[index]
}

export function getClassicAudioInput(state: AtemState, index: number): ClassicAudio.ClassicAudioChannel | undefined {
	return state.audio?.channels[index]
}
