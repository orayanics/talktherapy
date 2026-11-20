import { useCompleteAppointmentMutation } from '#/modules/appointments/hooks/useAppointmentMutations'
import { errMsg } from '#/lib/errorMessage'

export default function useCompleteAppointment() {
  const mutation = useCompleteAppointmentMutation()

  const submit = async (
    appointmentId: string,
    _data?: { is_hidden?: boolean },
  ) => {
    await mutation.mutateAsync(appointmentId)
  }

  return {
    submit,
    reset: mutation.reset,
    apiError: mutation.error ? errMsg(mutation.error, 'Complete failed') : null,
    isLoading: mutation.isPending,
  }
}
