import { createFileRoute } from '@tanstack/react-router'
import NotificationComposer from '#/modules/notifications/components/NotificationComposer'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/(adm-shared)/notifications')({
  staticData: {
    page: PAGE_META.administration.children.notifications,
    bcLink: '.',
  },
  component: () => (
    <PageLayout
      title={PAGE_META.administration.children.notifications.title}
      description={PAGE_META.administration.children.notifications.description}
      paddedCh
    >
      <NotificationComposer />
    </PageLayout>
  ),
})
