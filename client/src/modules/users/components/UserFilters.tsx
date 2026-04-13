import { Search, Filter } from 'lucide-react'
import type { UsersParams, QueryParams } from '@/types/params'
import { ROLE_VALUES, STATUS_VALUES } from '@/constants/account'

type UpdateSearch = (next: Partial<UsersParams & QueryParams>) => void

type Props = {
  searchTerm: string
  role: string[]
  accountStatus: string[]
  updateSearch: UpdateSearch
}

export default function UserFilters({
  searchTerm,
  role,
  accountStatus,
  updateSearch,
}: Props) {
  const toggleValue = (values: string[], value: string): string[] =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value]

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-full h-10 bg-white border-slate-200 rounded-lg shadow-sm input input-bordered">
        <Search className="text-slate-600" size={16} />
        <input
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateSearch({ page: 1, search: e.target.value })
          }
          placeholder="Search name/email..."
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

        <div
          popover="auto"
          id="filter-popover"
          className="dropdown dropdown-end menu p-4 shadow-xl bg-white border border-slate rounded-lg w-72 mt-2"
          style={{ positionAnchor: '--filter-anchor' }}
        >
          <div className="mb-4">
            <span className="text-xs text-slate-700 font-bold uppercase mb-2 block tracking-widest">
              Account Role
            </span>
            {ROLE_VALUES.map((value: string) => (
              <label
                key={value}
                className="flex items-center gap-2 mb-2 tracking-wide uppercase"
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={role.includes(value)}
                  onChange={() =>
                    updateSearch({
                      page: 1,
                      role: toggleValue(role, value),
                    })
                  }
                />
                {value}
              </label>
            ))}
          </div>

          <div>
            <span className="text-xs text-slate-700 font-bold uppercase mb-2 block tracking-widest">
              Account Status
            </span>
            {STATUS_VALUES.map((value: string) => (
              <label
                key={value}
                className="flex items-center gap-2 mb-2 tracking-wide uppercase"
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={accountStatus.includes(value)}
                  onChange={() =>
                    updateSearch({
                      page: 1,
                      account_status: toggleValue(accountStatus, value),
                    })
                  }
                />
                {value}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
