import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { startOfDay, endOfDay, addDays } from 'date-fns'
import { ArrowRight, Stethoscope } from 'lucide-react'

import { fetchAppointments } from '@/api/schedule'
import type { Appointment } from '@/api/schedule'

import { fetchContentList } from '@/api/content'
import type { Content } from '@/api/content'

import StateLoading from '@/components/State/StateLoading'
import StateError from '@/components/State/StateError'
import StateNull from '@/components/State/StateNull'
import AppointmentPill from '@/components/Decorator/AppointmentPill'

import { formatDate } from '@/utils/useDate'

function upcomingRange() {
  const start = startOfDay(new Date())
  const end = endOfDay(addDays(start, 30))

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  }
}

export default function PatientDashboard() {
  const { from, to } = upcomingRange()

  const apptQ = useQuery(fetchAppointments({}, { from, to }))
  const appts: Appointment[] = apptQ.data?.data ?? []

  const contentQ = useQuery(
    fetchContentList({ page: 1 }, { is_bookmarked: true }),
  )
  const bookmarks: Content[] = contentQ.data?.data ?? []

  if (apptQ.isLoading || contentQ.isLoading) return <StateLoading />
  if (apptQ.isError || contentQ.isError) return <StateError />

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">
            Clinical Schedule
          </p>
          <p className="text-xs text-slate-400 font-medium">Next 30 days</p>
        </div>

        {appts.length === 0 ? (
          <StateNull />
        ) : (
          <ul className="space-y-3">
            {appts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase leading-none ">
                      {formatDate(a.slot.startAt, 'MMM')}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {formatDate(a.slot.startAt, 'dd')}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 leading-tight">
                      <Stethoscope size={18} />
                      {a.clinician.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500 tracking-tight">
                        {formatDate(a.slot.startAt, 'p')}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <AppointmentPill status={a.status} />
                    </div>
                  </div>
                </div>

                <Link
                  to="/appointments/$appointmentId"
                  params={{
                    appointmentId: a.id,
                  }}
                  className="btn btn-sm btn-neutral"
                >
                  Details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Bookmarks Section */}
      <section className="space-y-4">
        <div>
          <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">
            Bookmarked Content
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Your saved articles for later reading
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 italic">
              No bookmarks yet. Browse clinical content to save helpful
              articles.
            </p>
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
                p-4 bg-white border border-slate-200 rounded-lg"
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900 font-serif">
                    {c.title}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {c.description}
                  </p>
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
