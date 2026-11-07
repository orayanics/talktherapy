import { useAcceptAppointmentMutation } from '#/modules/appointments/hooks/useAppointmentMutations'
import { errMsg } from '#/lib/errorMessage'

export default function useAcceptAppointment() {
  const mutation = useAcceptAppointmentMutation()

  const submit = async (
    appointmentId: string,
    _data?: { is_hidden?: boolean },
  ) => {
    await mutation.mutateAsync(appointmentId)
  }

  return {
    submit,
    reset: mutation.reset,
    apiError: mutation.error ? errMsg(mutation.error, 'Accept failed') : null,
    isLoading: mutation.isPending,
  }
}
