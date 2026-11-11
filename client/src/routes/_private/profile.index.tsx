import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '#/modules/profile/components/ProfilePage'

export const Route = createFileRoute('/_private/profile/')({
  component: ProfilePage,
})
