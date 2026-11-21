import AppointmentPill from '#/modules/appointments/components/AppointmentPill'
import type { Appointment } from '#/modules/appointments/types/appointment'
import { formatDate } from '#/utils/useDate'
import { Link } from '@tanstack/react-router'
import { Stethoscope } from 'lucide-react'

export default function UpcomingAppointmentItem({ a }: { a: Appointment }) {
  return (
    <li className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-box">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-50 rounded-box border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase leading-none ">
            {formatDate(a.slot.start_at, 'MMM')}
          </span>
          <span className="text-xs font-bold text-slate-900">
            {formatDate(a.slot.start_at, 'dd')}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-base-content leading-normal">
            <Stethoscope size={18} />
            {a.clinician.name}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-slate-500 tracking-tight">
              {formatDate(a.slot.start_at, 'p')}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <AppointmentPill status={a.status} />
          </div>
        </div>
      </div>

      <Link to="/appointments" className="btn btn-sm btn-neutral">
        Appointments
      </Link>
    </li>
  )
}
