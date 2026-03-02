import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import PageTitle from '~/components/Page/PageTitle'
import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'

import ContentMediaInfoEdit from '~/modules/content/ContentMediaInfoEdit'
import { contentDetailQueryOptions } from '~/api/content'

export const Route = createFileRoute(
  '/_private/(shared)/content/(admin-content)/$contentId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
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
      {isLoading && <LoaderTable />}
      {isError && <SkeletonError />}
      {data && <ContentMediaInfoEdit data={data} id={contentId} />}
    </>
  )
}
