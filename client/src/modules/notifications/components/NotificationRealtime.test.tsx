/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEcho } from '@laravel/echo-react'
import type * as RouterModule from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import NotificationRealtime from './NotificationRealtime'
import { Route as RoomRoute } from '#/routes/_session/room/route'
import { AlertContext, AlertProvider } from '#/context/AlertContext'
import Sidebar from '#/components/Page/Sidebar'
import { SessionProvider } from '#/modules/auth/context/SessionContext'
import { toUser } from '#/modules/auth/api/auth-client'
import { api } from '#/lib/api/client'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('../api/echo', () => ({}))
vi.mock('#/components/Page/SidebarItem', () => ({ default: () => null }))
vi.mock('@laravel/echo-react', () => ({
  useConnectionStatus: () => 'connected',
  useEcho: vi.fn(),
}))
vi.mock('#/modules/auth/hooks/useSessionRevalidation', () => ({
  useSessionRevalidation: vi.fn(),
}))
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  createFileRoute: () => (options: object) => ({
    options,
    useRouteContext: () => ({ user: { id: 'recipient' } }),
  }),
  Outlet: () => null,
}))
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

it.each(['patient', 'clinician', 'admin', 'superadmin'] as const)(
  'shows a broadcast toast for a connected %s and ignores duplicate delivery',
  async (role) => {
    const client = new QueryClient()
    const invalidations = vi.spyOn(client, 'invalidateQueries')
    const user = toUser({
      id: 'recipient',
      name: 'Recipient',
      email: 'recipient@example.com',
      email_verified_at: '',
      role,
      status: 'active',
      image: null,
      created_at: '',
      updated_at: '',
    })
    vi.mocked(api).mockResolvedValue({ data: { channel: 'users.recipient.0' } })
    const { unmount } = render(
      <QueryClientProvider client={client}>
        <AlertProvider>
          <SessionProvider value={user}>
            <NotificationRealtime />
          </SessionProvider>
        </AlertProvider>
      </QueryClientProvider>,
    )
    await waitFor(() =>
      expect(useEcho).toHaveBeenCalledWith(
        'users.recipient.0',
        '.UserNotificationAvailable',
        expect.any(Function),
        expect.any(Array),
      ),
    )
    invalidations.mockClear()
    const announce = vi
      .mocked(useEcho)
      .mock.calls.find(
        ([, event]) => event === '.UserNotificationAvailable',
      )![2]!
    await act(async () => {
      announce({ notification_id: 'broadcast-id', type: 'system' })
    })
    expect(screen.getByRole('alert').textContent).toContain(
      'New notification received.',
    )
    expect(invalidations).toHaveBeenCalledExactlyOnceWith({
      queryKey: ['notifications', 'recipient'],
    })
    await act(async () => {
      announce({ notification_id: 'broadcast-id', type: 'system' })
    })
    expect(invalidations).toHaveBeenCalledOnce()
    unmount()
    client.clear()
  },
)

it('subscribes to recipient notifications while in a session room', async () => {
  const client = new QueryClient()
  vi.mocked(api).mockResolvedValue({ data: { channel: 'users.recipient.0' } })
  const RoomLayout = RoomRoute.options.component!
  await RoomLayout.preload?.()
  const { unmount } = render(
    <QueryClientProvider client={client}>
      <AlertProvider>
        <RoomLayout />
      </AlertProvider>
    </QueryClientProvider>,
  )
  await waitFor(() =>
    expect(useEcho).toHaveBeenCalledWith(
      'users.recipient.0',
      '.UserNotificationAvailable',
      expect.any(Function),
      expect.any(Array),
    ),
  )
  unmount()
  client.clear()
})

it('delivers incoming alerts through the mounted recipient context', async () => {
  const client = new QueryClient()
  const showAlert = vi.fn()
  vi.mocked(api).mockResolvedValue({ data: { channel: 'users.recipient.0' } })
  const { unmount } = render(
    <QueryClientProvider client={client}>
      <AlertProvider>
        <AlertContext.Provider value={{ showAlert, hideAlert: vi.fn() }}>
          <SessionProvider
            value={toUser({
              id: 'recipient',
              name: '',
              email: '',
              email_verified_at: '',
              role: 'patient',
              status: 'active',
              image: null,
              created_at: '',
              updated_at: '',
            })}
          >
            <NotificationRealtime />
          </SessionProvider>
        </AlertContext.Provider>
      </AlertProvider>
    </QueryClientProvider>,
  )
  await waitFor(() => expect(useEcho).toHaveBeenCalled())
  const announce = vi.mocked(useEcho).mock.calls[0][2]!
  await act(async () => {
    announce({ notification_id: 'new-id', type: 'system' })
  })
  expect(showAlert).toHaveBeenCalledExactlyOnceWith(
    'New notification received.',
    'info',
  )
  unmount()
  client.clear()
})

it('keeps an accurate bell count while closed, refreshes on receipt, and clears it when viewed', async () => {
  const client = new QueryClient()
  let unread = 24
  let viewed = false
  vi.mocked(api).mockImplementation(async (url, options) => {
    if (url === '/api/v1/notifications/channel')
      return { data: { channel: 'users.recipient.0' } }
    if (options?.method === 'PATCH') {
      unread--
      viewed = true
      return undefined
    }
    return {
      data: [
        {
          id: 'new-id',
          title: 'Reminder',
          message: 'Check your account',
          read_at: viewed ? '2026-11-07' : null,
        },
      ],
      meta: { total: unread, current_page: 1, last_page: 1 },
    }
  })
  const { unmount } = render(
    <QueryClientProvider client={client}>
      <AlertProvider>
        <SessionProvider
          value={toUser({
            id: 'recipient',
            name: '',
            email: '',
            email_verified_at: '',
            role: 'patient',
            status: 'active',
            image: null,
            created_at: '',
            updated_at: '',
          })}
        >
          <NotificationRealtime />
          <Sidebar role="patient">
            <p>Dashboard</p>
          </Sidebar>
        </SessionProvider>
      </AlertProvider>
    </QueryClientProvider>,
  )
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Notifications, 24 unread' })
        .textContent,
    ).toContain('24'),
  )
  expect(screen.queryByText('Reminder')).toBeNull()
  const announce = vi.mocked(useEcho).mock.calls[0][2]!
  unread = 25
  await act(async () => {
    announce({ notification_id: 'new-id', type: 'system' })
  })
  expect(screen.getByRole('alert').textContent).toContain(
    'New notification received.',
  )
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Notifications, 25 unread' })
        .textContent,
    ).toContain('25'),
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Notifications, 25 unread' }),
  )
  await waitFor(() => expect(screen.getByText('Reminder')).toBeDefined())
  fireEvent.click(screen.getByRole('button', { name: 'Mark as viewed' }))
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Notifications, 24 unread' })
        .textContent,
    ).toContain('24'),
  )
  unread = 125
  await act(async () => {
    await client.invalidateQueries({ queryKey: ['notifications', 'recipient'] })
  })
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Notifications, 125 unread' })
        .textContent,
    ).toContain('99+'),
  )
  unread = 0
  await act(async () => {
    await client.invalidateQueries({ queryKey: ['notifications', 'recipient'] })
  })
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Notifications' }).textContent,
    ).toBe(''),
  )
  expect(api).toHaveBeenCalledWith(
    '/api/v1/notifications?unread=true&per_page=1',
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  )
  unmount()
  client.clear()
})
