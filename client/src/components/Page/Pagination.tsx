import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Meta } from '@/types/params'

type Props = {
  meta: Meta
  page: number
  updateSearch: (next: { page: number }) => void
}

export default function Pagination({ meta, page, updateSearch }: Props) {
  return (
    <div className="p-4 flex justify-between items-center text-sm">
      <div className="flex items-center space-x-1">
        <button
          disabled={meta.current_page === 1}
          onClick={() => updateSearch({ page: page - 1 })}
          className="btn btn-square shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        <button className="btn btn-ghost">
          Page {meta.current_page} of {meta.last_page}
        </button>

        <button
          disabled={meta.current_page === meta.last_page}
          onClick={() => updateSearch({ page: page + 1 })}
          className="btn btn-square shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div>
        {meta.from ?? 0} - {meta.to ?? 0} of {meta.total}
      </div>
    </div>
  )
}
