import type { ExpressionOrValue } from '@companion-module/base'
import { JsonValue } from 'type-fest'

export function OffsetNumericExpressionOrValueByX(
	input: ExpressionOrValue<JsonValue | undefined> | undefined,
	offset: number,
): ExpressionOrValue<JsonValue | undefined> | undefined {
	if (!input) return undefined

	const result = { ...input }

	if (typeof result.value === 'number') {
		result.value += offset
	} else if (typeof result.value === 'string') {
		result.value += ` + ${offset}`
	}

	return result
}
