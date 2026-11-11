import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAlert } from '#/context/AlertContext'

import { APPOINTMENT as APPT_MSG } from '#/constants/message'

import { mutateBookSlot } from '../api/bookings'

export const useBookSlotMutation = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: mutateBookSlot,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['slots'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
      ])
      showAlert(APPT_MSG.book.success, 'success')
    },
    onError: async (error: { response?: { status?: number } }) => {
      if (error.response?.status === 409) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['slots'] }),
          queryClient.invalidateQueries({ queryKey: ['appointments'] }),
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
        ])
      }
    },
  })
}
