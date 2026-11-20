import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useNavigate } from '@tanstack/react-router'

import { useAlert } from '#/context/AlertContext'

import { mutateSchedule } from '../api/schedules'

export const useScheduleMutation = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: mutateSchedule,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['slots'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
      ])
      showAlert('Schedule created successfully', 'success')
      navigate({ to: '/schedules' })
    },
  })
}
