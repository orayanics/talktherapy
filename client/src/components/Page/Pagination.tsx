import { ChevronLeft, ChevronRight } from 'lucide-react'

type Meta = {
  current_page: number
  last_page: number
  total: number
  from?: number | null
  to?: number | null
}

type Props = {
  meta: Meta
  page: number
  updateSearch: (next: { page: number }) => void
}

export default function Pagination({ meta, updateSearch }: Props) {
  return (
    <nav
      aria-label="Pagination"
      className="p-4 flex flex-wrap gap-3 justify-between items-center text-sm"
    >
      <div className="flex items-center space-x-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={meta.current_page <= 1}
          onClick={() =>
            updateSearch({ page: Math.max(1, meta.current_page - 1) })
          }
          className="btn btn-square shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="px-3" aria-live="polite">
          Page {meta.current_page} of {Math.max(1, meta.last_page)}
        </span>

        <button
          type="button"
          aria-label="Next page"
          disabled={meta.current_page >= meta.last_page || meta.last_page === 0}
          onClick={() =>
            updateSearch({
              page: Math.min(meta.last_page, meta.current_page + 1),
            })
          }
          className="btn btn-square shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div>
        {meta.from ?? 0} - {meta.to ?? 0} of {meta.total}
      </div>
    </nav>
  )
}
