import { createFileRoute } from '@tanstack/react-router'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

import PageTitle from '~/components/Page/PageTitle'

import ProfileAccInfo from '~/modules/profile/ProfileAccInfo'
import ProfileUserInfo from '~/modules/profile/ProfileUserInfo'

import { userDetailQueryOptions } from '~/api/users'

export const Route = createFileRoute('/_private/(adm-shared)/users/$userId')({
  loader: ({ context: { queryClient }, params }) => {
    const { userId } = params
    return queryClient.ensureQueryData(userDetailQueryOptions(userId))
  },
  component: RouteComponent,
})

function RouteComponent() {
  // const params = Route.useParams();
  // const userId = params.userId;
  const data = Route.useLoaderData()
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
          </div>
        </GridItem>
      </Grid>
    </>
  )
}
