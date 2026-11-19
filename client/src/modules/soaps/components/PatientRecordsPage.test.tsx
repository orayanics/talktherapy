/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import PatientRecordsPage from './PatientRecordsPage'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('#/modules/auth/context/SessionContext', () => ({
  useSession: () => ({ id: 'patient-1' }),
}))
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
}))

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

it('opens and closes a patient record in a details drawer', async () => {
  const record = {
    id: 'soap-1',
    createdAt: '2026-10-29T00:00:00Z',
    clinician: { name: 'Dr Lee' },
    activity_plan: 'Practice sounds',
    session_type: 'Individual',
    subjective_notes: 'Feeling confident',
    objective_notes: 'Completed tasks',
    assessment: 'Improving',
    recommendation: 'Continue practice',
    comments: 'Next week',
  }
  vi.mocked(api).mockImplementation(async (url) =>
    url === '/api/v1/soaps/soap-1'
      ? { data: record }
      : {
          data: [record],
          meta: {
            current_page: 1,
            last_page: 1,
            total: 1,
            from: 1,
            to: 1,
            per_page: 15,
          },
        },
  )
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <PatientRecordsPage />
    </QueryClientProvider>,
  )

  fireEvent.click(
    await screen.findByRole('button', { name: 'View' }, { timeout: 5000 }),
  )
  expect(
    await screen.findByRole('heading', { name: 'SOAP Details' }),
  ).toBeTruthy()
  expect(screen.getByText('Feeling confident')).toBeTruthy()

  fireEvent.click(
    screen.getByRole('button', { name: 'Close SOAP record details' }),
  )
  expect(screen.queryByText('Feeling confident')).toBeNull()
  queryClient.clear()
})
