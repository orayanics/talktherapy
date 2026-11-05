import { StatusStat } from '#/modules/dashboard/components/StatusStats'
import { Link } from '@tanstack/react-router'
import type { AdminStats } from '../../api/dashboard'

interface AppointmentsSummaryProps {
  stats: AdminStats
}

export default function AppointmentsSummary({
  stats,
}: AppointmentsSummaryProps) {
  return (
    <section className="bg-white border border-border rounded-md p-4 md:col-span-2 flex flex-col justify-between">
      <p className="font-bold mt-0">Appointments</p>
      <div className="grid grid-cols-2 gap-4 mt-3">
        {Object.entries(stats.appointments).map(([status, count]) => (
          <StatusStat key={status} count={count} status={status} showIcon />
        ))}
      </div>

      <Link to="/appointments" className="btn btn-neutral w-full mt-4">
        View Appointments
      </Link>
    </section>
  )
}
