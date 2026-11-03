/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import type { Appointment } from '#/modules/appointments/types/appointment'
import ScheduleData from './ScheduleData'

it('renders every appointment with its patient, time, and status color', () => {
  const appointments = [
    {
      id: 'appointment-1',
      status: 'PENDING',
      patient: {
        id: 'patient-1',
        name: 'Alex Rivera',
        email: 'alex@example.com',
      },
      slot: {
        id: 'slot-1',
        start_at: '2026-11-03T09:00:00.000Z',
        end_at: '2026-11-03T10:00:00.000Z',
        status: 'PENDING',
      },
    },
    {
      id: 'appointment-2',
      status: 'ACCEPTED',
      patient: { id: 'patient-2', name: 'Sam Lee', email: 'sam@example.com' },
      slot: {
        id: 'slot-2',
        start_at: '2026-11-03T11:00:00.000Z',
        end_at: '2026-11-03T12:00:00.000Z',
        status: 'ACCEPTED',
      },
    },
  ] as Array<Appointment>

  render(<ScheduleData appointments={appointments} />)

  expect(screen.getAllByRole('listitem')).toHaveLength(2)
  expect(screen.getByText('Alex Rivera').parentElement?.className).toContain(
    'bg-amber-50',
  )
  expect(screen.getByText('Sam Lee').parentElement?.className).toContain(
    'bg-green-50',
  )
})
