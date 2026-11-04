import { SearchFilter } from '#/components/Page/Filters'
import type { QueryParams } from '#/types/api'
import type { LogParams } from '#/modules/logs/types/params'
import useExport from '#/modules/logs/hooks/useExport'

type UpdateSearch = (next: Partial<LogParams & QueryParams>) => void

type Props = {
  searchTerm: string
  date_from: string
  date_to: string
  per_page: number
  updateSearch: UpdateSearch
}

export default function LogsFilters({
  searchTerm,
  date_from,
  date_to,
  per_page = 10,
  updateSearch,
}: Props) {
  const { onSubmit: exportLogs, onQueue, isLoading, apiError } = useExport()

  return (
    <FilterDrawer>
      <div className="flex flex-col gap-4">
        {apiError && (
          <div className="alert alert-error" role="alert">
            <span>{apiError}</span>
          </div>
        )}
        <SearchFilter
          label="Search activity logs"
          value={searchTerm}
          onChange={(search) => updateSearch({ page: 1, search })}
        />

        <div className="flex flex-col gap-4">
          <div>
            <div className="space-y-4">
              <div className="mb-4">
                <span className="text-xs text-slate-700 font-bold uppercase mb-2 block tracking-widest">
                  Date range
                </span>
                <div className="flex flex-col gap-2">
                  <div>
                    <label htmlFor="logs-date-from">Date From</label>
                    <input
                      id="logs-date-from"
                      type="date"
                      className="input input-sm"
                      value={date_from}
                      onChange={(e) =>
                        updateSearch({ page: 1, date_from: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="logs-date-to">Date To</label>
                    <input
                      id="logs-date-to"
                      type="date"
                      className="input input-sm"
                      value={date_to}
                      onChange={(e) =>
                        updateSearch({ page: 1, date_to: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <select
            aria-label="Logs per page"
            className="select col-span-12 lg:col-span-2 w-full"
            value={String(per_page)}
            onChange={(e) =>
              updateSearch({ page: 1, per_page: Number(e.target.value) })
            }
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          <div>
            <div className="space-y-4">
              <div className="space-y-4">
                <span className="text-xs text-slate-700 font-bold uppercase mb-2 block tracking-widest">
                  Export
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    className="btn"
                    onClick={() =>
                      exportLogs(
                        {
                          search: searchTerm,
                          date_from,
                          date_to,
                        },
                        'csv',
                      )
                    }
                    disabled={isLoading}
                  >
                    CSV
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      exportLogs(
                        {
                          search: searchTerm,
                          date_from,
                          date_to,
                        },
                        'json',
                      )
                    }
                    disabled={isLoading}
                  >
                    JSON
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      exportLogs(
                        { search: searchTerm, date_from, date_to },
                        'xls',
                      )
                    }
                    disabled={isLoading}
                  >
                    Excel
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      onQueue({ search: searchTerm, date_from, date_to })
                    }
                    disabled={isLoading}
                  >
                    Queue JSONL
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      onQueue({ search: searchTerm, date_from, date_to }, 'xls')
                    }
                    disabled={isLoading}
                  >
                    Queue Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FilterDrawer>
  )
}
import FilterDrawer from '#/components/Page/FilterDrawer'
