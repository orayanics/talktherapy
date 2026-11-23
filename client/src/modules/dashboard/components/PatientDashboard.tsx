import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { fetchAppointments } from '#/modules/appointments/api/appointments'
import type { Appointment } from '#/modules/appointments/types/appointment'
import { fetchDashboardSummary } from '#/modules/dashboard/api/dashboard'

import type { Content } from '#/modules/content/api/content'
import { fetchContentList } from '#/modules/content/api/content'

import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import StateNull from '#/components/State/StateNull'

import { formatDate } from '#/utils/useDate'
import PatientSummary from './patient/PatientSummary'

import UpcomingAppointmentItem from './UpcomingAppointmentItem'

function upcomingRange() {
  const start = new Date()
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 30)

  return {
    from: formatDate(start, 'yyyy-MM-dd'),
    to: formatDate(end, 'yyyy-MM-dd'),
  }
}

export default function PatientDashboard() {
  const { from, to } = upcomingRange()

  const apptQ = useQuery(fetchAppointments({}, { from, to }))
  const summaryQ = useQuery(
    fetchDashboardSummary({ date_from: from, date_to: to }),
  )
  const appts: Appointment[] = apptQ.data?.data ?? []

  const contentQ = useQuery(
    fetchContentList({ page: 1 }, { is_bookmarked: true }),
  )
  const bookmarks: Content[] = contentQ.data?.data ?? []

  if (apptQ.isLoading) return <StateLoading />

  return (
    <div className="space-y-6">
      <PatientSummary summary={summaryQ.data} />
      <section className="space-y-4">
        <div>
          <p className="text-lg font-semibold text-base-content">
            Clinical Schedule
          </p>
          <p className="text-sm text-muted">Next 30 days</p>
        </div>

        {apptQ.isError ? (
          <StateError />
        ) : appts.length === 0 ? (
          <StateNull />
        ) : (
          <ul className="space-y-3">
            {appts.map((a) => (
              <UpcomingAppointmentItem key={a.id} a={a} />
            ))}
          </ul>
        )}
      </section>

      {/* Bookmarks Section */}
      <section className="space-y-4">
        <div>
          <p className="text-lg font-semibold text-base-content">
            Bookmarked Content
          </p>
          <p className="text-sm text-muted">
            Your saved articles for later reading
          </p>
        </div>

        {contentQ.isLoading ? (
          <StateLoading />
        ) : contentQ.isError ? (
          <StateError />
        ) : bookmarks.length === 0 ? (
          <div
            className="p-6 alert alert-soft text-center flex flex-col"
            role="alert"
          >
            Looks like you don't have any favorites yet
            <Link to="/content" className="btn btn-primary">
              Browse content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarks.map((c) => (
              <Link
                to="/content/$contentId"
                params={{ contentId: c.id }}
                key={c.id}
                className="group hover:border-slate-400 transition-border
                flex items-end-safe justify-between
                p-4 bg-white border border-slate-200 rounded-box"
              >
                <div className="space-y-1">
                  <h3 className="font-bold">{c.title}</h3>
                  <p className="text-muted">{c.description}</p>
                </div>

                <div className="gap-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-neutral uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Read
                  </p>
                  <ArrowRight
                    size={12}
                    className="text-neutral opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
