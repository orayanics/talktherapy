import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api } from './client'
import { useAlert } from '@/context/AlertContext'
import type { QueryParams, ClinicianPatientsParams, Meta } from '@/types/params'
import type { Clinician, Patient } from './schedule'

export interface ClinicianPatient {
  clinicianId: string
  patientId: string
  firstCompletedAt?: string
  clinician: Clinician
  patient: Patient
}

export interface ClinicianPatientsResponse {
  data: ClinicianPatient[]
  meta: Meta
}

export interface Soap {
  id: string
  clinicianId: string
  patientId: string
  activity_plan?: string | null
  session_type?: string | null
  subjective_notes?: string | null
  objective_notes?: string | null
  assessment?: string | null
  recommendation?: string | null
  comments?: string | null
  createdAt: string
  updatedAt: string
  clinician: Clinician
  patient: Patient
}

export interface SoapsResponse {
  data: Soap[]
  meta: Meta
}

export const fetchClinicianPatients = (
  params: QueryParams = {},
  searchParams: ClinicianPatientsParams = {},
) => {
  const query = {
    page: params.page,
    search: searchParams.search,
    sort: searchParams.sort,
  }

  return queryOptions<ClinicianPatientsResponse>({
    queryKey: ['clinician-patients', query],
    queryFn: async () => {
      const { data } = await api('/clinician-patient', {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const fetchSoapsByPatient = (
  patientId: string,
  params: QueryParams = {},
  searchParams: { sort?: 'asc' | 'desc' | string } = {},
) => {
  const query = {
    page: params.page,
    sort: searchParams.sort,
  }

  return queryOptions<SoapsResponse>({
    queryKey: ['soaps', patientId, query],
    queryFn: async () => {
      const { data } = await api(`/soaps/patient/${patientId}`, {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const fetchSoapById = (soapId: string) => {
  return queryOptions<Soap | undefined>({
    queryKey: ['soap', soapId],
    queryFn: async () => {
      const { data } = await api(`/soaps/${soapId}`, { method: 'GET' })
      return data
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

export const mutateCreateSoap = (patientId: string) => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<Soap>) => {
      const { data } = await api(`/soaps/${patientId}`, {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['soaps'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['soap'],
      })
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
    mutationFn: async (payload: Partial<Soap>) => {
      const { data } = await api(`/soaps/${soapId}`, {
        method: 'PATCH',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['soaps'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['soap'],
      })
      showAlert('SOAP updated', 'success')
      navigate({ to: '/patients/$patientId', params: { patientId } })
    },
  })
}
