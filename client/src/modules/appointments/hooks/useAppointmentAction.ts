import {
  mutateCancelAppointment,
  mutateRejectAppointment,
} from '#/modules/appointments/api/appointments'
import type { TAppointmentAction } from '../types/schema'
import { errMsg } from '#/lib/errorMessage'

export default function useAppointmentAction(isClinician = false) {
  const mutation = isClinician
    ? mutateRejectAppointment()
    : mutateCancelAppointment()

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
