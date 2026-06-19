import { describe, expect, test } from 'vitest'
import type {
	CompanionMigrationAction,
	CompanionMigrationFeedback,
	CompanionStaticUpgradeProps,
	CompanionUpgradeContext,
	ExpressionOrValue,
	JsonValue,
} from '@companion-module/base'
import { FixMissedUpgradeToExpressions2 } from '../v4.0.0.js'
import type { AtemConfig } from '../../config.js'

const context: CompanionUpgradeContext<AtemConfig> = {
	currentConfig: {},
}

function value(value: JsonValue | undefined): ExpressionOrValue<JsonValue | undefined> {
	return { isExpression: false, value }
}

function expression(value: string): ExpressionOrValue<JsonValue | undefined> {
	return { isExpression: true, value }
}

function makeFeedback(feedbackId: string, options: Record<string, any>): CompanionMigrationFeedback {
	return { id: 'f1', controlId: 'c1', feedbackId, options }
}

function makeAction(actionId: string, options: Record<string, any>): CompanionMigrationAction {
	return { id: 'a1', controlId: 'c1', actionId, options }
}

function runUpgrade(props: Partial<CompanionStaticUpgradeProps<AtemConfig, undefined>>) {
	return FixMissedUpgradeToExpressions2(context, {
		config: null,
		secrets: null,
		actions: [],
		feedbacks: [],
		...props,
	})
}

describe('FixMissedUpgradeToExpressions2', () => {
	test('migrates feedback enum value stored as a number', () => {
		const feedback = makeFeedback('usk_type', { type: value(3) })
		const result = runUpgrade({ feedbacks: [feedback] })

		expect(result.updatedFeedbacks).toEqual([feedback])
		expect(feedback.options['type']).toEqual(value('dve'))
	})

	test('migrates feedback enum value stored as a numeric string (the case missed before)', () => {
		const feedback = makeFeedback('usk_type', { type: value('0') })
		const result = runUpgrade({ feedbacks: [feedback] })

		expect(result.updatedFeedbacks).toEqual([feedback])
		expect(feedback.options['type']).toEqual(value('luma'))
	})

	test('migrates fairlight mix option feedback', () => {
		const feedback = makeFeedback('fairlightAudioMixOption', { option: value('2') })
		runUpgrade({ feedbacks: [feedback] })

		expect(feedback.options['option']).toEqual(value('on'))
	})

	test('migrates supersource art placement feedback', () => {
		const feedback = makeFeedback('ssrc_art_option', { artOption: value(1) })
		runUpgrade({ feedbacks: [feedback] })

		expect(feedback.options['artOption']).toEqual(value('foreground'))
	})

	test('migrates action enum values too', () => {
		const action = makeAction('uskType', { type: value('1') })
		const result = runUpgrade({ actions: [action] })

		expect(result.updatedActions).toEqual([action])
		expect(action.options['type']).toEqual(value('chroma'))
	})

	test('is idempotent - already migrated string ids are left untouched', () => {
		const feedback = makeFeedback('usk_type', { type: value('luma') })
		const result = runUpgrade({ feedbacks: [feedback] })

		expect(result.updatedFeedbacks).toEqual([])
		expect(feedback.options['type']).toEqual(value('luma'))
	})

	test('leaves expressions untouched', () => {
		const feedback = makeFeedback('usk_type', { type: expression('$(atem:something)') })
		const result = runUpgrade({ feedbacks: [feedback] })

		expect(result.updatedFeedbacks).toEqual([])
		expect(feedback.options['type']).toEqual(expression('$(atem:something)'))
	})

	test('leaves unrelated feedbacks untouched', () => {
		const feedback = makeFeedback('uskOnAir', { mixeffect: value(1), key: value(1) })
		const result = runUpgrade({ feedbacks: [feedback] })

		expect(result.updatedFeedbacks).toEqual([])
	})

	test('does not fabricate values for missing options', () => {
		const feedback = makeFeedback('usk_type', {})
		const result = runUpgrade({ feedbacks: [feedback] })

		expect(result.updatedFeedbacks).toEqual([])
		expect(feedback.options['type']).toBeUndefined()
	})
})
