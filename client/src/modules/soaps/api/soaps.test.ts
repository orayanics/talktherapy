import { describe, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import type { Soap, SoapsResponse } from '#/modules/soaps/types/soap'
import { fetchSoapById, fetchSoapsByPatient } from './soaps'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))

describe('fetchSoapsByPatient', () => {
  it('preserves the paginator envelope and uses the versioned route', async () => {
    const response: SoapsResponse = {
      data: [],
      meta: {
        current_page: 2,
        from: 16,
        last_page: 3,
        per_page: 15,
        to: 30,
        total: 42,
      },
    }
    vi.mocked(api).mockResolvedValue(response)
    const query = fetchSoapsByPatient('patient-1', { page: 2 }, { sort: 'asc' })

    const result = await query.queryFn!({} as never)

    expect(result).toEqual(response)
    expect(api).toHaveBeenCalledWith('/api/v1/soaps/patient/patient-1', {
      method: 'GET',
      params: { page: 2, sort: 'asc' },
    })
  })

  it('unwraps one SOAP resource from the versioned detail route', async () => {
    const soap: Soap = {
      id: 'soap-1',
      clinicianId: 'clinician-1',
      patientId: 'patient-1',
      activity_plan: 'Plan',
      version: 1,
      createdAt: '2026-10-29T00:00:00.000Z',
      updatedAt: '2026-10-29T00:00:00.000Z',
      clinician: { id: 'clinician-1', name: 'Clinician', diagnosis: null },
      patient: { id: 'patient-1', name: 'Patient' },
    }
    vi.mocked(api).mockResolvedValue({ data: soap })
    const query = fetchSoapById(soap.id)

    const result = await query.queryFn!({} as never)

    expect(result).toEqual(soap)
    expect(api).toHaveBeenCalledWith('/api/v1/soaps/soap-1', { method: 'GET' })
  })
})
