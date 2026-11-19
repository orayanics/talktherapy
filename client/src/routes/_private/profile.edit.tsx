import { createFileRoute } from '@tanstack/react-router'
import EditProfilePage from '#/modules/profile/components/EditProfilePage'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/profile/edit')({
  staticData: { page: PAGE_META.profile.children.edit, bcLink: '.' },
  component: EditProfilePage,
})
