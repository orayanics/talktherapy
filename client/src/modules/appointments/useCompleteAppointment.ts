import { useState } from 'react'
import { isAxiosError } from 'axios'
import { mutateCompleteAppointment } from '@/api/schedule'

export default function useCompleteAppointment() {
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = mutateCompleteAppointment()

  const submit = async (appointmentId: string, data?: any) => {
    setApiError(null)
    try {
      await mutation.mutateAsync({ id: appointmentId, body: data })
    } catch (err: any) {
      if (isAxiosError(err)) {
        setApiError(err.response?.data?.message ?? 'Complete failed')
      } else {
        setApiError(err.message)
      }
      throw err
    }
  }

  return { submit, apiError, isLoading: (mutation as any).isPending }
}
