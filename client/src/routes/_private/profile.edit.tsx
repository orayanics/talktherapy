import { createFileRoute } from '@tanstack/react-router'
import EditProfilePage from '#/modules/profile/components/EditProfilePage'

export const Route = createFileRoute('/_private/profile/edit')({
  component: EditProfilePage,
})
