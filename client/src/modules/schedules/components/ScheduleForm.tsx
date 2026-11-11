import { useEffect } from 'react'
import useScheduleForm from '#/modules/schedules/hooks/useScheduleForm'
import useRecurrenceBuilder from '#/modules/schedules/hooks/useRecurrenceBuilder'
import type { TFrequency } from '../types/schema'
import { formatDate } from '#/utils/useDate'
import FormInput from '#/components/Form/FormInput'

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
    DAY_CODES,
  } = useRecurrenceBuilder(startAt)

  useEffect(() => {
    setValue('recurrence_rule', rruleRaw || null)
  }, [rruleRaw, setValue])

  return (
    <form onSubmit={onSubmit} className="w-full bg-white">
      <div className="space-y-4 p-4">
        {apiError && (
          <div className="alert alert-soft alert-error" role="alert">
            {apiError}
          </div>
        )}

        <div>
          <div className="space-y-2">
            <span className="font-bold">Date &amp; Time</span>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <span className="text-muted lg:col-span-2">
                Schedule times and previews use UTC
              </span>
              <FormInput
                htmlFor="schedule-start-at"
                label="Start (UTC)"
                error={errors.start_at?.message}
                required
              >
                <input
                  id="schedule-start-at"
                  {...register('start_at')}
                  type="datetime-local"
                  className="w-full input "
                />
              </FormInput>

              <FormInput
                htmlFor="schedule-end-at"
                label="End (UTC)"
                error={errors.end_at?.message}
                required
              >
                <input
                  id="schedule-end-at"
                  {...register('end_at')}
                  type="datetime-local"
                  className="w-full input "
                />
              </FormInput>
            </div>
          </div>

          <div className="divider h-px" />

          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="font-bold">Recurrence</span>
              <span className="text-muted lg:col-span-2">
                How many times this schedule should appear
              </span>
            </div>

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
              <div className="space-x-2">
                <FormInput
                  htmlFor="schedule-occurrences"
                  label="Occurrences"
                  className="inline-flex"
                  required
                >
                  <input
                    id="schedule-occurrences"
                    type="number"
                    min={1}
                    max={365}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="input w-stretch"
                  />
                </FormInput>

                <span className="text-muted">max 365</span>
              </div>
            )}
          </div>

          <div className="divider h-px" />

          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Preview</span>
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
                {occurrences.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-right font-mono text-neutral/60 shrink-0">
                      {i + 1}
                    </span>
                    <div className={`w-0.5 h-3.5 rounded-full shrink-0`} />
                    <span className="font-mono ">{formatDate(d, 'PPp')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-4">
          <span className="text-muted">
            Server enforces a one-year horizon on generated occurrences.
          </span>
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
