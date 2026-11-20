import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  mutateCreateDiagnosis,
  mutateUpdateDiagnosis,
  mutateArchiveDiagnosis,
} from '../api/diagnoses'

export function useDiagnosisActions() {
  const queryClient = useQueryClient()
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-diagnoses'] }),
      queryClient.invalidateQueries({ queryKey: ['public-diagnoses'] }),
    ])
  }
  const create = useMutation({
    mutationFn: mutateCreateDiagnosis,
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: mutateUpdateDiagnosis,
    onSuccess: invalidate,
  })
  const archive = useMutation({
    mutationFn: mutateArchiveDiagnosis,
    onSuccess: invalidate,
  })
  return { create, update, archive }
}
