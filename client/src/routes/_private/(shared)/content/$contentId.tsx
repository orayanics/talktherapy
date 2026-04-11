import { createFileRoute } from '@tanstack/react-router'
import ContentDetail from '@/modules/content/ContentDetail'

export const Route = createFileRoute('/_private/(shared)/content/$contentId')({
  component: RouteComponent,
})

function RouteComponent() {
  const contentId = Route.useParams().contentId

  return <ContentDetail contentId={contentId} />
}
