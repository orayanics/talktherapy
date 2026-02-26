import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/(shared)')({
  component: () => <Outlet />,
})
