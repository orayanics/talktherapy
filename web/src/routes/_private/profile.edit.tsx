import { createFileRoute } from '@tanstack/react-router'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'

import ProfileUpdate from '~/modules/profile/ProfileUpdate'

import { sessionQueryOptions } from '~/api/auth'

export const Route = createFileRoute('/_private/profile/edit')({
  ssr: false,
  loader: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions)
    return session
  },
  component: RouteComponent,
})

function RouteComponent() {
  const session = Route.useLoaderData()

  return (
    <>
      <PageTitle
        heading={'User Profile'}
        subheading={'Manage your profile information and settings.'}
      />

      <Grid cols={8} gap={6} className="w-auto lg:w-200">
        <GridItem colSpan={8} className="flex flex-col gap-4 order-1">
          <ProfileUpdate {...session} />
        </GridItem>
      </Grid>
    </>
  )
}
