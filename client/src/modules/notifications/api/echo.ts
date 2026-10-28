import { configureEcho, echoIsConfigured } from '@laravel/echo-react'
import type { ChannelAuthorizationCallback } from 'pusher-js'
import { api } from '#/lib/api/client'
import { API_URL } from '#/constants/application'

if (!echoIsConfigured()) {
  configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8081),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8081),
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${API_URL ?? 'http://localhost:8080'}/api/v1/broadcasting/auth`,
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
        void api<NonNullable<Parameters<ChannelAuthorizationCallback>[1]>>(
          '/api/v1/broadcasting/auth',
          {
            method: 'POST',
            data: { socket_id: socketId, channel_name: channel.name },
          },
        ).then(
          (data) => callback(null, data),
          (error: unknown) =>
            callback(
              error instanceof Error
                ? error
                : new Error('Channel authorization failed.'),
              null,
            ),
        )
      },
    }),
  })
}
