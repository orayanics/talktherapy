import { createFileRoute } from '@tanstack/react-router'
import { userDetailQueryOptions } from '~/api/users'
import UserOverviewAdmin from '~/modules/users/UserOverviewAdmin'

export const Route = createFileRoute('/_private/(adm-shared)/users/$userId')({
  loader: ({ context: { queryClient }, params }) => {
    const { userId } = params
    return queryClient.ensureQueryData(userDetailQueryOptions(userId))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return <UserOverviewAdmin data={data} />
}
