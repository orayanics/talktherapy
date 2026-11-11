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
    <div className="flex flex-col gap-2 rounded-box border border-slate-200 bg-white p-4">
      <div className="inline-flex items-start gap-4">
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

      <div className="inline-flex items-end gap-4">
        <p className="font-bold text-4xl my-0!">{value}</p>
        {detail && <p className="my-0! text-base-content text-sm">{detail}</p>}
      </div>
    </div>
  )
}
