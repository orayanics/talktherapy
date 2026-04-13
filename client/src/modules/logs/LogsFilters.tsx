import React from 'react'
import { Filter, Search } from 'lucide-react'
import type { LogParams, QueryParams } from '@/types/params'
import useExport from './useExport'

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
  const { onSubmit: exportLogs, isLoading, apiError } = useExport()

  return (
    <div className="flex lg:flex-row flex-col gap-2">
      {apiError && (
        <div className="alert alert-error">
          <span>{apiError}</span>
        </div>
      )}
      <div className="lg:w-100 w-full shadow-sm input">
        <Search className="text-slate-600" size={16} />
        <input
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateSearch({ page: 1, search: e.target.value })
          }
          placeholder="Search action, entity, details"
        />
      </div>

      <div className="flex lg:flex-row flex-col gap-2 justify-end-safe lg:ms-auto">
        <div>
          <button
            className="lg:w-auto w-full btn btn-neutral flex items-center gap-2 shadow-sm text-sm"
            popoverTarget="date-range-popover"
            style={{ anchorName: '--date-range-anchor' }}
          >
            <Filter size={14} />
            Date
          </button>

          <div
            popover="auto"
            id="date-range-popover"
            className="dropdown dropdown-end menu p-4 shadow-xl bg-white border border-slate rounded-lg w-72 mt-2"
            style={{ positionAnchor: '--date-range-anchor' }}
          >
            <div className="mb-4">
              <span className="text-xs text-slate-700 font-bold uppercase mb-2 block tracking-widest">
                Date range
              </span>
              <div className="flex flex-col gap-2">
                <div>
                  <p>Date From</p>
                  <input
                    type="date"
                    className="input input-sm"
                    value={date_from}
                    onChange={(e) =>
                      updateSearch({ page: 1, date_from: e.target.value })
                    }
                  />
                </div>

                <div>
                  <p>Date To</p>
                  <input
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
          <button
            className="lg:w-auto w-full btn btn-neutral flex items-center gap-2 shadow-sm text-sm"
            popoverTarget="export-popover"
            style={{ anchorName: '--export-anchor' }}
          >
            Export
          </button>

          <div
            popover="auto"
            id="export-popover"
            className="dropdown dropdown-end menu p-4 shadow-xl bg-white border border-slate rounded-lg w-auto mt-2"
            style={{ positionAnchor: '--export-anchor' }}
          >
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
