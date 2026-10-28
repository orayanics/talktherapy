import { useState } from 'react'
import {
  mutateCancelAppointment,
  mutateRejectAppointment,
} from '#/modules/appointments/api/appointments'
import type { TAppointmentAction } from '../types/schema'
import { errMsg } from '#/lib/errorMessage'

export default function useAppointmentAction(isClinician = false) {
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = isClinician
    ? mutateRejectAppointment()
    : mutateCancelAppointment()

  const submit = async (appointmentId: string, data: TAppointmentAction) => {
    setApiError(null)
    try {
      await mutation.mutateAsync({
        id: appointmentId,
        body: isClinician ? data : { reason: data.reason },
      })
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Action failed'))
      throw error
    }
  }

  return { submit, apiError, isLoading: (mutation as any).isPending }
}
