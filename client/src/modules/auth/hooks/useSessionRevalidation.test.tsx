/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { useSessionRevalidation } from './useSessionRevalidation'
import { toUser } from '../api/auth-client'
import { api } from '#/lib/api/client'
import { requireSession } from '../lib/session-guard'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))

const { invalidate } = vi.hoisted(() => ({ invalidate: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useRouter: () => ({ invalidate }) }))
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  focusManager.setFocused(undefined)
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

it('refetches a stale session once on focus and reuses it when refreshing route context', async () => {
  const queryClient = new QueryClient()
  const resource = {
    id: 'patient',
    name: 'Patient',
    email: '',
    email_verified_at: null,
    role: 'patient',
    status: 'active',
    image: null,
    created_at: '',
    updated_at: '',
  } as const
  const user = toUser(resource)
  queryClient.setQueryData(
    ['session'],
    { user },
    { updatedAt: Date.now() - 30_001 },
  )
  vi.mocked(api).mockResolvedValue({ data: { ...resource, name: 'Updated' } })
  invalidate.mockImplementation(() =>
    requireSession({ context: { queryClient } }),
  )
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { rerender, unmount } = renderHook(
    ({ guardedUser }) => useSessionRevalidation(guardedUser),
    { wrapper, initialProps: { guardedUser: user } },
  )
  expect(api).not.toHaveBeenCalled()
  await act(async () => {
    focusManager.setFocused(false)
    focusManager.setFocused(true)
  })
  await waitFor(() => expect(invalidate).toHaveBeenCalledOnce())
  const guarded = await requireSession({ context: { queryClient } })
  await act(async () => {
    rerender({ guardedUser: { ...guarded.user } })
  })
  expect(api).toHaveBeenCalledOnce()
  expect(invalidate).toHaveBeenCalledOnce()
  unmount()
  queryClient.clear()
})

it('does not invalidate routes for an equal user with a different object reference', async () => {
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
  queryClient.setQueryData(['session'], { user: { ...user } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { rerender, unmount } = renderHook(
    ({ guardedUser }) => useSessionRevalidation(guardedUser),
    { wrapper, initialProps: { guardedUser: user } },
  )
  await act(async () => {
    rerender({ guardedUser: { ...user } })
  })
  expect(invalidate).not.toHaveBeenCalled()
  await act(async () => {
    queryClient.setQueryData(['session'], {
      user: { ...user, name: 'Updated' },
    })
  })
  await waitFor(() => expect(invalidate).toHaveBeenCalledOnce())
  unmount()
  queryClient.clear()
})
