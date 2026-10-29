/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import SlpAssessmentPage from './SlpAssessmentPage'

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  clear: vi.fn(),
  reset: vi.fn(),
  start: vi.fn(),
}))
vi.mock('../hooks/usePracticeRecorder', () => ({
  default: () => ({
    state: 'reviewing',
    audio: new Blob(['voice']),
    url: 'blob:practice',
    error: null,
    start: mocks.start,
    stop: vi.fn(),
    clear: mocks.clear,
  }),
}))
vi.mock('../hooks/useSlpAssessment', () => ({
  default: () => ({
    result: null,
    apiError: null,
    isSubmitting: false,
    submitAssessment: mocks.submit,
    resetAssessment: mocks.reset,
  }),
}))
beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

it('submits the selected Filipino prompt and offers a less playful focus mode', () => {
  render(<SlpAssessmentPage />)
  fireEvent.change(screen.getByLabelText('Practice language'), {
    target: { value: 'tl' },
  })
  expect(screen.getByRole('heading', { name: 'araw' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Finish my turn' }))
  expect(mocks.submit).toHaveBeenCalledWith(expect.any(Blob), 'araw', 'tl')
  fireEvent.change(screen.getByLabelText('Activity style'), {
    target: { value: 'focus' },
  })
  expect(screen.getByRole('heading', { name: 'Speech practice' })).toBeTruthy()
})

it('break clears both capture and assessment instead of retaining an active turn', () => {
  render(<SlpAssessmentPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Take a break' }))
  expect(mocks.clear).toHaveBeenCalledOnce()
  expect(mocks.reset).toHaveBeenCalledOnce()
  expect(
    screen.getByRole('heading', { name: 'Time for a little rest' }),
  ).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Finish my turn' })).toBeNull()
})
