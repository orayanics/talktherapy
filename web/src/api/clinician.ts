import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import type {
  ClinicianMyPatientParams,
  ClinicianPatientDetailParams,
} from '~/models/params'
import type { ClinicianPatientDetailDto, SoapDto } from '~/models/booking'
import type { CreateSoapPayload } from '~/models/payloads'

import { api } from '~/api/axios'
import { SOAP } from '~/config/message'
import { useAlert } from '~/context/AlertContext'

export const clinicianMyPatientsQuery = (params: ClinicianMyPatientParams) =>
  queryOptions({
    queryKey: ['clinician', 'my-patients', params],
    queryFn: async () => {
      const { data } = await api.get('/scheduling/appointments/patients', {
        params,
      })
      return data
    },
    placeholderData: (prev) => prev,
    retry: false,
  })

export const clinicianPatientDetailQuery = (
  patientId: string,
  params: ClinicianPatientDetailParams,
) =>
  queryOptions<ClinicianPatientDetailDto>({
    queryKey: ['clinician', 'patient', patientId, params],
    queryFn: async () => {
      const { data } = await api.get(
        `/scheduling/appointments/patients/${patientId}`,
        {
          params: {
            ...(params.from && { from: params.from }),
            ...(params.to && { to: params.to }),
            page: params.page ?? 1,
            per_page: params.perPage ?? 10,
          },
        },
      )
      return data
    },
    placeholderData: (prev) => prev,
    retry: false,
  })

export const clinicianPatientSoapsQuery = (patientId: string) =>
  queryOptions<Array<SoapDto>>({
    queryKey: ['clinician', 'patient', patientId, 'soaps'],
    queryFn: async () => {
      const { data } = await api.get(`/scheduling/soap/patients/${patientId}`)
      return data
    },
    retry: false,
  })

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
