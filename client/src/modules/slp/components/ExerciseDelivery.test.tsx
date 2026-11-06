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
import ExerciseDelivery from './ExerciseDelivery'
import type { SlpExercise } from '../api/exercises'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('#/modules/auth/hooks/useAuth', () => ({
  useAuthGuard: () => ({ role: 'clinician' }),
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('opens the visibility drawer, saves visibility and audience, and restores focus on Escape', async () => {
  vi.mocked(api).mockResolvedValue({ data: {} })
  const exercise: SlpExercise = {
    id: 'exercise',
    owner_id: 'clinician',
    scope: 'private',
    module: 'voice',
    archived_at: null,
    created_at: '',
    updated_at: '',
    latest_version: {
      id: 'version',
      revision: 1,
      language: 'en',
      dialect: null,
      task_type: 'reading',
      status: 'draft',
      prompt_text: 'Read aloud',
      configuration: { patient_visible: false },
    },
  }
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <ExerciseDelivery exercise={exercise} />
    </QueryClientProvider>,
  )
  expect(
    screen.queryByRole('checkbox', {
      name: 'Allow patients to test this draft',
    }),
  ).toBeNull()
  const trigger = screen.getByRole('button', { name: 'Patient visibility' })
  fireEvent.click(trigger)
  const content = screen.getByRole('region', { name: 'Exercise content' })
  expect(content.textContent).toContain('Read aloud')
  expect(content.textContent).toContain('voice')
  expect(content.textContent).toContain('en')
  expect(content.textContent).toContain('reading')
  expect(content.textContent).toContain('private')
  expect(content.textContent).toContain('draft')
  fireEvent.click(
    screen.getByRole('checkbox', { name: 'Allow patients to test this draft' }),
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Save visibility and audience' }),
  )
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith(
      '/api/v1/slp/exercise-versions/version/visibility',
      {
        method: 'PATCH',
        data: { visible: true, audience: 'all', patient_ids: [] },
      },
    ),
  )
  fireEvent.keyDown(
    screen.getByRole('button', { name: 'Close Patient visibility' }),
    { key: 'Escape' },
  )
  expect(
    screen.queryByRole('checkbox', {
      name: 'Allow patients to test this draft',
    }),
  ).toBeNull()
  expect(document.activeElement).toBe(trigger)
})
