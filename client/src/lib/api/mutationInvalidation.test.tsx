/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { useCreateSoap } from '#/modules/soaps/hooks/useSoapsMutations'
import { useUpdateContent } from '#/modules/content/hooks/useContentMutations'
import { useScheduleMutation } from '#/modules/schedules/hooks/useScheduleMutation'
import { useHideSlotMutation } from '#/modules/schedules/hooks/useHideSlotMutation'

import { useCompleteAppointmentMutation } from '#/modules/appointments/hooks/useAppointmentMutations'
import { useBookSlotMutation } from '#/modules/book/hooks/useBookSlotMutation'
import useActions from '#/modules/users/hooks/useActions'
import {
  useRegisterAdminMutation,
  useRegisterClinicianMutation,
  useRegisterPatientInvitationMutation,
} from '#/modules/register/hooks/useRegistrationMutations'
import {
  useCreateSlpAssignmentMutation,
  useUploadSlpRecordingMutation,
} from '#/modules/slp/hooks/useWorkflowMutations'

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
    'slot hiding',
    useHideSlotMutation,
    'slot',
    ['slots', 'slot', 'dashboardSummary'],
    false,
    true,
  ],
  [
    'SOAP creation',
    () => useCreateSoap('patient'),
    {},
    ['soaps', 'soap'],
    false,
    true,
  ],
  [
    'content update',
    () => useUpdateContent('content'),
    {},
    ['content', 'logs'],
    false,
    true,
  ],
  [
    'schedule creation',
    useScheduleMutation,
    {},
    ['slots', 'dashboardSummary'],
    false,
    true,
  ],
  [
    'appointment completion',
    useCompleteAppointmentMutation,
    'appointment',
    ['appointments', 'appointment', 'dashboardSummary', 'clinician-patients'],
    false,
    true,
  ],
  [
    'booking conflict',
    useBookSlotMutation,
    { slot_id: 'slot' },
    ['slots', 'appointments', 'dashboardSummary'],
    true,
    false,
  ],
  [
    'account reactivation',
    () => ({ mutateAsync: useActions().reactivateUser }),
    'user',
    ['users', 'users-count', 'logs', 'dashboardSummary'],
    false,
    true,
  ],
  [
    'account suspension',
    () => {
      const { suspendUser } = useActions()
      return { mutateAsync: (id: string) => suspendUser(id, 'Review required') }
    },
    'user',
    ['users', 'users-count', 'logs', 'dashboardSummary'],
    false,
    true,
  ],
  ...(
    [
      ['admin invitation', useRegisterAdminMutation],
      ['clinician invitation', useRegisterClinicianMutation],
      ['patient invitation', useRegisterPatientInvitationMutation],
    ] as const
  ).map(
    ([name, hook]) =>
      [
        name,
        hook,
        { name: 'New user', email: 'user@example.com' },
        ['users', 'users-count', 'dashboardSummary', 'logs'],
        false,
        true,
      ] as const,
  ),
  [
    'SLP assignment creation',
    useCreateSlpAssignmentMutation,
    { exercise_version_id: 'version', patient_id: 'patient' },
    ['slp-workflow', 'dashboardSummary'],
    false,
    false,
  ],
  [
    'SLP recording upload',
    () => useUploadSlpRecordingMutation('attempt'),
    new Blob(['recording']),
    ['slp-workflow', 'dashboardSummary'],
    false,
    false,
  ],
] as const

it.each(cases)(
  'starts independent %s invalidations together and waits for all',
  async (_name, hook, payload, expectedKeys, conflict, alerts) => {
    const queryClient = new QueryClient()
    const releases: Array<() => void> = []
    const invalidations = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            releases.push(resolve)
          }),
      )
    if (conflict)
      vi.mocked(api).mockRejectedValue({ response: { status: 409 } })
    else vi.mocked(api).mockResolvedValue({ data: {} })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, unmount } = renderHook(() => hook(), { wrapper })
    let settled = false
    const pending = result.current
      .mutateAsync(payload as never)
      .catch(() => undefined)
      .finally(() => {
        settled = true
      })
    try {
      await vi.waitFor(() =>
        expect(invalidations).toHaveBeenCalledTimes(expectedKeys.length),
      )
      expect(
        invalidations.mock.calls.map(([filters]) => filters?.queryKey?.[0]),
      ).toEqual(expectedKeys)
      expect(showAlert).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
      expect(settled).toBe(false)
      await act(async () => {
        releases.slice(0, -1).forEach((release) => release())
      })
      expect(settled).toBe(false)
      expect(showAlert).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    } finally {
      invalidations.mockResolvedValue(undefined)
      await act(async () => {
        releases.forEach((release) => release())
        await pending
      })
      unmount()
      queryClient.clear()
    }
    if (alerts) expect(showAlert).toHaveBeenCalledOnce()
    else expect(showAlert).not.toHaveBeenCalled()
  },
)

it('does not refresh caches or show success when a status mutation fails', async () => {
  const queryClient = new QueryClient()
  const invalidations = vi.spyOn(queryClient, 'invalidateQueries')
  const error = new Error('Request failed')
  vi.mocked(api).mockRejectedValue(error)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result, unmount } = renderHook(useActions, { wrapper })
  try {
    await act(async () => {
      await expect(result.current.reactivateUser('user')).rejects.toBe(error)
    })
    expect(invalidations).not.toHaveBeenCalled()
    expect(showAlert).toHaveBeenCalledExactlyOnceWith(
      'Unable to update account status.',
      'error',
    )
  } finally {
    unmount()
    queryClient.clear()
  }
})
