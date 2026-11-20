import { DotGridIcon } from './StatCard'
import { Link } from '@tanstack/react-router'

export default function SummaryCard({
  label,
  value,
  detail,
  redirect,
}: {
  label: string
  value: string | number
  detail?: string
  redirect?: { to: string; search?: Record<string, unknown> }
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-box border border-border bg-white p-4 sm:p-5">
      <div className="inline-flex items-start gap-2 text-sm text-muted">
        <DotGridIcon className="bg-slate-500" />
        <span>
          {redirect ? (
            <Link
              to={redirect.to}
              search={redirect.search}
              className="hover:text-slate-900 hover:underline"
            >
              {label}
            </Link>
          ) : (
            label
          )}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-semibold text-3xl tracking-tight tabular-nums my-0!">
          {value}
        </p>
        {detail && <p className="my-0! text-muted text-xs">{detail}</p>}
      </div>
    </div>
  )
}
