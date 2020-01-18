import { AtemState } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionVariable } from '../../../instance_skel_types'
import { GetSourcesListForType, SourceInfo } from './choices'
import { AtemConfig, PresetStyleName } from './config'
import { ModelSpec } from './models'
import { getDSK, getMixEffect, getUSK } from './state'

function getSourcePresetName(instance: InstanceSkel<AtemConfig>, state: AtemState, id: number) {
  const input = state.inputs[id]
  if (input) {
    return instance.config.presets === PresetStyleName.Long + '' ? input.longName : input.shortName
  } else if (id === 0) {
    return 'Black'
  } else if (id === undefined) {
    return 'Unknown'
  } else {
    return `Unknown input (${id})`
  }
}

export function updateMEProgramVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, meIndex: number) {
  const input = getMixEffect(state, meIndex)?.programInput ?? 0
  instance.setVariable(`pgm${meIndex + 1}_input`, getSourcePresetName(instance, state, input))
}
export function updateMEPreviewVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, meIndex: number) {
  const input = getMixEffect(state, meIndex)?.previewInput ?? 0
  instance.setVariable(`pvw${meIndex + 1}_input`, getSourcePresetName(instance, state, input))
}

export function updateUSKVariable(
  instance: InstanceSkel<AtemConfig>,
  state: AtemState,
  meIndex: number,
  keyIndex: number
) {
  const input = getUSK(state, meIndex, keyIndex)?.fillSource ?? 0
  instance.setVariable(`usk_${meIndex + 1}_${keyIndex + 1}_input`, getSourcePresetName(instance, state, input))
}
export function updateDSKVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, keyIndex: number) {
  const input = getDSK(state, keyIndex)?.sources?.fillSource ?? 0
  instance.setVariable(`dsk_${keyIndex + 1}_input`, getSourcePresetName(instance, state, input))
}

export function updateAuxVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, auxIndex: number) {
  const input = state.video.auxilliaries[auxIndex] ?? 0
  instance.setVariable(`aux${auxIndex + 1}_input`, getSourcePresetName(instance, state, input))
}

export function updateMacroVariable(instance: InstanceSkel<AtemConfig>, state: AtemState, id: number) {
  const macro = state.macro.macroProperties[id]
  instance.setVariable(`macro_${id + 1}`, (macro ? macro.description || macro.name : '') || `Macro ${id + 1}`)
}

function updateInputVariables(instance: InstanceSkel<AtemConfig>, src: SourceInfo) {
  instance.setVariable(`long_${src.id}`, src.longName)
  instance.setVariable(`short_${src.id}`, src.shortName)
}

export function InitVariables(instance: InstanceSkel<AtemConfig>, model: ModelSpec, state: AtemState) {
  const variables: CompanionVariable[] = []

  // PGM/PV busses
  for (let i = 0; i < model.MEs; ++i) {
    variables.push({
      label: `Label of input active on program bus (M/E ${i + 1})`,
      name: `pgm${i + 1}_input`
    })
    updateMEProgramVariable(instance, state, i)

    variables.push({
      label: `Label of input active on preview bus (M/E ${i + 1})`,
      name: `pvw${i + 1}_input`
    })
    updateMEPreviewVariable(instance, state, i)

    for (let k = 0; k < model.USKs; ++k) {
      variables.push({
        label: `Label of input active on M/E ${i + 1} Key ${k + 1}`,
        name: `usk_${i + 1}_${k + 1}_input`
      })

      updateUSKVariable(instance, state, i, k)
    }
  }

  // Auxs
  for (let a = 0; a < model.auxes; ++a) {
    variables.push({
      label: `Label of input active on Aux ${a + 1}`,
      name: `aux${a + 1}_input`
    })

    updateAuxVariable(instance, state, a)
  }

  // DSKs
  for (let k = 0; k < model.DSKs; ++k) {
    variables.push({
      label: `Label of input active on DSK ${k + 1}`,
      name: `dsk_${k + 1}_input`
    })

    updateDSKVariable(instance, state, k)
  }

  // Source names
  for (const src of GetSourcesListForType(model, state)) {
    variables.push({
      label: `Long name of source id ${src.id}`,
      name: `long_${src.id}`
    })
    variables.push({
      label: `Short name of source id ${src.id}`,
      name: `short_${src.id}`
    })

    updateInputVariables(instance, src)
  }

  // Macros
  for (let i = 0; i < model.macros; i++) {
    variables.push({
      label: `Name of macro #${i + 1}`,
      name: `macro_${i + 1}`
    })

    updateMacroVariable(instance, state, i)
  }

  instance.setVariableDefinitions(variables)
}
