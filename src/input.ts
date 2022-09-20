import {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	CompanionInputFieldNumber,
	DropdownChoice,
} from '@companion-module/base'
import { AtemState, Enums } from 'atem-connection'
import {
	CHOICES_KEYTRANS,
	CHOICES_SSRCBOXES,
	GetAudioInputsList,
	GetAuxIdChoices,
	GetDSKIdChoices,
	GetMediaPlayerChoices,
	GetMEIdChoices,
	GetMultiviewerIdChoices,
	GetSourcesListForType,
	GetSuperSourceIdChoices,
	GetTransitionStyleChoices,
	GetUSKIdChoices,
	SourcesToChoices,
} from './choices.js'
import { ModelSpec } from './models/index.js'
import { iterateTimes, MEDIA_PLAYER_SOURCE_CLIP_OFFSET, compact, NumberComparitor } from './util.js'

export function AtemMESourcePicker(model: ModelSpec, state: AtemState, id: number): CompanionInputFieldDropdown {
	return {
		id: `input${id ? id : ''}`,
		label: `Input${id ? ` Option ${id}` : ''}`,
		type: 'dropdown',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
	}
}
export function AtemTransitionStylePicker(skipSting?: boolean): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'style',
		label: 'Transition Style',
		default: Enums.TransitionStyle.MIX,
		choices: GetTransitionStyleChoices(skipSting),
	}
}
export function AtemRatePicker(label: string): CompanionInputFieldNumber {
	return {
		type: 'number',
		id: 'rate',
		label,
		min: 1,
		max: 250,
		range: true,
		default: 25,
	}
}
export function AtemTransitionSelectionPickers(model: ModelSpec): CompanionInputFieldCheckbox[] {
	const pickers: CompanionInputFieldCheckbox[] = [
		{
			type: 'checkbox',
			id: 'background',
			label: 'Background',
			default: true,
		},
	]

	for (let i = 0; i < model.USKs; i++) {
		pickers.push({
			type: 'checkbox',
			id: `key${i}`,
			label: `Key ${i + 1}`,
			default: false,
		})
	}

	return pickers
}
export function AtemTransitionSelectionComponentPicker(model: ModelSpec): CompanionInputFieldDropdown {
	const options: DropdownChoice[] = [
		{
			id: 0,
			label: 'Background',
		},
	]

	for (let i = 0; i < model.USKs; i++) {
		options.push({
			id: i + 1,
			label: `Key ${i + 1}`,
		})
	}

	return {
		label: 'Component',
		type: 'dropdown',
		id: 'component',
		choices: options,
		default: 0,
	}
}
export function AtemMEPicker(model: ModelSpec, id: number): CompanionInputFieldDropdown {
	return {
		id: `mixeffect${id ? id : ''}`,
		label: `M/E${id ? ` Option ${id}` : ''}`,
		type: 'dropdown',
		default: id > 0 ? id - 1 : 0,
		choices: GetMEIdChoices(model),
	}
}
export function AtemDSKPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Key',
		id: 'key',
		default: 0,
		choices: GetDSKIdChoices(model),
	}
}
export function AtemUSKPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Key',
		id: 'key',
		default: 0,
		choices: GetUSKIdChoices(model),
	}
}
export function AtemAuxPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'aux',
		label: 'AUX',
		default: 0,
		choices: GetAuxIdChoices(model),
	}
}
export function AtemMultiviewerPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'multiViewerId',
		label: 'MV',
		default: 0,
		choices: GetMultiviewerIdChoices(model),
	}
}
export function AtemKeyFillSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Fill Source',
		id: 'fill',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'me')),
	}
}
export function AtemKeyCutSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Key Source',
		id: 'cut',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'key')),
	}
}
export function AtemAuxSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Input',
		id: 'input',
		default: 1,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'aux')),
	}
}
export function AtemSuperSourceBoxPicker(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'boxIndex',
		label: 'Box #',
		default: 0,
		choices: CHOICES_SSRCBOXES,
	}
}
export function AtemSuperSourceIdPicker(model: ModelSpec): CompanionInputFieldDropdown | undefined {
	const choices = GetSuperSourceIdChoices(model)
	if (choices.length > 1) {
		return {
			type: 'dropdown',
			id: 'ssrcId',
			label: 'Super Source',
			default: 0,
			choices,
		}
	} else {
		return undefined
	}
}
export function AtemSuperSourceArtOption(action: boolean): CompanionInputFieldDropdown {
	const options = compact([
		action
			? {
					id: 'unchanged',
					label: 'Unchanged',
			  }
			: undefined,
		{
			id: Enums.SuperSourceArtOption.Foreground,
			label: 'Foreground',
		},
		{
			id: Enums.SuperSourceArtOption.Background,
			label: 'Background',
		},
		action
			? {
					id: 'toggle',
					label: 'Toggle',
			  }
			: undefined,
	])
	return {
		type: 'dropdown',
		id: 'artOption',
		label: 'Place in',
		default: options[0].id,
		choices: options,
	}
}
export function AtemSuperSourcePropertiesPickers(
	model: ModelSpec,
	state: AtemState,
	offset: boolean
): Array<
	| CompanionInputFieldNumber
	| CompanionInputFieldCheckbox
	| CompanionInputFieldDropdown
	| CompanionInputFieldMultiDropdown
> {
	const allProps: ReturnType<typeof AtemSuperSourcePropertiesPickers> = compact([
		{
			type: 'number',
			id: 'size',
			label: 'Size',
			min: offset ? -1 : 0,
			max: 1,
			range: true,
			default: offset ? 0 : 0.5,
			step: 0.01,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('size'),
		},

		!offset
			? {
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: CHOICES_KEYTRANS,
					isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('onair'),
			  }
			: undefined,

		!offset
			? {
					type: 'dropdown',
					id: 'source',
					label: 'Source',
					default: 0,
					choices: SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-box')),
					isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('source'),
			  }
			: undefined,

		{
			type: 'number',
			id: 'x',
			label: 'X',
			min: -48,
			max: 48,
			range: true,
			default: 0,
			step: 0.01,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('x'),
		},
		{
			type: 'number',
			id: 'y',
			label: 'Y',
			min: -27,
			max: 27,
			range: true,
			default: 0,
			step: 0.01,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('y'),
		},
		offset
			? undefined
			: {
					type: 'checkbox',
					id: 'cropEnable',
					label: 'Crop Enable',
					default: false,
					isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropEnable'),
			  },
		{
			type: 'number',
			id: 'cropTop',
			label: 'Crop Top',
			min: offset ? -18 : 0,
			max: 18,
			range: true,
			default: 0,
			step: 0.01,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropTop'),
		},
		{
			type: 'number',
			id: 'cropBottom',
			label: 'Crop Bottom',
			min: offset ? -18 : 0,
			max: 18,
			range: true,
			default: 0,
			step: 0.01,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropBottom'),
		},
		{
			type: 'number',
			id: 'cropLeft',
			label: 'Crop Left',
			min: offset ? -32 : 0,
			max: 32,
			range: true,
			default: 0,
			step: 0.01,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropLeft'),
		},
		{
			type: 'number',
			id: 'cropRight',
			label: 'Crop Right',
			min: offset ? -32 : 0,
			max: 32,
			range: true,
			default: 0,
			step: 0.01,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('cropRight'),
		},
	])

	return compact([
		{
			type: 'multidropdown',
			id: 'properties',
			label: 'Properties',
			minSelection: 1,
			default: allProps.map((p) => p.id),
			choices: allProps.map((p) => ({ id: p.id, label: p.label })),
		},
		...allProps,
	])
}
export function AtemSuperSourceArtPropertiesPickers(
	model: ModelSpec,
	state: AtemState,
	action: boolean
): Array<
	| CompanionInputFieldNumber
	| CompanionInputFieldCheckbox
	| CompanionInputFieldDropdown
	| CompanionInputFieldMultiDropdown
> {
	const artSources = SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-art'))

	const allProps: ReturnType<typeof AtemSuperSourcePropertiesPickers> = compact([
		{
			type: 'dropdown',
			id: 'fill',
			label: 'Fill Source',
			default: 0,
			choices: artSources,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('fill'),
		},
		{
			type: 'dropdown',
			id: 'key',
			label: 'Key Source',
			default: 0,
			choices: artSources,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('key'),
		},
		{
			...AtemSuperSourceArtOption(action),
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artOption'),
		},

		{
			type: 'checkbox',
			id: 'artPreMultiplied',
			label: 'Pre-multiplied',
			default: true,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artPreMultiplied'),
		},
		{
			type: 'number',
			id: 'artClip',
			label: 'Clip',
			min: 0,
			max: 100,
			range: true,
			default: 50,
			step: 1,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artClip'),
		},
		{
			type: 'number',
			id: 'artGain',
			label: 'Gain',
			min: 0,
			max: 100,
			range: true,
			default: 50,
			step: 1,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artGain'),
		},
		{
			type: 'checkbox',
			id: 'artInvertKey',
			label: 'Invert Key',
			default: false,
			isVisible: (opts) => Array.isArray(opts.properties) && opts.properties.includes('artInvertKey'),
		},
	])

	return compact([
		{
			type: 'multidropdown',
			id: 'properties',
			label: 'Properties',
			minSelection: 1,
			default: allProps.map((p) => p.id),
			choices: allProps.map((p) => ({ id: p.id, label: p.label })),
		},
		...allProps,
	])
}
export function AtemSuperSourceArtSourcePicker(
	model: ModelSpec,
	state: AtemState,
	id: string,
	label: string
): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: id,
		label: label,
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-art')),
	}
}
export function AtemSuperSourceBoxSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'ssrc-box')),
	}
}
export function AtemMultiviewSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state, 'mv')),
	}
}
export function AtemMultiviewWindowPicker(model: ModelSpec): CompanionInputFieldDropdown {
	const choices = model.multiviewerFullGrid
		? iterateTimes(16, (i) => ({
				id: i,
				label: `Window ${i + 1}`,
		  }))
		: iterateTimes(8, (i) => ({
				id: i + 2,
				label: `Window ${i + 3}`,
		  }))

	return {
		type: 'dropdown',
		id: 'windowIndex',
		label: 'Window #',
		default: 2,
		choices,
	}
}
export function AtemMediaPlayerPicker(model: ModelSpec): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'mediaplayer',
		label: 'Media Player',
		default: 0,
		choices: GetMediaPlayerChoices(model),
	}
}

export function AtemMediaPlayerSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: [
			...iterateTimes(model.media.clips, (i) => {
				const clip = state.media.clipPool[i]
				return {
					id: i + MEDIA_PLAYER_SOURCE_CLIP_OFFSET,
					label: clip?.name ? `Clip #${i + 1}: ${clip.name}` : `Clip #${i + 1}`,
				}
			}),
			...iterateTimes(model.media.stills, (i) => {
				const still = state.media.stillPool[i]
				return {
					id: i,
					label: still?.fileName ? `Still #${i + 1}: ${still.fileName}` : `Still #${i + 1}`,
				}
			}),
		],
	}
}

export function AtemFadeToBlackStatePicker(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: 'on',
		choices: [
			{
				id: 'on',
				label: 'On',
			},
			{
				id: 'off',
				label: 'Off',
			},
			{
				id: 'fading',
				label: 'Fading',
			},
		],
	}
}

export function AtemMatchMethod(): CompanionInputFieldDropdown {
	return {
		id: 'matchmethod',
		label: 'Match method',
		type: 'dropdown',
		default: 'exact',
		choices: [
			{
				id: 'exact',
				label: 'Exact',
			},
			{
				id: 'contains',
				label: 'Contains',
			},
			{
				id: 'not-contain',
				label: 'Not Contain',
			},
		],
	}
}

export function AtemAudioInputPicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	const inputs = SourcesToChoices(GetAudioInputsList(model, state))
	return {
		type: 'dropdown',
		id: 'input',
		label: 'Input',
		default: inputs[0].id,
		choices: inputs,
	}
}

export function AtemFairlightAudioSourcePicker(): CompanionInputFieldDropdown {
	const sources: DropdownChoice[] = [
		{
			id: '-65280',
			label: 'Stereo',
		},
		{
			id: '-256',
			label: 'Mono (Ch1)',
		},
		{
			id: '-255',
			label: 'Mono (Ch2)',
		},
	]

	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: sources[0].id,
		choices: sources,
	}
}

export function NumberComparitorPicker(): CompanionInputFieldDropdown {
	const options = [
		{ id: NumberComparitor.Equal, label: 'Equal' },
		{ id: NumberComparitor.NotEqual, label: 'Not Equal' },
		{ id: NumberComparitor.GreaterThan, label: 'Greater than' },
		{ id: NumberComparitor.GreaterThanEqual, label: 'Greater than or equal' },
		{ id: NumberComparitor.LessThan, label: 'Less than' },
		{ id: NumberComparitor.LessThanEqual, label: 'Less than or equal' },
	]
	return {
		type: 'dropdown',
		label: 'Comparitor',
		id: 'comparitor',
		default: NumberComparitor.Equal,
		choices: options,
	}
}

export const FadeDurationChoice: CompanionInputFieldNumber = {
	type: 'number',
	label: 'Fade Duration (ms)',
	id: 'fadeDuration',
	default: 0,
	min: 0,
	step: 10,
	max: 60000,
}
export const FaderLevelDeltaChoice: CompanionInputFieldNumber = {
	type: 'number',
	label: 'Delta',
	id: 'delta',
	default: 1,
	max: 100,
	min: -100,
}

export function AtemAllSourcePicker(model: ModelSpec, state: AtemState): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		default: 0,
		choices: SourcesToChoices(GetSourcesListForType(model, state)),
	}
}
