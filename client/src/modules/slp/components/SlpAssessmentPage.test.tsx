/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { AssessResponse } from '../api/slp'
import SlpAssessmentPage from './SlpAssessmentPage'

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  clear: vi.fn(),
  reset: vi.fn(),
  start: vi.fn(),
  audio: null as Blob | null,
  url: null as string | null,
}))
vi.mock('../hooks/usePracticeRecorder', () => ({
  default: () => ({
    state: mocks.audio ? 'reviewing' : 'idle',
    audio: mocks.audio,
    url: mocks.url,
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
beforeEach(() => {
  vi.clearAllMocks()
  mocks.audio = null
  mocks.url = null
  mocks.submit.mockResolvedValue(null)
  mocks.clear.mockImplementation(() => {
    mocks.audio = null
    mocks.url = null
  })
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(cleanup)
let recordingSequence = 0

function recordedTurn() {
  mocks.audio = new Blob(['voice'])
  mocks.url = `blob:${++recordingSequence}`
}
const matchingResponse = {
  meta: {
    schemaVersion: '2.0',
    measurement: 'transcript_agreement_only',
    status: 'review_required',
    cer: 0,
  },
  analysis: { transcript: 'ball' },
} as AssessResponse

function finishRound() {
  for (let index = 0; index < 4; index++)
    fireEvent.click(
      screen.getByRole('button', { name: /^(Continue|Skip for now)$/ }),
    )
  fireEvent.click(screen.getByRole('button', { name: 'See my results' }))
}

it('submits the selected Filipino prompt and offers a less playful focus mode', async () => {
  const { rerender } = render(<SlpAssessmentPage />)
  fireEvent.change(screen.getByLabelText('Practice language'), {
    target: { value: 'tl' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Ipakita ang salita' }))
  expect(
    screen.getByText('bola', { selector: '#practice-answer' }),
  ).toBeTruthy()
  recordedTurn()
  rerender(<SlpAssessmentPage />)
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: 'Check my word' })),
  )
  expect(mocks.submit).toHaveBeenCalledWith(expect.any(Blob), 'bola', 'tl')
  fireEvent.change(screen.getByLabelText('Activity style'), {
    target: { value: 'focus' },
  })
  expect(screen.getByRole('heading', { name: 'Speech practice' })).toBeTruthy()
})

it('break clears capture and assessment but retains earned practice stars', () => {
  recordedTurn()
  render(<SlpAssessmentPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Take a break' }))
  expect(mocks.clear).toHaveBeenCalledOnce()
  expect(mocks.reset).toHaveBeenCalledOnce()
  expect(
    screen.getByRole('heading', { name: 'Time for a little rest' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'I’m ready' }))
  expect(
    screen.getByRole('img', { name: '1 of 3 practice stars earned' }),
  ).toBeTruthy()
})

it('preserves a turn on theme changes and clears capture when the picture set changes', async () => {
  recordedTurn()
  const { container, rerender } = render(<SlpAssessmentPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Ocean friends' }))
  expect(container.querySelector('section')?.dataset.practiceTheme).toBe(
    'ocean',
  )
  expect(mocks.clear).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('Picture set'), {
    target: { value: 'nature' },
  })
  expect(mocks.clear).toHaveBeenCalledOnce()
  expect(
    screen.getByRole('img', { name: 'Picture to name' }).getAttribute('src'),
  ).toBe('/slp/pictures/pusa.jpg')
  recordedTurn()
  rerender(<SlpAssessmentPage />)
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: 'Check my word' })),
  )
  expect(mocks.submit).toHaveBeenCalledWith(expect.any(Blob), 'cat', 'en')
})

it('hides each answer until requested and hides it again on the next picture', () => {
  render(<SlpAssessmentPage />)
  expect(
    screen.queryByText('ball', { selector: '#practice-answer' }),
  ).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Show word' }))
  expect(
    screen.getByText('ball', { selector: '#practice-answer' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }))
  expect(
    screen.queryByText('soap', { selector: '#practice-answer' }),
  ).toBeNull()
  expect(
    screen
      .getByRole('button', { name: 'Show word' })
      .getAttribute('aria-expanded'),
  ).toBe('false')
})

it('offers a helper fallback if the picture cannot load', () => {
  render(<SlpAssessmentPage />)
  fireEvent.error(screen.getByRole('img', { name: 'Picture to name' }))
  expect(screen.getByText(/This picture could not load/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Show word' }))
  expect(
    screen.getByText('ball', { selector: '#practice-answer' }),
  ).toBeTruthy()
})

it('collects activity stars and presents a complete word-by-word summary with retry', async () => {
  recordedTurn()
  mocks.submit.mockResolvedValue(matchingResponse)
  render(<SlpAssessmentPage />)
  fireEvent.ended(screen.getByLabelText('Listen to my recording'))
  fireEvent.click(screen.getByRole('button', { name: 'I tried on my own' }))
  expect(
    screen.getByRole('img', { name: '3 of 3 practice stars earned' }),
  ).toBeTruthy()
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: 'Check my word' })),
  )
  expect(screen.getByText('The transcript matched!')).toBeTruthy()
  finishRound()
  const summary = screen.getByRole('region', {
    name: 'Round performance summary',
  })
  expect(within(summary).getByText('Look at what you practiced!')).toBeTruthy()
  expect(within(summary).getByText('Careful listener')).toBeTruthy()
  expect(within(summary).getByText(/1 transcript match/)).toBeTruthy()
  expect(within(summary).getAllByText('Not tried this round')).toHaveLength(4)
  expect(within(summary).queryByText(/100%/)).toBeNull()
  fireEvent.click(
    within(summary).getByRole('button', { name: 'Practice ball again' }),
  )
  expect(
    screen.queryByRole('region', { name: 'Round performance summary' }),
  ).toBeNull()
  expect(
    screen.getByRole('img', { name: '3 of 3 practice stars earned' }),
  ).toBeTruthy()
})

it('keeps earned stars when the automatic word check is unavailable', async () => {
  recordedTurn()
  render(<SlpAssessmentPage />)
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: 'Check my word' })),
  )
  expect(screen.getByText('Your practice still counts')).toBeTruthy()
  expect(
    screen.getByRole('img', { name: '1 of 3 practice stars earned' }),
  ).toBeTruthy()
})

it('does not award participation badges for skipped pictures', () => {
  render(<SlpAssessmentPage />)
  finishRound()
  expect(screen.getByText('Ready whenever you are')).toBeTruthy()
  expect(screen.queryByText('Brave first try')).toBeNull()
  expect(screen.getAllByText('Not tried this round')).toHaveLength(5)
  expect(
    screen
      .getByRole('progressbar', { name: 'Picture stops visited' })
      .getAttribute('value'),
  ).toBe('5')
  fireEvent.click(
    screen.getByRole('button', { name: 'Start a fresh adventure' }),
  )
  expect(
    screen
      .getByRole('progressbar', { name: 'Picture stops visited' })
      .getAttribute('value'),
  ).toBe('0')
})

it('does not attach a late automatic check to a new picture', async () => {
  let resolve!: (result: AssessResponse) => void
  mocks.submit.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done
      }),
  )
  recordedTurn()
  render(<SlpAssessmentPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Check my word' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await act(async () => resolve(matchingResponse))
  expect(screen.queryByText('The transcript matched!')).toBeNull()
})
