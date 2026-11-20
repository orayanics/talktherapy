/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import ExercisePreview from './ExercisePreview'
import type { SlpExercise } from '../api/exercises'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('../hooks/usePracticeRecorder', () => ({
  default: () => ({
    state: 'reviewing',
    audio: new Blob(['audio'], { type: 'audio/webm' }),
    url: null,
    error: null,
  }),
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('sends the exercise ID for server-side prompt resolution and displays Python feedback', async () => {
  vi.mocked(api).mockResolvedValue({
    data: { feedback: { text: 'Listen together.' } },
  })
  const exercise = {
    id: 'exercise',
    latest_version: { language: 'tl', prompt_text: 'araw' },
  } as SlpExercise
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ExercisePreview exercise={exercise} />
    </QueryClientProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Check recording' }))
  expect((await screen.findByRole('status')).textContent).toBe(
    'Listen together.',
  )
  const [path, options] = vi.mocked(api).mock.calls[0]
  expect(path).toBe('/api/v1/slp/assess')
  expect((options?.data as FormData).get('exercise_id')).toBe('exercise')
  expect((options?.data as FormData).has('reference_text')).toBe(false)
  expect((options?.data as FormData).has('audio')).toBe(true)
})

it('uses a version ID when a patient performs a collection exercise', async () => {
  vi.mocked(api).mockResolvedValue({
    data: { feedback: { text: 'Listen together.' } },
  })
  const version = {
    id: 'version-1',
    exercise_id: 'exercise-1',
    prompt_text: 'araw',
    language: 'tl',
    dialect: null,
    task_type: 'word',
    assignment_id: null,
  }
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ExercisePreview version={version} />
    </QueryClientProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Check recording' }))
  await screen.findByRole('status')
  const data = vi.mocked(api).mock.calls[0][1]?.data as FormData
  expect(data.get('exercise_version_id')).toBe('version-1')
  expect(data.has('exercise_id')).toBe(false)
  expect(data.has('reference_text')).toBe(false)
})
