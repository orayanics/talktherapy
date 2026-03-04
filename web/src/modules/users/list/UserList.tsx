import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import debounce from 'debounce'

import UserAddClinician from '../UserAddClinician'
import UserAddAdmin from '../UserAddAdmin'
import type {
  UserListItem,
  UserListTableFilters,
  UserListTableProps,
} from '~/models/table'

import type { ACCOUNT_ROLE, ACCOUNT_STATUS } from '~/models/account'
import TablePagination from '~/components/Table/TablePagination'
import TableContent from '~/components/Table/TableContent'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import { useAuthGuard } from '~/hooks/useAuthGuard'
import { formatToLocalDateTime } from '~/utils/date'
import InputMultiselect from '~/components/Input/InputMultiselect'
import InputDropdown from '~/components/Input/InputDropdown'
import RoleBadge from '~/components/Badge/RoleBadge'
import AccountStatusBadge from '~/components/Badge/AccountStatusBadge'

export default function UserList(props: UserListTableProps) {
  const { search, isLoading, isError, data } = props
  const { data: usersData = [], meta } = data ?? {
    data: [],
    meta: { page: 1, per_page: 10, total: 0 },
  }
  const navigate = useNavigate({ from: '/users/' })
  const status = search.status ?? []
  const role = search.role ?? []
  const page = search.page ?? 1
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.search ?? '')
  const perPage = search.perPage ?? 10

  const updateDebouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value)
      }, 200),
    [],
  )
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    updateDebouncedSearch(value)
  }

  useEffect(() => {
    if (debouncedSearch === (search.search ?? '')) return
    navigate({ search: { ...search, search: debouncedSearch, page: 1 } })
  }, [debouncedSearch])

  useEffect(() => {
    return () => updateDebouncedSearch.clear()
  }, [updateDebouncedSearch])

  return (
    <>
      <TableFilters
        search={searchInput}
        role={role}
        status={status}
        onSearchChange={handleSearchChange}
        onRoleChange={(newRole) =>
          navigate({ search: { ...search, role: newRole, page: 1 } })
        }
        onStatusChange={(newStatus) =>
          navigate({ search: { ...search, status: newStatus, page: 1 } })
        }
        onClearFilters={() => navigate({ search: { page: 1, perPage } })}
      />

      {usersData.length > 0 ? (
        <Table data={usersData} />
      ) : isLoading ? (
        <LoaderTable />
      ) : isError ? (
        <SkeletonError />
      ) : (
        <SkeletonNull />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={meta.total}
        onPageChange={(q: number) =>
          navigate({ search: { ...search, page: q } })
        }
        onPerPageChange={(q: number) =>
          navigate({ search: { ...search, perPage: q, page: 1 } })
        }
      />
    </>
  )
}

function TableFilters(props: UserListTableFilters) {
  const {
    search,
    role,
    status,
    onSearchChange,
    onRoleChange,
    onStatusChange,
    onClearFilters,
  } = props
  const [isClinicianModalOpen, setClinicianModalOpen] = useState(false)
  const [isAdminModalOpen, setAdminModalOpen] = useState(false)

  const { is, can } = useAuthGuard()
  const isSudo = is('sudo')
  const isAllowedAction = can('users:create')

  return (
    <div className="flex flex-col lg:flex-row gap-2 justify-between">
      <div className="flex flex-col lg:flex-row gap-2">
        <input
          type="text"
          placeholder="Search users..."
          className="input input-bordered w-full lg:w-42"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <InputMultiselect
          placeholder="Account Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'deactivated', label: 'Deactivated' },
            { value: 'pending', label: 'Pending' },
            { value: 'suspended', label: 'Suspended' },
          ]}
          value={status as Array<ACCOUNT_STATUS>}
          onChange={(newStatus) =>
            onStatusChange(newStatus as Array<ACCOUNT_STATUS>)
          }
          className={'w-full lg:w-42'}
        />

        <InputMultiselect
          placeholder="User Type"
          options={[
            ...(isSudo
              ? [
                  { value: 'sudo', label: 'Super Admin' },
                  { value: 'admin', label: 'Admin' },
                ]
              : []),
            { value: 'patient', label: 'Patient' },
            { value: 'clinician', label: 'Clinician' },
          ]}
          value={role as Array<ACCOUNT_ROLE>}
          onChange={(newRole) => onRoleChange(newRole as Array<ACCOUNT_ROLE>)}
          className={'w-full lg:w-42'}
        />

        <button className="btn btn-primary" onClick={onClearFilters}>
          Clear Filters
        </button>
      </div>

      {isAllowedAction && (
        <>
          <InputDropdown
            label="Add User"
            className="flex flex-col gap-2 lg:w-auto w-full"
            btnClassName="lg:w-auto w-full btn-primary"
          >
            <button className="btn" onClick={() => setClinicianModalOpen(true)}>
              Clinician
            </button>
            {isSudo && (
              <button className="btn" onClick={() => setAdminModalOpen(true)}>
                Admin
              </button>
            )}
          </InputDropdown>

          <UserAddClinician
            isOpen={isClinicianModalOpen}
            onClose={() => setClinicianModalOpen(false)}
          />
        </>
      )}
      {isSudo && (
        <UserAddAdmin
          isOpen={isAdminModalOpen}
          onClose={() => setAdminModalOpen(false)}
        />
      )}
    </div>
  )
}

function Table({ data }: { data: Array<UserListItem> }) {
  return (
    <TableContent
      columns={[
        { header: 'Account Status', accessor: 'account_status' },
        {
          header: 'Name',
          accessor: 'name',
          render: (value: string, row: UserListItem) => (
            <Link
              to="/users/$userId"
              params={{ userId: row.id }}
              className="link link-hover hover:text-primary"
            >
              {value}
            </Link>
          ),
        },
        {
          header: 'Email',
          accessor: 'email',
          render: (value: string, row: UserListItem) => (
            <Link
              to="/users/$userId"
              params={{ userId: row.id }}
              className="link link-hover hover:text-primary"
            >
              {value}
            </Link>
          ),
        },
        { header: 'User Type', accessor: 'account_role' },
        {
          header: 'Created At',
          accessor: 'created_at',
          render: (value: string) => formatToLocalDateTime(value),
        },
        {
          header: 'Last Login',
          accessor: 'last_login',
          render: (value: string | null) =>
            value ? formatToLocalDateTime(value) : 'Never',
        },
        { header: 'Id', accessor: 'id', className: 'hidden' },
      ]}
      data={data}
      renderers={{
        account_role: (value: string) => <RoleBadge role={value} />,
        account_status: (value: string) => (
          <AccountStatusBadge status={value as ACCOUNT_STATUS} />
        ),
      }}
    />
  )
}
