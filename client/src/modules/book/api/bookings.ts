import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { useAlert } from '#/context/AlertContext'
import { APPOINTMENT as APPT_MSG } from '#/constants/message'

export const mutateBookSlot = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: { slot_id: string; [key: string]: any }) => {
      const { slot_id, ...rest } = payload
      return (
          await api(`/api/v1/slots/${slot_id}/book`, {
          method: 'POST',
          data: JSON.stringify(rest),
        })
      ).data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['slots'] })
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      showAlert(APPT_MSG.book.success, 'success')
    },
    onError: async (error: { response?: { status?: number } }) => {
      if (error.response?.status === 409) {
        await queryClient.invalidateQueries({ queryKey: ['slots'] })
        await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      }
    },
  })
}
