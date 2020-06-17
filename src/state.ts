import { AtemState, Commands } from 'atem-connection'
import { InputValue } from '../../../instance_skel_types'
import { SuperSourceBox, TransitionProperties } from 'atem-connection/dist/state/video'
import { MultiViewerWindowState } from 'atem-connection/dist/state/settings'

// TODO - these should be exported more cleanly from atem-connection
type MixEffect = AtemState['video']['ME'][0]
type UpstreamKeyer = MixEffect['upstreamKeyers'][0]
type DownstreamKeyer = AtemState['video']['downstreamKeyers'][0]
type MultiViewer = AtemState['settings']['multiViewers'][0]
export type TallyBySource = Commands.TallyBySourceCommand['properties']

export function getME(state: AtemState, meIndex: InputValue | undefined): MixEffect | undefined {
  return state.video.ME[Number(meIndex)]
}
export function getTransitionProperties(
  state: AtemState,
  meIndex: InputValue | undefined
): TransitionProperties | undefined {
  const me = getME(state, meIndex)
  return me ? me.transitionProperties : undefined
}
export function getUSK(
  state: AtemState,
  meIndex: InputValue | undefined,
  keyIndex: InputValue | undefined
): UpstreamKeyer | undefined {
  const me = getME(state, meIndex)
  return me ? me.upstreamKeyers[Number(keyIndex)] : undefined
}
export function getDSK(state: AtemState, keyIndex: InputValue | undefined): DownstreamKeyer | undefined {
  return state.video.downstreamKeyers[Number(keyIndex)]
}
export function getSuperSourceBox(
  state: AtemState,
  boxIndex: InputValue | undefined,
  ssrcId?: InputValue | undefined
): SuperSourceBox | undefined {
  const ssrc = state.video.superSources[Number(ssrcId || 0)]
  return ssrc ? ssrc.boxes[Number(boxIndex)] : undefined
}
export function getMultiviewer(state: AtemState, index: InputValue | undefined): MultiViewer | undefined {
  return state.settings.multiViewers[Number(index)]
}
export function getMultiviewerWindow(
  state: AtemState,
  mvIndex: InputValue | undefined,
  windowIndex: InputValue | undefined
): MultiViewerWindowState | undefined {
  const mv = getMultiviewer(state, mvIndex)
  return mv ? mv.windows[Number(windowIndex)] : undefined
}
