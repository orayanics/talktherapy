/** @vitest-environment jsdom */
import { act, renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import useUpdateSoapForm from './useUpdateSoapForm'
import { getContext } from '#/integrations/tanstack-query/root-provider'
import { api } from '#/lib/api/client'
import type { Soap } from '../types/soap'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }))
vi.mock('#/context/AlertContext', () => ({
  useAlert: () => ({ showAlert: vi.fn() }),
}))
afterEach(cleanup)

const note = (id: string, version = 1): Soap => ({
  id,
  version,
  patientId: 'patient',
  clinicianId: 'clinician',
  activity_plan: id,
  createdAt: '',
  updatedAt: '',
  clinician: { id: 'clinician', name: 'Clinician', diagnosis: null },
  patient: { id: 'patient', name: 'Patient' },
})

it('keeps the draft and original version when the query refreshes', async () => {
  const { queryClient } = getContext()
  queryClient.setQueryData(['soap', 'a'], note('a'))
  vi.mocked(api).mockResolvedValue({ data: note('a', 2) })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result, unmount } = renderHook(
    () => useUpdateSoapForm({ soapId: 'a' }),
    { wrapper },
  )
  await waitFor(() => expect(result.current.watch('activity_plan')).toBe('a'))
  act(() => result.current.reset({ activity_plan: 'draft' }))
  await act(async () => {
    queryClient.setQueryData(['soap', 'a'], note('a', 2))
    await new Promise((resolve) => setTimeout(resolve, 10))
  })
  expect(result.current.watch('activity_plan')).toBe('draft')
  await act(() => result.current.onSubmit())
  expect(api).toHaveBeenCalledWith(
    '/api/v1/soaps/a',
    expect.objectContaining({
      method: 'PATCH',
      data: expect.objectContaining({ activity_plan: 'draft', version: 1 }),
    }),
  )
  unmount()
  queryClient.clear()
})

it('does not submit the prior note while another identity is loading', async () => {
  const { queryClient } = getContext()
  queryClient.setQueryData(['soap', 'a'], note('a'))
  vi.mocked(api)
    .mockClear()
    .mockImplementation(() => new Promise(() => {}))
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result, rerender, unmount } = renderHook(
    ({ soapId }) => useUpdateSoapForm({ soapId }),
    { initialProps: { soapId: 'a' }, wrapper },
  )
  await waitFor(() => expect(result.current.watch('activity_plan')).toBe('a'))
  rerender({ soapId: 'b' })
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
