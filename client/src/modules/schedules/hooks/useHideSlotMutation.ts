import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAlert } from '#/context/AlertContext'
import { mutateHideSlot } from '../api/schedules'

export const useHideSlotMutation = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: mutateHideSlot,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['slots'] }),
        queryClient.invalidateQueries({ queryKey: ['slot'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
      ])
      showAlert('Slot hidden successfully', 'success')
    },
  })
}
