/// <reference types="node" />
import { EventEmitter } from "events"

export interface CompanionSystem extends EventEmitter {

}

export interface CompanionAction {
  label: string
  options: SomeCompanionInputField[]
}
export interface CompanionActionEvent {
  action: string
  options: { [key: string]: string }
}

export interface CompanionFeedbackEvent {
  type: string
  options: { [key: string]: string }
}
export interface CompanionFeedbackResult {
  color?: number
  bgcolor?: number
}

export type ConfigValue = string | number
export interface DropdownChoice {
  id: ConfigValue
  label: string
}

export type SomeCompanionInputField = CompanionInputFieldText | CompanionInputFieldColor | CompanionInputFieldTextInput | CompanionInputFieldDropdown
export interface CompanionInputField {
  id: string
  type: 'text' | 'textinput' | 'dropdown' | 'colorpicker'
  label: string
}
export interface CompanionInputFieldText extends CompanionInputField {
  type: 'text'
  value: string
}
export interface CompanionInputFieldColor extends CompanionInputField {
  type: 'colorpicker'
  default: number
}
export interface CompanionInputFieldTextInput extends CompanionInputField {
  type: 'textinput'
  regex: string
  default?: string
}
export interface CompanionInputFieldDropdown extends CompanionInputField {
  type: 'dropdown'
  default: ConfigValue
  choices: DropdownChoice[]
}

export interface CompanionConfigField extends CompanionInputField {
  width: number
}
export type SomeCompanionConfigField = SomeCompanionInputField & CompanionConfigField

export interface CompanionVariable {
  label: string
  name: string
}
export interface CompanionFeedback {
  label: string
  description: string
  options: SomeCompanionInputField[]
}
export interface CompanionPreset {
  // TODO
}

export interface CompanionFeedbacks { [id: string]: CompanionFeedback }
export interface CompanionActions { [id: string]: CompanionAction }
