import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api } from '#/lib/api/client'
import { useAlert } from '#/context/AlertContext'
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
    queryFn: async () =>
      (
        await api(`/soaps/patient/${patientId}`, {
          method: 'GET',
          params: query,
        })
      ).data,
    staleTime: 1000 * 60 * 5,
  })
}
export const fetchSoapById = (soapId: string) =>
  queryOptions<Soap | undefined>({
    queryKey: ['soap', soapId],
    queryFn: async () =>
      (await api(`/soaps/${soapId}`, { method: 'GET' })).data,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
export const mutateCreateSoap = (patientId: string) => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Soap>) =>
      (
        await api(`/soaps/${patientId}`, {
          method: 'POST',
          data: JSON.stringify(payload),
        })
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['soaps'] })
      await queryClient.invalidateQueries({ queryKey: ['soap'] })
      showAlert('SOAP created successfully', 'success')
      navigate({ to: '/patients/$patientId', params: { patientId } })
    },
  })
}
export const mutateUpdateSoap = (soapId: string, patientId: string) => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Soap>) =>
      (
        await api(`/soaps/${soapId}`, {
          method: 'PATCH',
          data: JSON.stringify(payload),
        })
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['soaps'] })
      await queryClient.invalidateQueries({ queryKey: ['soap'] })
      showAlert('SOAP updated', 'success')
      navigate({ to: '/patients/$patientId', params: { patientId } })
    },
  })
}
