import { createFileRoute } from '@tanstack/react-router'
import NotificationComposer from '#/modules/notifications/components/NotificationComposer'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/(adm-shared)/notifications')({
  staticData: {
    page: PAGE_META.administration.children.notifications,
    bcLink: '.',
  },
  component: NotificationComposer,
})
