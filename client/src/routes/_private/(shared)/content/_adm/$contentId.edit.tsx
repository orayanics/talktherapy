import { fetchContentById } from '#/modules/content/api/content'
import { createFileRoute } from '@tanstack/react-router'
import EditContentPage from '#/modules/content/components/EditContentPage'

export const Route = createFileRoute(
  '/_private/(shared)/content/_adm/$contentId/edit',
)({
  loader: ({ context, params }) =>
    context.queryClient.query(fetchContentById(params.contentId)),
  component: EditContentPage,
})
