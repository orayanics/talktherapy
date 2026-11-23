import { expect, it } from 'vitest'
import { matchesPracticeAnswer } from './practiceGame'

it('accepts alternatives and repetitions of a whole answer', () => {
  expect(matchesPracticeAnswer('Eye, eye!', ['eyes', 'eye'])).toBe(true)
  expect(matchesPracticeAnswer('red ball red ball', ['red ball'])).toBe(true)
  expect(matchesPracticeAnswer('not a ball', ['ball'])).toBe(false)
  expect(matchesPracticeAnswer('', ['ball'])).toBe(false)
})
