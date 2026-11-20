/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import ExerciseActions from './ExerciseActions'
import type { SlpExercise } from '../api/exercises'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('#/modules/auth/hooks/useAuth', () => ({
  useAuthGuard: () => ({ role: 'admin' }),
}))
vi.mock('./CreateSlpExercisePage', () => ({ default: () => null }))
vi.mock('./ExercisePreview', () => ({ default: () => null }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('reviews and publishes exercise versions through the existing workflow', async () => {
  vi.mocked(api).mockResolvedValue({})
  const client = new QueryClient()
  const exercise = {
    id: 'exercise',
    is_hidden: false,
    can_manage: false,
    latest_version: { id: 'version', status: 'draft' },
  } as SlpExercise
  const { rerender } = render(
    <QueryClientProvider client={client}>
      <ExerciseActions exercise={exercise} />
    </QueryClientProvider>,
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Review for publishing' }),
  )
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith(
      '/api/v1/slp/exercise-versions/version/review',
      { method: 'POST' },
    ),
  )

  rerender(
    <QueryClientProvider client={client}>
      <ExerciseActions
        exercise={{
          ...exercise,
          latest_version: { ...exercise.latest_version!, status: 'reviewed' },
        }}
      />
    </QueryClientProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Publish to patients' }))
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith(
      '/api/v1/slp/exercise-versions/version/publish',
      { method: 'POST' },
    ),
  )
})

it('changes only the hidden flag and reports save failure without hiding the row', async () => {
  vi.mocked(api).mockRejectedValue(new Error('Unavailable'))
  const exercise = {
    id: 'exercise',
    is_hidden: false,
    can_manage: true,
  } as SlpExercise
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      <ExerciseActions exercise={exercise} />
    </QueryClientProvider>,
  )
  fireEvent.click(screen.getByRole('checkbox', { name: 'Hide exercise' }))
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith('/api/v1/slp/exercises/exercise', {
      method: 'PATCH',
      data: { is_hidden: true },
    }),
  )
  expect((await screen.findByRole('alert')).textContent).toContain(
    'Could not save',
  )
  expect(
    screen.getByRole<HTMLInputElement>('checkbox', { name: 'Hide exercise' })
      .checked,
  ).toBe(false)
})
