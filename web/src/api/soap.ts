import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import type { CreateSoapPayload } from '~/models/payloads'
import type { PatientRecordsParams } from '~/models/params'
import { api } from '~/api/axios'
import { SOAP } from '~/config/message'
import { useAlert } from '~/context/AlertContext'

// PATIENT Endpoints
// GET /scheduling/soap/ - list SOAPs for authenticated patient
export const patientSoapsQuery = (params: PatientRecordsParams = {}) =>
  queryOptions({
    queryKey: ['soaps', params],
    queryFn: async () => {
      const apiParams = {
        ...(params.from && { from: params.from }),
        ...(params.to && { to: params.to }),
        ...(params.clinician_name && { clinician_name: params.clinician_name }),
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
      }
      const { data } = await api.get(`/scheduling/soaps/`, {
        params: apiParams,
      })
      return data
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

// GET /scheduling/soap/:soap_id - get single SOAP for authenticated patient
export const patientSoapByIdQuery = (soapId: string) =>
  queryOptions({
    queryKey: ['soaps', soapId],
    queryFn: async () => {
      const { data } = await api.get(`/scheduling/soaps/${soapId}`)
      return data
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

// clinician mutations
export const useCreateSoap = (patientId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: CreateSoapPayload) => {
      const { data } = await api.post(
        `/scheduling/soap/patients/${patientId}`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['clinician', 'patient', patientId, 'soaps'],
      })
      showAlert(SOAP.create.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Create SOAP failed:', error.response?.data)
      }
      showAlert(SOAP.create.error, 'error')
    },
  })
}
