import { useState } from 'react'
import { isAxiosError } from 'axios'
import { mutateAcceptAppointment } from '@/api/schedule'

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
    } catch (err: any) {
      if (isAxiosError(err)) {
        setApiError(err.response?.data?.message ?? 'Accept failed')
      } else {
        setApiError(err.message)
      }
      throw err
    }
  }

  return { submit, apiError, isLoading: (mutation as any).isPending }
}
