import { SearchFilter, ChoiceFilter } from '#/components/Page/Filters'
import { ROLE_VALUES, STATUS_VALUES } from '#/constants/account'
import type { UsersParams } from '../types/params'
import type { QueryParams } from '#/types/api'
import FilterDrawer from '#/components/Page/FilterDrawer'

export default function UserFilters({
  searchTerm,
  role,
  accountStatus,
  updateSearch,
}: {
  searchTerm: string
  role: string[]
  accountStatus: string[]
  updateSearch: (next: Partial<UsersParams & QueryParams>) => void
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
      <SearchFilter
        label="Search users"
        placeholder="Search name/email..."
        value={searchTerm}
        onChange={(search) => updateSearch({ page: 1, search })}
      />
      <FilterDrawer>
        <div className="space-y-6">
          <ChoiceFilter
            label="Account role"
            options={ROLE_VALUES.map((value) => ({ value, label: value }))}
            value={role}
            onChange={(r) => updateSearch({ page: 1, role: r })}
          />
          <ChoiceFilter
            label="Account status"
            options={STATUS_VALUES.map((value) => ({ value, label: value }))}
            value={accountStatus}
            onChange={(account_status) =>
              updateSearch({ page: 1, account_status })
            }
          />
        </div>
      </FilterDrawer>
    </div>
  )
}
