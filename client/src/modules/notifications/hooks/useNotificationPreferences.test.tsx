/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { useNotificationPreferences } from './useNotificationPreferences'
import { api } from '#/lib/api/client'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
afterEach(cleanup)

it('loads preferences, refreshes the cache after saving, and retains errors without changing cached preferences', async () => {
  const client = new QueryClient()
  let preferences = { in_app: true, email: true }
  vi.mocked(api).mockImplementation(async (_url, config) => {
    if (config?.method === 'PUT') {
      preferences = config.data
      return undefined
    }
    return { data: preferences }
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const { result, unmount } = renderHook(useNotificationPreferences, {
    wrapper,
  })
  await waitFor(() => expect(result.current.data).toEqual(preferences))
  await act(() => result.current.update({ in_app: false, email: true }))
  await waitFor(() =>
    expect(result.current.data).toEqual({ in_app: false, email: true }),
  )
  expect(api).toHaveBeenCalledWith('/api/v1/me/notification-preferences', {
    method: 'PUT',
    data: { in_app: false, email: true },
  })
  vi.mocked(api).mockRejectedValueOnce(new Error('Offline'))
  await act(async () => {
    await expect(
      result.current.update({ in_app: true, email: false }),
    ).rejects.toThrow('Offline')
  })
  expect(result.current.data).toEqual({ in_app: false, email: true })
  unmount()
  client.clear()
})
