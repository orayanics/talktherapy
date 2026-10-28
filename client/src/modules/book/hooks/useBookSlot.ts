import { useState } from 'react'
import { mutateBookSlot } from '#/modules/book/api/bookings'
import { errMsg } from '#/lib/errorMessage'
import type { TBookSlot } from '../types/schema'

export default function useBookSlot() {
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = mutateBookSlot()

  const submit = async (slotId: string, data: TBookSlot) => {
    setApiError(null)
    try {
      await mutation.mutateAsync({ slot_id: slotId, ...data })
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Booking failed'))
      throw error
    }
  }

  return { submit, apiError, isLoading: mutation.isPending }
}
