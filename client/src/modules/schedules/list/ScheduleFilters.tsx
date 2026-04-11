import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '@/api/public'

import type { ScheduleParams, QueryParams } from '@/types/params'
import { Filter } from 'lucide-react'

type UpdateSearch = (next: Partial<ScheduleParams & QueryParams>) => void

export default function ScheduleFilters({
  from,
  updateSearch,
  diagnosis,
}: ScheduleParams & { updateSearch: UpdateSearch }) {
  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)

  const toggleValue = (values: string[] = [], value: string): string[] =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value]
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-2">
        <label className="flex items-center gap-2">
          <input
            value={from ?? ''}
            onChange={(e) => updateSearch({ from: e.target.value })}
            type="date"
            className="input shadow-sm"
          />
        </label>
      </div>

      {diagnosis && (
        <div>
          <button
            className="btn btn-outline border-slate-200 bg-white h-10 px-4 rounded-lg flex items-center gap-2 shadow-sm text-sm"
            popoverTarget="book-popover"
            style={{ anchorName: '--book-anchor' }}
          >
            <Filter size={14} />
            Filter
          </button>

          {!isPending && !isError && (
            <div
              popover="auto"
              id="book-popover"
              className="dropdown dropdown-end menu p-4 shadow-xl bg-white border border-slate rounded-lg w-72 mt-2"
              style={{ positionAnchor: '--book-anchor' }}
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
      )}
    </div>
  )
}
