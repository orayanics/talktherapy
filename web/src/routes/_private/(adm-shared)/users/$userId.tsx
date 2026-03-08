import { createFileRoute } from '@tanstack/react-router'
import { userDetailQueryOptions } from '~/api/users'
import UserDetail from '~/modules/users/detail/UserDetail'

export const Route = createFileRoute('/_private/(adm-shared)/users/$userId')({
  loader: ({ context: { queryClient }, params }) => {
    const { userId } = params
    return queryClient.ensureQueryData(userDetailQueryOptions(userId))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return <UserDetail data={data} />
}
