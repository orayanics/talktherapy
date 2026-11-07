import type { BookSlotPayload } from '../types/schema'

import type { Appointment } from '#/modules/appointments/types/appointment'

import { api } from '#/lib/api/client'

export const mutateBookSlot = async (payload: BookSlotPayload) => {
  const { slot_id, ...rest } = payload
  return (
    await api<{ data: Appointment }>(`/api/v1/slots/${slot_id}/book`, {
      method: 'POST',
      data: JSON.stringify(rest),
    })
  ).data
}
