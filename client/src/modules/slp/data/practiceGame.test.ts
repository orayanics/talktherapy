import { expect, it } from 'vitest'
import {
  getCheckOutcome,
  getPracticeStars,
  practiceGameReducer,
  summarizePractice,
} from './practiceGame'
import type { AssessResponse } from '../api/slp'

it('awards stars for distinct practice activities rather than retries or transcript scores', () => {
  let state = practiceGameReducer(
    {},
    { type: 'recorded', promptId: 'bola', word: 'ball', recordingKey: 'one' },
  )
  state = practiceGameReducer(state, {
    type: 'recorded',
    promptId: 'bola',
    word: 'ball',
    recordingKey: 'one',
  })
  expect(state.bola?.attempts).toBe(1)
  expect(getPracticeStars(state.bola)).toBe(1)
  state = practiceGameReducer(state, { type: 'replayed', promptId: 'bola' })
  state = practiceGameReducer(state, {
    type: 'reflected',
    promptId: 'bola',
    reflection: 'with_help',
  })
  expect(getPracticeStars(state.bola)).toBe(3)
  state = practiceGameReducer(state, {
    type: 'recorded',
    promptId: 'bola',
    word: 'ball',
    recordingKey: 'two',
  })
  expect(state.bola?.attempts).toBe(2)
  expect(getPracticeStars(state.bola)).toBe(3)
})

it('preserves participation when analysis fails and cancels pending checks', () => {
  let state = practiceGameReducer(
    {},
    { type: 'recorded', promptId: 'bola', word: 'ball', recordingKey: 'one' },
  )
  state = practiceGameReducer(state, {
    type: 'check',
    promptId: 'bola',
    recordingKey: 'one',
    outcome: 'checking',
    transcript: '',
  })
  state = practiceGameReducer(state, { type: 'cancel_checks' })
  expect(state.bola?.outcome).toBe('not_checked')
  expect(getPracticeStars(state.bola)).toBe(1)
})

it('keeps a new custom word separate from the previous word at that stop', () => {
  let state = practiceGameReducer(
    {},
    { type: 'recorded', promptId: 'bola', word: 'ball', recordingKey: 'one' },
  )
  state = practiceGameReducer(state, {
    type: 'reflected',
    promptId: 'bola',
    reflection: 'independent',
  })
  state = practiceGameReducer(state, {
    type: 'recorded',
    promptId: 'bola',
    word: 'basketball',
    recordingKey: 'two',
  })
  expect(state.bola?.word).toBe('basketball')
  expect(state.bola?.reflection).toBeNull()
  expect(state.bola?.attempts).toBe(1)
})

it('distinguishes an exact transcript match from pronunciation accuracy', () => {
  const result = {
    meta: {
      schemaVersion: '2.0',
      measurement: 'transcript_agreement_only',
      status: 'review_required',
      cer: 0,
    },
  } as AssessResponse
  expect(getCheckOutcome(result)).toBe('matched')
  expect(
    getCheckOutcome({ ...result, meta: { ...result.meta, cer: 0.1 } }),
  ).toBe('review')
  expect(
    getCheckOutcome({
      ...result,
      meta: { ...result.meta, status: 'task_mismatch' },
    }),
  ).toBe('different')
  expect(
    getCheckOutcome({
      ...result,
      meta: { ...result.meta, status: 'unscorable' },
    }),
  ).toBe('unscorable')
  expect(
    getCheckOutcome({
      ...result,
      meta: { alignmentSource: 'reference', cer: 0 },
    }),
  ).toBe('review')
})

it('summarizes only the current set and distinguishes self-reports from automatic checks', () => {
  let state = practiceGameReducer(
    {},
    { type: 'recorded', promptId: 'bola', word: 'ball', recordingKey: 'one' },
  )
  state = practiceGameReducer(state, {
    type: 'reflected',
    promptId: 'bola',
    reflection: 'independent',
  })
  state = practiceGameReducer(state, {
    type: 'recorded',
    promptId: 'pusa',
    word: 'cat',
    recordingKey: 'two',
  })
  expect(summarizePractice(state, ['bola', 'sabon'])).toEqual({
    stars: 2,
    recorded: 1,
    replayed: 0,
    reflected: 1,
    independent: 1,
    withHelp: 0,
    attempts: 1,
    matched: 0,
  })
})

it('ignores a late check response for a recording that has been replaced', () => {
  let state = practiceGameReducer(
    {},
    { type: 'recorded', promptId: 'bola', word: 'ball', recordingKey: 'new' },
  )
  state = practiceGameReducer(state, {
    type: 'check',
    promptId: 'bola',
    recordingKey: 'old',
    outcome: 'matched',
    transcript: 'ball',
  })
  expect(state.bola?.outcome).toBe('not_checked')
  expect(state.bola?.transcript).toBe('')
})
