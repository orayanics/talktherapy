/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { useCreateSoap } from '#/modules/soaps/hooks/useSoapsMutations'
import { useUpdateContent } from '#/modules/content/hooks/useContentMutations'
import { useScheduleMutation } from '#/modules/schedules/hooks/useScheduleMutation'

import { useCompleteAppointmentMutation } from '#/modules/appointments/hooks/useAppointmentMutations'
import { useBookSlotMutation } from '#/modules/book/hooks/useBookSlotMutation'

import { api } from './client'

const { showAlert, navigate } = vi.hoisted(() => ({
  showAlert: vi.fn(),
  navigate: vi.fn(),
}))
vi.mock('./client', () => ({ api: vi.fn() }))
vi.mock('#/context/AlertContext', () => ({ useAlert: () => ({ showAlert }) }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const cases = [
  [
    'SOAP creation',
    () => useCreateSoap('patient'),
    {},
    ['soaps', 'soap'],
    false,
  ],
  [
    'content update',
    () => useUpdateContent('content'),
    {},
    ['content', 'logs'],
    false,
  ],
  [
    'schedule creation',
    useScheduleMutation,
    {},
    ['slots', 'dashboardSummary'],
    false,
  ],
  [
    'appointment completion',
    useCompleteAppointmentMutation,
    'appointment',
    ['appointments', 'appointment', 'dashboardSummary', 'clinician-patients'],
    false,
  ],
  [
    'booking conflict',
    useBookSlotMutation,
    { slot_id: 'slot' },
    ['slots', 'appointments', 'dashboardSummary'],
    true,
  ],
] as const

it.each(cases)(
  'starts independent %s invalidations together and waits for all',
  async (_name, hook, payload, expectedKeys, conflict) => {
    const queryClient = new QueryClient()
    let release!: () => void
    const first = new Promise<void>((resolve) => {
      release = resolve
    })
    const invalidations = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined)
      .mockReturnValueOnce(first)
    if (conflict)
      vi.mocked(api).mockRejectedValue({ response: { status: 409 } })
    else vi.mocked(api).mockResolvedValue({ data: {} })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, unmount } = renderHook(() => hook(), { wrapper })
    const pending = result.current
      .mutateAsync(payload as never)
      .catch(() => undefined)
    try {
      await vi.waitFor(() =>
        expect(invalidations).toHaveBeenCalledTimes(expectedKeys.length),
      )
      expect(
        invalidations.mock.calls.map(([filters]) => filters?.queryKey?.[0]),
      ).toEqual(expectedKeys)
      expect(showAlert).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    } finally {
      await act(async () => {
        release()
        await pending
      })
      unmount()
      queryClient.clear()
    }
    if (!conflict) expect(showAlert).toHaveBeenCalledOnce()
  },
)
