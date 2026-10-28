import { describe, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import type { ClinicianPatientsResponse } from '#/modules/patients/types/patients'
import { fetchClinicianPatients } from './patients'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))

describe('fetchClinicianPatients', () => {
  it('preserves the paginator envelope and uses the versioned route', async () => {
    const response: ClinicianPatientsResponse = {
      data: [
        {
          clinicianId: 'clinician-1',
          patientId: 'patient-1',
          firstCompletedAt: '2026-10-29T00:00:00.000Z',
          patient: { id: 'patient-1', name: 'Patient' },
        },
      ],
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
    const query = fetchClinicianPatients({ page: 2 }, { search: 'Patient', sort: 'asc' })

    const result = await query.queryFn!({} as never)

    expect(result).toEqual(response)
    expect(api).toHaveBeenCalledWith('/api/v1/patients', {
      method: 'GET',
      params: { page: 2, search: 'Patient', sort: 'asc' },
    })
  })
})
