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
      await mutation.mutateAsync({
        slot_id: slotId,
        encounter: {
          ...data.encounter,
          referral_url: data.encounter.referral_url || null,
        },
      })
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Booking failed'))
      throw error
    }
  }

  const reset = () => {
    setApiError(null)
    mutation.reset()
  }

  return { submit, reset, apiError, isLoading: mutation.isPending }
}
