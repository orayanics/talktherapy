import useSchedule from './useSchedule'
import type { Freq } from '~/models/booking'
import { DAYS } from '~/utils/rrule'
import { fieldError, hasOnlyMessage } from '~/utils/errors'
import { todayUtcStr } from '~/utils/date'
import Loader from '~/components/Loader/Loader'

export default function ScheduleForm() {
  const { form, errors, isLoading, handleChange, handleSubmit, toggleDay } =
    useSchedule()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      noValidate
      className="border rounded-lg p-6 shadow-sm/10 bg-white flex flex-col gap-6"
    >
      {hasOnlyMessage(errors) && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>{errors!.message}</span>
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-sm text-primary uppercase">
          Date & Time
        </h2>

        <fieldset>
          <legend className="fieldset-legend font-mono text-sm uppercase text-gray-400">
            <span className="text-primary mr-1">*</span>
            Schedule Date
          </legend>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            aria-required
            className="input validator w-full"
            placeholder="Pick a date"
            min={todayUtcStr()}
            title="Must be valid date"
          />
          {fieldError(errors, 'date') && (
            <p className="text-error text-sm mt-1">
              {fieldError(errors, 'date')}
            </p>
          )}
        </fieldset>
        <fieldset>
          <legend className="fieldset-legend font-mono text-sm uppercase text-gray-400">
            <span className="text-primary mr-1">*</span>
            Start Time
          </legend>
          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            className="input validator w-full"
            required
            aria-required
          />
          {fieldError(errors, 'start_time') && (
            <p className="text-error text-sm mt-1">
              {fieldError(errors, 'start_time')}
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="fieldset-legend font-mono text-sm uppercase text-gray-400">
            <span className="text-primary mr-1">*</span>
            End Time
          </legend>
          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            className="input validator w-full"
            required
            aria-required
          />
          {fieldError(errors, 'end_time') && (
            <p className="text-error text-sm mt-1">
              {fieldError(errors, 'end_time')}
            </p>
          )}
        </fieldset>
      </section>

      <hr />

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-sm text-primary uppercase">Recurrence</h2>

        <div className="flex gap-2 flex-wrap">
          {(['none', 'DAILY', 'WEEKLY', 'MONTHLY'] as Array<Freq>).map((f) => (
            <label key={f} className="cursor-pointer">
              <input
                type="radio"
                name="freq"
                value={f}
                checked={form.freq === f}
                onChange={handleChange}
                className="sr-only"
              />
              <span
                className={`btn btn-sm ${form.freq === f ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
              >
                {f === 'none'
                  ? 'One-time'
                  : f.charAt(0) + f.slice(1).toLowerCase()}
              </span>
            </label>
          ))}
        </div>

        {form.freq === 'WEEKLY' && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-400 font-mono uppercase">
              Days <span className="text-primary">*</span>
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Select days of the week"
            >
              {DAYS.map((d) => {
                const active = form.selected_days.includes(d.value)
                return (
                  <label key={d.value} className="cursor-pointer">
                    <input
                      type="checkbox"
                      name="selected_days"
                      value={d.value}
                      checked={active}
                      onChange={() => toggleDay(d.value)}
                      className="sr-only"
                      aria-label={d.label}
                    />
                    <span
                      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                    >
                      {d.label}
                    </span>
                  </label>
                )
              })}
            </div>
            {fieldError(errors, 'selected_days') && (
              <p className="text-error text-sm font-medium" role="alert">
                {fieldError(errors, 'selected_days')}
              </p>
            )}
          </div>
        )}
      </section>

      {form.freq !== 'none' && form.freq !== 'MONTHLY' && (
        <>
          <hr />

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-sm text-primary uppercase">
              Expansion Window
            </h2>

            <fieldset>
              <legend className="fieldset-legend font-mono text-sm uppercase text-gray-400">
                {`Generate slots for the next ${form.horizon_days} day${form.horizon_days !== 1 ? 's' : ''}`}
              </legend>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-gray-400">1</span>
                <input
                  type="range"
                  name="horizon_days"
                  min={1}
                  max={30}
                  value={form.horizon_days}
                  onChange={handleChange}
                  className="range range-primary range-xs w-full"
                />
                <span className="font-mono text-sm text-gray-400">30</span>
              </div>
              <p className="text-sm text-gray-400">
                Slots will be pre-generated up to {form.horizon_days} day
                {form.horizon_days !== 1 ? 's' : ''} from today. Maximum is 30
                days.
              </p>
            </fieldset>
          </section>
        </>
      )}

      {form.freq !== 'none' &&
        form.freq !== 'WEEKLY' &&
        form.freq !== 'DAILY' && (
          <>
            <hr />

            <section className="flex flex-col gap-2">
              <h2 className="font-mono text-sm text-primary uppercase">
                Expansion Window
              </h2>

              <fieldset>
                <legend className="fieldset-legend font-mono text-sm uppercase text-gray-400">
                  {`Generate slots for the next ${form.horizon_days} month${form.horizon_days !== 1 ? 's' : ''}`}
                </legend>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-gray-400">1</span>
                  <input
                    type="range"
                    name="horizon_days"
                    min={1}
                    max={6}
                    value={form.horizon_days}
                    onChange={handleChange}
                    className="range range-primary range-xs w-full"
                  />
                  <span className="font-mono text-sm text-gray-400">6</span>
                </div>
                <p className="text-sm text-gray-400">
                  Slots will be pre-generated up to {form.horizon_days} month
                  {form.horizon_days !== 1 ? 's' : ''} from today. Maximum is 6
                  months.
                </p>
              </fieldset>
            </section>
          </>
        )}

      <hr />

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-sm text-primary uppercase">Preview</h2>

        <div className="border rounded-lg bg-gray-50">
          <Row label="Date" value={form.date || '—'} />
          <Row
            label="Time"
            value={
              form.start_time && form.end_time
                ? `${form.start_time} → ${form.end_time}`
                : '—'
            }
          />
          <Row
            label="Recurrence"
            value={
              form.freq === 'none'
                ? 'One-time'
                : form.freq === 'WEEKLY' && form.selected_days.length > 0
                  ? `Weekly on [${form.selected_days.join(', ')}]`
                  : form.freq === 'WEEKLY'
                    ? 'Weekly (no days selected)'
                    : form.freq.charAt(0) + form.freq.slice(1).toLowerCase()
            }
          />
          {form.freq !== 'none' && (
            <Row label="Window" value={`${form.horizon_days} days`} />
          )}
        </div>
      </section>

      {/* Actions */}
      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading && <Loader />} Create Schedule
      </button>
    </form>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-row justify-between items-center text-sm px-4 py-2 font-mono text-gray-400 uppercase">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
