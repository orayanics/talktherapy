import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '#/modules/profile/components/ProfilePage'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/profile/')({
  staticData: { page: PAGE_META.profile, bcLink: '.' },
  component: () => (
    <PageLayout
      title={PAGE_META.profile.title}
      description={PAGE_META.profile.description}
      paddedCh
    >
      <ProfilePage />
    </PageLayout>
  ),
})
