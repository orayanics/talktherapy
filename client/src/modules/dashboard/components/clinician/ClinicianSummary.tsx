import SummaryCard from '#/modules/dashboard/components/SummaryCard'
import { formatDate } from '#/utils/useDate'
import type { DashboardSummary } from '../../api/dashboard'
import { pendingCount, periodTotal, rateLabel } from '../../hooks/count'

export default function ClinicianSummary({
  summary,
}: {
  summary?: DashboardSummary
}) {
  if (!summary) {
    return (
      <div className="rounded-box border border-warning/30 bg-warning/10 p-4 text-sm text-warning-content">
        Workload summary is temporarily unavailable. Today’s appointments are
        still shown below.
      </div>
    )
  }

  const next = summary.appointments.next

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard
        label="This week's appointments"
        value={periodTotal(summary)}
      />
      <SummaryCard label="Pending requests" value={pendingCount(summary)} />
      <SummaryCard label="Patients seen" value={summary.patients?.seen ?? 0} />
      <SummaryCard
        label="Completed sessions"
        value={summary.appointments.period.COMPLETED}
        detail={`${rateLabel(summary.appointments.rates.completed)} of period appointments`}
      />
      <SummaryCard
        label="Active practice"
        value={summary.practice?.active_assignments ?? 0}
      />
      <SummaryCard
        label="Next session"
        value={next ? (next.patient?.name ?? 'Scheduled') : 'None'}
        detail={next ? formatDate(next.start_at, 'MMM d, yyyy p') : undefined}
      />
    </div>
  )
}
