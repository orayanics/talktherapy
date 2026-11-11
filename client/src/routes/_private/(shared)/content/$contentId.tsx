import { fetchContentById } from '#/modules/content/api/content'
import { createFileRoute } from '@tanstack/react-router'
import ContentDetail from '#/modules/content/components/ContentDetail'

export const Route = createFileRoute('/_private/(shared)/content/$contentId')({
  loader: ({ context, params }) =>
    context.queryClient.query(fetchContentById(params.contentId)),
  component: RouteComponent,
})

function RouteComponent() {
  const contentId = Route.useParams().contentId

  return <ContentDetail contentId={contentId} />
}
