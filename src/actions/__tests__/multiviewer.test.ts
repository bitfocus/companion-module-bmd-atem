import { describe, expect, test } from 'vitest'
import { Enums } from 'atem-connection'
import { createMultiviewerActions } from '../multiviewer.js'
import { createMultiviewerFeedbacks } from '../../feedback/multiviewer.js'
import { ALL_MODELS } from '../../models/index.js'
import type { ModelSpec } from '../../models/types.js'
import { makeMockAtem, makeTestState } from '../../__tests__/helpers.js'

// #481: some models report a multiviewer (MVs > 0) whose windows cannot be re-sourced, so the
// window-source picker has no choices and rendered as "??". The window-source action/feedback must
// be hidden for those, while the layout action - a separate capability - stays.

function hasMultiviewerSources(model: ModelSpec): boolean {
	return model.inputs.some((i) => (i.sourceAvailability & Enums.SourceAvailability.Multiviewer) !== 0)
}

const FIXED_MV_MODEL = ALL_MODELS.find((m) => m.MVs > 0 && !hasMultiviewerSources(m))!
const ROUTABLE_MV_MODEL = ALL_MODELS.find((m) => m.MVs > 0 && hasMultiviewerSources(m))!

describe('Multiviewer window-source gating (#481)', () => {
	test('the model fixtures used by this test exist', () => {
		// Without both, the assertions below would silently pass against nothing
		expect(FIXED_MV_MODEL).toBeDefined()
		expect(ROUTABLE_MV_MODEL).toBeDefined()
	})

	test('window-source action/feedback are hidden on a fixed multiviewer, but layout stays', () => {
		const mock = makeMockAtem()
		const state = makeTestState()

		const actions = createMultiviewerActions(mock.atem, FIXED_MV_MODEL, state)
		expect(actions.setMvSource).toBeUndefined()
		expect(actions.multiviewerLayout).toBeDefined()

		const feedbacks = createMultiviewerFeedbacks(FIXED_MV_MODEL, state)
		expect(feedbacks.mv_source).toBeUndefined()
		expect(feedbacks.multiviewerLayout).toBeDefined()
	})

	test('window-source action/feedback are offered on a routable multiviewer', () => {
		const mock = makeMockAtem()
		const state = makeTestState()

		const actions = createMultiviewerActions(mock.atem, ROUTABLE_MV_MODEL, state)
		expect(actions.setMvSource).toBeDefined()

		const feedbacks = createMultiviewerFeedbacks(ROUTABLE_MV_MODEL, state)
		expect(feedbacks.mv_source).toBeDefined()
	})
})
