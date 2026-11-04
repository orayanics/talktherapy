import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '#/modules/diagnoses/api/diagnoses'
import { DateFilter, ChoiceFilter } from '#/components/Page/Filters'
import type { ScheduleParams } from '../../types/params'
export default function ScheduleFilters({
  from,
  diagnosis,
  updateSearch,
}: ScheduleParams & { updateSearch: (next: Partial<ScheduleParams>) => void }) {
  const query = useQuery({
    ...fetchDiagnoses,
    enabled: diagnosis !== undefined,
  })
  return (
    <FilterDrawer>
      <div className="flex flex-col gap-4">
        <DateFilter
          label="From date"
          value={from}
          onChange={(from) =>
            updateSearch({ page: 1, from: from || undefined })
          }
        />
        {diagnosis !== undefined &&
          (query.isError ? (
            <p role="alert">Diagnosis filters unavailable.</p>
          ) : query.isPending ? (
            <span role="status">Loading diagnoses…</span>
          ) : (
            <ChoiceFilter
              label="Diagnosis"
              options={query.data.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              value={diagnosis}
              onChange={(diagnosis) => updateSearch({ page: 1, diagnosis })}
            />
          ))}
      </div>
    </FilterDrawer>
  )
}
import FilterDrawer from '#/components/Page/FilterDrawer'
