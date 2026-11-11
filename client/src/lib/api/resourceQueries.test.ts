import { QueryClient } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { api } from './client'
import {
  fetchAppointments,
  fetchAppointment,
} from '#/modules/appointments/api/appointments'
import { fetchSoapById, fetchSoapsByPatient } from '#/modules/soaps/api/soaps'
import {
  fetchContentById,
  fetchContentList,
} from '#/modules/content/api/content'
import {
  fetchUsers,
  fetchUser,
  fetchUsersCount,
} from '#/modules/users/api/users'
import { fetchSlot, fetchSlots } from '#/modules/schedules/api/schedules'
import { fetchClinicianPatients } from '#/modules/patients/api/patients'

vi.mock('./client', () => ({ api: vi.fn() }))
afterEach(() => vi.clearAllMocks())

const queries = [
  ['appointments', () => fetchAppointments()],
  ['appointment', () => fetchAppointment('a')],
  ['SOAPs', () => fetchSoapsByPatient('p')],
  ['SOAP', () => fetchSoapById('s')],
  ['content list', () => fetchContentList()],
  ['content', () => fetchContentById('c')],
  ['users', () => fetchUsers()],
  ['user', () => fetchUser('u')],
  ['user counts', () => fetchUsersCount()],
  ['slots', () => fetchSlots()],
  ['slot', () => fetchSlot('s')],
  ['patients', () => fetchClinicianPatients()],
] as const

it.each(queries)(
  'cancels the HTTP request when %s query is canceled',
  async (_name, options) => {
    vi.mocked(api).mockImplementation(() => new Promise(() => {}))
    const client = new QueryClient()
    const query = options()
    if (typeof query.queryFn !== 'function')
      throw new Error('Resource query requires a query function')
    const pending = client.query<unknown>({
      queryKey: query.queryKey,
      queryFn: query.queryFn,
    })
    const rejection = expect(pending).rejects.toThrow()
    await vi.waitFor(() => expect(api).toHaveBeenCalledOnce())
    const signal = vi.mocked(api).mock.calls[0][1]?.signal
    expect(signal?.aborted).toBe(false)
    await client.cancelQueries({ queryKey: query.queryKey })
    await rejection
    expect(signal?.aborted).toBe(true)
    client.clear()
  },
)
