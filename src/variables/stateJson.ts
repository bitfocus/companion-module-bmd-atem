import type { AtemState } from 'atem-connection'

/*
 * The switcher state as one JSON variable (state_json), for controllers that read Companion over
 * its HTTP API: one request instead of hundreds of variables. Values are kept in the switcher's
 * own units (hundredths of a dB, 1/1000 for DVE sizes and positions, 1/100 for SuperSource...).
 * Arrays instead of objects keep it small; see the comments for the order of the fields.
 */

const bits = (arr: readonly number[] | undefined): number => (arr ?? []).reduce((a, b) => a | b, 0)
const db100 = (db: number | undefined): number =>
	db === undefined || !Number.isFinite(db) ? -10000 : Math.round(db * 100)

export function buildStateJson(
	state: AtemState,
	ccu?: ReadonlyMap<number, Record<string, Array<number | boolean | string>>>,
): string {
	const v = state.video
	const out: Record<string, unknown> = {
		v: 1,
		product: state.info.productIdentifier ?? '',
		version: state.info.apiVersion ?? 0,
		// me: [pgm, pvw, style, nextStyle, selection, nextSelection, inTransition, position, mixRate, previewTransition,
		//      ftb [black, inTransition, rate], keys [[onAir, type, fill, cut, flyEnabled, sizeX, sizeY, posX, posY, rotation]]]
		me: v.mixEffects.map((m) =>
			m
				? [
						m.programInput,
						m.previewInput,
						m.transitionProperties?.style ?? 0,
						m.transitionProperties?.nextStyle ?? 0,
						bits(m.transitionProperties?.selection),
						bits(m.transitionProperties?.nextSelection),
						m.transitionPosition?.inTransition ? 1 : 0,
						m.transitionPosition?.handlePosition ?? 0,
						m.transitionSettings?.mix?.rate ?? 25,
						m.transitionPreview ? 1 : 0,
						[m.fadeToBlack?.isFullyBlack ? 1 : 0, m.fadeToBlack?.inTransition ? 1 : 0, m.fadeToBlack?.rate ?? 25],
						m.upstreamKeyers.map((k) =>
							k
								? [
										k.onAir ? 1 : 0,
										k.mixEffectKeyType ?? 0,
										k.fillSource ?? 0,
										k.cutSource ?? 0,
										k.flyEnabled ? 1 : 0,
										k.dveSettings?.sizeX ?? 500,
										k.dveSettings?.sizeY ?? 500,
										k.dveSettings?.positionX ?? 0,
										k.dveSettings?.positionY ?? 0,
										k.dveSettings?.rotation ?? 0,
									]
								: null,
						),
					]
				: null,
		),
		// dsk: [onAir, inTransition, isAuto, tie, rate, fill, cut]
		dsk: v.downstreamKeyers.map((d) =>
			d
				? [
						d.onAir ? 1 : 0,
						d.inTransition ? 1 : 0,
						d.isAuto ? 1 : 0,
						d.properties?.tie ? 1 : 0,
						d.properties?.rate ?? 25,
						d.sources?.fillSource ?? 0,
						d.sources?.cutSource ?? 0,
					]
				: null,
		),
		aux: v.auxilliaries.map((a) => a ?? 0),
		// mv: [layout, [window sources]]
		mv: state.settings.multiViewers.map((m) =>
			m ? [m.properties?.layout ?? 0, (m.windows ?? []).map((w) => w?.source ?? 0)] : null,
		),
		// ss: [[enabled, source, x, y, size, cropped]] per SuperSource
		ss: v.superSources.map((s) =>
			s
				? (s.boxes ?? []).map((b) => (b ? [b.enabled ? 1 : 0, b.source, b.x, b.y, b.size, b.cropped ? 1 : 0] : null))
				: null,
		),
		// inputs: id: [longName, shortName, internalPortType, sourceAvailability, meAvailability]
		inputs: Object.fromEntries(
			Object.values(state.inputs)
				.filter((i) => !!i)
				.map((i) => [i.inputId, [i.longName, i.shortName, i.internalPortType, i.sourceAvailability, i.meAvailability]]),
		),
	}

	const fl = state.fairlight
	if (fl) {
		const eq = (e: { enabled: boolean; gain: number; bands: readonly any[] } | undefined) =>
			e
				? [
						e.enabled ? 1 : 0,
						e.gain,
						// bands: [enabled, shape, supportedShapes (bits), frequency, gain, q]
						e.bands.map((b) =>
							b ? [b.bandEnabled ? 1 : 0, b.shape, bits(b.supportedShapes), b.frequency, b.gain, b.qFactor] : null,
						),
					]
				: null
		const comp = (c: any) =>
			c ? [c.compressorEnabled ? 1 : 0, c.threshold, c.ratio, c.attack, c.hold, c.release] : null
		const lim = (l: any) => (l ? [l.limiterEnabled ? 1 : 0, l.threshold, l.attack, l.hold, l.release] : null)
		// channels "input.source": [type, gain, balance, fader, mixOption, supportedMixOptions (bits), eq, comp, lim]
		const ch: Record<string, unknown> = {}
		for (const [input, inp] of Object.entries(fl.inputs)) {
			for (const [source, s] of Object.entries(inp?.sources ?? {})) {
				const p = s?.properties
				if (!p) continue
				ch[`${input}.${source}`] = [
					p.sourceType,
					p.gain,
					p.balance,
					p.faderGain,
					p.mixOption,
					bits(p.supportedMixOptions),
					eq(s?.equalizer),
					comp(s?.dynamics?.compressor),
					lim(s?.dynamics?.limiter),
				]
			}
		}
		out.fairlight = {
			// master: [fader, eq, comp, lim]
			master: [
				fl.master?.properties?.faderGain ?? 0,
				eq(fl.master?.equalizer),
				comp(fl.master?.dynamics?.compressor),
				lim(fl.master?.dynamics?.limiter),
			],
			ch,
		}
	} else if (state.audio) {
		// classic: id: [mixOption, gain (0.01 dB), balance (-50..50)]
		out.classic = {
			master: db100(state.audio.master?.gain),
			ch: Object.fromEntries(
				Object.entries(state.audio.channels)
					.filter(([, c]) => !!c)
					.map(([id, c]) => [id, [c!.mixOption, db100(c!.gain), c!.balance]]),
			),
		}
	}
	// ccu: camera: { "category.parameter": [values] }, every value the cameras reported (fixed16 as decimals)
	if (ccu && ccu.size) out.ccu = Object.fromEntries(ccu)
	return JSON.stringify(out)
}
