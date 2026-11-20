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
import SlotDetailsDrawer from './SlotDetailsDrawer'
import { api } from '#/lib/api/client'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('#/modules/auth/hooks/useAuth', () => ({
  useAuthGuard: () => ({ role: 'clinician' }),
}))
vi.mock('#/context/AlertContext', () => ({
  useAlert: () => ({ showAlert: vi.fn() }),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('hides a slot from the drawer and refreshes its hidden state', async () => {
  const slot = {
    id: 'slot',
    clinician: { name: 'Clinician' },
    status: 'FREE',
    start_at: '2027-01-01T09:00:00Z',
    end_at: '2027-01-01T10:00:00Z',
    is_hidden: false,
  }
  vi.mocked(api).mockImplementation(async (_url, options) => {
    if (options?.method === 'POST') slot.is_hidden = true
    return { data: { ...slot } }
  })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <SlotDetailsDrawer slotId="slot" onClose={vi.fn()} />
    </QueryClientProvider>,
  )
  fireEvent.click(await screen.findByRole('button', { name: 'Hide slot' }))
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith('/api/v1/slots/slot/hide', {
      method: 'POST',
    }),
  )
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: /Hide slot|Hiding slot/ }),
    ).toBeNull(),
  )
  queryClient.clear()
})
