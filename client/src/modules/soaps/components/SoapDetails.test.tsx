/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import SoapDetails from './SoapDetails'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

function renderDetails() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <SoapDetails soapId="soap-1" />
    </QueryClientProvider>,
  )
}

it('loads a SOAP record and displays its clinical details', async () => {
  vi.mocked(api).mockResolvedValue({
    data: {
      createdAt: '2026-10-29T00:00:00Z',
      clinician: { name: 'Dr Lee' },
      activity_plan: 'Practice sounds',
      session_type: 'Individual',
      subjective_notes: 'Feeling confident',
      objective_notes: 'Completed tasks',
      assessment: 'Improving',
      recommendation: 'Continue practice',
      comments: 'Next week',
    },
  })
  renderDetails()
  expect(
    await screen.findByRole('heading', { name: 'SOAP Details' }),
  ).toBeTruthy()
  for (const value of [
    '29 October 2026',
    'Dr Lee',
    'Practice sounds',
    'Individual',
    'Feeling confident',
    'Completed tasks',
    'Improving',
    'Continue practice',
    'Next week',
  ]) {
    expect(screen.getByText(value)).toBeTruthy()
  }
  expect(api).toHaveBeenCalledWith('/api/v1/soaps/soap-1', { method: 'GET' })
})

it('shows an error when loading the record fails', async () => {
  vi.mocked(api).mockRejectedValue(new Error('Unavailable'))
  renderDetails()
  expect(await screen.findByText('Something went wrong!')).toBeTruthy()
})

it('shows the empty state when no record is returned', async () => {
  vi.mocked(api).mockResolvedValue({ data: null })
  renderDetails()
  expect(await screen.findByText('No Data Found')).toBeTruthy()
})
