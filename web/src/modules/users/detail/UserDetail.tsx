import useResendOtp from './useResendOtp'
import useDeactivateUser from './useDeactivateUser'
import useReactiveUser from './useReactiveUser'
import useSuspendUser from './useSuspendUser'

import type { SESSION_USER } from '~/models/system'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

import PageTitle from '~/components/Page/PageTitle'

import ProfileAccInfo from '~/modules/profile/ProfileAccInfo'
import ProfileUserInfo from '~/modules/profile/ProfileUserInfo'
import { useAuthGuard } from '~/hooks/useAuthGuard'

export default function UserDetail({ data }: { data: SESSION_USER }) {
  const { id, account_status } = data

  const { handleSubmit: handleResend, isLoading: isResending } = useResendOtp({
    id,
  })
  const { handleSubmit: handleDeactivate, isLoading: isDeactivating } =
    useDeactivateUser({ id })
  const { handleSubmit: handleReactivate, isLoading: isReactivating } =
    useReactiveUser({ id })
  const { handleSubmit: handleSuspend, isLoading: isSuspending } =
    useSuspendUser({ id })

  const isLoading =
    isResending || isDeactivating || isReactivating || isSuspending

  const { canAny } = useAuthGuard()
  const isAllowedAction = canAny(['users:update', 'users:delete'])

  return (
    <>
      <PageTitle
        heading={'User Overview'}
        subheading={'Manage user profile and settings.'}
      />

      <Grid cols={8} gap={6} className="w-auto lg:w-200">
        <GridItem colSpan={8} className="flex flex-col gap-4 order-1">
          <ProfileAccInfo {...data} />
          <ProfileUserInfo {...data} />

          <div className="flex flex-col gap-2 col-span-12">
            {isAllowedAction && (
              <>
                {account_status === 'active' && (
                  <>
                    <button
                      className="btn btn-error"
                      onClick={handleDeactivate}
                      disabled={isLoading}
                    >
                      Deactivate User
                    </button>

                    <button
                      className="btn btn-warning"
                      onClick={handleSuspend}
                      disabled={isLoading}
                    >
                      Suspend User
                    </button>
                  </>
                )}

                {account_status === 'deactivated' ||
                  (account_status === 'suspended' && (
                    <button
                      className="btn btn-primary"
                      onClick={handleReactivate}
                      disabled={isLoading}
                    >
                      Reactivate User
                    </button>
                  ))}

                {account_status === 'pending' && (
                  <button
                    className="btn btn-soft"
                    onClick={handleResend}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                )}
              </>
            )}
          </div>
        </GridItem>
      </Grid>
    </>
  )
}
