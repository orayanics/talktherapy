import SummaryCard from '#/components/Dashboard/SummaryCard'
import type { DashboardSummary } from '../../api/dashboard'
import { appointmentRedirect, pendingCount, rateLabel } from '../../hooks/count'

export function AdminSummary({ summary }: { summary?: DashboardSummary }) {
  if (!summary) {
    return (
      <div role="alert" className="alert alert-neutral alert-soft">
        <span>
          Operational summary is temporarily unavailable. Distribution data is
          still shown below.
        </span>
      </div>
    )
  }

  const bookingShare = summary.slots?.booking_share
  const rate =
    bookingShare?.rate == null ? '—' : `${Math.round(bookingShare.rate * 100)}%`

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard
        label="Pending requests"
        value={pendingCount(summary)}
        redirect={appointmentRedirect(summary, 'PENDING')}
      />
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
        redirect={{
          to: '/users',
          search: { account_status: ['pending'] },
        }}
      />
      <SummaryCard
        label="Suspended accounts"
        value={summary.accounts?.suspended ?? 0}
        redirect={{
          to: '/users',
          search: { account_status: ['suspended'] },
        }}
      />
      <SummaryCard
        label="Completed rate"
        value={rateLabel(summary.appointments.rates.completed)}
        detail={`${summary.appointments.period.COMPLETED}/${summary.appointments.total} appointments`}

        redirect={appointmentRedirect(summary, 'COMPLETED')}
      />
      <SummaryCard
        label="Cancelled rate"
        value={rateLabel(summary.appointments.rates.cancelled)}
        detail={`${summary.appointments.period.CANCELLED}/${summary.appointments.total} appointments`}
        redirect={appointmentRedirect(summary, 'CANCELLED')}
      />
      <SummaryCard
        label="Active patients"
        value={summary.accounts?.active_patients ?? 0}
        detail="Active accounts"
        redirect={{
          to: '/users',
          search: { account_status: ['active'], role: ['patient'] },
        }}
      />
      <SummaryCard
        label="Active clinicians"
        value={summary.accounts?.active_clinicians ?? 0}
        detail="Active accounts"
        redirect={{
          to: '/users',
          search: { account_status: ['active'], role: ['clinician'] },
        }}
      />
    </div>
  )
}
