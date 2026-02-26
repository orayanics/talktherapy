import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import debounce from 'debounce'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import TableContent from '~/components/Table/TableContent'
import TablePagination from '~/components/Table/TablePagination'
import AccountStatusBadge from '~/components/Badge/AccountStatusBadge'
import RoleBadge from '~/components/Badge/RoleBadge'
import PageTitle from '~/components/Page/PageTitle'
import UserAddAdmin from '~/modules/users/UserAddAdmin'
import InputDropdown from '~/components/Input/InputDropdown'
import InputMultiselect from '~/components/Input/InputMultiselect'
import LoaderTable from '~/components/Loader/LoaderTable'
import UserAddClinician from '~/modules/users/UserAddClinician'

import { UsersTableProps } from '~/models/system'
import { formatToLocalDateTime } from '~/utils/date'
import { normalizeSearchArray } from '~/utils/query'

import { usersQueryOptions } from '~/api/users'
import { useAuthGuard } from '~/hooks/useAuthGuard'

export const Route = createFileRoute('/_private/(adm-shared)/users/')({
  validateSearch: (search: Record<string, unknown>) => {
    const status = normalizeSearchArray(search.status)
    const role = normalizeSearchArray(search.role)
    const page = Number(search.page ?? 1)
    const perPage = Number(search.perPage ?? 10)
    const searchTerm =
      typeof search.search === 'string' ? search.search : undefined

    return {
      ...(status?.length ? { status } : {}),
      ...(role?.length ? { role } : {}),
      ...(page !== 1 ? { page } : {}),
      ...(perPage !== 10 ? { perPage } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()

  const search = Route.useSearch()
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
    if (debouncedSearch === search.search || !debouncedSearch) return
    navigate({ search: { ...search, search: debouncedSearch, page: 1 } })
  }, [debouncedSearch])

  useEffect(() => {
    return () => updateDebouncedSearch.clear()
  }, [updateDebouncedSearch])

  const { data, isPending } = useQuery(
    usersQueryOptions({
      page,
      perPage,
      search: debouncedSearch,
      account_status: status,
      account_role: role,
    }),
  )

  return (
    <>
      <PageTitle heading="Users" subheading="View all users" />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <Table
            data={data}
            page={page}
            perPage={perPage}
            status={status}
            role={role}
            search={searchInput}
            isLoading={isPending}
            onPageChange={(page) => navigate({ search: { ...search, page } })}
            onPerPageChange={(perPage) =>
              navigate({ search: { ...search, perPage, page: 1 } })
            }
            onStatusChange={(status) =>
              navigate({ search: { ...search, status, page: 1 } })
            }
            onRoleChange={(role) =>
              navigate({ search: { ...search, role, page: 1 } })
            }
            onSearchChange={handleSearchChange}
            onClearFilters={() => navigate({ to: '/users', search: {} })}
          />
        </GridItem>
      </Grid>
    </>
  )
}

function Table(props: UsersTableProps) {
  const {
    isLoading = false,
    page,
    perPage,
    data,
    role = [],
    status = [],
    search = '',
    onPageChange,
    onPerPageChange,
    onStatusChange,
    onRoleChange,
    onSearchChange,
    onClearFilters,
  } = props
  const [isClinicianModalOpen, setClinicianModalOpen] = useState(false)
  const [isAdminModalOpen, setAdminModalOpen] = useState(false)

  const { data: usersData = [], total = 0, last_page, to, from } = data || {}

  const { is } = useAuthGuard()
  const isSudo = is('sudo')

  return (
    <>
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
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending', label: 'Pending' },
              { value: 'suspended', label: 'Suspended' },
            ]}
            value={status}
            onChange={(status) => onStatusChange(status)}
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
            value={role}
            onChange={(role) => onRoleChange(role)}
            className={'w-full lg:w-42'}
          />

          <button className="btn btn-primary" onClick={onClearFilters}>
            Clear Filters
          </button>
        </div>

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
        {isSudo && (
          <UserAddAdmin
            isOpen={isAdminModalOpen}
            onClose={() => setAdminModalOpen(false)}
          />
        )}
      </div>

      {isLoading ? (
        <LoaderTable className="h-120 max-h-120 " />
      ) : (
        <TableContent
          columns={[
            { header: 'Account Status', accessor: 'account_status' },
            {
              header: 'Name',
              accessor: 'name',
              render: (value, row) => (
                <Link
                  to="/users/$userId"
                  params={{ userId: row.id }}
                  className="link link-hover hover:text-primary"
                >
                  {value}
                </Link>
              ),
            },
            { header: 'Email', accessor: 'email' },
            { header: 'User Type', accessor: 'account_role' },
            {
              header: 'Created At',
              accessor: 'created_at',
              render: (value) => formatToLocalDateTime(value),
            },
            { header: 'Last Login', accessor: 'last_login' },
            {
              header: 'Actions',
              accessor: 'id',
              render: (_value, row) => (
                <InputDropdown
                  label="Actions"
                  className="flex flex-col gap-2"
                  btnClassName="btn-primary"
                  position="dropdown-center dropdown-left"
                >
                  <Link
                    to={'/users/$userId/edit'}
                    params={{ userId: row.id }}
                    className="btn btn-soft btn-primary"
                  >
                    Edit
                  </Link>
                  <Link
                    // TODO: Add deactivate user functionality
                    to={'/users/$userId'}
                    params={{ userId: row.id }}
                    className="btn btn-soft btn-error"
                  >
                    Deactivate
                  </Link>
                </InputDropdown>
              ),
            },
          ]}
          data={usersData}
          renderers={{
            account_role: (value) => <RoleBadge role={value} />,
            account_status: (value) => <AccountStatusBadge status={value} />,
          }}
        />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={total ?? usersData.length}
        lastPage={last_page}
        from={from}
        to={to}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </>
  )
}
