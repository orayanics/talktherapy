import RoleBadge from '~/components/Badge/RoleBadge'
import AccountStatusBadge from '~/components/Badge/AccountStatusBadge'

import { UserResponse } from '~/models/system'
import { formatToLocalDateTime } from '~/utils/date'

export default function ProfileAccInfo(props: UserResponse) {
  const { account_role, account_status, created_at } = props

  return (
    <>
      <p className="font-bold uppercase text-primary">Account Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Account Type</p>
          <RoleBadge role={account_role} />
        </div>

        {account_role === 'clinician' && (
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Specialization</p>
            <p>SLP</p>
          </div>
        )}

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Account Status</p>
          <AccountStatusBadge status={account_status} />
        </div>
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Last Login</p>
          <p>Jan 24, 2025</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Created At</p>
          <p>{formatToLocalDateTime(created_at)}</p>
        </div>
      </div>
    </>
  )
}
