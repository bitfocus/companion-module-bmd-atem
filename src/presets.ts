import { AtemState } from 'atem-connection'
import InstanceSkel = require('../../../instance_skel')
import { CompanionPreset } from '../../../instance_skel_types'
import { ActionId } from './actions'
import { GetSourcesListForType, GetTransitionStyleChoices } from './choices'
import { AtemConfig, PresetStyleName } from './config'
import { FeedbackId, MacroFeedbackType } from './feedback'
import { ModelSpec } from './models'
import { calculateTransitionSelection } from './util'

interface CompanionPresetExt extends CompanionPreset {
  feedbacks: Array<
    {
      type: FeedbackId
    } & CompanionPreset['feedbacks'][0]
  >
  actions: Array<
    {
      action: ActionId
    } & CompanionPreset['actions'][0]
  >
}

function getTransitionSelectionOptions(keyCount: number): boolean[][] {
  let res: boolean[][] = []
  res.push([true])
  res.push([false])

  for (let i = 0; i < keyCount; i++) {
    const tmp: boolean[][] = []
    for (const r of res) {
      tmp.push([...r, false])
      tmp.push([...r, true])
    }
    res = tmp
  }

  return res
}

export function GetPresetsList(
  instance: InstanceSkel<AtemConfig>,
  model: ModelSpec,
  state: AtemState
): CompanionPreset[] {
  const presets: CompanionPresetExt[] = []

  const pstText = instance.config.presets === PresetStyleName.Long + '' ? 'long_' : 'short_'
  const pstSize = instance.config.presets === PresetStyleName.Long + '' ? 'auto' : '18'

  const meSources = GetSourcesListForType(model, state, 'me')

  for (let me = 0; me < model.MEs; ++me) {
    for (const src of meSources) {
      presets.push({
        category: `Preview (M/E ${me + 1})`,
        label: `Preview button for ${src.shortName}`,
        bank: {
          style: 'text',
          text: `$(atem:${pstText}${src.id})`,
          size: pstSize,
          color: instance.rgb(255, 255, 255),
          bgcolor: instance.rgb(0, 0, 0)
        },
        feedbacks: [
          {
            type: FeedbackId.PreviewBG,
            options: {
              bg: instance.rgb(0, 255, 0),
              fg: instance.rgb(255, 255, 255),
              input: src.id,
              mixeffect: me
            }
          }
        ],
        actions: [
          {
            action: ActionId.Preview,
            options: {
              mixeffect: me,
              input: src.id
            }
          }
        ]
      })

      presets.push({
        category: `Program (M/E ${me + 1})`,
        label: `Program button for ${src.shortName}`,
        bank: {
          style: 'text',
          text: `$(atem:${pstText}${src.id})`,
          size: pstSize,
          color: instance.rgb(255, 255, 255),
          bgcolor: instance.rgb(0, 0, 0)
        },
        feedbacks: [
          {
            type: FeedbackId.ProgramBG,
            options: {
              bg: instance.rgb(255, 0, 0),
              fg: instance.rgb(255, 255, 255),
              input: src.id,
              mixeffect: me
            }
          }
        ],
        actions: [
          {
            action: ActionId.Program,
            options: {
              mixeffect: me,
              input: src.id
            }
          }
        ]
      })
    }
  }

  for (let me = 0; me < model.MEs; ++me) {
    for (const opt of GetTransitionStyleChoices()) {
      presets.push({
        category: `Transitions (M/E ${me + 1})`,
        label: `Transition style ${opt.label}`,
        bank: {
          style: 'text',
          text: opt.label,
          size: pstSize,
          color: instance.rgb(255, 255, 255),
          bgcolor: instance.rgb(0, 0, 0)
        },
        feedbacks: [
          {
            type: FeedbackId.TransitionStyle,
            options: {
              bg: instance.rgb(255, 255, 0),
              fg: instance.rgb(255, 255, 255),
              mixeffect: me,
              style: opt.id
            }
          }
        ],
        actions: [
          {
            action: ActionId.TransitionStyle,
            options: {
              mixeffect: me,
              style: opt.id
            }
          }
        ]
      })
    }

    const rateOptions = [12, 15, 25, 30, 37, 45, 50, 60]
    for (const opt of GetTransitionStyleChoices(true)) {
      for (const rate of rateOptions) {
        presets.push({
          category: `Transitions (M/E ${me + 1})`,
          label: `Transition ${opt.label} rate ${rate}`,
          bank: {
            style: 'text',
            text: `${opt.label} ${rate}`,
            size: pstSize,
            color: instance.rgb(255, 255, 255),
            bgcolor: instance.rgb(0, 0, 0)
          },
          feedbacks: [
            {
              type: FeedbackId.TransitionRate,
              options: {
                bg: instance.rgb(255, 255, 0),
                fg: instance.rgb(255, 255, 255),
                mixeffect: me,
                style: opt.id,
                rate
              }
            }
          ],
          actions: [
            {
              action: ActionId.TransitionRate,
              options: {
                mixeffect: me,
                style: opt.id,
                rate
              }
            }
          ]
        })
      }
    }

    for (const opt of getTransitionSelectionOptions(model.USKs)) {
      const transitionStringParts = opt[0] ? ['BG'] : []
      const selectionProps: any = {
        background: opt[0]
      }
      for (let i = 0; i < model.USKs; i++) {
        if (opt[i + 1]) {
          transitionStringParts.push(`K${i + 1}`)
        }
        selectionProps[`key${i}`] = opt[i + 1]
      }

      if (calculateTransitionSelection(model.USKs, selectionProps) === 0) {
        // The 0 case is not supported on the atem
        continue
      }

      const transitionString = transitionStringParts.join(' & ')

      presets.push({
        category: `Transitions (M/E ${me + 1})`,
        label: `Transition Selection ${transitionString.trim()}`,
        bank: {
          style: 'text',
          text: transitionString.trim(),
          size: pstSize,
          color: instance.rgb(255, 255, 255),
          bgcolor: instance.rgb(0, 0, 0)
        },
        feedbacks: [
          {
            type: FeedbackId.TransitionSelection,
            options: {
              bg: instance.rgb(255, 255, 0),
              fg: instance.rgb(255, 255, 255),
              mixeffect: me,
              ...selectionProps
            }
          }
        ],
        actions: [
          {
            action: ActionId.TransitionSelection,
            options: {
              mixeffect: me,
              ...selectionProps
            }
          }
        ]
      })
    }
  }

  for (let aux = 0; aux < model.auxes; ++aux) {
    for (const src of GetSourcesListForType(model, state, 'aux')) {
      presets.push({
        category: `AUX ${aux + 1}`,
        label: `AUX ${aux + 1} button for ${src.shortName}`,
        bank: {
          style: 'text',
          text: `$(atem:${pstText}${src.id})`,
          size: pstSize,
          color: instance.rgb(255, 255, 255),
          bgcolor: instance.rgb(0, 0, 0)
        },
        feedbacks: [
          {
            type: FeedbackId.AuxBG,
            options: {
              bg: instance.rgb(255, 255, 0),
              fg: instance.rgb(0, 0, 0),
              input: src.id,
              aux
            }
          }
        ],
        actions: [
          {
            action: ActionId.Aux,
            options: {
              aux,
              input: src.id
            }
          }
        ]
      })
    }
  }

  // Upstream keyers
  for (let me = 0; me < model.MEs; ++me) {
    for (let key = 0; key < model.USKs; ++key) {
      presets.push({
        category: 'KEYs',
        label: `Toggle upstream M/E ${me + 1} KEY ${key + 1}`,
        bank: {
          style: 'text',
          text: 'KEY ' + (key + 1),
          size: '24',
          color: instance.rgb(255, 255, 255),
          bgcolor: instance.rgb(0, 0, 0)
        },
        feedbacks: [
          {
            type: FeedbackId.USKBG,
            options: {
              bg: instance.rgb(255, 0, 0),
              fg: instance.rgb(255, 255, 255),
              key,
              mixeffect: me
            }
          }
        ],
        actions: [
          {
            action: ActionId.USKOnAir,
            options: {
              onair: 'toggle',
              key,
              mixeffect: me
            }
          }
        ]
      })

      for (const src of meSources) {
        presets.push({
          category: `M/E ${me + 1} Key ${key + 1}`,
          label: `M/E ${me + 1} KEY ${key + 1} source ${src.shortName}`,
          bank: {
            style: 'text',
            text: `$(atem:${pstText}${src.id})`,
            size: pstSize,
            color: instance.rgb(255, 255, 255),
            bgcolor: instance.rgb(0, 0, 0)
          },
          feedbacks: [
            {
              type: FeedbackId.USKSource,
              options: {
                bg: instance.rgb(238, 238, 0),
                fg: instance.rgb(0, 0, 0),
                fill: src.id,
                key,
                mixeffect: me
              }
            }
          ],
          actions: [
            {
              action: ActionId.USKSource,
              options: {
                fill: src.id,
                cut: src.id + 1,
                key,
                mixeffect: me
              }
            }
          ]
        })
      }
    }
  }

  // Downstream keyers
  for (let dsk = 0; dsk < model.DSKs; ++dsk) {
    presets.push({
      category: 'KEYs',
      label: `Toggle downstream KEY ${dsk + 1}`,
      bank: {
        style: 'text',
        text: `DSK ${dsk + 1}`,
        size: '24',
        color: instance.rgb(255, 255, 255),
        bgcolor: instance.rgb(0, 0, 0)
      },
      feedbacks: [
        {
          type: FeedbackId.DSKBG,
          options: {
            bg: instance.rgb(255, 0, 0),
            fg: instance.rgb(255, 255, 255),
            key: dsk
          }
        }
      ],
      actions: [
        {
          action: ActionId.DSKOnAir,
          options: {
            onair: 'toggle',
            key: dsk
          }
        }
      ]
    })

    for (const src of meSources) {
      presets.push({
        category: `DSK ${dsk + 1}`,
        label: `DSK ${dsk + 1} source ${src.shortName}`,
        bank: {
          style: 'text',
          text: `$(atem:${pstText}${src.id})`,
          size: pstSize,
          color: instance.rgb(255, 255, 255),
          bgcolor: instance.rgb(0, 0, 0)
        },
        feedbacks: [
          {
            type: FeedbackId.DSKSource,
            options: {
              bg: instance.rgb(238, 238, 0),
              fg: instance.rgb(0, 0, 0),
              fill: src.id,
              key: dsk
            }
          }
        ],
        actions: [
          {
            action: ActionId.DSKSource,
            options: {
              fill: src.id,
              cut: src.id + 1,
              key: dsk
            }
          }
        ]
      })
    }
  }

  // Macros
  for (let macro = 0; macro < model.macros; macro++) {
    presets.push({
      category: 'MACROS',
      label: `Run button for macro ${macro + 1}`,
      bank: {
        style: 'text',
        text: `$(atem:macro_${macro + 1})`,
        size: 'auto',
        color: instance.rgb(255, 255, 255),
        bgcolor: instance.rgb(0, 0, 0)
      },
      feedbacks: [
        {
          type: FeedbackId.Macro,
          options: {
            bg: instance.rgb(0, 0, 238),
            fg: instance.rgb(255, 255, 255),
            macroIndex: macro + 1,
            state: MacroFeedbackType.IsUsed
          }
        },
        {
          type: FeedbackId.Macro,
          options: {
            bg: instance.rgb(0, 238, 0),
            fg: instance.rgb(255, 255, 255),
            macroIndex: macro + 1,
            state: MacroFeedbackType.IsRunning
          }
        },
        {
          type: FeedbackId.Macro,
          options: {
            bg: instance.rgb(238, 238, 0),
            fg: instance.rgb(255, 255, 255),
            macroIndex: macro + 1,
            state: MacroFeedbackType.IsWaiting
          }
        },
        {
          type: FeedbackId.Macro,
          options: {
            bg: instance.rgb(238, 0, 0),
            fg: instance.rgb(255, 255, 255),
            macroIndex: macro + 1,
            state: MacroFeedbackType.IsRecording
          }
        }
      ],
      actions: [
        {
          action: ActionId.MacroRun,
          options: {
            macro: macro + 1,
            action: 'runContinue'
          }
        }
      ]
    })
  }

  for (let mv = 0; mv < model.MVs; mv++) {
    for (let window = 2; window < 10; window++) {
      for (const src of GetSourcesListForType(model, state, 'mv')) {
        presets.push({
          category: `MV ${mv + 1} Window ${window + 1}`,
          label: `Set MV ${mv + 1} Window ${window + 1} to source ${src.shortName}`,
          bank: {
            style: 'text',
            text: `$(atem:${pstText}${src.id})`,
            size: pstSize,
            color: instance.rgb(255, 255, 255),
            bgcolor: instance.rgb(0, 0, 0)
          },
          feedbacks: [
            {
              type: FeedbackId.MVSource,
              options: {
                bg: instance.rgb(255, 255, 0),
                fg: instance.rgb(0, 0, 0),
                multiViewerId: mv,
                source: src.id,
                windowIndex: window
              }
            }
          ],
          actions: [
            {
              action: ActionId.MultiviewerWindowSource,
              options: {
                multiViewerId: mv,
                source: src.id,
                windowIndex: window
              }
            }
          ]
        })
      }
    }
  }

  for (let ssrc = 0; ssrc < model.SSrc; ssrc++) {
    for (let box = 0; box < 4; box++) {
      for (const src of meSources) {
        presets.push({
          category: `SSrc ${ssrc + 1} Box ${box + 1}`,
          label: `Set SuperSource ${ssrc + 1} Box ${box + 1} to source  ${src.shortName}`,
          bank: {
            style: 'text',
            text: `$(atem:${pstText}${src.id})`,
            size: pstSize,
            color: instance.rgb(255, 255, 255),
            bgcolor: instance.rgb(0, 0, 0)
          },
          feedbacks: [
            {
              type: FeedbackId.SSrcBoxSource,
              options: {
                bg: instance.rgb(255, 255, 0),
                fg: instance.rgb(0, 0, 0),
                ssrcId: ssrc,
                source: src.id,
                boxIndex: box
              }
            }
          ],
          actions: [
            {
              action: ActionId.SuperSourceBoxSource,
              options: {
                ssrcId: ssrc,
                source: src.id,
                boxIndex: box
              }
            }
          ]
        })
      }
    }
  }
  return presets
}
