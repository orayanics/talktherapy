import type { ReactNode } from 'react'

export default function StatCardItem({
  label,
  count,
  icon,
}: {
  label: string
  count: number
  icon: ReactNode
}) {
  return (
    <div className="bg-white rounded-box border border-border p-4 flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center">
        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
          {icon}
        </div>
        <p className="text-base-content text-sm font-medium my-0!">{label}</p>
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">
            {count}
          </span>
        </div>
      </div>
    </div>
  )
}
