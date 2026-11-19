import { fetchContentById } from '#/modules/content/api/content'
import { createFileRoute } from '@tanstack/react-router'
import EditContentPage from '#/modules/content/components/EditContentPage'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute(
  '/_private/(shared)/content/_adm/$contentId/edit',
)({
  staticData: { page: PAGE_META.content.children.edit, bcLink: '.' },
  loader: ({ context, params }) =>
    context.queryClient.query(fetchContentById(params.contentId)),
  component: EditContentPage,
})
