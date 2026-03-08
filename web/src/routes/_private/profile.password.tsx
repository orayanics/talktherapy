import { createFileRoute } from '@tanstack/react-router'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'
import ProfilePassword from '~/modules/profile/ProfilePassword'

export const Route = createFileRoute('/_private/profile/password')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <PageTitle
        heading={'Change Password'}
        subheading={
          'Update your account password to keep your information secure.'
        }
      />

      <Grid cols={8} gap={6} className="w-auto lg:w-200">
        <GridItem colSpan={8} className="flex flex-col gap-4 order-1">
          <ProfilePassword />
        </GridItem>
      </Grid>
    </>
  )
}
