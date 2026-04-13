import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { fetchUsers, fetchUsersCount } from '@/api/users'

import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import StateNull from '@/components/State/StateNull'
import StatCards from './components/StatCards'
import StatusPill from '@/components/Decorator/StatusPill'
import RolePill from '@/components/Decorator/RolePill'
import { formatDate } from '@/utils/useDate'
import UserFilters from './components/UserFilters'
import UserPagination from './components/UserPagination'
import { TableBase } from '@/components/Table/TableBase'
import RegisterAdmin from '../register/RegisterAdmin'
import Dropdown from '@/components/Dropdown'
import RegisterClinician from '../register/RegisterClinician'
import { ChevronDown, ChevronUp } from 'lucide-react'

import useActions from './useActions'

export default function UsersList() {
  const search = useSearch({ from: '/_private/(adm-shared)/users/' })
  const navigate = useNavigate({ from: '/users/' })

  const page = search.page ?? 1
  const searchTerm = search.search ?? ''
  const role = search.role ?? []
  const accountStatus = search.account_status ?? []
  const sort = search.sort

  const updateSearch = (next: Record<string, unknown>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
      }),
    })
  }

  const { data, isPending, isError } = useQuery(
    fetchUsers(
      { page },
      {
        search: searchTerm || undefined,
        role,
        account_status: accountStatus,
        sort,
      },
    ),
  )

  const {
    data: userCount,
    isPending: countPending,
    isError: countError,
  } = useQuery(
    fetchUsersCount({
      search: searchTerm || undefined,
      role,
      account_status: accountStatus,
      sort,
    }),
  )

  const users = data?.data ?? []
  const meta = data?.meta
  const count = userCount?.counts

  const [isClinicianModalOpen, setClinicianModalOpen] = useState(false)
  const [isAdminModalOpen, setAdminModalOpen] = useState(false)
  const isAsc = sort === 'asc'

  const { handleBanUser, handleUnbanUser } = useActions()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <UserFilters
          searchTerm={searchTerm}
          role={role}
          accountStatus={accountStatus}
          updateSearch={updateSearch}
        />

        <Dropdown label="Add User" btnClassName="lg:w-auto w-full btn-neutral">
          <div className="flex flex-col gap-2">
            <button
              className="btn btn-neutral shadow-sm"
              onClick={() => setAdminModalOpen(true)}
            >
              Admin
            </button>
            <button
              className="btn btn-neutral shadow-sm"
              onClick={() => setClinicianModalOpen(true)}
            >
              Clinician
            </button>
          </div>
        </Dropdown>
      </div>

      <RegisterAdmin
        isOpen={isAdminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      <RegisterClinician
        isOpen={isClinicianModalOpen}
        onClose={() => setClinicianModalOpen(false)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {count && !countPending && !countError && <StatCards {...count} />}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="w-full p-4">
          {isPending ? (
            <StateLoading />
          ) : isError ? (
            <StateError />
          ) : users.length == 0 ? (
            <StateNull />
          ) : (
            <TableBase
              data={users}
              keyExtractor={(u) => u.id}
              columns={[
                {
                  header: 'Name',
                  render: (user) => (
                    <div className="flex items-center gap-3">
                      <img
                        className="w-9 h-9 rounded-full"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name,
                        )}&background=1e293b&color=fff&rounded=true&font-size=0.35`}
                        alt={user.name}
                      />
                      <div>
                        <Link
                          to="/users/$userId"
                          params={{ userId: user.id }}
                          className="font-bold"
                        >
                          {user.name}
                        </Link>
                        <div className="text-xs text-slate-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  header: 'Role',
                  render: (user) => <RolePill role={user.role} />,
                },
                {
                  header: (
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => {
                        updateSearch({
                          page: 1,
                          sort: isAsc ? 'desc' : 'asc',
                        })
                      }}
                    >
                      Created{' '}
                      {isAsc ? (
                        <ChevronUp strokeWidth={3} size={16} />
                      ) : (
                        <ChevronDown strokeWidth={3} size={16} />
                      )}
                    </div>
                  ),
                  accessor: 'createdAt',
                  render: (user) => formatDate(user.createdAt, 'MMM dd, yyyy'),
                },
                {
                  header: 'Status',
                  render: (user) => (
                    <>
                      {user.banned ? (
                        <StatusPill status="banned" />
                      ) : (
                        <StatusPill status={user.status} />
                      )}
                    </>
                  ),
                },
                {
                  header: 'Actions',
                  render: (user) => (
                    <div className="space-x-2">
                      {user.banned ? (
                        <button
                          className="btn btn-sm btn-neutral"
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-neutral"
                          onClick={() => handleBanUser(user.id)}
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>

        {meta && (
          <UserPagination meta={meta} page={page} updateSearch={updateSearch} />
        )}
      </div>
    </div>
  )
}
