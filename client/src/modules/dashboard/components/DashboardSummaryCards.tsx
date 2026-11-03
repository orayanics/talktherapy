import type { DashboardSummary } from '../api/dashboard'
import { formatDate } from '#/utils/useDate'
import { Link } from '@tanstack/react-router'

function pendingCount(summary: DashboardSummary) {
  return typeof summary.appointments.pending === 'number'
    ? summary.appointments.pending
    : summary.appointments.pending.count
}

function periodTotal(summary: DashboardSummary) {
  return Object.values(summary.appointments.period).reduce(
    (total, count) => total + count,
    0,
  )
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail?: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-tight text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </div>
  )
}

function UnavailableCard({ label, detail }: { label: string; detail: string }) {
  return <SummaryCard label={label} value="—" detail={detail} />
}

function rateLabel(rate: number | null | undefined) {
  return rate == null ? '—' : `${Math.round(rate * 100)}%`
}

export function AdminSummaryCards({ summary }: { summary?: DashboardSummary }) {
  if (!summary) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-content">
        Operational summary is temporarily unavailable. Distribution data is
        still shown below.
      </div>
    )
  }

  const bookingShare = summary.slots?.booking_share
  const rate =
    bookingShare?.rate == null ? '—' : `${Math.round(bookingShare.rate * 100)}%`

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard label="Pending requests" value={pendingCount(summary)} />
      <SummaryCard
        label="Booking share"
        value={rate}
        detail={
          bookingShare
            ? `${bookingShare.occupied}/${bookingShare.eligible} slots`
            : undefined
        }
      />
      <SummaryCard
        label="Awaiting activation"
        value={summary.accounts?.awaiting_activation ?? 0}
      />
      <SummaryCard
        label="Suspended accounts"
        value={summary.accounts?.suspended ?? 0}
      />
      <SummaryCard
        label="Completed rate"
        value={rateLabel(summary.appointments.rates.completed)}
        detail={`${summary.appointments.period.COMPLETED ?? 0}/${summary.appointments.total} appointments`}
      />
      <SummaryCard
        label="Cancelled rate"
        value={rateLabel(summary.appointments.rates.cancelled)}
        detail={`${summary.appointments.period.CANCELLED ?? 0}/${summary.appointments.total} appointments`}
      />
      <SummaryCard
        label="Active patients"
        value={summary.accounts?.active_patients ?? 0}
        detail="Active accounts"
      />
      <SummaryCard
        label="Active clinicians"
        value={summary.accounts?.active_clinicians ?? 0}
        detail="Active accounts"
      />
    </div>
  )
}

export function ClinicianSummaryCards({
  summary,
}: {
  summary?: DashboardSummary
}) {
  if (!summary) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-content">
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
        value={summary.appointments.period.COMPLETED ?? 0}
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

export function PatientSummaryCards({
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
          value={summary.appointments.period.COMPLETED ?? 0}
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
