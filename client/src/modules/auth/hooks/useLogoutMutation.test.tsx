/** @vitest-environment jsdom */
import { act, renderHook, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLogoutMutation } from './useLogoutMutation'
import { api, initializeCsrf } from '#/lib/api/client'

vi.mock('#/lib/api/client', () => ({ api: vi.fn(), initializeCsrf: vi.fn() }))
afterEach(cleanup)

it('retains private data on logout failure and clears it after successful logout', async () => {
  const client = new QueryClient()
  client.setQueryData(['soap', 'note'], { assessment: 'Private note' })
  vi.mocked(api)
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce(undefined)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const { result, unmount } = renderHook(useLogoutMutation, { wrapper })
  await act(async () => {
    await expect(result.current.mutateAsync()).rejects.toThrow('Offline')
  })
  expect(client.getQueryData(['soap', 'note'])).toBeTruthy()
  await act(() => result.current.mutateAsync())
  expect(initializeCsrf).toHaveBeenCalledTimes(2)
  expect(api).toHaveBeenCalledWith('/logout', { method: 'POST' })
  expect(client.getQueryCache().getAll()).toHaveLength(0)
  unmount()
  client.clear()
})
