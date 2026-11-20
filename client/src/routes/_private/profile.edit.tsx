import { createFileRoute } from '@tanstack/react-router'
import EditProfilePage from '#/modules/profile/components/EditProfilePage'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/profile/edit')({
  staticData: { page: PAGE_META.profile.children.edit, bcLink: '.' },
  component: () => (
    <PageLayout
      title={PAGE_META.profile.children.edit.title}
      description={PAGE_META.profile.children.edit.description}
      paddedCh
    >
      <EditProfilePage />
    </PageLayout>
  ),
})
