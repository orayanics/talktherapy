import { createFileRoute } from '@tanstack/react-router'
import NotificationComposer from '#/modules/notifications/components/NotificationComposer'

export const Route = createFileRoute('/_private/(adm-shared)/notifications')({ component: NotificationComposer })
