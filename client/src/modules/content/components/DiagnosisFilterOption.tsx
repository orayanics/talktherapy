import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'
import type { UpdateSearch } from './ContentFilters'

export default function DiagnosisFilterOption({
  item,
  diagnosis,
  updateSearch,
  toggleValue,
}: {
  item: DiagnosisItem
  diagnosis: string[]
  updateSearch: UpdateSearch
  toggleValue: (values: string[] | undefined, value: string) => string[]
}) {
  return (
    <label className="flex items-center gap-2 mb-4">
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
  )
}
