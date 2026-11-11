import type { AdminUser } from '#/modules/users/types/user'

import { api } from '#/lib/api/client'

import type {
  TRegisterPatient,
  TRegisterAdmin,
  TRegisterClinician,
  TRegisterPatientInvitation,
} from '#/modules/register/types/schema'

export const mutateRegisterPatient = async (payload: TRegisterPatient) => {
  const { data } = await api<{
    data: { email: string; status: 'pending' }
  }>('/api/v1/registrations/patient', {
    method: 'POST',
    data: JSON.stringify(payload),
  })
  return data
}

export const mutateRegisterClinician = async (payload: TRegisterClinician) => {
  const { data } = await api<{ data: AdminUser }>('/api/v1/users', {
    method: 'POST',
    data: JSON.stringify({ ...payload, role: 'clinician' }),
  })
  return data
}

export const mutateRegisterAdmin = async (payload: TRegisterAdmin) => {
  const { data } = await api<{ data: AdminUser }>('/api/v1/users', {
    method: 'POST',
    data: JSON.stringify({ ...payload, role: 'admin' }),
  })
  return data
}

export const mutateRegisterPatientInvitation = async (
  payload: TRegisterPatientInvitation,
) => {
  const { data } = await api<{ data: AdminUser }>('/api/v1/users', {
    method: 'POST',
    data: JSON.stringify({ ...payload, role: 'patient' }),
  })
  return data
}
