import { useState } from 'react'
import { mutateAcceptAppointment } from '#/modules/appointments/api/appointments'
import { errMsg } from '#/lib/errorMessage'

export default function useAcceptAppointment() {
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = mutateAcceptAppointment()

  const submit = async (
    appointmentId: string,
    data?: { is_hidden?: boolean },
  ) => {
    setApiError(null)
    try {
      await mutation.mutateAsync({ id: appointmentId, body: data })
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Accept failed'))
      throw error
    }
  }

  return { submit, apiError, isLoading: (mutation as any).isPending }
}
