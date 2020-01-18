import { AtemState, Commands, SettingsState, VideoState } from 'atem-connection'
import { InputValue } from '../../../instance_skel_types'

export type TallyBySource = Commands.TallyBySourceCommand['properties']

export function getMixEffect(state: AtemState, meIndex: InputValue | undefined): VideoState.MixEffect | undefined {
  return state.video.mixEffects[Number(meIndex)]
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
export function getSuperSourceBox(state: AtemState, boxIndex: InputValue | undefined, ssrcId?: InputValue | undefined) {
  const ssrc = state.video.superSources[Number(ssrcId || 0)]
  return ssrc ? ssrc.boxes[Number(boxIndex)] : undefined
}
export function getMultiviewer(state: AtemState, index: InputValue | undefined): SettingsState.MultiViewer | undefined {
  return state.settings.multiViewers[Number(index)]
}
export function getMultiviewerWindow(
  state: AtemState,
  mvIndex: InputValue | undefined,
  windowIndex: InputValue | undefined
) {
  const mv = getMultiviewer(state, mvIndex)
  return mv ? mv.windows[Number(windowIndex)] : undefined
}
