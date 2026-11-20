import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  mutateCreateSlpExercise,
  mutateUpdateSlpExercise,
  mutateArchiveSlpExercise,
  slpExerciseKeys,
} from '../api/exercises'

export const useCreateSlpExerciseMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mutateCreateSlpExercise,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: slpExerciseKeys.all }),
  })
}

export const useUpdateSlpExerciseMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof mutateUpdateSlpExercise>[1]) =>
      mutateUpdateSlpExercise(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: slpExerciseKeys.all }),
  })
}

export const useArchiveSlpExerciseMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => mutateArchiveSlpExercise(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: slpExerciseKeys.all }),
  })
}
