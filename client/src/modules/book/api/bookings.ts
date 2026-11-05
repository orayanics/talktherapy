import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BookSlotPayload } from '../types/schema'
import type { Appointment } from '#/modules/appointments/types/appointment'
import { api } from '#/lib/api/client'
import { useAlert } from '#/context/AlertContext'
import { APPOINTMENT as APPT_MSG } from '#/constants/message'

export const mutateBookSlot = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: BookSlotPayload) => {
      const { slot_id, ...rest } = payload
      return (
        await api<{ data: Appointment }>(`/api/v1/slots/${slot_id}/book`, {
          method: 'POST',
          data: JSON.stringify(rest),
        })
      ).data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['slots'] })
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      showAlert(APPT_MSG.book.success, 'success')
    },
    onError: async (error: { response?: { status?: number } }) => {
      if (error.response?.status === 409) {
        await queryClient.invalidateQueries({ queryKey: ['slots'] })
        await queryClient.invalidateQueries({ queryKey: ['appointments'] })
        await queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      }
    },
  })
}
