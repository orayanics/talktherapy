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
      Promise.all([
        queryClient.invalidateQueries({ queryKey: slpExerciseKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['slp-collections'] }),
      ]),
  })
}

export const useUpdateSlpExerciseMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof mutateUpdateSlpExercise>[1]) =>
      mutateUpdateSlpExercise(id, input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: slpExerciseKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['slp-collections'] }),
      ]),
  })
}

export const useArchiveSlpExerciseMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => mutateArchiveSlpExercise(id),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: slpExerciseKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['slp-collections'] }),
      ]),
  })
}
