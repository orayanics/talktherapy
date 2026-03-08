import { createFileRoute, useNavigate } from '@tanstack/react-router'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'

import ProfileAccInfo from '~/modules/profile/ProfileAccInfo'
import ProfileUserInfo from '~/modules/profile/ProfileUserInfo'

import { sessionQueryOptions } from '~/api/auth'

export const Route = createFileRoute('/_private/profile/')({
  ssr: false,
  loader: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions)
    return session
  },
  component: RouteComponent,
})

function RouteComponent() {
  const session = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <>
      <PageTitle
        heading={'User Profile'}
        subheading={'Manage your profile information and settings.'}
      />

      <Grid cols={8} gap={6} className="w-auto lg:w-200">
        <GridItem colSpan={8} className="flex flex-col gap-4 order-1">
          <ProfileUserInfo {...session} />
          <ProfileAccInfo {...session} />

          <div className="flex flex-col gap-2 col-span-12">
            <button
              className="btn btn-primary"
              onClick={() => navigate({ to: '/profile/edit' })}
            >
              Edit Profile
            </button>
            <button
              className="btn"
              onClick={() => navigate({ to: '/profile/password' })}
            >
              Change Password
            </button>
          </div>
        </GridItem>
      </Grid>
    </>
  )
}
