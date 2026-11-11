import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAlert } from '#/context/AlertContext'
import { APPOINTMENT as APPT_MSG } from '#/constants/message'
import { mutateAppointmentAction } from '../api/appointments'

const useAppointmentActionMutation = (
  action: 'accept' | 'reject' | 'cancel' | 'complete',
  successMsg: string,
) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: (
      payload: string | { id: string; body?: Record<string, unknown> },
    ) => mutateAppointmentAction(action, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['appointment'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
        ...(action === 'complete'
          ? [
              queryClient.invalidateQueries({
                queryKey: ['clinician-patients'],
              }),
            ]
          : []),
      ])
      showAlert(successMsg, 'success')
    },
    onError: async (error: { response?: { status?: number } }) => {
      if (error.response?.status === 409) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['appointments'] }),
          queryClient.invalidateQueries({ queryKey: ['appointment'] }),
          queryClient.invalidateQueries({ queryKey: ['slots'] }),
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
        ])
      }
    },
  })
}
export const useAcceptAppointmentMutation = () =>
  useAppointmentActionMutation('accept', APPT_MSG.confirm.success)
export const useRejectAppointmentMutation = () =>
  useAppointmentActionMutation('reject', APPT_MSG.reschedule.error)
export const useCancelAppointmentMutation = () =>
  useAppointmentActionMutation('cancel', APPT_MSG.cancel.success)
export const useCompleteAppointmentMutation = () =>
  useAppointmentActionMutation('complete', APPT_MSG.complete.success)
