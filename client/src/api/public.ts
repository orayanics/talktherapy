import { queryOptions } from '@tanstack/react-query'
import { api } from './client'

export interface DiagnosisItem {
  id: string
  value: string
  label: string
}

export const fetchDiagnoses = queryOptions<DiagnosisItem[]>({
  queryKey: ['public-diagnoses'],
  queryFn: async () => {
    const { data } = await api('/public/diagnoses', {
      method: 'GET',
    })
    return data
  },
  staleTime: 1000 * 60 * 60,
})
