import { useState } from 'react'
import { isAxiosError } from 'axios'
import {
  mutateCancelAppointment,
  mutateRejectAppointment,
} from '@/api/schedule'
import type { TAppointmentAction } from './schema'

export default function useAppointmentAction(isClinician = false) {
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = isClinician
    ? mutateRejectAppointment()
    : mutateCancelAppointment()

  const submit = async (appointmentId: string, data: TAppointmentAction) => {
    setApiError(null)
    try {
      await mutation.mutateAsync({ id: appointmentId, body: data })
    } catch (err: any) {
      if (isAxiosError(err)) {
        setApiError(err.response?.data?.message ?? 'Action failed')
      } else {
        setApiError(err.message)
      }
      throw err
    }
  }

  return { submit, apiError, isLoading: (mutation as any).isPending }
}
