import { useEffect } from 'react'
import useScheduleForm from './useScheduleForm'
import useRecurrenceBuilder from './useRecurrenceBuilder'
import type { TFrequency } from './schema'
import { formatDate } from '@/utils/useDate'
import RowError from '@/components/Table/RowError'

const FREQ_BUTTONS: ReadonlyArray<{ freq: TFrequency; label: string }> = [
  { freq: 'none', label: 'One-Time' },
  { freq: 'daily', label: 'Daily' },
  { freq: 'weekly', label: 'Weekly' },
  { freq: 'monthly', label: 'Monthly' },
]

export default function ScheduleForm() {
  const { register, setValue, onSubmit, errors, apiError, isLoading, watch } =
    useScheduleForm()

  const startAt = watch('start_at')

  const {
    freq,
    handleFreqChange,
    selectedDays,
    toggleDay,
    count,
    setCount,
    rruleRaw,
    rruleErr,
    occurrences,
    occurrencesPreview,
    remaining,
    DAY_CODES,
  } = useRecurrenceBuilder(startAt)

  useEffect(() => {
    setValue('recurrence_rule', rruleRaw || null)
  }, [rruleRaw, setValue])

  return (
    <form onSubmit={onSubmit} className="w-full bg-white">
      <div className="rounded-lg border border-slate-300 shadow-sm space-y-4 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide">
          New Schedule
        </h2>

        {apiError && (
          <div className="alert alert-soft alert-error">{apiError}</div>
        )}

        <div>
          <div className="space-y-2">
            <h1 className="font-bold uppercase text-sm text-slate-600 tracking-wide">
              Date &amp; Time
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <label>
                  <span className="text-xs font-mono text-gray-400">Start</span>
                  <input
                    {...register('start_at')}
                    type="datetime-local"
                    className="w-full input shadow-sm"
                  />
                </label>

                <RowError message={errors.start_at?.message} />
              </div>

              <div>
                <label>
                  <span className="text-xs font-mono text-gray-400">End</span>
                  <input
                    {...register('end_at')}
                    type="datetime-local"
                    className="w-full input shadow-sm"
                  />
                </label>

                <RowError message={errors.end_at?.message} />
              </div>
            </div>
          </div>

          <div className="divider h-px" />

          <div className="space-y-2">
            <h1 className="font-bold uppercase text-sm text-slate-600 tracking-wide">
              Recurrence
            </h1>

            <div className="flex flex-wrap gap-2">
              {FREQ_BUTTONS.map(({ freq: f, label }) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFreqChange(f)}
                  className={` btn ${freq === f ? 'btn-neutral' : 'btn-soft'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {freq === 'weekly' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-mono text-gray-400 uppercase tracking-wide">
                    Days of week
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAY_CODES.map(({ code, label }) => {
                      const active = selectedDays.has(code)
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleDay(code)}
                          className={`btn btn-circle ${
                            active ? 'btn-neutral' : 'btn-soft'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {selectedDays.size === 0 && (
                  <p className="text-xs text-error">Select at least one day</p>
                )}
              </div>
            )}

            {freq !== 'none' && (
              <div className="space-x-4">
                <label>
                  <span className="text-xs font-mono text-gray-400">
                    Occurrences
                  </span>

                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="input shadow-sm w-24 ml-4"
                  />
                </label>

                <span className="text-xs text-slate-400 font-mono uppercase">
                  max 365
                </span>
              </div>
            )}
          </div>

          <div className="divider h-px" />

          <div className="card space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-bold uppercase text-sm text-slate-600 tracking-wide">
                Occurrence Preview
              </h1>
              <div className="badge badge-soft text-xs font-mono">
                {occurrences.length > 0
                  ? `${occurrences.length} occurrence${occurrences.length !== 1 ? 's' : ''}`
                  : '—'}
              </div>
            </div>

            {!startAt ? (
              <p className="text-xs text-slate-600 ">
                Set a start date to preview occurrences.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {occurrencesPreview.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-right text-xs font-mono text-neutral/60 shrink-0">
                      {i + 1}
                    </span>
                    <div
                      className={`w-0.5 h-3.5 rounded-full shrink-0 ${
                        i === 0
                          ? 'bg-gray-700 dark:bg-gray-300'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                    <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                      {formatDate(d, 'PPp')}
                    </span>
                  </div>
                ))}
                {remaining > 0 && (
                  <p className="text-xs font-mono text-slate-600">
                    + {remaining} more occurrence{remaining !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <p className="text-xs text-slate-600">
            Server enforces a one-year horizon on generated occurrences.
          </p>
          <button
            type="submit"
            disabled={
              isLoading ||
              (freq === 'weekly' && selectedDays.size === 0) ||
              !!rruleErr
            }
            className="btn btn-neutral"
          >
            Create Schedule
          </button>
        </div>
      </div>
    </form>
  )
}
