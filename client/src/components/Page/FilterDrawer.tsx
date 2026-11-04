import { useId } from 'react'
import type { ReactNode } from 'react'
import { Filter } from 'lucide-react'

export default function FilterDrawer({ children }: { children: ReactNode }) {
  const id = useId()
  return (
    <div className="drawer drawer-end">
      <input id={id} type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <label
          htmlFor={id}
          className="btn btn-flat drawer-button"
          aria-label="Open filters"
        >
          <Filter size={16} /> Filters
        </label>
      </div>

      <div className="drawer-side z-40">
        <label
          htmlFor={id}
          aria-label="Close filters"
          className="drawer-overlay"
        />
        <aside
          aria-label="Filters"
          className="min-h-full w-100 max-w-lg bg-base-100 text-base-content py-4 px-6"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold">Filters</p>
            <label htmlFor={id} className="btn btn-sm btn-neutral">
              Close
            </label>
          </div>
          <div>{children}</div>
        </aside>
      </div>
    </div>
  )
}
