import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '#/utils/useDate'

export default function ScheduleCalendar({
  start,
  days = 35,
  renderDay,
  onSelect,
}: {
  start: string
  days?: number
  renderDay?: (date: string) => ReactNode
  onSelect?: (date: string) => void
}) {
  const [offset, setOffset] = useState(0)
  const anchor = new Date(`${start}T00:00:00Z`)
  anchor.setUTCDate(anchor.getUTCDate() + offset)
  const monday = new Date(anchor)
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7))
  const monthStart = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
  )
  const monthEnd = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0),
  )
  const today = formatDate(new Date(), 'yyyy-MM-dd')

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-900">
              {formatDate(anchor, 'MMMM yyyy')}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {formatDate(monthStart, 'MMM d, yyyy')} –{' '}
              {formatDate(monthEnd, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="join self-start sm:self-auto">
          <button
            type="button"
            className="btn join-item bg-white"
            aria-label="Previous period"
            onClick={() => setOffset(offset - days)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn join-item bg-white"
            onClick={() => setOffset(0)}
          >
            Today
          </button>
          <button
            type="button"
            className="btn join-item bg-white"
            aria-label="Next period"
            onClick={() => setOffset(offset + days)}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto border-t border-slate-200">
        <div className="grid min-w-4xl grid-cols-7 gap-px bg-slate-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="bg-white py-3 text-center text-xs font-medium text-slate-600"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: days }, (_, i) => {
            const date = new Date(monday)
            date.setUTCDate(date.getUTCDate() + i)
            const key = formatDate(date, 'yyyy-MM-dd')
            const outsideMonth = date.getUTCMonth() !== anchor.getUTCMonth()

            return (
              <div key={key} className="min-h-32 overflow-hidden bg-white p-2">
                <button
                  type="button"
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                    key === today
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : outsideMonth
                        ? 'text-slate-400'
                        : 'text-slate-700'
                  }`}
                  aria-label={formatDate(date, 'EEEE, MMMM d, yyyy')}
                  onClick={() => onSelect?.(key)}
                >
                  {date.getUTCDate()}
                </button>
                <div className="mt-2 space-y-1 overflow-hidden text-xs">
                  {renderDay?.(key)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
