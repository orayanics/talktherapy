import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_private/(adm-shared)/users/$userId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello users/$userId/edit</div>
}
