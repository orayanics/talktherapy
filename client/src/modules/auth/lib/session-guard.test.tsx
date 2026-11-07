/** @vitest-environment jsdom */
import { QueryClient } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { afterEach, expect, it, vi } from 'vitest'
import { requireSession, requireGuest } from './session-guard'
import { requireRole } from './auth-guard'
import { api, initializeCsrf } from '#/lib/api/client'
import { authClient, sessionQueryOptions } from '../api/auth-client'

vi.mock('#/lib/api/client', () => ({ api: vi.fn(), initializeCsrf: vi.fn() }))
afterEach(() => vi.clearAllMocks())

const user = {
  id: 'patient-1',
  name: 'Patient',
  email: 'patient@example.com',
  email_verified_at: '',
  role: 'patient',
  status: 'active',
  image: null,
  created_at: '',
  updated_at: '',
}
const httpError = (status: number) =>
  new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
  } as AxiosResponse)

function testRouter(queryClient = new QueryClient()) {
  const childLoad = vi.fn()
  const root = createRootRouteWithContext<{ queryClient: QueryClient }>()()
  const protectedRoute = createRoute({
    getParentRoute: () => root,
    id: '_protected',
    ssr: false,
    beforeLoad: requireSession,
  })
  const child = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/private',
    loader: childLoad,
  })
  const login = createRoute({ getParentRoute: () => root, path: '/login' })
  const router = createRouter({
    routeTree: root.addChildren([protectedRoute.addChildren([child]), login]),
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: ['/private'] }),
  })
  return { router, childLoad, queryClient }
}

it('blocks child loaders until authentication resolves and provides the normalized user', async () => {
  let resolve!: (data: unknown) => void
  vi.mocked(api).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done
      }),
  )
  const { router, childLoad, queryClient } = testRouter()
  const loading = router.load()
  await vi.waitFor(() => expect(api).toHaveBeenCalledOnce())
  expect(childLoad).not.toHaveBeenCalled()
  resolve({ data: user })
  await loading
  expect(childLoad).toHaveBeenCalledOnce()
  expect(router.state.matches.at(-1)?.context).toMatchObject({
    user: { id: user.id, role: 'patient', emailVerified: false },
  })
  queryClient.clear()
})

it.each([403, 500])(
  'propagates HTTP %s and never starts protected children',
  async (status) => {
    const error = httpError(status)
    vi.mocked(api).mockRejectedValue(error)
    const { router, childLoad, queryClient } = testRouter()
    await router.load()
    expect(childLoad).not.toHaveBeenCalled()
    expect(router.state.matches.some((match) => match.error === error)).toBe(
      true,
    )
    expect(router.state.location.pathname).toBe('/private')
    queryClient.clear()
  },
)

it('redirects only a confirmed 401 and revalidates previously authenticated cache', async () => {
  vi.mocked(api)
    .mockResolvedValueOnce({ data: user })
    .mockRejectedValueOnce(httpError(401))
  const { router, childLoad, queryClient } = testRouter()
  await queryClient.query(sessionQueryOptions)
  await router.load()
  expect(childLoad).not.toHaveBeenCalled()
  expect(router.state.location.pathname).toBe('/login')
  queryClient.clear()
})

it('preserves network errors for retry and permits a subsequent successful check', async () => {
  const queryClient = new QueryClient()
  const error = new Error('Offline')
  vi.mocked(api)
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce({ data: user })
  await expect(requireSession({ context: { queryClient } })).rejects.toBe(error)
  await expect(
    requireSession({ context: { queryClient } }),
  ).resolves.toMatchObject({ user: { id: user.id } })
  queryClient.clear()
})

it('keeps guest checks and role checks in beforeLoad-compatible functions', async () => {
  const queryClient = new QueryClient()
  vi.mocked(api).mockResolvedValue({ data: user })
  await expect(
    requireGuest({ context: { queryClient } }),
  ).rejects.toMatchObject({ options: { to: '/dashboard' } })
  const { user: session } = await requireSession({ context: { queryClient } })
  expect(() => requireRole(session, 'admin')).toThrow()
  expect(requireRole({ ...session, role: 'superadmin' }, 'admin').role).toBe(
    'superadmin',
  )
  queryClient.clear()
})

it('clears all user-bound query data only after successful logout', async () => {
  const queryClient = new QueryClient()
  queryClient.setQueryData(['soap', 'note'], { assessment: 'Private note' })
  vi.mocked(api)
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce(undefined)
  await expect(authClient.signOut(queryClient)).rejects.toThrow('Offline')
  expect(queryClient.getQueryData(['soap', 'note'])).toBeTruthy()
  await authClient.signOut(queryClient)
  expect(initializeCsrf).toHaveBeenCalledTimes(2)
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
})

it('reuses a fresh session for preloads but verifies it again for navigation', async () => {
  const queryClient = new QueryClient()
  vi.mocked(api)
    .mockResolvedValueOnce({ data: user })
    .mockRejectedValueOnce(httpError(401))
  await requireSession({ context: { queryClient }, preload: true })
  await requireSession({ context: { queryClient }, preload: true })
  expect(api).toHaveBeenCalledOnce()
  await expect(
    requireSession({ context: { queryClient } }),
  ).rejects.toMatchObject({ options: { to: '/login' } })
  expect(api).toHaveBeenCalledTimes(2)
  queryClient.clear()
})

it("drops another user's cached resources when the session identity changes", async () => {
  const queryClient = new QueryClient()
  vi.mocked(api)
    .mockResolvedValueOnce({ data: user })
    .mockResolvedValueOnce({ data: { ...user, id: 'patient-2' } })
  await requireSession({ context: { queryClient } })
  queryClient.setQueryData(['soaps', 'patient-1'], ['Sensitive note'])
  await requireSession({ context: { queryClient } })
  expect(queryClient.getQueryData(['soaps', 'patient-1'])).toBeUndefined()
  queryClient.clear()
})
