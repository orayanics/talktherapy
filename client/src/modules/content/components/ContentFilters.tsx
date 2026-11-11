import { SearchFilter } from '#/components/Page/Filters'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { QueryParams } from '#/types/api'
import type { ContentParams } from '#/modules/content/types/params'

import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '#/modules/diagnoses/api/diagnoses'
import FilterDrawer from '#/components/Page/FilterDrawer'

type UpdateSearch = (
  next: Partial<Omit<ContentParams, 'is_bookmarked'> & QueryParams> & {
    is_bookmarked?: true
  },
) => void

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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-row md:items-center justify-between gap-4">
        <SearchFilter
          label="Search content"
          value={searchTerm}
          onChange={(search) => updateSearch({ page: 1, search })}
        />
        <div>
          <button
            className={`btn ${is_bookmarked ? 'btn-primary' : 'btn-primary btn-ghost border-sky-400'}`}
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

        <div>
          <button
            className="btn btn-flat"
            onClick={() =>
              updateSearch({ page: 1, sort: isDesc ? 'asc' : 'desc' })
            }
          >
            Sort
            {isDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>
      <FilterDrawer>
        <div className="flex flex-col gap-4">
          <div>
            {!isPending && !isError && (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="font-semibold mb-4 mt-0">Diagnosis</p>
                  {diagnoses.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 mb-4"
                    >
                      <input
                        aria-label={`Filter by diagnosis: ${item.label}`}
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
        </div>
      </FilterDrawer>
    </div>
  )
}
