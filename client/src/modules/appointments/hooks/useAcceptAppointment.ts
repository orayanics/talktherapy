import { useState } from 'react'
import { mutateAcceptAppointment } from '#/modules/appointments/api/appointments'
import { errMsg } from '#/lib/errorMessage'

export default function useAcceptAppointment() {
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = mutateAcceptAppointment()

  const submit = async (
    appointmentId: string,
    _data?: { is_hidden?: boolean },
  ) => {
    setApiError(null)
    try {
      await mutation.mutateAsync(appointmentId)
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Accept failed'))
      throw error
    }
  }

  const reset = () => {
    setApiError(null)
    mutation.reset()
  }

  return { submit, reset, apiError, isLoading: mutation.isPending }
}
