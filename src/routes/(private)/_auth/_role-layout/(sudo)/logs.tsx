import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(private)/_auth/_role-layout/(sudo)/logs',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(private)/_auth/_role-layout/(sudo)/logs"!</div>
}
