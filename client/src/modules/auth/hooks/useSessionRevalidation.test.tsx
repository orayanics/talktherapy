/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { useSessionRevalidation } from './useSessionRevalidation'
import { toUser } from '../api/auth-client'

const { invalidate } = vi.hoisted(() => ({ invalidate: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useRouter: () => ({ invalidate }) }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('uses the guarded session without another mount request and rechecks routes on expiry', async () => {
  const queryClient = new QueryClient()
  const user = toUser({
    id: 'patient',
    name: 'Patient',
    email: '',
    email_verified_at: null,
    role: 'patient',
    status: 'active',
    image: null,
    created_at: '',
    updated_at: '',
  })
  queryClient.setQueryData(['session'], { user })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { unmount } = renderHook(() => useSessionRevalidation(user), {
    wrapper,
  })
  expect(queryClient.isFetching()).toBe(0)
  expect(invalidate).not.toHaveBeenCalled()
  await act(async () => {
    queryClient.setQueryData(['session'], null)
  })
  await waitFor(() => expect(invalidate).toHaveBeenCalledOnce())
  unmount()
  queryClient.clear()
})
