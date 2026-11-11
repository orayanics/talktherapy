import { queryOptions } from '@tanstack/react-query'
import { api } from '#/lib/api/client'

import type { DiagnosisItem } from '../types/diagnosis'

export const fetchDiagnoses = queryOptions<DiagnosisItem[]>({
  queryKey: ['public-diagnoses'],
  queryFn: async () => {
    const { data } = await api<{ data: DiagnosisItem[] }>('/api/v1/diagnoses', {
      method: 'GET',
    })
    return data
  },
  staleTime: 1000 * 60 * 60,
})

export const mutateCreateDiagnosis = (
  input: Pick<DiagnosisItem, 'id' | 'label' | 'value'>,
) => api('/api/v1/admin/diagnoses', { method: 'POST', data: input })
export const mutateUpdateDiagnosis = ({
  id,
  ...input
}: Partial<DiagnosisItem> & { id: string }) =>
  api(`/api/v1/admin/diagnoses/${id}`, { method: 'PATCH', data: input })
export const mutateArchiveDiagnosis = (id: string) =>
  api(`/api/v1/admin/diagnoses/${id}`, { method: 'DELETE' })
