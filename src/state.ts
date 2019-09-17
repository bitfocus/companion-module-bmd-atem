import { AtemState } from 'atem-connection'

// TODO - these should be exported more cleanly from atem-connection
type MixEffect = AtemState['video']['ME'][0]
type UpstreamKeyer = MixEffect['upstreamKeyers'][0]
type DownstreamKeyer = AtemState['video']['downstreamKeyers'][0]
type MultiViewer = AtemState['settings']['multiViewers'][0]

export function getME(state: AtemState, meIndex: number | string): MixEffect | undefined {
  return state.video.ME[meIndex]
}
export function getUSK(
  state: AtemState,
  meIndex: number | string,
  keyIndex: number | string
): UpstreamKeyer | undefined {
  const me = getME(state, meIndex)
  return me ? me.upstreamKeyers[keyIndex] : undefined
}
export function getDSK(state: AtemState, keyIndex: number | string): DownstreamKeyer | undefined {
  return state.video.downstreamKeyers[keyIndex]
}
export function getSuperSourceBox(state: AtemState, boxIndex: number | string, ssrcId?: number | string) {
  const ssrc = state.video.superSources[ssrcId || 0]
  return ssrc ? ssrc.boxes[boxIndex] : undefined
}
export function getMultiviewer(state: AtemState, index: number | string): MultiViewer | undefined {
  return state.settings.multiViewers[index]
}
export function getMultiviewerWindow(state: AtemState, mvIndex: number | string, windowIndex: number | string) {
  const mv = getMultiviewer(state, mvIndex)
  return mv ? mv.windows[windowIndex] : undefined
}
