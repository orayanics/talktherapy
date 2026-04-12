import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/(room)/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/(room)/$roomId"!</div>
}
