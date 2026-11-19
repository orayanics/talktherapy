import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '#/modules/profile/components/ProfilePage'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/profile/')({
  staticData: { page: PAGE_META.profile, bcLink: '.' },
  component: ProfilePage,
})
