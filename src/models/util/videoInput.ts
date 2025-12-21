import { Enums } from 'atem-connection'
import type { VideoInputInfo } from '../types'

interface VideoInputGeneratorOptions {
	meCount: number
	baseSourceAvailability: Enums.SourceAvailability
}
export class VideoInputGenerator {
	readonly #options: VideoInputGeneratorOptions
	readonly #inputs: VideoInputInfo[] = []

	readonly #defaultMeAvailability: Enums.MeAvailability
	readonly #defaultSourceAvailability: Enums.SourceAvailability

	private constructor(options: VideoInputGeneratorOptions) {
		this.#options = options

		this.#defaultMeAvailability = generateMeAvailability(this.#options.meCount)
		this.#defaultSourceAvailability = Enums.SourceAvailability.KeySource | this.#options.baseSourceAvailability
	}

	static begin(options: VideoInputGeneratorOptions): VideoInputGenerator {
		return new VideoInputGenerator(options)
	}

	addInternalColorsAndBlack(skipAux = false): VideoInputGenerator {
		let sourceAvailability = this.#defaultSourceAvailability
		if (skipAux) sourceAvailability &= ~Enums.SourceAvailability.Auxiliary

		this.#inputs.push(
			{
				id: 0,
				portType: Enums.InternalPortType.Black,
				sourceAvailability: sourceAvailability,
				meAvailability: this.#defaultMeAvailability,
			},
			{
				id: 1000,
				portType: Enums.InternalPortType.ColorBars,
				sourceAvailability: sourceAvailability,
				meAvailability: this.#defaultMeAvailability,
			},
			{
				id: 2001,
				portType: Enums.InternalPortType.ColorGenerator,
				sourceAvailability: sourceAvailability & ~Enums.SourceAvailability.KeySource,
				meAvailability: this.#defaultMeAvailability,
			},
			{
				id: 2002,
				portType: Enums.InternalPortType.ColorGenerator,
				sourceAvailability: sourceAvailability & ~Enums.SourceAvailability.KeySource,
				meAvailability: this.#defaultMeAvailability,
			},
		)
		return this
	}

	addExternalInputs(count: number, sourceAvailability: Enums.SourceAvailability = 0): VideoInputGenerator {
		return this.addInputs(
			1,
			count,
			Enums.InternalPortType.External,
			sourceAvailability | this.#defaultSourceAvailability,
			this.#defaultMeAvailability,
		)
	}

	addMediaPlayers(count: number, skipAux = false): VideoInputGenerator {
		let sourceAvailability = this.#defaultSourceAvailability
		if (skipAux) sourceAvailability &= ~Enums.SourceAvailability.Auxiliary

		for (let i = 1; i <= count; i++) {
			this.#inputs.push(
				{
					id: 3000 + i * 10,
					portType: Enums.InternalPortType.MediaPlayerFill,
					sourceAvailability: sourceAvailability,
					meAvailability: this.#defaultMeAvailability,
				},
				{
					id: 3001 + i * 10,
					portType: Enums.InternalPortType.MediaPlayerKey,
					sourceAvailability: sourceAvailability,
					meAvailability: this.#defaultMeAvailability,
				},
			)
		}

		return this
	}

	addThunderbolt(): VideoInputGenerator {
		this.#inputs.push(
			{
				id: 3210,
				portType: Enums.InternalPortType.MediaPlayerFill,
				sourceAvailability: this.#defaultSourceAvailability,
				meAvailability: this.#defaultMeAvailability,
			},
			{
				id: 3211,
				portType: Enums.InternalPortType.MediaPlayerKey,
				sourceAvailability: this.#defaultSourceAvailability,
				meAvailability: this.#defaultMeAvailability,
			},
		)

		return this
	}

	addUpstreamKeyMasks(count: number): VideoInputGenerator {
		for (let i = 1; i <= count; i++) {
			this.#inputs.push({
				id: 4000 + i * 10,
				portType: Enums.InternalPortType.Mask,
				sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
				meAvailability: Enums.MeAvailability.None,
			})
		}

		return this
	}

	addDownstreamKeyMasks(count: number): VideoInputGenerator {
		for (let i = 1; i <= count; i++) {
			this.#inputs.push({
				id: 5000 + i * 10,
				portType: Enums.InternalPortType.Mask,
				sourceAvailability: Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
				meAvailability: Enums.MeAvailability.None,
			})
		}

		return this
	}
	addCleanFeeds(count: number): VideoInputGenerator {
		for (let i = 1; i <= count; i++) {
			this.#inputs.push({
				id: 7000 + i,
				portType: Enums.InternalPortType.MEOutput,
				//Enums.SourceAvailability.Multiviewer | Enums.SourceAvailability.Auxiliary,
				sourceAvailability:
					this.#defaultSourceAvailability &
					~Enums.SourceAvailability.KeySource &
					~Enums.SourceAvailability.SuperSourceArt &
					~Enums.SourceAvailability.SuperSourceBox,
				meAvailability: Enums.MeAvailability.None,
			})
		}

		return this
	}
	addDownstreamKeyMasksAndClean(count: number): VideoInputGenerator {
		return this.addDownstreamKeyMasks(count).addCleanFeeds(count)
	}

	addAuxiliaryOutputs(count: number): VideoInputGenerator {
		return this.addInputs(
			8001,
			count,
			Enums.InternalPortType.Auxiliary,
			this.#defaultSourceAvailability & Enums.SourceAvailability.Multiviewer,
			Enums.MeAvailability.None,
		)
	}

	addSuperSource(count: number = 1): VideoInputGenerator {
		return this.addInputs(
			6000,
			count,
			Enums.InternalPortType.SuperSource,
			this.#defaultSourceAvailability & ~Enums.SourceAvailability.SuperSourceArt,
			this.#defaultMeAvailability,
		)
	}

	addProgramPreview(): VideoInputGenerator {
		for (let i = 1; i <= this.#options.meCount; i++) {
			let sourceAvailability =
				this.#defaultSourceAvailability & ~Enums.SourceAvailability.SuperSourceArt & ~Enums.SourceAvailability.KeySource
			if (i === 1) sourceAvailability &= ~Enums.SourceAvailability.SuperSourceBox

			const meAvailability = i > 1 ? generateMeAvailability(i - 1) : 0

			this.#inputs.push(
				{
					id: 10000 + i * 10,
					portType: Enums.InternalPortType.MEOutput,
					sourceAvailability: sourceAvailability,
					meAvailability: meAvailability,
				},
				{
					id: 10001 + i * 10,
					portType: Enums.InternalPortType.MEOutput,
					sourceAvailability: sourceAvailability,
					meAvailability: meAvailability,
				},
			)
		}
		return this
	}

	addMultiviewers(count: number): VideoInputGenerator {
		return this.addInputs(
			9001,
			count,
			Enums.InternalPortType.MultiViewer,
			this.#defaultSourceAvailability &
				(Enums.SourceAvailability.Auxiliary |
					Enums.SourceAvailability.Auxiliary1 |
					Enums.SourceAvailability.Auxiliary2 |
					Enums.SourceAvailability.WebcamOut),
			Enums.MeAvailability.None,
		)
	}

	addMultiviewerStatusSources(audioMonitor = false): VideoInputGenerator {
		this.#inputs.push(
			{
				id: 9101,
				portType: Enums.InternalPortType.MultiViewer,
				sourceAvailability: Enums.SourceAvailability.Multiviewer,
				meAvailability: Enums.MeAvailability.None,
			},
			{
				id: 9102,
				portType: Enums.InternalPortType.MultiViewer,
				sourceAvailability: Enums.SourceAvailability.Multiviewer,
				meAvailability: Enums.MeAvailability.None,
			},
			{
				id: 9103,
				portType: Enums.InternalPortType.MultiViewer,
				sourceAvailability: Enums.SourceAvailability.Multiviewer,
				meAvailability: Enums.MeAvailability.None,
			},
		)

		if (audioMonitor) {
			this.#inputs.push({
				id: 9200,
				portType: Enums.InternalPortType.AudioMonitor,
				sourceAvailability:
					Enums.SourceAvailability.WebcamOut |
					Enums.SourceAvailability.Multiviewer |
					Enums.SourceAvailability.Auxiliary,
				meAvailability: Enums.MeAvailability.None,
			})
		}

		return this
	}

	addDirectInputForAux(count: number): VideoInputGenerator {
		for (let i = 1; i <= count; i++) {
			let sourceAvailability = Enums.SourceAvailability.Auxiliary
			if (i === 1 && this.#options.baseSourceAvailability & Enums.SourceAvailability.Auxiliary1)
				sourceAvailability |= Enums.SourceAvailability.Auxiliary1
			if (i === 2 && this.#options.baseSourceAvailability & Enums.SourceAvailability.Auxiliary2)
				sourceAvailability |= Enums.SourceAvailability.Auxiliary2

			this.#inputs.push({
				id: 11000 + i,
				portType: Enums.InternalPortType.ExternalDirect,
				sourceAvailability: sourceAvailability,
				meAvailability: Enums.MeAvailability.None,
			})
		}
		return this
	}

	addInputs(
		firstIndex: number,
		count: number,
		type: Enums.InternalPortType,
		sourceAvailability: Enums.SourceAvailability,
		meAvailability: Enums.MeAvailability,
	): VideoInputGenerator {
		for (let i = firstIndex; i < firstIndex + count; i++) {
			this.#inputs.push({
				id: i,
				portType: type,
				sourceAvailability: sourceAvailability,
				meAvailability: meAvailability,
			})
		}
		return this
	}

	generate(): VideoInputInfo[] {
		return this.#inputs.sort((a, b) => a.id - b.id)
	}
}

function generateMeAvailability(meCount: number): Enums.MeAvailability {
	let meAvailability = Enums.MeAvailability.Me1
	if (meCount > 1) {
		meAvailability |= Enums.MeAvailability.Me2
	}
	if (meCount > 2) {
		meAvailability |= Enums.MeAvailability.Me3
	}
	if (meCount > 3) {
		meAvailability |= Enums.MeAvailability.Me4
	}
	return meAvailability
}
