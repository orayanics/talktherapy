import { queryOptions } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export interface DiagnosisItem {
  id: string
  value: string
  label: string
  active?: boolean
}

export const fetchDiagnoses = queryOptions<DiagnosisItem[]>({
  queryKey: ['public-diagnoses'],
  queryFn: async () => {
    const { data } = await api('/api/v1/diagnoses', {
      method: 'GET',
    })
    return data
  },
  staleTime: 1000 * 60 * 60,
})

export function useDiagnosisActions() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-diagnoses'] })
  const create = useMutation({
    mutationFn: (input: Pick<DiagnosisItem, 'id' | 'label' | 'value'>) => api('/api/v1/admin/diagnoses', { method: 'POST', data: input }),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, ...input }: Partial<DiagnosisItem> & { id: string }) => api(`/api/v1/admin/diagnoses/${id}`, { method: 'PATCH', data: input }),
    onSuccess: invalidate,
  })
  const archive = useMutation({
    mutationFn: (id: string) => api(`/api/v1/admin/diagnoses/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
  return { create, update, archive }
}
