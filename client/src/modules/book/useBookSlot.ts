import { useState } from 'react'
import { isAxiosError } from 'axios'
import { mutateBookSlot } from '@/api/schedule'
import type { TBookSlot } from './schema'

export default function useBookSlot() {
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = mutateBookSlot()

  const submit = async (slotId: string, data: TBookSlot) => {
    setApiError(null)
    try {
      await mutation.mutateAsync({ slot_id: slotId, ...data })
    } catch (err: any) {
      if (isAxiosError(err)) {
        setApiError(err.response?.data?.message ?? 'Booking failed')
      } else {
        setApiError(err.message)
      }
      throw err
    }
  }

  return { submit, apiError, isLoading: mutation.isPending }
}
