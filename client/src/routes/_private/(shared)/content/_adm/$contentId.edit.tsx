import { createFileRoute } from '@tanstack/react-router'
import EditContentPage from '#/modules/content/components/EditContentPage'

export const Route = createFileRoute(
  '/_private/(shared)/content/_adm/$contentId/edit',
)({
  component: EditContentPage,
})
