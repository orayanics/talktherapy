/** @vitest-environment node */
import { QueryClient } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import { sessionQueryOptions } from './auth-client'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))

it('never sends browser-cookie session requests from the server', async () => {
  const queryClient = new QueryClient()
  await expect(queryClient.query(sessionQueryOptions)).rejects.toThrow(
    'Session checks require a browser',
  )
  expect(api).not.toHaveBeenCalled()
  expect(queryClient.getQueryData(sessionQueryOptions.queryKey)).toBeUndefined()
  queryClient.clear()
})
