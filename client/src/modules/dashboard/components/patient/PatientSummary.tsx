import SummaryCard from '#/modules/dashboard/components/SummaryCard'
import { formatDate } from '#/utils/useDate'
import { Link } from '@tanstack/react-router'
import type { DashboardSummary } from '../../api/dashboard'
import { pendingCount } from '../../hooks/count'
import UnavailableCard from '#/modules/dashboard/components/UnavailableCard'

export default function PatientSummary({
  summary,
}: {
  summary?: DashboardSummary
}) {
  if (!summary) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-content">
        Your dashboard summary is temporarily unavailable. Your schedule is
        still shown below.
      </div>
    )
  }

  const next = summary.appointments.next
  const activeAssignments = summary.practice?.active_assignments ?? 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Next session"
          value={next ? (next.clinician?.name ?? 'Scheduled') : 'None'}
          detail={next ? formatDate(next.start_at, 'MMM d, yyyy p') : undefined}
        />
        <SummaryCard label="Pending bookings" value={pendingCount(summary)} />
        <SummaryCard label="Active practice" value={activeAssignments} />
        <SummaryCard
          label="Submissions this week"
          value={summary.practice?.submissions_this_week ?? 0}
        />
        <SummaryCard
          label="Completed sessions"
          value={summary.appointments.period.COMPLETED}
        />
        <UnavailableCard
          label="Progress trend"
          detail="Comparable clinical data is not available yet"
        />
      </div>
      {activeAssignments > 0 && (
        <Link to="/slp/assignments" className="btn btn-neutral btn-sm">
          Open assigned practice
        </Link>
      )}
    </div>
  )
}
