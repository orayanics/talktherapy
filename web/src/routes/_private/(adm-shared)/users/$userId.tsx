import { createFileRoute } from '@tanstack/react-router'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

import PageTitle from '~/components/Page/PageTitle'

import ProfileAccInfo from '~/modules/profile/ProfileAccInfo'
import ProfileUserInfo from '~/modules/profile/ProfileUserInfo'

import { userDetailQueryOptions } from '~/api/users'
import { useResendOtp } from '~/api/auth'
import { useAlert } from '~/context/AlertContext'
import { OTP } from '~/config/message'

export const Route = createFileRoute('/_private/(adm-shared)/users/$userId')({
  loader: ({ context: { queryClient }, params }) => {
    const { userId } = params
    return queryClient.ensureQueryData(userDetailQueryOptions(userId))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const { account_status } = data
  const { showAlert } = useAlert()

  const resendOtp = useResendOtp()
  const handleResendOtp = () => {
    resendOtp.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          showAlert(OTP.resend.success, 'success')
        },
        onError: (error) => {
          console.error('Failed to resend OTP:', error)
          showAlert(OTP.resend.error, 'error')
        },
      },
    )
  }

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
            <button className="btn btn-primary">Deactivate User</button>
            {account_status === 'inactive' && (
              <button className="btn btn-soft" onClick={handleResendOtp}>
                Resend OTP
              </button>
            )}
          </div>
        </GridItem>
      </Grid>
    </>
  )
}
