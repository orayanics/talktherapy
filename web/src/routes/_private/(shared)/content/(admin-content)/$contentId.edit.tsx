import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import PageTitle from '~/components/Page/PageTitle'
import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

import ContentMediaInfoEdit from '~/modules/content/ContentMediaInfoEdit'
import { contentDetailQueryOptions } from '~/api/content'
import { useAuthGuard } from '~/hooks/useAuthGuard'

export const Route = createFileRoute(
  '/_private/(shared)/content/(admin-content)/$contentId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { can } = useAuthGuard()
  const isAllowedAction = can('content:update')

  if (!isAllowedAction) {
    const navigate = useNavigate()
    navigate({ to: '/unauthorized' })
    return null
  }

  const { contentId } = Route.useParams()
  const { data, isLoading, isError } = useQuery(
    contentDetailQueryOptions(contentId),
  )

  return (
    <>
      <PageTitle
        heading="Edit Content"
        subheading="Manage the content of this media."
      />
      {isLoading ? (
        <LoaderTable />
      ) : isError ? (
        <SkeletonError />
      ) : data ? (
        <ContentMediaInfoEdit data={data} id={contentId} />
      ) : (
        <SkeletonNull />
      )}
    </>
  )
}
