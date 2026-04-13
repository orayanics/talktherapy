import { Search } from 'lucide-react'
import type { QueryParams } from '@/types/params'

type UpdateSearch = (
  next: Partial<QueryParams & { search?: string; sort?: string }>,
) => void

type Props = {
  searchTerm: string
  updateSearch: UpdateSearch
}

export default function CpFilters({ searchTerm, updateSearch }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-full h-10 bg-white border-slate-200 rounded-lg shadow-sm input input-bordered">
        <Search className="text-slate-600" size={16} />
        <input
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateSearch({ page: 1, search: e.target.value })
          }
          placeholder="Search patient name"
        />
      </div>
    </div>
  )
}
