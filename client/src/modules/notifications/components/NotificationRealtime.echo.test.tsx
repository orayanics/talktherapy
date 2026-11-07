/** @vitest-environment jsdom */
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureEcho } from '@laravel/echo-react'
import { afterEach, expect, it, vi } from 'vitest'
import NotificationRealtime from './NotificationRealtime'
import Sidebar from '#/components/Page/Sidebar'
import { AlertProvider } from '#/context/AlertContext'
import { SessionProvider } from '#/modules/auth/context/SessionContext'
import { toUser } from '#/modules/auth/api/auth-client'
import { api } from '#/lib/api/client'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('../api/echo', () => ({}))
vi.mock('#/components/Page/SidebarItem', () => ({ default: () => null }))
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

it.each([
  'UserNotificationAvailable',
  'App\\Events\\UserNotificationAvailable',
])(
  'receives wire event %s through real Echo and updates the recipient UI',
  async (eventName) => {
    const listeners = new Map<string, Set<(payload: unknown) => void>>()
    const subscription = {
      bind: (name: string, callback: (payload: unknown) => void) => {
        if (!listeners.has(name)) listeners.set(name, new Set())
        listeners.get(name)!.add(callback)
      },
      unbind: (name: string, callback: (payload: unknown) => void) => {
        listeners.get(name)?.delete(callback)
      },
    }
    const subscribe = vi.fn(() => subscription)
    configureEcho({
      broadcaster: 'reverb',
      key: 'test',
      client: {
        connection: {
          state: 'connected',
          socket_id: '1.1',
          bind: vi.fn(),
          unbind: vi.fn(),
        },
        subscribe,
        unsubscribe: vi.fn(),
        disconnect: vi.fn(),
      },
    })
    let unread = 0
    vi.mocked(api).mockImplementation(async (url) =>
      url === '/api/v1/notifications/channel'
        ? { data: { channel: 'users.recipient.0' } }
        : { data: [], meta: { total: unread, current_page: 1, last_page: 1 } },
    )
    const client = new QueryClient()
    const user = toUser({
      id: 'recipient',
      name: 'Recipient',
      email: '',
      email_verified_at: '',
      role: 'patient',
      status: 'active',
      image: null,
      created_at: '',
      updated_at: '',
    })
    const { unmount } = render(
      <QueryClientProvider client={client}>
        <AlertProvider>
          <SessionProvider value={user}>
            <NotificationRealtime />
            <Sidebar role="patient">
              <p>Dashboard</p>
            </Sidebar>
          </SessionProvider>
        </AlertProvider>
      </QueryClientProvider>,
    )
    try {
      await waitFor(() =>
        expect(subscribe).toHaveBeenCalledWith('private-users.recipient.0'),
      )
      unread = 1
      await act(async () => {
        listeners
          .get(eventName)
          ?.forEach((receive) =>
            receive({ notification_id: 'sent-from-composer', type: 'system' }),
          )
      })
      await waitFor(() =>
        expect(screen.getByRole('alert').textContent).toContain(
          'New notification received.',
        ),
      )
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Notifications, 1 unread' })
            .textContent,
        ).toContain('1'),
      )
    } finally {
      unmount()
      client.clear()
    }
  },
)
