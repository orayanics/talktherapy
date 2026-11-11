import {
  useCancelAppointmentMutation,
  useRejectAppointmentMutation,
} from '#/modules/appointments/hooks/useAppointmentMutations'
import type { TAppointmentAction } from '../types/schema'
import { errMsg } from '#/lib/errorMessage'

export default function useAppointmentAction(isClinician = false) {
  const mutation = isClinician
    ? useRejectAppointmentMutation()
    : useCancelAppointmentMutation()

  const submit = async (appointmentId: string, data: TAppointmentAction) => {
    await mutation.mutateAsync({
      id: appointmentId,
      body: isClinician ? data : { reason: data.reason },
    })
  }

  return {
    submit,
    reset: mutation.reset,
    apiError: mutation.error ? errMsg(mutation.error, 'Action failed') : null,
    isLoading: mutation.isPending,
  }
}
