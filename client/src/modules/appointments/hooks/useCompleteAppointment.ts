import { useState } from 'react'
import { mutateCompleteAppointment } from '#/modules/appointments/api/appointments'
import { errMsg } from '#/lib/errorMessage'

export default function useCompleteAppointment() {
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = mutateCompleteAppointment()

  const submit = async (appointmentId: string, _data?: { is_hidden?: boolean }) => {
    setApiError(null)
    try {
      await mutation.mutateAsync(appointmentId)
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Complete failed'))
      throw error
    }
  }

  const reset = () => {
    setApiError(null)
    mutation.reset()
  }

  return { submit, reset, apiError, isLoading: mutation.isPending }
}
