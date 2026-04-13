import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import type { ContentParams, QueryParams } from '@/types/params'

import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '@/api/public'

type UpdateSearch = (next: Partial<ContentParams & QueryParams>) => void

type Props = {
  searchTerm: string
  diagnosis: string[]
  sort: 'asc' | 'desc' | string
  updateSearch: UpdateSearch
  is_bookmarked?: boolean | undefined
}

export default function ContentFilters({
  searchTerm,
  diagnosis,
  sort = 'desc',
  is_bookmarked,
  updateSearch,
}: Props) {
  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)

  const toggleValue = (values: string[] = [], value: string): string[] =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value]

  const isDesc = sort === 'desc'

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-full h-10 bg-white border-slate-200 rounded-lg shadow-sm input input-bordered">
        <Search className="text-slate-600" size={16} />
        <input
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateSearch({ page: 1, search: e.target.value })
          }
          placeholder="Search titles and descriptions"
        />
      </div>

      <div>
        <button
          className="btn btn-outline border-slate-200 bg-white h-10 px-4 rounded-lg flex items-center gap-2 shadow-sm text-sm"
          popoverTarget="filter-popover"
          style={{ anchorName: '--filter-anchor' }}
        >
          <Filter size={14} />
          Filter
        </button>

        {!isPending && !isError && (
          <div
            popover="auto"
            id="filter-popover"
            className="dropdown dropdown-end menu p-4 shadow-xl bg-white border border-slate rounded-lg w-72 mt-2"
            style={{ positionAnchor: '--filter-anchor' }}
          >
            <div className="mb-4">
              <span className="text-xs text-slate-700 font-bold uppercase mb-2 block tracking-widest">
                Diagnosis
              </span>
              {diagnoses.map((item) => (
                <label key={item.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={diagnosis.includes(item.value)}
                    onChange={() =>
                      updateSearch({
                        page: 1,
                        diagnosis: toggleValue(diagnosis, item.value),
                      })
                    }
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          className="btn bg-white shadow-sm"
          onClick={() =>
            updateSearch({ page: 1, sort: isDesc ? 'asc' : 'desc' })
          }
        >
          Sort
          {isDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      <div>
        <button
          className={`btn ${is_bookmarked ? 'btn-primary' : 'btn-primary btn-soft border-sky-400'}`}
          onClick={() =>
            updateSearch({
              page: 1,
              is_bookmarked: is_bookmarked ? undefined : true,
            })
          }
        >
          Bookmarks
        </button>
      </div>
    </div>
  )
}
