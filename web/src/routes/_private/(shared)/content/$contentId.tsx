import { createFileRoute } from '@tanstack/react-router'

import SharedContentView from '~/views/content/shared/ContentView'

export const Route = createFileRoute('/_private/(shared)/content/$contentId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { contentId } = Route.useParams()
  return <SharedContentView contentId={contentId} />
}
