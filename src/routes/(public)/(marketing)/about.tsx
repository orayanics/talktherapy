import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/(marketing)/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(public)/marketing/about"!</div>
}
