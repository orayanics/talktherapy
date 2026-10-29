import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { fetchUsers, fetchUsersCount } from '#/modules/users/api/users'

import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import StateNull from '#/components/State/StateNull'
import StatCards from './StatCards'
import StatusPill from '#/components/Decorator/StatusPill'
import RolePill from '#/components/Decorator/RolePill'
import { formatDate } from '#/utils/useDate'
import UserFilters from './UserFilters'
import UserPagination from './UserPagination'
import { TableBase } from '#/components/Table/TableBase'
import RegisterAdmin from '#/modules/register/components/RegisterAdmin'
import Dropdown from '#/components/Dropdown'
import RegisterClinician from '#/modules/register/components/RegisterClinician'
import RegisterPatientInvitation from '#/modules/register/components/RegisterPatientInvitation'
import { ChevronDown, ChevronUp } from 'lucide-react'

import useActions from '#/modules/users/hooks/useActions'
import { useSession } from '#/modules/auth/context/SessionContext'
import ModalBody from '#/components/Modal/ModalBody'

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
  const count = userCount?.data.counts

  const [isClinicianModalOpen, setClinicianModalOpen] = useState(false)
  const [isAdminModalOpen, setAdminModalOpen] = useState(false)
  const [isPatientModalOpen, setPatientModalOpen] = useState(false)
  const [suspendingUser, setSuspendingUser] = useState<(typeof users)[number] | null>(null)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [suspensionError, setSuspensionError] = useState('')
  const isAsc = sort === 'asc'

  const { suspendUser, reactivateUser, isPending: isStatusPending } = useActions()
  const session = useSession()
  const canInviteAdmin = session.role === 'superadmin'

  const closeSuspension = () => {
    if (isStatusPending) return
    setSuspendingUser(null)
    setSuspensionReason('')
    setSuspensionError('')
  }

  const confirmSuspension = async () => {
    const reason = suspensionReason.trim()
    if (!suspendingUser || !reason) {
      setSuspensionError('A reason is required.')
      return
    }
    try {
      await suspendUser(suspendingUser.id, reason)
      closeSuspension()
    } catch {
      setSuspensionError('Unable to suspend this account. Please try again.')
    }
  }

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
            {canInviteAdmin && (
              <>
                <button
                  className="btn btn-neutral shadow-sm"
                  onClick={() => setAdminModalOpen(true)}
                >
                  Admin
                </button>
                <button
                  className="btn btn-neutral shadow-sm"
                  onClick={() => setPatientModalOpen(true)}
                >
                  Patient
                </button>
              </>
            )}
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

      <RegisterPatientInvitation
        isOpen={isPatientModalOpen}
        onClose={() => setPatientModalOpen(false)}
      />

      <ModalBody isOpen={Boolean(suspendingUser)} onClose={closeSuspension}>
        <form onSubmit={(event) => { event.preventDefault(); void confirmSuspension() }} className="bg-white p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Suspend account</h2>
            <p className="mt-1 text-sm text-slate-600">This immediately prevents sign-in. The reason will be included in the audit record and email.</p>
          </div>
          <div>
            <label htmlFor="suspension-reason" className="label">Reason</label>
            <textarea id="suspension-reason" required minLength={3} maxLength={1000} value={suspensionReason} onChange={(event) => { setSuspensionReason(event.target.value); setSuspensionError('') }} className="textarea textarea-bordered w-full" rows={4} autoFocus />
            {suspensionError && <p role="alert" className="mt-2 text-sm text-error">{suspensionError}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={closeSuspension}>Cancel</button>
            <button type="submit" className="btn btn-error" disabled={isStatusPending}>{isStatusPending ? 'Suspending…' : 'Suspend account'}</button>
          </div>
        </form>
      </ModalBody>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  accessor: 'created_at',
                  render: (user) => formatDate(user.created_at, 'MMM dd, yyyy'),
                },
                {
                  header: 'Status',
                  render: (user) => (
                    <>
                      <StatusPill status={user.status} />
                    </>
                  ),
                },
                {
                  header: 'Actions',
                  render: (user) => (
                    <div className="space-x-2">
                      {user.id !== session.id &&
                      (canInviteAdmin ||
                        (session.role === 'admin' &&
                          ['patient', 'clinician'].includes(user.role))) ? (
                        user.status === 'suspended' ? (
                          <button
                            className="btn btn-sm btn-neutral"
                            onClick={() => reactivateUser(user.id)}
                          >
                            Reactivate
                          </button>
                        ) : user.status === 'active' ? (
                          <button
                            className="btn btn-sm btn-neutral"
                            onClick={() => { setSuspendingUser(user); setSuspensionReason(''); setSuspensionError('') }}
                          >
                            Suspend
                          </button>
                        ) : null
                      ) : null}
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
