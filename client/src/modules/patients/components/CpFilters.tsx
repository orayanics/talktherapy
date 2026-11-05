import FilterDrawer from '#/components/Page/FilterDrawer'
import { SearchFilter } from '#/components/Page/Filters'

export default function CpFilters({
  searchTerm,
  updateSearch,
}: {
  searchTerm: string
  updateSearch: (next: { page: number; search: string }) => void
}) {
  return (
    <FilterDrawer>
      <SearchFilter
        label="Search patients"
        placeholder="Search patient name"
        value={searchTerm}
        onChange={(search) => updateSearch({ page: 1, search })}
      />
    </FilterDrawer>
  )
}
