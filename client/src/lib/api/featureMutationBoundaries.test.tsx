/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { api } from './client'
import {
  useVerifyOtpMutation,
  useActivateAccountMutation,
} from '#/modules/activation/hooks/useActivationMutations'
import {
  useRegisterPatientMutation,
  useRegisterAdminMutation,
  useRegisterClinicianMutation,
  useRegisterPatientInvitationMutation,
} from '#/modules/register/hooks/useRegistrationMutations'
import { useDiagnosisActions } from '#/modules/diagnoses/hooks/useDiagnosisActions'
import { useAdminNotificationComposer } from '#/modules/notifications/hooks/useAdminNotificationComposer'
import {
  useCreateSlpExerciseMutation,
  useUpdateSlpExerciseMutation,
  useArchiveSlpExerciseMutation,
} from '#/modules/slp/hooks/useExerciseMutations'
import {
  useCreateSlpAssignmentMutation,
  useCreateSlpConsentMutation,
  useCreateSlpAttemptMutation,
  useUploadSlpRecordingMutation,
  useSaveSlpReviewMutation,
  useApproveSlpReviewMutation,
} from '#/modules/slp/hooks/useWorkflowMutations'

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

const member = { name: 'New user', email: 'user@example.com' }
const patient = {
  ...member,
  diagnosis_id: 'diagnosis',
  password: 'password123',
  password_confirmation: 'password123',
  consent: true,
}
const otp = { email: member.email, otp_code: '123456' }
const diagnosis = { id: 'diagnosis', label: 'Diagnosis', value: 'diagnosis' }
const broadcast = { channels: ['in_app'] as const, message: 'Update' }
const exercise = {
  module: 'voice',
  language: 'en',
  task_type: 'reading',
  prompt_text: 'Read aloud',
}
const assignment = { exercise_version_id: 'version', patient_id: 'patient' }
const consent = {
  subject_id: 'patient',
  purpose: 'slp_recording',
  policy_version: 'v1',
}
const attempt = { submission_key: 'submission', consent_id: 'consent' }
const review = { annotations: [{ start: 0 }] }
const userKeys = [['users'], ['users-count'], ['dashboardSummary'], ['logs']]
const workflowKeys = [['slp-workflow', 'assignments'], ['dashboardSummary']]

const cases = [
  {
    name: 'OTP verification',
    hook: useVerifyOtpMutation,
    payload: otp,
    path: '/api/v1/activation/otp/verify',
    method: 'POST',
    data: JSON.stringify(otp),
    keys: [],
    unwrap: true,
    redirect: '',
  },
  {
    name: 'activation',
    hook: useActivateAccountMutation,
    payload: otp,
    path: '/api/v1/activation',
    method: 'POST',
    data: JSON.stringify(otp),
    keys: [],
    unwrap: true,
    redirect: '/login',
  },
  {
    name: 'patient registration',
    hook: useRegisterPatientMutation,
    payload: patient,
    path: '/api/v1/registrations/patient',
    method: 'POST',
    data: JSON.stringify(patient),
    keys: [],
    unwrap: true,
    redirect: '/activate/otp',
  },
  {
    name: 'admin invitation',
    hook: useRegisterAdminMutation,
    payload: member,
    path: '/api/v1/users',
    method: 'POST',
    data: JSON.stringify({ ...member, role: 'admin' }),
    keys: userKeys,
    unwrap: true,
    redirect: '',
  },
  {
    name: 'clinician invitation',
    hook: useRegisterClinicianMutation,
    payload: member,
    path: '/api/v1/users',
    method: 'POST',
    data: JSON.stringify({ ...member, role: 'clinician' }),
    keys: userKeys,
    unwrap: true,
    redirect: '',
  },
  {
    name: 'patient invitation',
    hook: useRegisterPatientInvitationMutation,
    payload: member,
    path: '/api/v1/users',
    method: 'POST',
    data: JSON.stringify({ ...member, role: 'patient' }),
    keys: userKeys,
    unwrap: true,
    redirect: '',
  },
  {
    name: 'diagnosis creation',
    hook: () => useDiagnosisActions().create,
    payload: diagnosis,
    path: '/api/v1/admin/diagnoses',
    method: 'POST',
    data: diagnosis,
    keys: [['admin-diagnoses'], ['public-diagnoses']],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'diagnosis update',
    hook: () => useDiagnosisActions().update,
    payload: diagnosis,
    path: '/api/v1/admin/diagnoses/diagnosis',
    method: 'PATCH',
    data: { label: diagnosis.label, value: diagnosis.value },
    keys: [['admin-diagnoses'], ['public-diagnoses']],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'diagnosis archive',
    hook: () => useDiagnosisActions().archive,
    payload: 'diagnosis',
    path: '/api/v1/admin/diagnoses/diagnosis',
    method: 'DELETE',
    keys: [['admin-diagnoses'], ['public-diagnoses']],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'notification preview',
    hook: () => useAdminNotificationComposer().preview,
    payload: broadcast,
    path: '/api/v1/notifications/preview',
    method: 'POST',
    data: broadcast,
    keys: [],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'notification send',
    hook: () => useAdminNotificationComposer().send,
    payload: broadcast,
    path: '/api/v1/notifications',
    method: 'POST',
    data: broadcast,
    keys: [],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'exercise creation',
    hook: useCreateSlpExerciseMutation,
    payload: exercise,
    path: '/api/v1/slp/exercises',
    method: 'POST',
    data: exercise,
    keys: [['slp-exercises']],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'exercise update',
    hook: () => useUpdateSlpExerciseMutation('exercise'),
    payload: exercise,
    path: '/api/v1/slp/exercises/exercise',
    method: 'PATCH',
    data: exercise,
    keys: [['slp-exercises']],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'exercise archive',
    hook: () => useArchiveSlpExerciseMutation('exercise'),
    payload: undefined,
    path: '/api/v1/slp/exercises/exercise',
    method: 'DELETE',
    keys: [['slp-exercises']],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'assignment creation',
    hook: useCreateSlpAssignmentMutation,
    payload: assignment,
    path: '/api/v1/slp/assignments',
    method: 'POST',
    data: assignment,
    keys: workflowKeys,
    unwrap: false,
    redirect: '',
  },
  {
    name: 'recording consent',
    hook: useCreateSlpConsentMutation,
    payload: consent,
    path: '/api/v1/slp/consents',
    method: 'POST',
    data: consent,
    keys: [],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'attempt creation',
    hook: () => useCreateSlpAttemptMutation('assignment'),
    payload: attempt,
    path: '/api/v1/slp/assignments/assignment/attempts',
    method: 'POST',
    data: attempt,
    keys: [['slp-workflow', 'assignments']],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'recording upload',
    hook: () => useUploadSlpRecordingMutation('attempt'),
    payload: new Blob(['recording']),
    path: '/api/v1/slp/attempts/attempt/recording',
    method: 'POST',
    data: expect.any(FormData),
    keys: workflowKeys,
    unwrap: false,
    redirect: '',
  },
  {
    name: 'review save',
    hook: () => useSaveSlpReviewMutation('attempt'),
    payload: review,
    path: '/api/v1/slp/attempts/attempt/review',
    method: 'PUT',
    data: review,
    keys: [],
    unwrap: false,
    redirect: '',
  },
  {
    name: 'review approval',
    hook: () => useApproveSlpReviewMutation('review'),
    payload: undefined,
    path: '/api/v1/slp/reviews/review/approve',
    method: 'POST',
    keys: [],
    unwrap: false,
    redirect: '',
  },
] as const

it.each(cases)(
  'preserves $name HTTP, cache and navigation behavior',
  async (entry) => {
    const response = {
      data: {
        id: 'result',
        role: 'patient',
        requires_credentials: false,
        status: 'active',
      },
    }
    for (const fails of [false, true]) {
      vi.clearAllMocks()
      const client = new QueryClient()
      entry.keys.forEach((key) => client.setQueryData(key, ['cached']))
      const error = new Error('Request failed')
      if (fails) vi.mocked(api).mockRejectedValue(error)
      else vi.mocked(api).mockResolvedValue(response)
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      )
      const { result, unmount } = renderHook(() => entry.hook(), { wrapper })
      await act(async () => {
        if (fails)
          await expect(
            result.current.mutateAsync(entry.payload as never),
          ).rejects.toBe(error)
        else
          await expect(
            result.current.mutateAsync(entry.payload as never),
          ).resolves.toEqual(entry.unwrap ? response.data : response)
      })
      expect(api).toHaveBeenCalledWith(entry.path, {
        method: entry.method,
        ...('data' in entry ? { data: entry.data } : {}),
      })
      entry.keys.forEach((key) =>
        expect(client.getQueryState(key)?.isInvalidated).toBe(!fails),
      )
      if (!fails && entry.redirect)
        expect(navigate).toHaveBeenCalledWith({ to: entry.redirect })
      else expect(navigate).not.toHaveBeenCalled()
      if (fails) expect(showAlert).not.toHaveBeenCalled()
      unmount()
      client.clear()
    }
  },
)
