import { describe, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import type { AppointmentsResponse } from '../types/appointment'
import { fetchAppointments } from './appointments'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))

describe('fetchAppointments', () => {
  it('preserves the Laravel paginator envelope and sends date-only filters', async () => {
    const response: AppointmentsResponse = {
      data: [
        {
          id: 'appointment-1',
          status: 'PENDING',
          booked_at: '2026-10-29T09:00:00.000Z',
          confirmed_at: null,
          cancelled_at: null,
          completed_at: null,
          room_id: null,
          slot: {
            id: 'slot-1',
            start_at: '2026-10-30T09:00:00.000Z',
            end_at: '2026-10-30T10:00:00.000Z',
            status: 'PENDING',
          },
          patient: { id: 'patient-1', name: 'Patient', email: 'patient@example.com' },
          clinician: {
            id: 'clinician-1',
            name: 'Clinician',
            email: 'clinician@example.com',
            diagnosis: null,
          },
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
    const query = fetchAppointments(
      { page: 2 },
      { from: '2026-10-29', to: '2026-10-31', sort: 'asc' },
    )

    const result = await query.queryFn!({} as never)

    expect(result).toEqual(response)
    expect(api).toHaveBeenCalledWith('/api/v1/appointments', {
      method: 'GET',
      params: {
        page: 2,
        date_from: '2026-10-29',
        date_to: '2026-10-31',
        sort: 'asc',
      },
    })
  })
})
