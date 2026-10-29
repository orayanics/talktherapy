/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { assessPronunciation } from '../api/slp'
import useSlpAssessment from './useSlpAssessment'
import type { AssessResponse } from '../api/slp'

vi.mock('../api/slp', () => ({ assessPronunciation: vi.fn() }))

it('aborts a cancelled turn and ignores a late result', async () => {
  let resolve!: (value: AssessResponse) => void
  vi.mocked(assessPronunciation).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done
      }),
  )
  const { result } = renderHook(useSlpAssessment)
  let request!: Promise<void>
  act(() => {
    request = result.current.submitAssessment(new Blob(['audio']), 'sun')
  })
  const signal = vi.mocked(assessPronunciation).mock.calls.at(-1)?.[2]
  act(() => result.current.resetAssessment())
  expect(signal?.aborted).toBe(true)
  await act(async () => {
    resolve({ meta: {} } as AssessResponse)
    await request
  })
  expect(result.current.result).toBeNull()
  expect(result.current.isSubmitting).toBe(false)
})
