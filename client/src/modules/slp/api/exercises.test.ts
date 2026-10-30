import { describe, expect, it } from 'vitest'
import { slpExerciseKeys } from './exercises'

describe('SLP exercise API contract', () => {
  it('keeps list and detail keys separated', () => {
    expect(slpExerciseKeys.list(2)).toEqual(['slp-exercises', 'list', 2])
    expect(slpExerciseKeys.detail('exercise-1')).toEqual(['slp-exercises', 'exercise-1'])
  })
})
