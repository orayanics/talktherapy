import { queryOptions } from '@tanstack/react-query'

import type {
  ClinicianMyPatientParams,
  ClinicianPatientDetailParams,
  PatientRecordsParams,
} from '~/models/params'
import type {
  ClinicianPatientDetailDto,
  SoapPaginatedDto,
} from '~/models/booking'

import { api } from '~/api/axios'

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

export const clinicianPatientSoapsQuery = (
  patientId: string,
  params: PatientRecordsParams,
) =>
  queryOptions<SoapPaginatedDto>({
    queryKey: ['clinician', 'patient', patientId, 'soaps', params],
    queryFn: async () => {
      const { data } = await api.get(
        `/scheduling/soaps/patients/${patientId}`,
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
    retry: false,
  })
