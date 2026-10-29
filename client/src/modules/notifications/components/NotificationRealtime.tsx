import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useConnectionStatus, useEcho } from '@laravel/echo-react'
import { api } from '#/lib/api/client'
import { useSession } from '#/modules/auth/context/SessionContext'
import '#/modules/notifications/api/echo'
import { showAlertGlobal } from '#/context/AlertContext'

type ChannelDescriptor = { channel: string }
type NotificationEvent = { notification_id: string; type: string }

export default function NotificationRealtime() {
  const { id: userId } = useSession()
  const queryClient = useQueryClient()
  const channelQueryKey = useMemo(
    () => ['notification-channel', userId] as const,
    [userId],
  )
  const { data } = useQuery({
    queryKey: channelQueryKey,
    queryFn: async () =>
      (await api<{ data: ChannelDescriptor }>('/api/v1/notifications/channel'))
        .data,
  })
  const connectionStatus = useConnectionStatus()

  useEffect(() => {
    if (connectionStatus === 'connected') {
      void queryClient.invalidateQueries({
        queryKey: ['notifications', userId],
      })
    }
  }, [connectionStatus, queryClient, userId])

  useEffect(
    () => () => {
      queryClient.removeQueries({ queryKey: ['notifications', userId] })
      queryClient.removeQueries({ queryKey: channelQueryKey })
    },
    [channelQueryKey, queryClient, userId],
  )

  return data?.channel ? (
    <NotificationChannel channel={data.channel} userId={userId} />
  ) : null
}

function NotificationChannel({
  channel,
  userId,
}: {
  channel: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const seenIds = useRef(new Set<string>())
  const announce = useCallback((event: NotificationEvent) => {
    const { notification_id, type } = event
    if (seenIds.current.has(notification_id)) return
    seenIds.current.add(notification_id)
    if (seenIds.current.size > 200) {
      const oldestId = seenIds.current.values().next().value
      if (oldestId) seenIds.current.delete(oldestId)
    }
    void queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    showAlertGlobal(
      type === 'appointment'
        ? 'New appointment notification received.'
        : type === 'clinical_record'
          ? 'New clinical record notification received.'
          : 'New notification received.',
      'info',
    )
  }, [queryClient, userId])

  useEcho<NotificationEvent>(
    channel,
    '.UserNotificationAvailable',
    announce,
    [channel, announce],
  )

  // Keep compatibility with broadcasters that serialize the PHP event name.
  useEcho<NotificationEvent>(
    channel,
    'App\\Events\\UserNotificationAvailable',
    announce,
    [channel, announce],
  )

  return null
}
