import { createFileRoute } from '@tanstack/react-router'

import ContentView from '~/modules/content/ContentView'

export const Route = createFileRoute('/_private/(shared)/content/$contentId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { contentId } = Route.useParams()
  return <ContentView contentId={contentId} />
}
