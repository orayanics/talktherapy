import { mutateCompleteAppointment } from '#/modules/appointments/api/appointments'
import { errMsg } from '#/lib/errorMessage'

export default function useCompleteAppointment() {
  const mutation = mutateCompleteAppointment()

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
