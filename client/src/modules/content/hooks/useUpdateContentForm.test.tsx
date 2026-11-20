/** @vitest-environment jsdom */
import { act, renderHook, cleanup, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import useUpdateContentForm from './useUpdateContentForm'
import { getContext } from '#/integrations/tanstack-query/root-provider'
import { api } from '#/lib/api/client'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }))
vi.mock('#/context/AlertContext', () => ({
  useAlert: () => ({ showAlert: vi.fn() }),
}))
afterEach(cleanup)

it('preserves the content draft on refresh and blocks submission while another item loads', async () => {
  const { queryClient } = getContext()
  const content = {
    id: 'a',
    title: 'Original',
    description: 'Description',
    body: 'Body',
    diagnosis: null,
    tags: [],
  }
  queryClient.setQueryData(['content', 'a'], content)
  vi.mocked(api)
    .mockClear()
    .mockImplementation(() => new Promise(() => {}))
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result, rerender, unmount } = renderHook(
    ({ contentId }) => useUpdateContentForm({ contentId }),
    { initialProps: { contentId: 'a' }, wrapper },
  )
  await waitFor(() => expect(result.current.watch('title')).toBe('Original'))
  act(() =>
    result.current.reset({
      title: 'Draft',
      body: 'Body',
      description: 'Description',
    }),
  )
  await act(async () => {
    queryClient.setQueryData(['content', 'a'], {
      ...content,
      title: 'New server title',
    })
    await new Promise((resolve) => setTimeout(resolve, 10))
  })
  expect(result.current.watch('title')).toBe('Draft')
  rerender({ contentId: 'b' })
  expect(result.current.isLoading).toBe(true)
  await act(() => result.current.onSubmit())
  expect(
    vi
      .mocked(api)
      .mock.calls.some(([, options]) => options?.method === 'PATCH'),
  ).toBe(false)
  unmount()
  queryClient.clear()
})
