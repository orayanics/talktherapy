import { queryOptions } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import type { QueryParams } from '#/types/api'
import type { Soap, SoapsResponse } from '#/modules/soaps/types/soap'

export const fetchSoapsByPatient = (
  patientId: string,
  params: QueryParams = {},
  searchParams: { sort?: 'asc' | 'desc' | string } = {},
) => {
  const query = { page: params.page, sort: searchParams.sort }
  return queryOptions<SoapsResponse>({
    queryKey: ['soaps', patientId, query],
    queryFn: () =>
      api<SoapsResponse>(`/api/v1/soaps/patient/${patientId}`, {
        method: 'GET',
        params: query,
      }),
    staleTime: 1000 * 60 * 5,
  })
}
export const fetchSoapById = (soapId: string) =>
  queryOptions<Soap | undefined>({
    queryKey: ['soap', soapId],
    queryFn: async () =>
      (await api<{ data: Soap }>(`/api/v1/soaps/${soapId}`, { method: 'GET' }))
        .data,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

export const mutateCreateSoap = async (
  patientId: string,
  payload: Partial<Soap>,
) =>
  (
    await api<{ data: Soap }>(`/api/v1/soaps/${patientId}`, {
      method: 'POST',
      data: payload,
    })
  ).data

export const mutateUpdateSoap = async (
  soapId: string,
  payload: Partial<Soap>,
) =>
  (
    await api<{ data: Soap }>(`/api/v1/soaps/${soapId}`, {
      method: 'PATCH',
      data: payload,
    })
  ).data
