import type { SourceInfo } from '../choices.js'

export function parseSourceId(source: string | number, knownSources: SourceInfo[]): number | null {
	if (typeof source === 'number' && source >= 0) return source
	if (typeof source === 'string') {
		// HACK match the source to what we know is valid. This should be parsing the string and converting back to ids instead of doing a lookup
		const matchedSource = knownSources.find((src) => src.longId.trim().toLowerCase() == source.trim().toLowerCase())
		return matchedSource?.id ?? null
	}

	return null
}
